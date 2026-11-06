export type SiteEntry = {
	title: string;
	meta: string;
	description: string;
	href?: string;
	status?: 'active' | 'stable' | 'experiment' | 'archived';
};

export type SiteSection = {
	number: string;
	id: 'building' | 'shipped' | 'lab' | 'notes' | 'infrastructure' | 'graveyard';
	label: string;
	kicker: string;
	title: string;
	description: string;
	entries: SiteEntry[];
};

export const sections: SiteSection[] = [
	{
		number: '01',
		id: 'building',
		label: 'Building',
		kicker: 'Gerade auf der Werkbank',
		title: 'Dinge, die gerade meinen Schreibtisch übernehmen.',
		description: 'Unfertig, in Bewegung und nah genug am Problem, dass noch alles offen ist.',
		entries: [
			{
				title: 'alrein.casa',
				meta: 'PERSONAL WEB · 2026',
				description:
					'Dieser Ort: ein lebender Index für Arbeit, Notizen und Dinge, die nicht auf LinkedIn gehören.',
				status: 'active'
			},
			{
				title: 'Ein ruhigeres Internet',
				meta: 'FORTLAUFENDES EXPERIMENT',
				description: 'Kleine, nützliche Software, die die Menschen respektiert, die sie verwenden.',
				status: 'experiment'
			}
		]
	},
	{
		number: '02',
		id: 'shipped',
		label: 'Shipped',
		kicker: 'Draußen in der Welt',
		title: 'Fertig genug, um die Werkstatt zu verlassen.',
		description:
			'Produkte, Systeme und Websites, die den Sprung von der Idee in den Alltag geschafft haben.',
		entries: [
			{
				title: 'Reinstadler Studio',
				meta: 'DESIGN & ENTWICKLUNG',
				description:
					'Ein fokussiertes Zuhause für Kundenarbeit — Strategie, Design und Code aus einer Hand.',
				status: 'stable'
			},
			{
				title: 'Unabhängige Systeme',
				meta: 'TOOLS · AUTOMATISIERUNG',
				description:
					'Nützliche Infrastruktur für kleine Teams, die ihren Stack lieber selbst besitzen.',
				status: 'stable'
			}
		]
	},
	{
		number: '03',
		id: 'lab',
		label: 'Lab',
		kicker: 'Versuchsanordnung',
		title: 'Kleine Experimente, Prototypen und halbfertige Ideen.',
		description:
			'Der Bereich für Fragen, bei denen ein funktionierender Versuch mehr sagt als eine weitere Meinung.',
		entries: [
			{
				title: 'ASCII Field',
				meta: 'CANVAS · TYPE · MOTION',
				description:
					'Formen aus Satzzeichen, die auf Licht, Bewegung und einen neugierigen Cursor reagieren.',
				status: 'experiment'
			},
			{
				title: 'Local-first everything',
				meta: 'RESEARCH',
				description: 'Was wird besser, wenn das Netzwerk optional statt zwingend wird?',
				status: 'experiment'
			}
		]
	},
	{
		number: '04',
		id: 'notes',
		label: 'Notes',
		kicker: 'Öffentliches Gedächtnis',
		title: 'Dinge, die ich verstanden habe und wiederfinden will.',
		description: 'Kurze Feldnotizen aus Design, Entwicklung und dem Betrieb eigener Systeme.',
		entries: [
			{
				title: 'Build Logs statt Thought Leadership',
				meta: 'NOTE 001 · 4 MIN',
				description:
					'Entscheidungen, Sackgassen und sonderbar spezifische Lösungen sichtbar machen.',
				status: 'active'
			},
			{
				title: 'Eine Website ist ein Ort',
				meta: 'NOTE 002 · 3 MIN',
				description: 'Warum persönliche Websites bewohnt und nicht bloß optimiert wirken sollten.',
				status: 'active'
			}
		]
	},
	{
		number: '05',
		id: 'infrastructure',
		label: 'Infrastructure',
		kicker: 'Unter der Oberfläche',
		title: 'Server, Netzwerke und die Kabel dazwischen.',
		description:
			'Die langweiligen, verständlichen Systeme, auf denen alles andere zuverlässig stehen darf.',
		entries: [
			{
				title: 'Das kleine Rack',
				meta: 'HOMELAB · AKTIV',
				description:
					'Eine bewusst unspektakuläre Sammlung von Diensten, die ich verstehen und reparieren kann.',
				status: 'active'
			},
			{
				title: 'Wie diese Seite hierherkommt',
				meta: 'SVELTEKIT · EDGE',
				description: 'Die Route von einem Git-Push bis zu den Pixeln auf deinem Bildschirm.',
				status: 'stable'
			}
		]
	},
	{
		number: '06',
		id: 'graveyard',
		label: 'Graveyard',
		kicker: 'Post-mortem',
		title: 'Projekte, die lehrreich und glorreich gestorben sind.',
		description:
			'Beerdigt, aber nicht vergessen. Jede gute Werkstatt braucht ein Regal für Fehlversuche.',
		entries: [
			{
				title: 'Das perfekte Dashboard',
				meta: '2023–2024 · URSACHE: AMBITION',
				description: 'Es konnte alles — außer den Tag von irgendjemandem einfacher zu machen.',
				status: 'archived'
			},
			{
				title: 'Mehrere ausgezeichnete Domains',
				meta: 'VERSCHIEDENE · URSACHE: REALITÄT',
				description: 'Starke Namen, schöne Logos und absolut kein Grund zu existieren.',
				status: 'archived'
			}
		]
	}
];
