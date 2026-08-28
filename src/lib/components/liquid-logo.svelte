<script lang="ts">
	import { onMount } from 'svelte';
	import logoUrl from '#lib/assets/alrein-logo-black.svg?url';

	let host: HTMLDivElement;

	onMount(() => {
		let mount: { dispose: () => void } | undefined;
		let objectUrl: string | undefined;
		let cancelled = false;

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
				const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
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

		return () => {
			cancelled = true;
			mount?.dispose();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	});
</script>

<div bind:this={host} class="liquid-logo" role="img" aria-label="alrein Logo">
	<img src={logoUrl} alt="" aria-hidden="true" />
</div>

<style>
	.liquid-logo {
		position: relative;
		aspect-ratio: 1218 / 386;
		width: min(440px, 78vw);
		margin-inline: auto;
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
