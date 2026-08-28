<script lang="ts">
	import { onMount } from 'svelte';
	import oldSite from '../lib/assets/OLD_SITE.html?raw';

	const scriptOpen = '<' + 'script>';
	const scriptClose = '</' + 'script>';
	const styleOpen = '<' + 'style>';
	const styleClose = '</' + 'style>';
	const css = oldSite.slice(
		oldSite.indexOf(styleOpen) + styleOpen.length,
		oldSite.indexOf(styleClose)
	);
	const behavior = oldSite.slice(
		oldSite.indexOf(scriptOpen) + scriptOpen.length,
		oldSite.lastIndexOf(scriptClose)
	);

	onMount(() => {
		// The first pass deliberately runs the original behaviour unchanged. Keeping
		// the source intact gives us a pixel-identical baseline before componentising it.
		const runOriginalSite = new Function(behavior);
		runOriginalSite();
	});
</script>

<svelte:head>
	<title>Reinstadler Studio</title>
	<meta
		name="description"
		content="Independent web studio by Alois Reinstadler — strategy, design and development."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap"
	/>
</svelte:head>

<!-- The stylesheet is a trusted, version-controlled local asset. -->
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html `<style>${css}</style>`}

<header class="nav">
	<a class="brand" href="#top" aria-label="Reinstadler home">
		<svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
			<path d="M3 5.2 13 22.4 23 5.2h-5.1L13 13.9 8.1 5.2H3Z" fill="currentColor" />
			<path d="M9.6 3h6.8L13 8.9 9.6 3Z" fill="currentColor" opacity=".55" />
		</svg>
		<span class="brand-name metal">Reinstadler</span>
		<span class="badge">STUDIO</span>
	</a>

	<div class="tabs" id="tabs" aria-label="Primary" role="tablist">
		<span class="tabs-marker" id="marker"></span>
		<a class="tab" role="tab" href="#work" aria-selected="true">Work</a>
		<a class="tab" role="tab" href="#services" aria-selected="false">Services</a>
		<a class="tab" role="tab" href="#process" aria-selected="false">Process</a>
		<a class="tab" role="tab" href="#faq" aria-selected="false">FAQ</a>
	</div>

	<div class="actions">
		<button class="icon-btn" id="theme" aria-label="Switch theme">
			<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
				<circle cx="10" cy="10" r="3.6" stroke="currentColor" stroke-width="1.5" />
				<path
					d="M10 1.6v2.1M10 16.3v2.1M18.4 10h-2.1M3.7 10H1.6M15.9 4.1l-1.5 1.5M5.6 14.4l-1.5 1.5M15.9 15.9l-1.5-1.5M5.6 5.6 4.1 4.1"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
		</button>
		<a class="grad nav-cta" href="#contact"><span>Get in touch</span></a>
	</div>
</header>

<section class="tall" id="top">
	<canvas class="field" id="fieldHero" aria-hidden="true"></canvas>
	<div class="wrap">
		<div class="hero-grid">
			<div class="hero-copy">
				<p class="eyebrow rise" style="--d:.12s">Independent web studio</p>
				<h1 class="metal rise" style="--d:.22s">
					Your website should be doing more than existing.
				</h1>
				<p class="lede rise" style="--d:.36s">
					I'm Alois. I design and build websites for businesses that need the thing to work, not
					just to look finished — strategy, design, build and launch, handled end to end by the
					person who will still pick up the phone next year.
				</p>
				<a class="grad cta rise" href="#contact" style="--d:.48s"><span>Start a project</span></a>
				<div class="hero-meta rise" style="--d:.58s">
					<span><i class="dot"></i>One person, start to finish</span>
					<span><i class="dot"></i>Fixed price, fixed scope</span>
					<span><i class="dot"></i>Taking work for next quarter</span>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="band" id="services">
	<div class="wrap">
		<div class="section-head">
			<p class="eyebrow rise">What I do</p>
			<h2 class="metal rise" style="--d:.1s">Three ways this usually goes.</h2>
		</div>
		<div class="svc">
			<article class="rise" style="--d:.16s">
				<span class="n">01</span>
				<h3>A website, end to end</h3>
				<p>
					You need a site and you don't have one worth keeping. We start at positioning and finish
					at launch: structure, copy direction, design, build, CMS, analytics, and a handover you
					can actually use.
				</p>
			</article>
			<article class="rise" style="--d:.24s">
				<span class="n">02</span>
				<h3>Rebuilds and rescues</h3>
				<p>
					You have a site that's slow, unmaintainable, or was left half-finished by someone else. I
					audit what's there, tell you honestly what's worth keeping, and rebuild the rest without
					losing your search rankings.
				</p>
			</article>
			<article class="rise" style="--d:.32s">
				<span class="n">03</span>
				<h3>Ongoing care</h3>
				<p>
					A monthly retainer for the businesses who'd rather not think about it: updates, new pages,
					performance, backups, and a person who already knows your codebase when something breaks.
				</p>
			</article>
		</div>
	</div>
