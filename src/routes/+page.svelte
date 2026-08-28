<script lang="ts">
	import { ArrowDownRight, ArrowUpRight, Mail } from '@lucide/svelte';
	import { Button } from '../lib/components/ui/button/index.js';

	const sections = [
		[
			'01',
			'building',
			'BUILDING',
			'The things currently taking over my desk.',
			[
				[
					'alrein.casa',
					'PERSONAL WEB · 2026',
					'This place. A living index of work, notes and things I refuse to put on LinkedIn.'
				],
				[
					'A quieter internet',
					'ONGOING EXPERIMENT',
					'Small, useful software that respects the person using it.'
				]
			]
		],
		[
			'02',
			'shipped',
			'SHIPPED',
			'Finished enough to leave the workshop.',
			[
				[
					'Reinstadler Studio',
					'DESIGN & DEVELOPMENT',
					'A focused home for my client work—strategy, design and code from one pair of hands.'
				],
				[
					'Independent systems',
					'TOOLS · AUTOMATION',
					'Useful infrastructure for small teams that would rather own their stack.'
				]
			]
		],
		[
			'03',
			'lab',
			'LAB',
			'Tiny experiments, prototypes and unfinished ideas.',
			[
				[
					'ASCII field',
					'CANVAS · TYPE · MOTION',
					'Images rebuilt from punctuation, then nudged out of shape with a cursor.'
				],
				[
					'Local-first everything',
					'RESEARCH',
					'What gets better when the network becomes optional?'
				]
			]
		],
		[
			'04',
			'notes',
			'NOTES',
			'Things I figured out and want Google to remember for me.',
			[
				[
					'Build logs over thought leadership',
					'NOTE 001 · 4 MIN',
					'Showing the decisions, dead ends and oddly specific fixes.'
				],
				[
					'A website is a place',
					'NOTE 002 · 3 MIN',
					'Why personal sites should feel inhabited, not optimized.'
				]
			]
		],
		[
			'05',
			'infrastructure',
			'INFRASTRUCTURE',
			'Homelab, servers, networks and the cables between them.',
			[
				[
					'The small rack',
					'HOMELAB · ACTIVE',
					'A deliberately boring collection of services I can understand and repair.'
				],
				[
					'How this site gets here',
					'SVELTEKIT · EDGE',
					'A map of the route from a git push to the pixels on your screen.'
				]
			]
		],
		[
			'06',
			'graveyard',
			'GRAVEYARD',
			'Projects that died glorious, instructive deaths.',
			[
				[
					'The perfect dashboard',
					'2023–2024 · CAUSE: AMBITION',
					'It did everything except make anyone’s day simpler.'
				],
				[
					'Several excellent domains',
					'VARIOUS · CAUSE: REALITY',
					'Strong names, beautiful logos, absolutely no reason to exist.'
				]
			]
		]
	] as const;

	const statue = `                 .:+*##%%%%##*+:.
             .=#@@@@@@@@@@@@@@@@@@#=.
           :#@@@@@@%*+=--=+*%@@@@@@@#:
          +@@@@@#-.          .-#@@@@@+
         #@@@@*.    .::::::.    .*@@@@#
        %@@@%:   .+%@@@@@@@@%+.   :%@@@%
       #@@@%    +@@@@@%##%@@@@+    %@@@#
       @@@@.   #@@@#:      :#@@@#   .@@@@
      :@@@#   *@@@+   ....   +@@@*   #@@@:
      -@@@*   @@@%  .#@@@@#.  %@@@   *@@@-
       @@@@.  @@@#  *@@@@@@*  #@@@  .@@@@
       *@@@%  +@@@=  -#@@#-  =@@@+  %@@@*
        %@@@*  #@@@*:      :*@@@#  *@@@%
         %@@@%: *@@@@@@@@@@@@@@@@* :%@@@%
          #@@@@+ :#@@@@@@@@@@@@#: +@@@@#
           +@@@@%:  :=*####*=:  :%@@@@+
            .#@@@@%+:.      .:+%@@@@#.
              :#@@@@@@@@@@@@@@@@@@#:
             .+%@@@@@@@@@@@@@@@@@@%+.
           .*@@@@@@@%#******#%@@@@@@@*.
          #@@@@@%+:            :+%@@@@@#
        :%@@@@*.                  .*@@@@%:
       +@@@@%.                      .%@@@@+
      *@@@@+                          +@@@@*
     #@@@@-                            -@@@@#`;
	const contactArt = `........::::::oooooxxxx%%%%XXXX####&&&&@@@@
   ........:::::oooooxxxx%%%%XXXX####&&&&
      .......:::::oooooxxxx%%%%XXXX####
          ......::::oooooxxxx%%%%XXXX
              .....:::ooooxxxx%%%%`;

	let pointerX = $state(0),
		pointerY = $state(0),
		active = $state('building');
	function move(event: PointerEvent) {
		pointerX = (event.clientX / innerWidth - 0.5) * 18;
		pointerY = (event.clientY / innerHeight - 0.5) * 12;
	}
	function observe(node: HTMLElement, id: string) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) active = id;
			},
			{ rootMargin: '-35% 0px -55%' }
		);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

