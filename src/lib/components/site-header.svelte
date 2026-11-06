<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { Menu, X } from '@lucide/svelte';
	import ThemeToggle from './theme-toggle.svelte';
	import { Button } from './ui/button/index.js';
	import { sections } from '#lib/site-data.js';
	let { activeSection = '' } = $props<{ activeSection?: string }>();
	let menuOpen = $state(false);
	afterNavigate(() => {
		menuOpen = false;
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') menuOpen = false;
	}}
/>
<header class="site-header">
	<a class="brand" href="/" aria-label="Alois Reinstadler, home">
		<svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
			<path d="M3 5.2 13 22.4 23 5.2h-5.1L13 13.9 8.1 5.2H3Z" fill="currentColor" />
			<path d="M9.6 3h6.8L13 8.9 9.6 3Z" fill="currentColor" opacity=".55" />
		</svg>
		<span class="brand-name metal">Reinstadler</span>
		<span class="badge">CASA</span>
	</a>

	<nav id="primary-navigation" class:open={menuOpen} class="tabs" aria-label="Main navigation">
		{#each [{ id: '', label: 'Home' }, ...sections] as item (item.id)}
			<a
				class:active={activeSection === item.id}
				href={item.id ? `/${item.id}/` : '/'}
				aria-current={activeSection === item.id ? 'page' : undefined}
				onclick={() => (menuOpen = false)}>{item.label}</a
			>
		{/each}
	</nav>

	<div class="actions">
		<ThemeToggle />
		<Button
			variant="ghost"
			size="icon"
			class="menu-button"
			onclick={() => (menuOpen = !menuOpen)}
			aria-label={menuOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={menuOpen}
			aria-controls="primary-navigation"
		>
			{#if menuOpen}<X aria-hidden="true" />{:else}<Menu aria-hidden="true" />{/if}
		</Button>
		<a class="grad nav-cta" href="mailto:alois@alrein.dev"><span>Say hello</span></a>
	</div>
</header>
