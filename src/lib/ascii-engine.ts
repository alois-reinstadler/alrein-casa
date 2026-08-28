import discusPlate from '#lib/assets/ascii/discus.jpg?url';
import handsPlate from '#lib/assets/ascii/hands.jpg?url';
import victoryPlate from '#lib/assets/ascii/victory.jpg?url';

type FieldConfig = {
	fs?: number;
	dim: (x: number, y: number, width: number) => number;
	paint?: (context: CanvasRenderingContext2D, width: number, height: number) => void;
	place?: (
		context: CanvasRenderingContext2D,
		image: HTMLImageElement,
		width: number,
		height: number,
		progress: number
	) => void;
	progress?: () => number;
};

type Field = {
	element: HTMLCanvasElement;
	destroy: () => void;
	point: (event: PointerEvent) => void;
	readInk: () => void;
	resize: () => void;
	setVisible: (visible: boolean) => void;
	tick: (time: number) => void;
};

const RAMP = ['.', ':', 'o', 'x', '%', 'X', '#', '&', '@'];
const SPRING = 0.045;
const DAMPING = 0.9;
const MAX_DISPLACEMENT = 130;

function requiredContext(canvas: HTMLCanvasElement, options?: CanvasRenderingContext2DSettings) {
	const context = canvas.getContext('2d', options);
	if (!context) throw new Error('Canvas 2D is required for the ASCII fields.');
	return context;
}

const smooth = (start: number, end: number, value: number) => {
	const amount = Math.min(1, Math.max(0, (value - start) / (end - start)));
	return amount * amount * (3 - 2 * amount);
};

function hash(x: number, y: number) {
	const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
	return value - Math.floor(value);
}

function hueToRgb(hue: number) {
	const channel = (offset: number) => (offset + hue / 60) % 6;
	const value = (offset: number) =>
		255 * (1 - Math.max(0, Math.min(channel(offset), 4 - channel(offset), 1)) * 0.8);
	return [value(5), value(3), value(1)];
}

