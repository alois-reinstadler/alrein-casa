import type { Component } from 'svelte';

export type PostSummary = {
	slug: string;
	title: string;
	date: string;
	topic: string;
	excerpt: string;
};

type PostModule = { default: Component; metadata: Omit<PostSummary, 'slug'> };
const modules = import.meta.glob<PostModule>('/src/content/writing/*.md', { eager: true });

const posts = Object.entries(modules)
	.map(([path, module]) => {
		const slug = path.split('/').pop()!.replace(/\.md$/, '');
		const metadata = module.metadata;
		if (
			!metadata?.title ||
			!metadata.excerpt ||
			!metadata.topic ||
			!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date) ||
			!Number.isFinite(Date.parse(metadata.date)) ||
			new Date(metadata.date).toISOString().slice(0, 10) !== metadata.date ||
			!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
		)
			throw new Error(`Invalid writing metadata or slug: ${path}`);
		return { summary: { ...metadata, slug }, component: module.default };
	})
	.sort(
		(a, b) =>
			b.summary.date.localeCompare(a.summary.date) || a.summary.slug.localeCompare(b.summary.slug)
	);

export const publishedPosts: PostSummary[] = posts.map((post) => post.summary);
export const findPost = (slug: string) => posts.find((post) => post.summary.slug === slug);
export const formatPostDate = (date: string) =>
	new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(new Date(`${date}T00:00:00Z`));
