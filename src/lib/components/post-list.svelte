<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import { formatPostDate, type PostSummary } from '#lib/writing.js';
	let { posts } = $props<{ posts: PostSummary[] }>();
</script>

{#if posts.length}
	<div class="post-list">
		{#each posts as post (post.slug)}
			<article class="post-card">
				<div class="post-meta">
					<time datetime={post.date}>{formatPostDate(post.date)}</time><span>{post.topic}</span>
				</div>
				<h2>
					<a href={`/blog/${post.slug}/`}>{post.title}<ArrowUpRight aria-hidden="true" /></a>
				</h2>
				<p>{post.excerpt}</p>
			</article>
		{/each}
	</div>
{:else}
	<div class="writing-empty">
		<p class="empty-title">A little quiet here, for now.</p>
		<p>
			The first post is still to come. There’s room for long essays, short observations, and
			unfinished thoughts.
		</p>
	</div>
{/if}
