import type { Field, FieldConfig } from '#lib/ascii-engine.js';

/**
 * WebGL2 renderer for the ASCII fields. One fullscreen triangle per canvas;
 * the fragment shader picks a ramp glyph per cell from a texture atlas and,
 * near the pointer, warps the sampling domain and recolors glyphs with a
 * liquid-metal stripe pattern (chrome bands + red/blue dispersion).
 */

const RAMP = ['.', ':', 'o', 'x', '%', 'X', '#', '&', '@'];

const VERTEX_SHADER = `#version 300 es
void main() {
	vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
	gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform highp sampler2D u_coverage;
uniform sampler2D u_glyphs;
uniform vec2 u_resolution;
uniform vec2 u_cell;
uniform ivec2 u_grid;
uniform vec3 u_ink;
uniform float u_time;
uniform vec2 u_cursor;
uniform float u_glow;
uniform float u_radius;

out vec4 outColor;

const float STRIPE_ANGLE = 1.2217; /* 70deg, matches the logo preset */

float hash21(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	float a = hash21(i);
	float b = hash21(i + vec2(1.0, 0.0));
	float c = hash21(i + vec2(0.0, 1.0));
	float d = hash21(i + vec2(1.0, 1.0));
	return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float coverageAt(ivec2 cell) {
	cell = clamp(cell, ivec2(0), u_grid - 1);
	return texelFetch(u_coverage, cell, 0).r;
}

/* Chrome band: mostly light, sharp dark stripes. Phase-shift per channel
   for the red/blue dispersion fringes of the liquid-metal reference. */
float metalWave(float t) {
	float c = 0.5 + 0.5 * cos(6.28318 * t);
	return 0.05 + 0.95 * pow(c, 3.0);
}

void main() {
	vec2 pixel = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
	float dist = distance(pixel, u_cursor);
	float proximity = u_glow * (1.0 - smoothstep(u_radius * 0.15, u_radius, dist));

	vec2 warped = pixel;
	if (proximity > 0.002) {
		float scale = u_cell.y * 6.0;
		float n1 = vnoise(pixel / scale + vec2(u_time * 0.35, -u_time * 0.22));
		float n2 = vnoise(pixel / scale - vec2(u_time * 0.28, u_time * 0.31));
		warped += (vec2(n1, n2) - 0.5) * u_cell.y * 3.4 * proximity;
	}

	ivec2 cell = ivec2(floor(warped / u_cell));
	if (any(lessThan(cell, ivec2(0))) || any(greaterThanEqual(cell, u_grid))) {
		outColor = vec4(0.0);
		return;
	}
	vec2 cellUV = fract(warped / u_cell);

	float baked = texelFetch(u_coverage, cell, 0).r;
	if (baked <= 0.02) {
		outColor = vec4(0.0);
		return;
	}

	/* Per-cell shimmer, ported from the Canvas2D renderer. */
	vec2 fc = vec2(cell);
	float noise = hash21(fc * vec2(0.73, 1.31) + vec2(11.0, 7.0));
	float clock = u_time * 0.42;
	float value = baked;
	value *= 0.74 + 0.44 * noise;
	value *= 0.86 + 0.26 * sin(fc.x * 0.17 - fc.y * 0.11 - clock * 2.1);
	value *= 0.93 + 0.16 * sin(clock * 3.1 + noise * 41.0);

	float density = clamp(max(value, proximity * 0.6), 0.0, 1.0);
	if (density < 0.035 && proximity < 0.05) {
		outColor = vec4(0.0);
		return;
	}

	float rampIndex = clamp(floor(pow(density, 0.72) * 9.0 + proximity * 4.2), 0.0, 8.0);
	float glyph = texture(u_glyphs, vec2((rampIndex + cellUV.x) / 9.0, cellUV.y)).r;
	float alpha = min(0.98, pow(density, 0.74) * 1.34 * (1.0 + proximity * 0.55));

	vec3 color = u_ink;
	if (proximity > 0.002) {
		vec2 direction = vec2(cos(STRIPE_ANGLE), sin(STRIPE_ANGLE));
		/* Edge contour: coverage gradient bends the stripes along shape edges. */
		float gradient =
			abs(coverageAt(cell + ivec2(1, 0)) - baked) + abs(coverageAt(cell + ivec2(0, 1)) - baked);
		float flow = vnoise(pixel / (u_cell.y * 5.0) + vec2(u_time * 0.3, u_time * -0.24));
		float t =
			dot(pixel - u_cursor, direction) / (u_radius * 0.45) +
			flow * 0.9 +
			gradient * 1.7 +
			u_time * 0.3;
		vec3 metal = vec3(metalWave(t + 0.055), metalWave(t), metalWave(t - 0.055));
		color = mix(u_ink, metal, proximity);
	}

	float coverageAlpha = glyph * alpha;
	outColor = vec4(color * coverageAlpha, coverageAlpha);
}`;