function createField(
	canvas: HTMLCanvasElement,
	source: string | null,
	config: FieldConfig,
	reducedMotion: boolean
): Field {
	const fontSize = config.fs ?? 10.5;
	const font = `${fontSize}px ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace`;
	const vector = source === null;
	const context = requiredContext(canvas, { alpha: true });
	const maskCanvas = document.createElement('canvas');
	const maskContext = requiredContext(maskCanvas, { willReadFrequently: true });
	const plate = new Image();

	let width = 0;
	let height = 0;
	let cellWidth = 7;
	let cellHeight = 13;
	let columns = 0;
	let rows = 0;
	let inkRed = 255;
	let inkGreen = 255;
	let inkBlue = 255;
	let coverage = new Float32Array(0);
	let columnBuffer = new Int16Array(0);
	let rowBuffer = new Int16Array(0);
	let activeColumns = new Int16Array(0);
	let activeRows = new Int16Array(0);
	let activeCount = 0;
	let offsetX = new Float32Array(0);
	let offsetY = new Float32Array(0);
	let velocityX = new Float32Array(0);
	let velocityY = new Float32Array(0);
	let ready = vector;
	let visible = false;
	let lastProgress = -1;
	let pointerX = -9e9;
	let pointerY = -9e9;
	let previousPointerX = -9e9;
	let previousPointerY = -9e9;
	let pointerSpeed = 0;
	let pointerIsLive = false;

	function allocate() {
		const length = columns * rows;
		coverage = new Float32Array(length);
		offsetX = new Float32Array(length);
		offsetY = new Float32Array(length);
		velocityX = new Float32Array(length);
		velocityY = new Float32Array(length);
		columnBuffer = new Int16Array(length);
		rowBuffer = new Int16Array(length);
	}

	function rebake(progress: number) {
		if (!ready || coverage.length === 0) return;
		coverage.fill(0);
		activeCount = 0;

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
		for (let row = 0; row < rows; row += 1) {
			const normalizedY = (row * cellHeight + cellHeight * 0.5) / height;
			for (let column = 0; column < columns; column += 1) {
				let alpha = data[(row * columns + column) * 4] / 255;
				if (alpha <= 0.06) continue;
				alpha *= config.dim((column * cellWidth + cellWidth * 0.5) / width, normalizedY, width);
				if (alpha <= 0.02) continue;
				coverage[row * columns + column] = alpha;
				columnBuffer[activeCount] = column;
				rowBuffer[activeCount] = row;
				activeCount += 1;
			}
		}
		activeColumns = columnBuffer.subarray(0, activeCount);
		activeRows = rowBuffer.subarray(0, activeCount);
	}

	function readInk() {
		const [red, green, blue] = getComputedStyle(document.documentElement)
			.getPropertyValue('--ascii-rgb')
			.trim()
			.split(',');
		inkRed = Number(red) || 255;
		inkGreen = Number(green) || 255;
		inkBlue = Number(blue) || 255;
		if (reducedMotion) draw(3000);
	}

	function resize() {
		const dpr = Math.min(devicePixelRatio || 1, 2);
		width = canvas.clientWidth || innerWidth;
		height = canvas.clientHeight || innerHeight;
		if (!width || !height) return;
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		context.setTransform(dpr, 0, 0, dpr, 0, 0);
		context.font = font;
		context.textBaseline = 'middle';
		cellWidth = Math.max(6, context.measureText('M').width * 1.28);
		cellHeight = fontSize * 1.22;
		columns = Math.ceil(width / cellWidth) + 1;
		rows = Math.ceil(height / cellHeight) + 1;
		allocate();
		lastProgress = config.progress?.() ?? 0;
		rebake(lastProgress);
		if (reducedMotion) draw(3000);
	}

	function updatePhysics() {
		const radius = Math.max(96, Math.min(width, height) * 0.17);
		const radiusSquared = radius * radius;
		const push = pointerIsLive ? 0.5 + Math.min(pointerSpeed, 90) * 0.085 : 0;

		for (let index = 0; index < activeCount; index += 1) {
			const column = activeColumns[index];
			const row = activeRows[index];
			const cell = row * columns + column;
			let nextVelocityX = velocityX[cell];
			let nextVelocityY = velocityY[cell];

			if (push > 0) {
				const distanceX = column * cellWidth - pointerX;
				const distanceY = row * cellHeight - pointerY;
				const distanceSquared = distanceX * distanceX + distanceY * distanceY;
				if (distanceSquared < radiusSquared) {
					const distance = Math.sqrt(distanceSquared) || 0.001;
					const falloff = 1 - distance / radius;
					const impulse = falloff * falloff * push;
					nextVelocityX += (distanceX / distance) * impulse;
					nextVelocityY += (distanceY / distance) * impulse;
				}
			}

			nextVelocityX = (nextVelocityX - offsetX[cell] * SPRING) * DAMPING;
			nextVelocityY = (nextVelocityY - offsetY[cell] * SPRING) * DAMPING;
			let nextOffsetX = offsetX[cell] + nextVelocityX;
			let nextOffsetY = offsetY[cell] + nextVelocityY;
			const magnitude = Math.hypot(nextOffsetX, nextOffsetY);
			if (magnitude > MAX_DISPLACEMENT) {
				const limit = MAX_DISPLACEMENT / magnitude;
				nextOffsetX *= limit;
				nextOffsetY *= limit;
			}
			offsetX[cell] = nextOffsetX;
			offsetY[cell] = nextOffsetY;
			velocityX[cell] = nextVelocityX;
			velocityY[cell] = nextVelocityY;
		}
	}

	function draw(time: number) {
		const clock = time * 0.00042;
		context.clearRect(0, 0, width, height);
		context.font = font;
		context.textBaseline = 'middle';
		const buckets: Array<Array<string | number>> = [[], [], [], [], [], []];
		const displaced: Array<string | number> = [];

		for (let index = 0; index < activeCount; index += 1) {
			const column = activeColumns[index];
			const row = activeRows[index];
			const cell = row * columns + column;
			let value = coverage[cell];
			const noise = hash(column * 0.73 + 11, row * 1.31 + 7);
			value *= 0.74 + 0.44 * noise;
			value *= 0.86 + 0.26 * Math.sin(column * 0.17 - row * 0.11 - clock * 2.1);
			value *= 0.93 + 0.16 * Math.sin(clock * 3.1 + noise * 41);

			const xOffset = offsetX[cell];
			const yOffset = offsetY[cell];
			const magnitude = Math.hypot(xOffset, yOffset);
			const mix = Math.min(1, magnitude / 24);
			if (value < 0.035 && mix < 0.05) continue;

			const density = Math.min(1, Math.max(value, mix * 0.55));
			let rampIndex = Math.floor(Math.pow(density, 0.72) * RAMP.length) + Math.round(mix * 4.2);
			rampIndex = Math.min(RAMP.length - 1, Math.max(0, rampIndex));
			const alpha = Math.min(0.98, Math.pow(density, 0.74) * 1.34 * (1 + mix * 0.55));
			const x = column * cellWidth + xOffset;
			const y = row * cellHeight + yOffset;

			if (mix < 0.08) {
				buckets[Math.min(5, (alpha * 6) | 0)].push(RAMP[rampIndex], x, y);
			} else {
				const hue = (Math.atan2(yOffset, xOffset) * 57.2958 + 360 + clock * 40) % 360;
				const [prismRed, prismGreen, prismBlue] = hueToRgb(hue);
				displaced.push(
					RAMP[rampIndex],
					x,
					y,
					`rgba(${(inkRed + (prismRed - inkRed) * mix) | 0},${(inkGreen + (prismGreen - inkGreen) * mix) | 0},${(inkBlue + (prismBlue - inkBlue) * mix) | 0},${alpha.toFixed(3)})`
				);
			}
		}

		for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) {
			const bucket = buckets[bucketIndex];
			if (bucket.length === 0) continue;
			context.fillStyle = `rgba(${inkRed},${inkGreen},${inkBlue},${(((bucketIndex + 0.6) / 6) * 0.9).toFixed(3)})`;
			for (let index = 0; index < bucket.length; index += 3) {
				context.fillText(
					String(bucket[index]),
					Number(bucket[index + 1]),
					Number(bucket[index + 2])
				);
			}
		}

		for (let index = 0; index < displaced.length; index += 4) {
			context.fillStyle = String(displaced[index + 3]);
			context.fillText(
				String(displaced[index]),
				Number(displaced[index + 1]),
				Number(displaced[index + 2])
			);
		}
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
		updatePhysics();
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
		},
		point,
		readInk,
		resize,
		setVisible,
		tick
	};
}

