<script lang="ts">
	import { Moon, Sun } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';

	let theme = $state<'dark' | 'light'>('dark');

	function applyTheme(value: 'dark' | 'light') {
		theme = value;
		document.documentElement.dataset.theme = value;
		document.documentElement.style.colorScheme = value;
		localStorage.setItem('alrein-theme', value);
	}

	onMount(() => {
		const stored = localStorage.getItem('alrein-theme');
		applyTheme(
			stored === 'dark' || stored === 'light'
				? stored
				: matchMedia('(prefers-color-scheme: light)').matches
					? 'light'
					: 'dark'
		);
	});
</script>

<Button
	variant="ghost"
	size="icon"
	class="theme-button"
	onclick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
	aria-label={theme === 'dark'
		? 'Helles Erscheinungsbild aktivieren'
		: 'Dunkles Erscheinungsbild aktivieren'}
	title={theme === 'dark' ? 'Helles Erscheinungsbild' : 'Dunkles Erscheinungsbild'}
>
	{#if theme === 'dark'}
		<Sun aria-hidden="true" />
	{:else}
		<Moon aria-hidden="true" />
	{/if}
</Button>