function compileProgram(gl: WebGL2RenderingContext) {
	const program = gl.createProgram();
	for (const [type, source] of [
		[gl.VERTEX_SHADER, VERTEX_SHADER],
		[gl.FRAGMENT_SHADER, FRAGMENT_SHADER]
	] as const) {
		const shader = gl.createShader(type);
		if (!shader) throw new Error('ASCII GL: shader allocation failed.');
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error(`ASCII GL shader: ${gl.getShaderInfoLog(shader)}`);
		}
		gl.attachShader(program, shader);
	}
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`ASCII GL link: ${gl.getProgramInfoLog(program)}`);
	}
	return program;
}

/** Compile-checks the shader on a scratch canvas so per-field mounts can't half-fail. */
export function probeAsciiGL(): boolean {
	try {
		const gl = document.createElement('canvas').getContext('webgl2');
		if (!gl) return false;
		compileProgram(gl);
		return true;
	} catch (error) {
		console.warn('ASCII GL probe failed, using Canvas2D fields:', error);
		return false;
	}
}

export function createFieldGL(
	canvas: HTMLCanvasElement,
	source: string | null,
	config: FieldConfig,
	reducedMotion: boolean
): Field {
	const fontSize = config.fs ?? 10.5;
	const fontFor = (size: number) =>
		`${size}px ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace`;
	const vector = source === null;

	const glContext = canvas.getContext('webgl2', {
		alpha: true,
		premultipliedAlpha: true,
		antialias: false,
		depth: false,
		stencil: false
	});
	if (!glContext) throw new Error('ASCII GL: WebGL2 unavailable.');
	const gl: WebGL2RenderingContext = glContext;

	const measure = document.createElement('canvas').getContext('2d');
	const maskCanvas = document.createElement('canvas');
	const mask = maskCanvas.getContext('2d', { willReadFrequently: true });
	if (!measure || !mask) throw new Error('ASCII GL: 2D context unavailable.');
	const measureContext: CanvasRenderingContext2D = measure;
	const maskContext: CanvasRenderingContext2D = mask;

	const program = compileProgram(gl);
	gl.useProgram(program);
	const uniform = (name: string) => gl.getUniformLocation(program, name);
	const locations = {
		coverage: uniform('u_coverage'),
		glyphs: uniform('u_glyphs'),
		resolution: uniform('u_resolution'),
		cell: uniform('u_cell'),
		grid: uniform('u_grid'),
		ink: uniform('u_ink'),
		time: uniform('u_time'),
		cursor: uniform('u_cursor'),
		glow: uniform('u_glow'),
		radius: uniform('u_radius')
	};
	gl.uniform1i(locations.coverage, 0);
	gl.uniform1i(locations.glyphs, 1);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

	const coverageTexture = gl.createTexture();
	const glyphTexture = gl.createTexture();
	for (const [unit, texture] of [
		[0, coverageTexture],
		[1, glyphTexture]
	] as const) {
		gl.activeTexture(gl.TEXTURE0 + unit);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, unit === 0 ? gl.NEAREST : gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, unit === 0 ? gl.NEAREST : gl.LINEAR);
	}

	const plate = new Image();
	let width = 0;
	let height = 0;
	let dpr = 1;
	let cellWidth = 7;
	let cellHeight = 13;
	let columns = 0;
	let rows = 0;
	let ready = vector;
	let visible = false;
	let lastProgress = -1;
	let pointerX = -9e9;
	let pointerY = -9e9;
	let previousPointerX = -9e9;
	let previousPointerY = -9e9;
	let pointerSpeed = 0;
	let pointerIsLive = false;
	let smoothX = -9e9;
	let smoothY = -9e9;
	let glow = 0;

	function rebake(progress: number) {
		if (!ready || columns === 0 || rows === 0) return;

		maskCanvas.width = columns;
		maskCanvas.height = rows;
		maskContext.setTransform(1, 0, 0, 1, 0, 0);
		maskContext.fillStyle = '#000';
		maskContext.fillRect(0, 0, columns, rows);
		maskContext.imageSmoothingEnabled = true;
		maskContext.imageSmoothingQuality = 'high';

		if (vector && config.paint) {
			const vectorCanvas = document.createElement('canvas');
			vectorCanvas.width = Math.max(2, Math.round(width));
			vectorCanvas.height = Math.max(2, Math.round(height));
			const vectorContext = vectorCanvas.getContext('2d');
			if (!vectorContext) return;
			vectorContext.fillStyle = '#000';
			vectorContext.fillRect(0, 0, vectorCanvas.width, vectorCanvas.height);
			vectorContext.fillStyle = '#fff';
			vectorContext.strokeStyle = '#fff';
			config.paint(vectorContext, width, height);
			maskContext.drawImage(vectorCanvas, 0, 0, columns, rows);
		} else if (config.place) {
			maskContext.setTransform(1 / cellWidth, 0, 0, 1 / cellHeight, 0, 0);
			config.place(maskContext, plate, width, height, progress);
			maskContext.setTransform(1, 0, 0, 1, 0, 0);
		}

		const data = maskContext.getImageData(0, 0, columns, rows).data;
		const coverage = new Uint8Array(columns * rows);
		for (let row = 0; row < rows; row += 1) {
			const normalizedY = (row * cellHeight + cellHeight * 0.5) / height;
			for (let column = 0; column < columns; column += 1) {
				let alpha = data[(row * columns + column) * 4] / 255;
				if (alpha <= 0.06) continue;
				alpha *= config.dim((column * cellWidth + cellWidth * 0.5) / width, normalizedY, width);
				if (alpha <= 0.02) continue;
				coverage[row * columns + column] = Math.min(255, Math.round(alpha * 255));
			}
		}

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, coverageTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, columns, rows, 0, gl.RED, gl.UNSIGNED_BYTE, coverage);
	}

	function bakeGlyphAtlas() {
		const slotWidth = Math.max(2, Math.round(cellWidth * dpr));
		const slotHeight = Math.max(2, Math.round(cellHeight * dpr));
		const atlas = document.createElement('canvas');
		atlas.width = slotWidth * RAMP.length;
		atlas.height = slotHeight;
		const context = atlas.getContext('2d');
		if (!context) return;
		context.fillStyle = '#fff';
		context.font = fontFor(fontSize * dpr);
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		for (let index = 0; index < RAMP.length; index += 1) {
			context.fillText(RAMP[index], (index + 0.5) * slotWidth, slotHeight * 0.54);
		}
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, glyphTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, atlas);
	}

	function readInk() {
		const [red, green, blue] = getComputedStyle(document.documentElement)
			.getPropertyValue('--ascii-rgb')
			.trim()
			.split(',');
		gl.uniform3f(
			locations.ink,
			(Number(red) || 255) / 255,
			(Number(green) || 255) / 255,
			(Number(blue) || 255) / 255
		);
		if (reducedMotion) draw(3000);
	}

	function resize() {
		dpr = Math.min(devicePixelRatio || 1, 2);
		width = canvas.clientWidth || innerWidth;
		height = canvas.clientHeight || innerHeight;
		if (!width || !height) return;
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		gl.viewport(0, 0, canvas.width, canvas.height);
		measureContext.font = fontFor(fontSize);
		cellWidth = Math.max(6, measureContext.measureText('M').width * 1.28);
		cellHeight = fontSize * 1.22;
		columns = Math.ceil(width / cellWidth) + 1;
		rows = Math.ceil(height / cellHeight) + 1;
		gl.uniform2f(locations.resolution, canvas.width, canvas.height);
		gl.uniform2f(locations.cell, cellWidth * dpr, cellHeight * dpr);
		gl.uniform2i(locations.grid, columns, rows);
		gl.uniform1f(locations.radius, Math.max(150, Math.min(width, height) * 0.28) * dpr);
		bakeGlyphAtlas();
		lastProgress = config.progress?.() ?? 0;
		rebake(lastProgress);
		if (reducedMotion) draw(3000);
	}

	function draw(time: number) {
		gl.uniform1f(locations.time, time * 0.001);
		gl.uniform2f(locations.cursor, smoothX * dpr, smoothY * dpr);
		gl.uniform1f(locations.glow, reducedMotion ? 0 : glow);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	function tick(time: number) {
		if (!visible || !ready) return;
		if (config.progress) {
			const progress = config.progress();
			if (Math.abs(progress - lastProgress) > 0.003) {
				lastProgress = progress;
				rebake(progress);
			}
		}
		const instantaneousSpeed = Math.hypot(pointerX - previousPointerX, pointerY - previousPointerY);
		pointerSpeed += (instantaneousSpeed - pointerSpeed) * 0.35;
		previousPointerX = pointerX;
		previousPointerY = pointerY;
		if (pointerIsLive) {
			if (smoothX < -1e8) {
				smoothX = pointerX;
				smoothY = pointerY;
			}
			smoothX += (pointerX - smoothX) * 0.22;
			smoothY += (pointerY - smoothY) * 0.22;
			const target = Math.min(1, 0.45 + Math.min(pointerSpeed, 60) * 0.02);
			glow += (target - glow) * 0.14;
		} else {
			glow *= 0.92;
		}
		draw(time);
	}

	function point(event: PointerEvent) {
		const bounds = canvas.getBoundingClientRect();
		const x = event.clientX - bounds.left;
		const y = event.clientY - bounds.top;
		if (x < -160 || y < -160 || x > bounds.width + 160 || y > bounds.height + 160) {
			pointerIsLive = false;
			pointerSpeed = 0;
			return;
		}
		if (!pointerIsLive) {
			previousPointerX = x;
			previousPointerY = y;
		}
		pointerX = x;
		pointerY = y;
		pointerIsLive = true;
	}

	function setVisible(nextVisible: boolean) {
		visible = nextVisible;
		if (!visible) {
			pointerIsLive = false;
			pointerSpeed = 0;
			glow = 0;
		}
	}

	if (!vector && source) {
		plate.onload = () => {
			ready = true;
			resize();
		};
		plate.src = source;
	}
	readInk();

	return {
		element: canvas,
		destroy: () => {
			plate.onload = null;
			gl.deleteTexture(coverageTexture);
			gl.deleteTexture(glyphTexture);
			gl.deleteProgram(program);
		},
		point,
		readInk,
		resize,
		setVisible,
		tick
	};
}