<svelte:head
	><title>Alois Reinstadler — Designer & Builder</title><meta
		name="description"
		content="Alois Reinstadler designs things, builds things, and writes down what he learns."
	/></svelte:head
>
<svelte:window onpointermove={move} />

<header class="site-header">
	<a class="brand" href="#top" aria-label="Alois Reinstadler, home"
		><svg viewBox="0 0 26 26" aria-hidden="true"
			><path d="M3 5.2 13 22.4 23 5.2h-5.1L13 13.9 8.1 5.2H3Z" /><path
				opacity=".5"
				d="M9.6 3h6.8L13 8.9 9.6 3Z"
			/></svg
		><span class="metal">Reinstadler</span><span class="badge">CASA</span></a
	>
	<nav aria-label="Primary navigation">
		<a href="#building">Now</a><a href="#shipped">Work</a><a href="#notes">Notes</a>
	</nav>
	<Button href="#contact" variant="outline" class="nav-contact">Say hello</Button>
</header>

<main>
	<section class="hero" id="top">
		<div class="hero-copy">
			<p class="eyebrow">ALREIN.CASA / VIENNA, AUSTRIA</p>
			<h1 class="metal">
				I design things.<br />I build things.<br /><span>Occasionally</span><br />they even work.
			</h1>
			<a class="down-link" href="#building">See what I’m up to <ArrowDownRight /></a>
		</div>
		<div class="statue" aria-hidden="true" style={`--mx:${pointerX}px;--my:${pointerY}px`}>
			<div class="ghost red">{statue}</div>
			<div class="ghost blue">{statue}</div>
			<pre>{statue}</pre>
			<span>FIG. 01 / THE THINKER, PROBABLY</span>
		</div>
		<div class="hero-index"><span>PERSONAL INDEX</span><span>EST. 1996</span></div>
	</section>
	<div class="section-nav" aria-label="Section index">
		{#each sections as s (s[1])}<a class:active={active === s[1]} href={`#${s[1]}`}
				><span>{s[0]}</span>{s[2]}</a
			>{/each}
	</div>
	{#each sections as section, i (section[1])}
		<section class="index-section" id={section[1]} use:observe={section[1]}>
			<header class="section-heading">
				<span class="number">{section[0]}</span>
				<div>
					<p class="eyebrow">{section[2]}</p>
					<h2 class="metal">{section[3]}</h2>
				</div>
			</header>
			<div class="entries">
				{#each section[4] as item (item[0])}<a class="entry" href="#contact"
						><span class="entry-meta">{item[1]}</span>
						<h3>{item[0]}</h3>
						<p>{item[2]}</p>
						<ArrowUpRight /></a
					>{/each}
			</div>
			{#if i === 2}<div class="ascii-divider" aria-hidden="true">
					+ + + + + + + + + + + + + + + + + + + + + + + + + +
				</div>{/if}
		</section>
	{/each}
	<section class="contact" id="contact">
		<div class="contact-art" aria-hidden="true">
			{contactArt}
		</div>
		<div class="contact-copy">
			<p class="eyebrow">LET’S TALK</p>
			<h2 class="metal">Tell me what you’re<br />trying to build.</h2>
			<p>Interesting project, strange idea, or a problem that refuses to behave?</p>
			<a class="gradient-button" href="mailto:alreinstadler@gmail.com"
				><span><Mail /> alreinstadler@gmail.com</span></a
			>
		</div>
	</section>
</main>
<footer>
	<span>© {new Date().getFullYear()} ALOIS REINSTADLER</span>
	<div>
		<a href="https://github.com/alois-reinstadler">GITHUB</a><a
			href="mailto:alreinstadler@gmail.com">EMAIL</a
		>
	</div>
</footer>
