<script lang="ts">
	import { findPost, formatPostDate } from '#lib/writing.js';
	let { data } = $props();
	const Content = $derived(findPost(data.post.slug)!.component);
</script>

<svelte:head>
	<title>{data.post.title} — Alois Reinstadler</title>
	<meta name="description" content={data.post.excerpt} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.post.title} />
	<meta property="og:description" content={data.post.excerpt} />
	<meta property="article:published_time" content={data.post.date} />
</svelte:head>
<main id="content" class="page-main article-main wrap">
	<article>
		<header class="writing-heading">
			<a class="text-link back-link" href="/blog/">← All posts</a>
			<div class="post-meta">
				<time datetime={data.post.date}>{formatPostDate(data.post.date)}</time><span
					>{data.post.topic}</span
				>
			</div>
			<h1>{data.post.title}</h1>
			<p class="lede">{data.post.excerpt}</p>
			<p class="byline">By Alois Reinstadler</p>
		</header>
		<div class="prose"><Content /></div>
		<aside class="article-response">
			<p>Something to add? A different perspective?</p>
			<a
				class="text-link"
				href={`mailto:alois@alrein.dev?subject=${encodeURIComponent(`Re: ${data.post.title}`)}`}
				>Write to me →</a
			>
		</aside>
	</article>
</main>
