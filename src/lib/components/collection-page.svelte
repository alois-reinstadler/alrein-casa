<script lang="ts">
	import { onMount } from 'svelte';
	import { sections } from '#lib/site-data.js';
	import { initializeAsciiExperience } from '#lib/ascii-engine.js';
	let { id } = $props<{ id: 'projects' | 'lab' }>();
	const section = $derived(sections.find((section) => section.id === id)!);
	onMount(() => {
		const destroy = id === 'lab' ? initializeAsciiExperience(['fieldProcess']) : () => {};
		return () => {
			destroy();
		};
	});
</script>

<svelte:head>
	<title>{section.label} — Alois Reinstadler</title>
	<meta name="description" content={section.description} />
</svelte:head>
<main id="content" class="page-main collection-page wrap" class:lab-page={id === 'lab'}>
	{#if id === 'lab'}
		<div class="lab-art" aria-hidden="true">
			<canvas class="ascii-canvas" id="fieldProcess"></canvas>
		</div>
	{/if}
	<header class="page-heading">
		<p class="eyebrow">{section.kicker}</p>
		<h1 class="metal">{section.label}</h1>
		<p class="lede">{section.description}</p>
	</header>
	<div class="collection-entries">
		{#each section.entries as entry (entry.title)}
			<article class="entry">
				<span class="entry-meta"
					><i class={`status status-${entry.status}`} aria-hidden="true"></i>{entry.meta}</span
				>
				<h2>{entry.title}</h2>
				<p>{entry.description}</p>
			</article>
		{/each}
	</div>
</main>