</section>

<section class="band" id="work">
	<div class="wrap">
		<div class="section-head">
			<p class="eyebrow rise">Selected work</p>
			<h2 class="metal rise" style="--d:.1s">A few recent projects.</h2>
			<p class="note rise" style="--d:.18s">Names withheld where clients preferred it.</p>
		</div>
		<div class="work-list">
			<a class="work-row rise" href="#contact" style="--d:.16s">
				<h3>B2B software</h3>
				<p>
					Marketing site rebuilt around a single clear offer. New information architecture, design
					system, and a CMS the marketing team runs without me.
				</p>
				<span class="yr">2025</span>
			</a>
			<a class="work-row rise" href="#contact" style="--d:.22s">
				<h3>Independent retailer</h3>
				<p>
					Replatformed a slow storefront onto something maintainable. Checkout simplified from five
					steps to two.
				</p>
				<span class="yr">2025</span>
			</a>
			<a class="work-row rise" href="#contact" style="--d:.28s">
				<h3>Private clinic</h3>
				<p>
					Booking flow, multilingual content, and an accessibility pass that took the site from
					failing to compliant.
				</p>
				<span class="yr">2024</span>
			</a>
		</div>
	</div>
</section>

<section class="rule" aria-hidden="true"><canvas class="field" id="fieldRule"></canvas></section>

