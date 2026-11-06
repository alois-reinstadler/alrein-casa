export type MorphPoint = { x: number; y: number; density: number };
export type MorphParticle = {
	from: MorphPoint;
	to: MorphPoint;
	fromAlpha: number;
	toAlpha: number;
	bend: number;
	delay: number;
};
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const noise = (index: number) => {
	const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
	return value - Math.floor(value);
};

// Interleave coordinates so nearby samples stay together in the correspondence.
function spatialKey(point: MorphPoint, width: number, height: number) {
	const x = Math.round(clamp(point.x / width) * 1023);
	const y = Math.round(clamp(point.y / height) * 1023);
	let key = 0;
	for (let bit = 0; bit < 10; bit++) {
		key |= ((x >> bit) & 1) << (bit * 2);
		key |= ((y >> bit) & 1) << (bit * 2 + 1);
	}
	return key;
}

export function matchMorphPoints(
	source: MorphPoint[],
	target: MorphPoint[],
	width: number,
	height: number
): MorphParticle[] {
	const order = (points: MorphPoint[]) =>
		points
			.map((point) => ({ point, key: spatialKey(point, width, height) }))
			.sort((a, b) => a.key - b.key)
			.map(({ point }) => point);
	const from = order(source);
	const to = order(target);
	const count = Math.min(3600, Math.max(from.length, to.length));
	if (!count) return [];
	const sourceIndices = Array.from({ length: count }, (_, i) =>
		Math.floor((i * from.length) / count)
	);
	const targetIndices = Array.from({ length: count }, (_, i) =>
		Math.floor((i * to.length) / count)
	);
	const sourceUses = new Map<number, number>();
	const targetUses = new Map<number, number>();
	sourceIndices.forEach((index) => sourceUses.set(index, (sourceUses.get(index) ?? 0) + 1));
	targetIndices.forEach((index) => targetUses.set(index, (targetUses.get(index) ?? 0) + 1));
	const alpha = (point: MorphPoint, copies: number) =>
		1 - Math.pow(1 - Math.min(0.94, 0.3 + Math.sqrt(point.density) * 0.64), 1 / copies);
	return Array.from({ length: count }, (_, i) => {
		const a = from[sourceIndices[i]];
		const b = to[targetIndices[i]];
		// Empty regions grow or dissolve in place instead of collapsing into a central dot.
		const start = a ?? { ...b, density: 0 };
		const end = b ?? { ...a, density: 0 };
		return {
			from: start,
			to: end,
			fromAlpha: a ? alpha(a, sourceUses.get(sourceIndices[i])!) : 0,
			toAlpha: b ? alpha(b, targetUses.get(targetIndices[i])!) : 0,
			bend: (noise(i) - 0.5) * 2,
			delay: noise(i + 73) * 0.1
		};
	});
}

export function positionMorphParticle(particle: MorphParticle, progress: number) {
	const t = clamp((progress - particle.delay) / (1 - particle.delay));
	const eased = t * t * t * (t * (t * 6 - 15) + 10);
	const dx = particle.to.x - particle.from.x;
	const dy = particle.to.y - particle.from.y;
	const distance = Math.hypot(dx, dy);
	const arc = Math.sin(Math.PI * eased) * Math.min(42, distance * 0.16) * particle.bend;
	return {
		x: particle.from.x + dx * eased + (distance ? (-dy / distance) * arc : 0),
		y: particle.from.y + dy * eased + (distance ? (dx / distance) * arc : 0),
		density: particle.from.density + (particle.to.density - particle.from.density) * eased,
		alpha: particle.fromAlpha + (particle.toAlpha - particle.fromAlpha) * eased
	};
}
