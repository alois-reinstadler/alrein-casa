<script lang="ts">
	import { ArrowDownRight, ArrowUpRight, Mail, Menu, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import AsciiField from '#lib/components/ascii-field.svelte';
	import ThemeToggle from '#lib/components/theme-toggle.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { sections } from '#lib/site-data.js';

	let activeSection = $state('building');
	let menuOpen = $state(false);
	let sectionNavigation: HTMLElement;

	const primaryNavigation = sections.filter((section) =>
		['building', 'shipped', 'notes', 'infrastructure'].includes(section.id)
	);

	function setActiveSection(id: string) {
		activeSection = id;
		if (innerWidth <= 800) {
			requestAnimationFrame(() => {
				const activeLink = sectionNavigation?.querySelector<HTMLElement>(`[data-section="${id}"]`);
				if (activeLink) {
					sectionNavigation.scrollTo({
						left:
							activeLink.offsetLeft +
							activeLink.offsetWidth / 2 -
							sectionNavigation.clientWidth / 2,
						behavior: 'smooth'
					});
				}
			});
		}
	}

	function observe(node: HTMLElement, id: string) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setActiveSection(id);
			},
			{ rootMargin: '-28% 0px -58%' }
		);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}

	onMount(() => {
		document.documentElement.classList.add('ready');
		return () => document.documentElement.classList.remove('ready');
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') menuOpen = false;
	}}
/>

<svelte:head>
	<title>Alois Reinstadler — Designer & Builder</title>
	<meta
		name="description"
		content="Alois Reinstadler gestaltet Dinge, baut Systeme und schreibt auf, was er dabei lernt."
	/>
	<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
	<meta name="theme-color" content="#f6f6f7" media="(prefers-color-scheme: light)" />
</svelte:head>

<a class="skip-link" href="#content">Zum Inhalt springen</a>

