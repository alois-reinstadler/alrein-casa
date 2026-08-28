<script lang="ts">
	import { onMount } from 'svelte';

	type Mode = 'figure' | 'signal' | 'network' | 'horizon';

	let {
		mode = 'figure',
		interactive = false,
		label = ''
	}: { mode?: Mode; interactive?: boolean; label?: string } = $props();

	let canvas: HTMLCanvasElement;
	let pointer = { x: -9999, y: -9999 };
	let frame = 0;

	const characters = ' .:o%xX#&@';
	const clamp = (value: number) => Math.max(0, Math.min(1, value));
	const ellipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
		clamp(1 - Math.hypot((x - cx) / rx, (y - cy) / ry));

	function density(modeName: Mode, x: number, y: number, time: number) {
		if (modeName === 'figure') {
			const head = ellipse(x, y, 0.62, 0.25, 0.12, 0.18);
			const shoulders = ellipse(x, y, 0.57, 0.54, 0.27, 0.22);
			const torso = ellipse(x, y, 0.62, 0.76, 0.18, 0.38);
			const arm = ellipse(x, y, 0.45, 0.58, 0.11, 0.36);
			const cut = ellipse(x, y, 0.57, 0.47, 0.08, 0.1);
			return clamp(Math.max(head, shoulders * 0.9, torso * 0.82, arm * 0.72) - cut * 0.48);
		}
		if (modeName === 'signal') {
			const wave = Math.sin(x * 25 + time) * 0.08 + Math.sin(x * 9 - time * 0.6) * 0.12;
			return clamp(0.82 - Math.abs(y - 0.5 - wave) * 7 + Math.sin((x + y) * 20) * 0.08);
		}
		if (modeName === 'network') {
			const grid = Math.max(Math.cos(x * 35) ** 20, Math.cos(y * 28) ** 24) * 0.45;
			const orbit = clamp(0.12 - Math.abs(Math.hypot(x - 0.58, y - 0.5) - 0.26)) * 6;
			const nodes = Math.max(
				ellipse(x, y, 0.31, 0.37, 0.055, 0.07),
				ellipse(x, y, 0.67, 0.3, 0.05, 0.065),
				ellipse(x, y, 0.73, 0.69, 0.06, 0.08),
				ellipse(x, y, 0.42, 0.72, 0.045, 0.06)
			);
			return clamp(Math.max(grid * 0.7, orbit, nodes));
		}
		const left = ellipse(x, y, 0.2, 1.02, 0.42, 0.38);
		const right = ellipse(x, y, 0.8, 1.04, 0.44, 0.42);
		const bands = 0.13 + Math.sin(x * 13 + y * 19) * 0.06;
		return clamp(Math.max(left, right) * (0.76 + bands));
	}

	function draw(time = 0) {
		if (!canvas) return;
		const context = canvas.getContext('2d');
		if (!context) return;
		const rect = canvas.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const width = Math.max(1, Math.round(rect.width * dpr));
		const height = Math.max(1, Math.round(rect.height * dpr));
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}
		context.clearRect(0, 0, width, height);
		const styles = getComputedStyle(document.documentElement);
		const rgb = styles.getPropertyValue('--ascii-rgb').trim() || '222, 229, 238';
		const cell = Math.max(7, Math.min(11, width / 135));
		context.font = `600 ${cell * 1.08}px ui-monospace, SFMono-Regular, Menlo, monospace`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		for (let py = cell / 2; py < height; py += cell * 1.05) {
			for (let px = cell / 2; px < width; px += cell * 0.72) {
				const x = px / width;
				const y = py / height;
				const noise = (Math.sin(px * 0.061 + py * 0.039) + 1) * 0.06;
				const value = density(mode, x, y, time * 0.001) + noise;
				if (value < 0.13) continue;
				const index = Math.min(characters.length - 1, Math.floor(value * characters.length));
				const distance = Math.hypot(px / dpr - pointer.x, py / dpr - pointer.y);
				const force = interactive && distance < 100 ? (1 - distance / 100) * 10 * dpr : 0;
				const angle = Math.atan2(py / dpr - pointer.y, px / dpr - pointer.x);
				context.fillStyle = `rgba(${rgb}, ${0.08 + value * 0.66})`;
				context.fillText(
					characters[index],
					px + Math.cos(angle) * force,
					py + Math.sin(angle) * force
				);
			}
		}
	}

	function handlePointer(event: PointerEvent) {
		if (!interactive) return;
		const rect = canvas.getBoundingClientRect();
		pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => draw(performance.now()));
	}

	onMount(() => {
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const resizeObserver = new ResizeObserver(() => draw(performance.now()));
		const themeObserver = new MutationObserver(() => draw(performance.now()));
		let animationFrame = 0;
		const animate = (time: number) => {
			draw(time);
			animationFrame = requestAnimationFrame(animate);
		};
		const visibilityObserver = new IntersectionObserver(([entry]) => {
			cancelAnimationFrame(animationFrame);
			if (entry.isIntersecting && !reducedMotion && mode === 'signal') {
				animationFrame = requestAnimationFrame(animate);
			}
		});
		resizeObserver.observe(canvas);
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
		visibilityObserver.observe(canvas);
		draw(performance.now());

		return () => {
			resizeObserver.disconnect();
			themeObserver.disconnect();
			visibilityObserver.disconnect();
			cancelAnimationFrame(animationFrame);
			cancelAnimationFrame(frame);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class:interactive
	aria-hidden={label ? undefined : 'true'}
	aria-label={label || undefined}
	role={label ? 'img' : undefined}
	onpointermove={handlePointer}
	onpointerleave={() => {
		pointer = { x: -9999, y: -9999 };
		draw(performance.now());
	}}
></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
	canvas.interactive {
		pointer-events: auto;
	}
</style>
