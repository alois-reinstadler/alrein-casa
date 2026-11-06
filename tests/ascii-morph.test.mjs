import assert from 'node:assert/strict';
import test from 'node:test';
import { matchMorphPoints, positionMorphParticle } from '../src/lib/ascii-morph.ts';

const source = [
	{ x: 20, y: 40, density: 0.5 },
	{ x: 100, y: 80, density: 1 }
];
const target = [
	{ x: 40, y: 10, density: 0.8 },
	{ x: 120, y: 20, density: 0.6 },
	{ x: 200, y: 100, density: 0.4 }
];
const near = (actual, expected) =>
	assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test('unequal point sets land exactly at their matched endpoints', () => {
	const particles = matchMorphPoints(source, target, 300, 200);
	assert.equal(particles.length, 3);
	for (const particle of particles) {
		for (const [progress, endpoint] of [
			[0, particle.from],
			[1, particle.to]
		]) {
			const point = positionMorphParticle(particle, progress);
			near(point.x, endpoint.x);
			near(point.y, endpoint.y);
			near(point.density, endpoint.density);
		}
	}
	assert.deepEqual(new Set(particles.map((p) => p.to)), new Set(target));
	assert.ok(
		particles.some((p) => {
			const middle = positionMorphParticle(p, 0.5);
			return (
				Math.hypot(middle.x - p.from.x, middle.y - p.from.y) > 1 &&
				Math.hypot(middle.x - p.to.x, middle.y - p.to.y) > 1
			);
		})
	);
});

test('duplicated source samples preserve their combined brightness', () => {
	const point = source[0];
	const one = matchMorphPoints([point], [target[0]], 300, 200)[0];
	const many = matchMorphPoints([point], target, 300, 200);
	near(
		1 - many.reduce((remaining, particle) => remaining * (1 - particle.fromAlpha), 1),
		one.fromAlpha
	);
});

test('empty and stationary shapes never produce invalid positions', () => {
	assert.deepEqual(matchMorphPoints([], [], 300, 200), []);
	for (const [from, to] of [
		[[], target],
		[source, []],
		[source, source]
	]) {
		for (const particle of matchMorphPoints(from, to, 300, 200)) {
			for (const progress of [-1, 0, 0.25, 0.5, 1, 2]) {
				const point = positionMorphParticle(particle, progress);
				assert.ok(Object.values(point).every(Number.isFinite));
				assert.ok(point.alpha >= 0 && point.alpha <= 1);
			}
			if (!from.length) assert.equal(particle.fromAlpha, 0);
			if (!to.length) assert.equal(particle.toAlpha, 0);
		}
	}
});

test('large pages have a deterministic particle budget without changing input arrays', () => {
	const points = Array.from({ length: 6000 }, (_, i) => ({
		x: i % 300,
		y: Math.floor(i / 300),
		density: 0.5
	}));
	const copy = structuredClone(points);
	const first = matchMorphPoints(points, target, 300, 200);
	assert.equal(first.length, 3600);
	assert.deepEqual(first, matchMorphPoints(points, target, 300, 200));
	assert.deepEqual(points, copy);
});
