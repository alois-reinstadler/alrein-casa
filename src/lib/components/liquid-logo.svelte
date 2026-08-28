<script lang="ts">
	import { onMount } from 'svelte';
	import logoUrl from '#lib/assets/alrein-logo-black.svg?url';

	let host: HTMLDivElement;

	onMount(() => {
		let mount: { dispose: () => void } | undefined;
		let objectUrl: string | undefined;
		let cancelled = false;
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

		(async () => {
			try {
				const {
					ShaderMount,
					liquidMetalFragmentShader,
					toProcessedLiquidMetal,
					getShaderColorFromString,
					LiquidMetalShapes,
					ShaderFitOptions
				} = await import('@paper-design/shaders');
				const { pngBlob } = await toProcessedLiquidMetal(logoUrl);
				if (cancelled) return;
				objectUrl = URL.createObjectURL(pngBlob);
				const processedImage = new Image();
				processedImage.src = objectUrl;
				await processedImage.decode();
				if (cancelled) return;
				mount = new ShaderMount(
					host,
					liquidMetalFragmentShader,
					{
						u_colorBack: getShaderColorFromString('#00000000'),
						u_colorTint: getShaderColorFromString('#ffffff'),
						u_image: processedImage,
						u_repetition: 2,
						u_softness: 0.1,
						u_shiftRed: 0.3,
						u_shiftBlue: 0.3,
						u_distortion: 0.07,
						u_contour: 0.4,
						u_angle: 70,
						u_shape: LiquidMetalShapes.none,
						u_isImage: true,
						u_fit: ShaderFitOptions.contain,
						u_scale: 1,
						u_rotation: 0,
						u_originX: 0.5,
						u_originY: 0.5,
						u_offsetX: 0,
						u_offsetY: 0,
						u_worldWidth: 0,
						u_worldHeight: 0
					},
					{ alpha: true },
					reducedMotion ? 0 : 1
				);
				host.classList.add('ready');
			} catch {
				// No WebGL (or shader init failed): keep the static fallback logo.
				host.querySelector('canvas')?.remove();
			}
		})();

		/* 3D tilt: the plate leans toward the cursor, eased per frame. */
		const canTilt = !reducedMotion && matchMedia('(pointer: fine)').matches;
		let tiltFrame = 0;
		let targetX = 0;
		let targetY = 0;
		let currentX = 0;
		let currentY = 0;

		const tiltLoop = () => {
			currentX += (targetX - currentX) * 0.1;
			currentY += (targetY - currentY) * 0.1;
			host.style.transform = `rotateX(${currentX.toFixed(3)}deg) rotateY(${currentY.toFixed(3)}deg)`;
			tiltFrame =
				Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02
					? requestAnimationFrame(tiltLoop)
					: 0;
		};

		const wake = () => {
			if (!tiltFrame) tiltFrame = requestAnimationFrame(tiltLoop);
		};

		const handlePointerMove = (event: PointerEvent) => {
			const bounds = host.getBoundingClientRect();
			const nx = (event.clientX - (bounds.left + bounds.width / 2)) / (innerWidth / 2);
			const ny = (event.clientY - (bounds.top + bounds.height / 2)) / (innerHeight / 2);
			targetY = Math.max(-1, Math.min(1, nx)) * 16;
			targetX = Math.max(-1, Math.min(1, -ny)) * 11;
			wake();
		};

		const handlePointerRest = () => {
			targetX = 0;
			targetY = 0;
			wake();
		};

		if (canTilt) {
			addEventListener('pointermove', handlePointerMove, { passive: true });
			addEventListener('blur', handlePointerRest);
			document.documentElement.addEventListener('pointerleave', handlePointerRest);
		}

		return () => {
			cancelled = true;
			mount?.dispose();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
			cancelAnimationFrame(tiltFrame);
			if (canTilt) {
				removeEventListener('pointermove', handlePointerMove);
				removeEventListener('blur', handlePointerRest);
				document.documentElement.removeEventListener('pointerleave', handlePointerRest);
			}
		};
	});
</script>

<div class="logo-scene">
	<div bind:this={host} class="liquid-logo" role="img" aria-label="alrein Logo">
		<img src={logoUrl} alt="" aria-hidden="true" />
	</div>
</div>

<style>
	.logo-scene {
		perspective: 1100px;
	}

	.liquid-logo {
		position: relative;
		aspect-ratio: 1218 / 386;
		width: min(920px, 94vw);
		margin-inline: auto;
		transform-style: preserve-3d;
		will-change: transform;
	}

	/* Fallback logo, replaced once the shader mounts; dark theme is the default */
	.liquid-logo img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0.85;
		filter: invert(1);
	}

	:global([data-theme='light']) .liquid-logo img {
		filter: none;
	}

	.liquid-logo:global(.ready) img {
		display: none;
	}
</style>