<section class="tall" id="process">
	<canvas class="field" id="fieldProcess" aria-hidden="true"></canvas>
	<div class="wrap">
		<div class="split">
			<div class="split-spacer" aria-hidden="true"></div>
			<div class="split-col">
				<p class="eyebrow rise">How it goes</p>
				<h2 class="metal rise" style="--d:.1s">Four steps, no surprises.</h2>
				<p class="lede rise" style="--d:.2s">
					Most of what goes wrong on a web project goes wrong before anyone writes code. So the
					first two steps are the ones I spend the most time on.
				</p>
				<div class="steps rise" style="--d:.3s">
					<div class="step">
						<span class="k">01</span>
						<div>
							<h3>A call</h3>
							<p>
								Thirty minutes, free, no deck. You tell me what the business actually needs. If I'm
								not the right person, I'll say so and point you somewhere better.
							</p>
						</div>
					</div>
					<div class="step">
						<span class="k">02</span>
						<div>
							<h3>A written proposal</h3>
							<p>
								Scope, timeline and a fixed price, on one page. Nothing starts until you've read it
								and agreed to it.
							</p>
						</div>
					</div>
					<div class="step">
						<span class="k">03</span>
						<div>
							<h3>The build</h3>
							<p>
								You see working pages every week, on a real URL, not screenshots. Feedback goes in
								as we go rather than piling up at the end.
							</p>
						</div>
					</div>
					<div class="step">
						<span class="k">04</span>
						<div>
							<h3>Launch and handover</h3>
							<p>
								I ship it, watch it for a fortnight, and leave you with documentation and a
								recording of how to run it.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="band" id="terms">
	<div class="wrap">
		<div class="section-head">
			<p class="eyebrow rise">Working together</p>
			<h2 class="metal rise" style="--d:.1s">Fixed price. No hourly billing.</h2>
			<p class="note rise" style="--d:.18s">
				You get a number before we start, and that number doesn't move unless you ask for something
				we didn't agree on. I'd rather quote carefully once than send surprising invoices.
			</p>
		</div>
		<div class="terms">
			<div class="term rise" style="--d:.16s">
				<span class="tag">Project</span>
				<h3>A site, start to finish</h3>
				<p>
					Quoted as one fixed price after the call. Half up front, half at launch. Typically four to
					eight weeks depending on how much content exists.
				</p>
			</div>
			<div class="term rise" style="--d:.22s">
				<span class="tag">Sprint</span>
				<h3>A focused week</h3>
				<p>
					One week, one problem — a landing page, a performance rescue, a design system. Good when
					you know exactly what you need and want it done now.
				</p>
			</div>
			<div class="term rise" style="--d:.28s">
				<span class="tag">Retainer</span>
				<h3>Ongoing care</h3>
				<p>
					A set number of hours each month for changes, fixes and small additions. Cancel with a
					month's notice, no lock-in.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="band" id="faq">
	<div class="wrap">
		<div class="section-head">
			<p class="eyebrow rise">Questions</p>
			<h2 class="metal rise" style="--d:.1s">The ones I get asked most.</h2>
		</div>
		<div class="faq rise" style="--d:.16s">
			<details open>
				<summary>Am I really working with one person?<i class="pm"></i></summary>
				<p>
					Yes. You talk to me, I do the work, and nothing gets passed to an account manager or
					offshored. When a project genuinely needs a specialist — a photographer, a copywriter, a
					translator — I'll tell you and bring one in openly.
				</p>
			</details>
			<details>
				<summary>What does a website cost?<i class="pm"></i></summary>
				<p>
					It depends on how many pages, how much content exists, and whether you need a CMS. I give
					you a fixed number after the first call rather than a range on a pricing page that would
					be wrong for you either way.
				</p>
			</details>
			<details>
				<summary>How long does it take?<i class="pm"></i></summary>
				<p>
					Four to eight weeks for most projects. The variable is almost never the build — it's how
					quickly content and feedback come back from your side.
				</p>
			</details>
			<details>
				<summary>Do you do design as well as development?<i class="pm"></i></summary>
				<p>
					Both. That's most of the point of hiring one person: nothing gets lost in the handoff
					between a designer who doesn't build and a developer who didn't design.
				</p>
			</details>
			<details>
				<summary>What happens after launch?<i class="pm"></i></summary>
				<p>
					Two weeks of watching and fixing are included. After that you can take it in-house with
					the documentation I leave you, or put me on a retainer.
				</p>
			</details>
			<details>
				<summary>Who owns the code?<i class="pm"></i></summary>
				<p>
					You do, on final payment. Your repository, your hosting account, your domain. Nothing is
					held hostage and there's no proprietary platform you have to stay on.
				</p>
			</details>
		</div>
	</div>
</section>

<section class="contact" id="contact">
	<canvas class="field" id="fieldHands" aria-hidden="true"></canvas>
	<div class="wrap">
		<p class="eyebrow rise">Let's talk</p>
		<h2 class="metal rise" style="--d:.1s">Tell me what you're trying to build.</h2>
		<p class="lede rise" style="--d:.2s">
			One email, a reply within a day, and a call if it sounds like a fit. No forms, no funnel, no
			follow-up sequence.
		</p>
		<a class="grad cta rise" href="mailto:alreinstadler@gmail.com" style="--d:.3s"
			><span>alreinstadler@gmail.com</span></a
		>
	</div>
</section>

<footer>
	<div class="wrap foot">
		<small>© <span id="yr">2026</span> Alois Reinstadler</small>
		<div class="foot-links">
			<a href="#work">Work</a>
			<a href="#services">Services</a>
			<a href="#process">Process</a>
			<a href="#faq">FAQ</a>
			<a href="mailto:alreinstadler@gmail.com">Email</a>
		</div>
	</div>
</footer>
