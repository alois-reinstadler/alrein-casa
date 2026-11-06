<script lang="ts">
	import PostList from '#lib/components/post-list.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>Blog — Alois Reinstadler</title>
	<meta
		name="description"
		content="An open notebook on politics, technology, and life. Essays, observations, and thoughts by Alois Reinstadler."
	/>
</svelte:head>
<main id="content" class="page-main wrap">
	<header class="page-heading">
		<p class="eyebrow">An open notebook</p>
		<h1 class="metal">Blog</h1>
		<p class="lede">
			Politics, technology, and life together. A place for opinions, questions, and changing my
			mind.
		</p>
	</header>
	<PostList posts={data.posts} />
</main>
