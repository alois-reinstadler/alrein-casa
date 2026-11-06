import { matchMorphPoints, positionMorphParticle, type MorphPoint } from './ascii-morph.js';

const GLYPHS = ' .:ox%X#&@';
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Sample visible typography and the existing statue canvases into a character grid. */
function samplePage(
	content: HTMLElement,
	width: number,
	height: number,
	top: number,
	columns: number,
	rows: number
) {
	const plate = document.createElement('canvas');
	plate.width = columns;
	plate.height = rows;
	const context = plate.getContext('2d', { willReadFrequently: true })!;
	context.scale(columns / width, rows / height);
	context.fillStyle = '#fff';
	context.textBaseline = 'top';
	for (const canvas of content.querySelectorAll('canvas')) {
		const rect = canvas.getBoundingClientRect();
		if (rect.bottom > top && rect.top < top + height && canvas.width && canvas.height) {
			context.drawImage(canvas, rect.left, rect.top - top, rect.width, rect.height);
		}
	}
	const selector =
		'h1, h2, h3, p, .entry-meta, .post-meta, .hero-card .cta, .text-link, small, .foot-links a';
	for (const element of content.querySelectorAll<HTMLElement>(selector)) {
		if (element.parentElement?.closest(selector)) continue;
		const rect = element.getBoundingClientRect();
		if (rect.bottom < top || rect.top > top + height || !rect.width) continue;
		const style = getComputedStyle(element);
		context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
		context.letterSpacing = style.letterSpacing;
		const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
		const words = (element.textContent ?? '').trim().split(/\s+/);
		let line = '';
		let y = rect.top - top;
		const draw = () => {
			const lineWidth = context.measureText(line).width;
			const x = rect.left + (style.textAlign === 'center' ? (rect.width - lineWidth) / 2 : 0);
			context.fillText(line, x, y);
			y += lineHeight;
		};
		for (const word of words) {
			const candidate = line ? `${line} ${word}` : word;
			if (line && context.measureText(candidate).width > rect.width + 1) {
				draw();
				line = word;
			} else line = candidate;
		}
		if (line) draw();
	}
	const pixels = context.getImageData(0, 0, columns, rows).data;
	return Float32Array.from({ length: columns * rows }, (_, index) => pixels[index * 4 + 3] / 255);
}

/** Move matched character samples between page shapes, rather than sweeping over the DOM. */
export async function playPageTransition(
	canvas: HTMLCanvasElement,
	content: HTMLElement,
	signal: AbortSignal,
	commit: () => Promise<void>
) {
	const context = canvas.getContext('2d');
	if (!context || signal.aborted) {
		if (!signal.aborted) await commit();
		return;
	}
	const rect = canvas.getBoundingClientRect();
	const width = rect.width;
	const height = rect.height;
	if (!width || !height) {
		await commit();
		return;
	}
	const cellWidth = Math.max(width < 600 ? 5.5 : 6.5, Math.sqrt((width * height) / 21000));
	const cellHeight = cellWidth * 1.5;
	const columns = Math.ceil(width / cellWidth);
	const rows = Math.ceil(height / cellHeight);
	const ratio = Math.min(devicePixelRatio || 1, 1.5);
	canvas.width = Math.ceil(width * ratio);
	canvas.height = Math.ceil(height * ratio);
	context.scale(ratio, ratio);
	context.font = `${cellHeight * 0.88}px ui-monospace, SFMono-Regular, Menlo, monospace`;
	context.textBaseline = 'middle';
	context.textAlign = 'center';
	const theme = getComputedStyle(document.documentElement);
	const ground = theme.getPropertyValue('--ground').trim();
	const ink = theme.getPropertyValue('--ink').trim();
	const originalClip = content.style.clipPath;
	const originalOpacity = canvas.style.opacity;
	const sample = (): MorphPoint[] => {
		const densities = samplePage(content, width, height, rect.top, columns, rows);
		const points: MorphPoint[] = [];
		densities.forEach((density, index) => {
			if (density > 0.045)
				points.push({
					x: (((index % columns) + 0.5) * width) / columns,
					y: ((Math.floor(index / columns) + 0.5) * height) / rows,
					density
				});
		});
		return points;
	};
	const source = sample();
	let particles = matchMorphPoints(source, source, width, height);
	let frame = 0;
	let finishFrame: (() => void) | undefined;
	let cleaned = false;
	const cleanup = () => {
		if (cleaned) return;
		cleaned = true;
		cancelAnimationFrame(frame);
		content.style.clipPath = originalClip;
		canvas.style.opacity = originalOpacity;
		context.clearRect(0, 0, width, height);
		finishFrame?.();
	};
	signal.addEventListener('abort', cleanup, { once: true });
	function draw(progress: number) {
		if (!context) return;
		context.globalAlpha = 1;
		context.fillStyle = ground;
		context.fillRect(0, 0, width, height);
		context.fillStyle = ink;
		for (const particle of particles) {
			const point = positionMorphParticle(particle, progress);
			if (point.alpha < 0.005) continue;
			const glyph = GLYPHS[Math.max(1, Math.round(Math.sqrt(point.density) * (GLYPHS.length - 1)))];
			context.globalAlpha = point.alpha;
			context.fillText(glyph, point.x, point.y);
		}
		context.globalAlpha = 1;
	}
	const animate = (duration: number, render: (progress: number) => void) =>
		new Promise<void>((resolve) => {
			if (signal.aborted) {
				resolve();
				return;
			}
			finishFrame = resolve;
			const start = performance.now();
			const tick = (time: number) => {
				if (signal.aborted) {
					resolve();
					return;
				}
				const progress = clamp((time - start) / duration);
				render(progress);
				if (progress < 1) frame = requestAnimationFrame(tick);
				else {
					finishFrame = undefined;
					resolve();
				}
			};
			frame = requestAnimationFrame(tick);
		});
	try {
		// A brief handoff changes live typography into its character representation.
		draw(0);
		await animate(90, (progress) => {
			canvas.style.opacity = String(progress);
		});
		if (signal.aborted) return;
		content.style.clipPath = 'inset(0 100% 0 0)';
		await commit();
		if (signal.aborted) return;
		// Give newly mounted canvases one frame to paint before sampling their shape.
		await animate(32, () => {});
		if (signal.aborted) return;
		particles = matchMorphPoints(source, sample(), width, height);
		await animate(width < 600 ? 720 : 820, draw);
		if (signal.aborted) return;
		content.style.clipPath = originalClip;
		await animate(130, (progress) => {
			canvas.style.opacity = String(1 - progress);
		});
	} finally {
		cleanup();
		signal.removeEventListener('abort', cleanup);
	}
}
