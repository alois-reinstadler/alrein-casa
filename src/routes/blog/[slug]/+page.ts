import { error } from '@sveltejs/kit';
import { findPost, publishedPosts } from '#lib/writing.js';
import type { PageLoad, EntryGenerator } from './$types';

export const entries: EntryGenerator = () => publishedPosts.map(({ slug }) => ({ slug }));
export const load: PageLoad = ({ params }) => {
	const post = findPost(params.slug);
	if (!post) error(404, 'This piece of writing could not be found.');
	return { post: post.summary };
};
