export type SiteEntry = {
	title: string;
	meta: string;
	description: string;
	href?: string;
	status: 'active' | 'stable' | 'experiment';
};

export const sections = [
	{
		number: '01',
		id: 'projects',
		label: 'Projects',
		kicker: 'Things I build',
		title: 'Selected work.',
		description: 'Websites, tools, and systems. Some out in the world, some still taking shape.',
		entries: [
			{
				title: 'alrein.casa',
				meta: 'IN PROGRESS · PERSONAL WEB',
				description: 'This corner of the internet. A home for my work, experiments, and thoughts.',
				status: 'active'
			},
			{
				title: 'Reinstadler Studio',
				meta: 'LIVE · DESIGN & DEVELOPMENT',
				description: 'Strategy, design, and code for client projects.',
				status: 'stable'
			},
			{
				title: 'Independent systems',
				meta: 'LIVE · TOOLS & AUTOMATION',
				description: 'Useful infrastructure for small teams that prefer to own their stack.',
				status: 'stable'
			}
		] satisfies SiteEntry[]
	},
	{
		number: '02',
		id: 'lab',
		label: 'Lab',
		kicker: 'Room to experiment',
		title: 'Ideas in progress.',
		description: 'Small experiments, prototypes, and the systems running underneath.',
		entries: [
			{
				title: 'ASCII Field',
				meta: 'EXPERIMENT · CANVAS & MOTION',
				description:
					'Shapes made of characters, responding to movement and a curious cursor. You can try them on this page.',
				status: 'experiment'
			},
			{
				title: 'Local-first everything',
				meta: 'RESEARCH',
				description: 'What gets better when a network connection becomes optional?',
				status: 'experiment'
			},
			{
				title: 'The little rack',
				meta: 'IN PROGRESS · HOMELAB',
				description:
					'A deliberately unremarkable collection of services I can understand and repair.',
				status: 'active'
			}
		] satisfies SiteEntry[]
	},
	{
		number: '03',
		id: 'blog',
		label: 'Blog',
		kicker: 'An open notebook',
		title: 'Thinking out loud.',
		description:
			'Politics, technology, and life together. A place for opinions, questions, and changing my mind.',
		entries: [] satisfies SiteEntry[]
	}
];