function requiredCanvas(id: string) {
	const canvas = document.getElementById(id);
	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new Error(`Missing ASCII canvas #${id}.`);
	}
	return canvas;
}

function requiredElement(id: string) {
	const element = document.getElementById(id);
	if (!element) throw new Error(`Missing required element #${id}.`);
	return element;
}

export function initializeAsciiExperience() {
	const root = document.documentElement;
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const contactElement = requiredElement('contact');

	function bottomProgress() {
		const top = contactElement.getBoundingClientRect().top + scrollY;
		const documentMaximum = document.documentElement.scrollHeight - innerHeight;
		const start = Math.max(0, top - innerHeight * 0.55);
		if (documentMaximum <= start + 1) return 1;
		return Math.min(1, Math.max(0, (scrollY - start) / (documentMaximum - start)));
	}

	const fields = [
		createField(
			requiredCanvas('fieldHero'),
			victoryPlate,
			{
				fs: 9,
				place(context, image, width, height) {
					const aspectRatio = image.naturalWidth / image.naturalHeight;
					if (width < 900) {
						const drawnHeight = Math.min(height * 0.92, (width * 1.7) / aspectRatio);
						context.drawImage(
							image,
							width * 0.6 - (drawnHeight * aspectRatio) / 2,
							height * 0.54 - drawnHeight / 2,
							drawnHeight * aspectRatio,
							drawnHeight
						);
					} else {
						const drawnHeight = Math.min(height * 0.95, (width * 0.58) / aspectRatio);
						context.drawImage(
							image,
							width * 0.735 - (drawnHeight * aspectRatio) / 2,
							height * 0.5 - drawnHeight / 2,
							drawnHeight * aspectRatio,
							drawnHeight
						);
					}
				},
				dim: (x, y, width) =>
					width < 900 ? 0.14 + 0.86 * smooth(0.5, 0.68, y) : 0.22 + 0.78 * smooth(0.33, 0.47, x)
			},
			reducedMotion
		),
		createField(
			requiredCanvas('fieldRule'),
			null,
			{
				fs: 7,
				paint(context, width, height) {
					const patternHeight = height * 0.68;
					const unit = patternHeight / 4;
					const top = (height - patternHeight) / 2;
					const period = unit * 5;
					context.lineWidth = unit * 0.86;
					context.lineCap = 'butt';
					context.lineJoin = 'miter';
					context.beginPath();
					context.moveTo(0, top + unit * 4);
					context.lineTo(width, top + unit * 4);
					for (let x = -period; x < width + period; x += period) {
						context.moveTo(x + unit * 0.55, top + unit * 4);
						context.lineTo(x + unit * 0.55, top + unit * 0.45);
						context.lineTo(x + unit * 3.6, top + unit * 0.45);
						context.lineTo(x + unit * 3.6, top + unit * 2.6);
						context.lineTo(x + unit * 1.9, top + unit * 2.6);
						context.lineTo(x + unit * 1.9, top + unit * 1.6);
						context.lineTo(x + unit * 2.7, top + unit * 1.6);
					}
					context.stroke();
				},
				dim: () => 1
			},
			reducedMotion
		),
		createField(
			requiredCanvas('fieldProcess'),
			discusPlate,
			{
				fs: 8,
				place(context, image, width, height) {
					if (width < 900) {
						const drawnHeight = Math.min(height * 0.5, width * 1.05);
						context.drawImage(
							image,
							width * 0.5 - drawnHeight / 2,
							height * 0.76 - drawnHeight / 2,
							drawnHeight,
							drawnHeight
						);
					} else {
						const drawnHeight = Math.min(height * 0.92, width * 0.62);
						context.drawImage(
							image,
							width * 0.255 - drawnHeight / 2,
							height * 0.52 - drawnHeight / 2,
							drawnHeight,
							drawnHeight
						);
					}
				},
				dim: (x, y, width) =>
					width < 900
						? 0.15 + 0.85 * smooth(0.52, 0.68, y)
						: 0.24 + 0.76 * smooth(0.34, 0.48, 1 - x)
			},
			reducedMotion
		),
		createField(
			requiredCanvas('fieldHands'),
			handsPlate,
			{
				fs: 10,
				progress: () => (reducedMotion ? 1 : bottomProgress()),
				place(context, image, width, height, progress) {
					const narrow = width < 900;
					const oversize = narrow ? 2.15 + 0.55 * progress : 1.18 + 0.2 * progress;
					const drawnWidth = width * oversize;
					const drawnHeight = drawnWidth * (image.naturalHeight / image.naturalWidth);
					const x = (width - drawnWidth) / 2;
					const y = height * (narrow ? 0.7 : 0.66) - drawnHeight * 0.575;
					const closingDistance = drawnWidth * 0.14 * progress;
					const middle = x + drawnWidth * 0.505;
					context.save();
					context.beginPath();
					context.rect(-40, -40, middle + 40, height + 80);
					context.clip();
					context.drawImage(image, x + closingDistance, y, drawnWidth, drawnHeight);
					context.restore();
					context.save();
					context.beginPath();
					context.rect(middle, -40, width - middle + 40, height + 80);
					context.clip();
					context.drawImage(image, x - closingDistance, y, drawnWidth, drawnHeight);
					context.restore();
				},
				dim(x, y) {
					const ellipseX = (x - 0.5) / 0.3;
					const ellipseY = (y - 0.2) / 0.26;
					return 0.3 + 0.7 * smooth(0.72, 1.3, Math.hypot(ellipseX, ellipseY));
				}
			},
			reducedMotion
		)
	];

	let animationFrame = 0;
	let resizeFrame = 0;
	const resizeAll = () => {
		cancelAnimationFrame(resizeFrame);
		resizeFrame = requestAnimationFrame(() => fields.forEach((field) => field.resize()));
	};
	const handlePointer = (event: PointerEvent) => fields.forEach((field) => field.point(event));
	const handleBlur = () => fields.forEach((field) => field.setVisible(false));

	if (!reducedMotion) {
		addEventListener('pointermove', handlePointer, { passive: true });
		addEventListener('blur', handleBlur);
	}
	addEventListener('resize', resizeAll, { passive: true });
	fields.forEach((field) => field.resize());

	const visibilityObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				fields.find((field) => field.element === entry.target)?.setVisible(entry.isIntersecting);
			}
		},
		{ threshold: 0 }
	);
	fields.forEach((field) => visibilityObserver.observe(field.element));

	const themeObserver = new MutationObserver(() => fields.forEach((field) => field.readInk()));
	themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

	if (!reducedMotion) {
		const loop = (time: number) => {
			fields.forEach((field) => field.tick(time));
			animationFrame = requestAnimationFrame(loop);
		};
		animationFrame = requestAnimationFrame(loop);
	}

	document.fonts.ready.then(resizeAll);

	return () => {
		cancelAnimationFrame(animationFrame);
		cancelAnimationFrame(resizeFrame);
		removeEventListener('pointermove', handlePointer);
		removeEventListener('blur', handleBlur);
		removeEventListener('resize', resizeAll);
		visibilityObserver.disconnect();
		themeObserver.disconnect();
		fields.forEach((field) => field.destroy());
	};
}
