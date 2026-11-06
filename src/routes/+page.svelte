<script lang="ts">
	import { ArrowUpRight, Mail } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { initializeAsciiExperience } from '#lib/ascii-engine.js';
	import { sections } from '#lib/site-data.js';
	onMount(() => {
		const destroy = initializeAsciiExperience(['fieldHero', 'fieldFooter']);
		return () => {
			destroy();
		};
	});
</script>

<svelte:head>
	<title>Alois Reinstadler — My corner of the internet</title>
	<meta
		name="description"
		content="My corner of the internet. Projects, experiments, and writing about politics, technology, and life."
	/>
	<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
	<meta name="theme-color" content="#f6f6f7" media="(prefers-color-scheme: light)" />
</svelte:head>

<main id="content">
	<section class="hero tall" id="top" aria-labelledby="hero-title">
		<canvas class="ascii-canvas hero-ascii" id="fieldHero" aria-hidden="true"></canvas>
		<div class="wrap hero-card">
			<p class="eyebrow">ALREIN.CASA / VIENNA, AUSTRIA</p>
			<h1 class="metal" id="hero-title">Alois Reinstadler</h1>
			<p class="lede">My corner of the internet. I build things and think out loud.</p>
			<a class="grad cta" href="mailto:alois@alrein.dev">
				<span><Mail aria-hidden="true" />alois@alrein.dev</span>
			</a>
		</div>
		<div class="hero-index" aria-hidden="true">
			<span>A PERSONAL CORNER</span><span>FIG. 01 / HANDS</span>
		</div>
	</section>

	<nav class="home-destinations wrap" aria-label="Explore this corner">
		{#each sections as section (section.id)}
			<a href={`/${section.id}/`}>
				<span class="eyebrow">{section.number}</span>
				<h2>{section.label} <ArrowUpRight aria-hidden="true" /></h2>
				<p>{section.description}</p>
			</a>
		{/each}
	</nav>
	<section class="contact" id="contact" aria-labelledby="contact-title">
		<canvas class="ascii-canvas footer-ascii" id="fieldFooter" aria-hidden="true"></canvas>
		<div class="wrap contact-copy">
			<p class="eyebrow">Say hello</p>
			<h2 class="metal" id="contact-title">
				Something on<br />your mind?
			</h2>
			<a class="grad cta" href="mailto:alois@alrein.dev">
				<span><Mail aria-hidden="true" />alois@alrein.dev</span>
			</a>
		</div>
	</section>
</main>