<header class="site-header">
	<a class="brand" href="#top" aria-label="Alois Reinstadler, Startseite">
		<svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
			<path d="M3 5.2 13 22.4 23 5.2h-5.1L13 13.9 8.1 5.2H3Z" fill="currentColor" />
			<path d="M9.6 3h6.8L13 8.9 9.6 3Z" fill="currentColor" opacity=".55" />
		</svg>
		<span class="brand-name metal">Reinstadler</span>
		<span class="badge">CASA</span>
	</a>

	<nav id="primary-navigation" class:open={menuOpen} class="tabs" aria-label="Hauptnavigation">
		{#each primaryNavigation as item (item.id)}
			<a
				class:active={activeSection === item.id}
				href={`#${item.id}`}
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
			aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
			aria-expanded={menuOpen}
			aria-controls="primary-navigation"
		>
			{#if menuOpen}<X aria-hidden="true" />{:else}<Menu aria-hidden="true" />{/if}
		</Button>
		<a class="grad nav-cta" href="#contact"><span>Hallo sagen</span></a>
	</div>
</header>

<main id="content">
	<section class="hero tall" id="top" aria-labelledby="hero-title">
		<div class="hero-ascii" aria-hidden="true">
			<AsciiField mode="figure" interactive />
		</div>
		<div class="wrap hero-grid">
			<div class="hero-copy">
				<p class="eyebrow rise" style="--d: .12s">ALREIN.CASA / WIEN, ÖSTERREICH</p>
				<h1 class="metal rise" id="hero-title" style="--d: .22s">
					Ich gestalte Dinge.<br />Ich baue Dinge.<br /><span>Manchmal</span><br />funktionieren sie
					sogar.
				</h1>
				<p class="lede rise" style="--d: .36s">
					Designer, Entwickler und Betreiber eigener Systeme. Das hier ist mein öffentlicher
					Schreibtisch: aktuelle Arbeit, verschickte Projekte und nützliche Fehlversuche.
				</p>
				<a class="ghost rise" href="#building" style="--d: .48s">
					Was gerade entsteht <ArrowDownRight class="arrow" aria-hidden="true" />
				</a>
				<div class="hero-meta rise" style="--d: .58s">
					<span><i class="dot"></i>Design & Code</span>
					<span><i class="dot"></i>Unabhängige Systeme</span>
					<span><i class="dot"></i>Seit 1996 neugierig</span>
				</div>
			</div>
		</div>
		<div class="hero-index" aria-hidden="true">
			<span>PERSONAL INDEX</span><span>FIG. 01 / THE THINKER, PROBABLY</span>
		</div>
	</section>

	<nav bind:this={sectionNavigation} class="section-nav" aria-label="Bereichsindex">
		{#each sections as section (section.id)}
			<a
				class:active={activeSection === section.id}
				data-section={section.id}
				href={`#${section.id}`}
			>
				<span>{section.number}</span>{section.label}
			</a>
		{/each}
	</nav>

	{#each sections as section, index (section.id)}
		<section
			class:has-ascii={section.id === 'lab' || section.id === 'infrastructure'}
			class:graveyard={section.id === 'graveyard'}
			class="index-section band"
			id={section.id}
			use:observe={section.id}
			aria-labelledby={`${section.id}-title`}
		>
			{#if section.id === 'lab' || section.id === 'infrastructure'}
				<div class="section-ascii" aria-hidden="true">
					<AsciiField
						mode={section.id === 'lab' ? 'signal' : 'network'}
						interactive={section.id === 'infrastructure'}
					/>
				</div>
			{/if}

			<div class="wrap">
				<header class="section-heading">
					<span class="number rise">{section.number}</span>
					<div>
						<p class="eyebrow rise">{section.kicker}</p>
						<h2 class="metal rise" id={`${section.id}-title`} style="--d: .1s">
							{section.title}
						</h2>
						<p class="note rise" style="--d: .18s">{section.description}</p>
					</div>
				</header>

				<div class="entries rise" style="--d: .22s">
					{#each section.entries as entry (entry.title)}
						<a
							class="entry"
							class:archived={entry.status === 'archived'}
							href={entry.href ?? '#contact'}
						>
							<span class="entry-meta">
								<i class={`status status-${entry.status}`} aria-hidden="true"></i>{entry.meta}
							</span>
							<h3>{entry.title}</h3>
							<p>{entry.description}</p>
							<ArrowUpRight aria-hidden="true" />
						</a>
					{/each}
				</div>

				<div class="section-foot" aria-hidden="true">
					<span>{section.label.toUpperCase()}</span><span
						>{String(index + 1).padStart(2, '0')} / 06</span
					>
				</div>
			</div>
		</section>
	{/each}

	<section class="contact" id="contact" aria-labelledby="contact-title">
		<div class="contact-ascii" aria-hidden="true"><AsciiField mode="horizon" /></div>
		<div class="wrap contact-copy">
			<p class="eyebrow rise">Lass uns reden</p>
			<h2 class="metal rise" id="contact-title" style="--d: .1s">
				Erzähl mir, was du<br />bauen möchtest.
			</h2>
			<p class="lede rise" style="--d: .2s">
				Ein interessantes Projekt, eine seltsame Idee oder ein Problem, das sich hartnäckig weigert,
				brav zu sein?
			</p>
			<a class="grad cta rise" href="mailto:alreinstadler@gmail.com" style="--d: .3s">
				<span><Mail aria-hidden="true" />alreinstadler@gmail.com</span>
			</a>
		</div>
	</section>
</main>

<footer>
	<div class="wrap foot">
		<small>© {new Date().getFullYear()} Alois Reinstadler</small>
		<div class="foot-links">
			<a href="#building">Building</a>
			<a href="#shipped">Shipped</a>
			<a href="#notes">Notes</a>
			<a href="https://github.com/alois-reinstadler" rel="me">GitHub</a>
			<a href="mailto:alreinstadler@gmail.com">E-Mail</a>
		</div>
	</div>
</footer>
