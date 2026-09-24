import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation, reduceSimulation } from '../src/simulation/engine.ts';
import { people } from '../src/simulation/model.ts';
import type { Simulation, Person } from '../src/simulation/model.ts';

function advance(s: Simulation, until: (state: Simulation) => boolean, limit = 10000) {
  for (let i = 0; i < limit; i++) {
    if (until(s)) return s;
    s = reduceSimulation(s, { type: 'tick', dt: .25 });
  }
  assert.fail(`Workflow stalled: ${s.project.stage}/${s.project.phase}, ${JSON.stringify(Object.fromEntries(people.map(n => [n, s.agents[n].state])))}`);
}
test('all six stages produce bounded fictional data across deterministic seeds', () => {
  for (let seed = 1; seed <= 20; seed++) {
    let s = advance(createSimulation(seed), s => s.project.status === 'NEEDS YOU');
    const p = s.project;
    assert.equal(p.stage, 'Rank');
    assert.equal(s.agents.Rank.state, 'NEEDS YOU');
    assert.ok(p.geometry!.depth >= 2 && p.geometry!.depth <= 3.2);
    assert.equal(p.geometry!.width, p.width);
    assert.equal(p.geometry!.pier, p.pier);
    assert.ok(p.geometry!.cells >= 2 && p.geometry!.cells <= 4);
    assert.ok(p.reviews.at(-1)!.accepted);
    assert.ok(p.revision <= 2);
    assert.ok(p.sustainability && p.cost);
    assert.equal(p.alternatives!.length, 3);
    for (const a of p.alternatives!) {
      assert.ok(a.score >= 0 && a.score <= 100);
      assert.equal(a.score, Math.round((a.structural + a.sustainability + a.cost) / 3));
    }
    s = reduceSimulation(s, { type: 'choose', alternative: p.alternatives![0].name });
    assert.equal(s.project.status, 'COMPLETE');
    assert.ok(people.every(n => s.agents[n].pose === 'celebrate'));
  }
});
test('rejection returns to Beam and eventually accepts a revised concept', () => {
  let rejected: Simulation | undefined;
  for (let seed = 1; seed <= 20 && !rejected; seed++) {
    const s = advance(createSimulation(seed), s => s.project.status === 'NEEDS YOU');
    if (s.project.revision > 0) rejected = s;
  }
  assert.ok(rejected, 'At least one seeded run must exercise rejection');
  assert.equal(rejected.project.reviews[0].accepted, false);
  assert.equal(rejected.project.reviews.length, rejected.project.revision + 1);
  assert.equal(rejected.project.reviews.at(-1)!.accepted, true);
});
test('breaks freeze active work and resume without losing progress', () => {
  for (const name of people) {
    let s = advance(createSimulation(12), s => s.project.stage === name && s.project.phase === 'work' && s.agents[name].progress >= 20);
    const progress = s.agents[name].progress;
    s = reduceSimulation(s, { type: 'break', name });
    s = advance(s, s => s.agents[name].state === 'BREAK');
    assert.equal(s.agents[name].progress, progress);
    assert.ok(s.agents[name].resume);
    s = reduceSimulation(s, { type: 'tick', dt: .25 });
    assert.equal(s.agents[name].progress, progress);
    s = advance(s, s => s.project.status === 'NEEDS YOU');
    assert.equal(s.project.status, 'NEEDS YOU');
  }
});
test('a break during a physical handoff resumes the delivery', () => {
  let s = advance(createSimulation(7), s => s.project.phase === 'handoff');
  const sender = s.project.sender as Person;
  s = reduceSimulation(s, { type: 'break', name: sender });
  s = advance(s, s => s.agents[sender].state === 'BREAK');
  s = reduceSimulation(s, { type: 'resume', name: sender });
  s = advance(s, s => s.project.status === 'NEEDS YOU');
  assert.equal(s.project.status, 'NEEDS YOU');
});
test('new project resets outputs while retaining completed project history', () => {
  let s = createSimulation(4);
  assert.equal(reduceSimulation(s, { type: 'new' }), s);
  s = advance(s, s => s.project.status === 'NEEDS YOU');
  assert.equal(reduceSimulation(s, { type: 'choose', alternative: 'Invalid' }), s);
  s = reduceSimulation(s, { type: 'choose', alternative: 'Alternative B' });
  const old = structuredClone(s.project);
  s = reduceSimulation(s, { type: 'new' });
  assert.equal(s.project.id, 'BG-025');
  assert.equal(s.project.stage, 'Atlas');
  assert.equal(s.project.geometry, undefined);
  assert.equal(s.project.cost, undefined);
  assert.deepEqual(s.history[0], old);
  assert.ok(people.every(n => s.agents[n].projectId === 'BG-025'));
});
test('transitions are deterministic, immutable, and zero-time ticks are inert', () => {
  const initial = createSimulation(42), copy = structuredClone(initial);
  const first = reduceSimulation(initial, { type: 'tick', dt: .25 });
  const second = reduceSimulation(initial, { type: 'tick', dt: .25 });
  assert.deepEqual(initial, copy);
  assert.deepEqual(first, second);
  assert.equal(reduceSimulation(initial, { type: 'tick', dt: 0 }), initial);
});
