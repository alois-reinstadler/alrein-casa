<script lang="ts">
	import './layout.css';
	import favicon from '../lib/assets/favicon.svg';
	import { onMount, tick } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import SiteHeader from '#lib/components/site-header.svelte';
	import WritingFooter from '#lib/components/writing-footer.svelte';
	import { playPageTransition } from '#lib/page-transition.js';
	let { children } = $props();
	let transitionCanvas: HTMLCanvasElement;
	let content: HTMLElement;
	let changing = $state(false);
	let cancelTransition: (() => void) | undefined;
	const activeSection = $derived(page.url.pathname.split('/')[1] ?? '');
	onMount(() => {
		document.documentElement.classList.add('ready');
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
		const stopIfReduced = () => {
			if (reducedMotion.matches) cancelTransition?.();
		};
		const stopIfHidden = () => {
			if (document.hidden) cancelTransition?.();
		};
		reducedMotion.addEventListener('change', stopIfReduced);
		document.addEventListener('visibilitychange', stopIfHidden);
		return () => {
			cancelTransition?.();
			reducedMotion.removeEventListener('change', stopIfReduced);
			document.removeEventListener('visibilitychange', stopIfHidden);
			document.documentElement.classList.remove('ready');
		};
	});

	onNavigate((navigation) => {
		cancelTransition?.();
		if (
			navigation.from?.url.pathname === navigation.to?.url.pathname ||
			document.hidden ||
			matchMedia('(prefers-reduced-motion: reduce)').matches
		)
			return;

		const controller = new AbortController();
		let release!: () => void;
		const covered = new Promise<void>((resolve) => {
			release = resolve;
		});
		const cancel = () => {
			controller.abort();
			release();
			changing = false;
		};
		cancelTransition = cancel;
		changing = true;
		void (async () => {
			try {
				await tick();
				await playPageTransition(transitionCanvas, content, controller.signal, async () => {
					release();
					await navigation.complete;
					await tick();
				});
			} catch {
				// Superseding navigations cancel their animations; routing always continues.
			} finally {
				release();
				if (cancelTransition === cancel) {
					changing = false;
					cancelTransition = undefined;
				}
			}
		})();
		return covered;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<a class="skip-link" href="#content">Skip to content</a>
<SiteHeader {activeSection} />
<canvas
	class="route-ascii-transition"
	class:changing
	bind:this={transitionCanvas}
	aria-hidden="true"
></canvas>
<div class="site-shell">
	<div class="route-view" bind:this={content}>
		<div class="route-content">{@render children()}</div>
		<WritingFooter />
	</div>
</div>
