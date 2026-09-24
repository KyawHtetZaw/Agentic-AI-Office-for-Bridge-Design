import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation, reduceSimulation } from '../src/simulation/engine.ts';
import { everyone, location, people, workers } from '../src/simulation/model.ts';
import { assignedAgent, boardColumns, projectColumn, projectProgress } from '../src/simulation/management.ts';
import { planRoute, blocked } from '../src/simulation/behavior.ts';
import type { Person, Simulation } from '../src/simulation/model.ts';

function advance(s: Simulation, until: (state: Simulation) => boolean, limit = 14000, resolveChoices = false) {
  for (let i = 0; i < limit; i++) {
    if (until(s)) return s;
    if (resolveChoices && s.project.issue === 'checkRevision') s = reduceSimulation(s, { type: 'decision', choice: 'sendBack' });
    else if (resolveChoices && s.project.issue === 'ecoTradeoff') s = reduceSimulation(s, { type: 'decision', choice: 'chooseA' });
    else s = reduceSimulation(s, { type: 'tick', dt: .25 });
  }
  assert.fail(`Workflow stalled: ${s.project.stage}/${s.project.phase}/${s.project.issue}, ${JSON.stringify(Object.fromEntries(people.map(n => [n, s.agents[n].state])))}`);
}
const toRank = (s: Simulation) => advance(s, next => next.project.issue === 'rankChoice', 14000, true);

test('the existing workflow reaches Rank with three bounded, fictional alternatives', () => {
  for (let seed = 1; seed <= 12; seed++) {
    let s = toRank(createSimulation(seed)); const p = s.project;
    assert.equal(p.stage, 'Rank'); assert.equal(p.status, 'NEEDS YOU');
    assert.equal(p.concepts!.length, 3); assert.equal(p.alternatives!.length, 3);
    for (const concept of p.concepts!) {
      assert.ok(concept.geometry.depth >= 2 && concept.geometry.depth <= 3.2);
      assert.equal(concept.geometry.width, p.width);
      assert.ok(concept.structural >= 72 && concept.structural <= 94);
    }
    assert.ok(p.reviews.at(-1)!.accepted); assert.ok(p.sustainability && p.cost);
    for (const name of workers) assert.ok(p.workerResults[name], `${name} delivered a game result`);
    for (const a of p.alternatives!) {
      assert.ok(a.score >= 0 && a.score <= 100);
      assert.equal(a.score, Math.round((a.structural + a.carbon + a.durability + a.maintainability + a.environmental + a.cost) / 6));
    }
    s = reduceSimulation(s, { type: 'choose', alternative: p.alternatives![0].name });
    assert.equal(s.project.issue, 'ceoApproval'); assert.equal(projectColumn(s.project), 'CEO REVIEW');
    s = reduceSimulation(s, { type: 'decision', choice: 'approveProject' });
    assert.equal(s.project.status, 'COMPLETE'); assert.equal(s.stats.projectsCompleted, 1);
    assert.ok(s.celebrationUntil > s.time);
  }
});

test('Check rejection waits for player; revision returns physically to Beam', () => {
  let rejected: Simulation | undefined;
  for (let seed = 1; seed <= 25 && !rejected; seed++) {
    const s = advance(createSimulation(seed), next => next.project.issue === 'checkRevision' || next.project.issue === 'ecoTradeoff');
    if (s.project.issue === 'checkRevision') rejected = s;
  }
  assert.ok(rejected);
  assert.equal(rejected.project.reviews.at(-1)!.accepted, false);
  const waiting = reduceSimulation(rejected, { type: 'decision', choice: 'ignore' });
  assert.equal(waiting.project.ignored, true); assert.equal(waiting.project.issue, 'checkRevision');
  const revised = reduceSimulation(waiting, { type: 'decision', choice: 'sendBack' });
  assert.equal(revised.project.stage, 'Beam'); assert.equal(revised.project.phase, 'handoff');
  assert.equal(revised.stats.beamRevisions, 1); assert.equal(revised.stats.checkRejections, 1);
  assert.equal(toRank(revised).project.issue, 'rankChoice');
});

test('Check approval is a distinct fictional override that advances to Eco', () => {
  let rejected: Simulation | undefined;
  for (let seed = 1; seed <= 25 && !rejected; seed++) {
    const s = advance(createSimulation(seed), next => next.project.issue === 'checkRevision' || next.project.issue === 'ecoTradeoff');
    if (s.project.issue === 'checkRevision') rejected = s;
  }
  assert.ok(rejected);
  const approved = reduceSimulation(rejected, { type: 'decision', choice: 'approveRevision' });
  assert.equal(approved.project.stage, 'Eco');
  assert.equal(approved.project.reviews.at(-1)!.accepted, true);
  assert.equal(approved.project.concepts![0].review, 'PASS');
});

test('four specialists work concurrently and return to Eco before Cash', () => {
  let s = advance(createSimulation(8), next => next.project.phase === 'department', 14000, true);
  s = advance(s, next => workers.every(name => next.agents[name].state === 'WORKING'));
  assert.ok(workers.every(name => s.agents[name].progress < 100));
  s = advance(s, next => next.project.phase === 'reports');
  assert.ok(workers.every(name => s.project.workerResults[name]));
  assert.equal(s.project.sustainability, undefined);
  s = advance(s, next => next.project.issue === 'ecoTradeoff');
  assert.ok(s.project.sustainability); assert.equal(s.stats.carbonAssessments, 1);
  s = reduceSimulation(s, { type: 'decision', choice: 'chooseB' });
  assert.equal(s.project.ecoPreference, 'B'); assert.equal(s.project.stage, 'Cash');
});

test('CEO review can delay, reject, and eventually approve a renewed project', () => {
  let s = toRank(createSimulation(17));
  s = reduceSimulation(s, { type: 'choose', alternative: 'Alternative B' });
  s = reduceSimulation(s, { type: 'decision', choice: 'ignore' });
  assert.equal(s.project.ignored, true);
  s = reduceSimulation(s, { type: 'decision', choice: 'rejectProject' });
  assert.equal(s.stats.projectsRejected, 1); assert.equal(s.project.stage, 'Beam');
  assert.equal(s.project.alternatives, undefined); assert.equal(s.project.winner, undefined);
  s = toRank(s); s = reduceSimulation(s, { type: 'choose', alternative: 'Alternative A' });
  s = reduceSimulation(s, { type: 'decision', choice: 'approveProject' });
  assert.equal(s.project.status, 'COMPLETE'); assert.equal(s.stats.projectsCompleted, 1);
});

test('breaks preserve active progress and resume across the gated workflow', () => {
  for (const name of people) {
    let s = advance(createSimulation(12), next => next.project.stage === name && next.project.phase === 'work' && next.agents[name].progress >= 20, 14000, true);
    const progress = s.agents[name].progress;
    s = reduceSimulation(s, { type: 'break', name });
    s = advance(s, next => next.agents[name].state === 'BREAK');
    assert.equal(s.agents[name].progress, progress); assert.ok(s.agents[name].resume);
    s = reduceSimulation(s, { type: 'resume', name });
    assert.equal(toRank(s).project.issue, 'rankChoice');
  }
});

test('a break during a physical handoff resumes delivery', () => {
  let s = advance(createSimulation(7), next => next.project.phase === 'handoff');
  const sender = s.project.sender as Person;
  s = reduceSimulation(s, { type: 'break', name: sender });
  s = advance(s, next => next.agents[sender].state === 'BREAK');
  s = reduceSimulation(s, { type: 'resume', name: sender });
  assert.equal(toRank(s).project.issue, 'rankChoice');
});

test('completed project history and board columns survive a new project', () => {
  let s = createSimulation(4);
  assert.equal(reduceSimulation(s, { type: 'new' }), s);
  s = toRank(s);
  assert.equal(reduceSimulation(s, { type: 'choose', alternative: 'Invalid' }), s);
  s = reduceSimulation(s, { type: 'choose', alternative: 'Alternative B' });
  s = reduceSimulation(s, { type: 'decision', choice: 'approveProject' });
  const old = structuredClone(s.project);
  s = reduceSimulation(s, { type: 'new' });
  assert.equal(s.project.id, 'BG-025'); assert.equal(s.project.stage, 'Atlas');
  assert.equal(s.project.geometry, undefined); assert.deepEqual(s.history[0], old);
  assert.equal(projectColumn(s.history[0]), 'COMPLETED'); assert.equal(projectColumn(s.project), 'NEW PROJECT');
  assert.ok(boardColumns.includes(projectColumn(s.project)));
  assert.equal(projectProgress(s.history[0], s), 100);
  assert.equal(assignedAgent(s.project), 'Atlas');
});

test('cross-room routes use corridor and door gaps', () => {
  const pairs = [[location('Beam','desk'), location('Carbon','desk')], [location('Eco','desk'), location('Cash','desk')],
    [location('Kyaw','ceoOffice'), location('Kyaw','parking')], [location('Maintain','desk'), location('Maintain','ecoModel')]] as const;
  for (const [from,to] of pairs) {
    const route = planRoute(from,to); assert.ok(route.length > 2);
    assert.deepEqual(route.at(-1),to);
    assert.ok(route.slice(0,-1).every(point => !blocked(point)));
  }
});

test('toilet visits hide characters and count funny statistics', () => {
  let found = false;
  for (let seed = 1; seed <= 20 && !found; seed++) {
    let s = createSimulation(seed);
    for (let i=0;i<1800;i++) {
      s = reduceSimulation(s,{type:'tick',dt:.25});
      const away = everyone.find(name => s.agents[name].hiddenUntil > s.time);
      if (away) {
        found = true; assert.equal(s.agents[away].state,'AWAY'); assert.ok(s.stats.toiletBreaks > 0);
        s = advance(s, next => next.agents[away].hiddenUntil === 0);
        assert.notEqual(s.agents[away].state,'AWAY'); break;
      }
    }
  }
  assert.ok(found);
});

test('the CEO takes a suspiciously long toilet break', () => {
  let s = reduceSimulation(createSimulation(3), { type: 'ceo', command: 'toilet' });
  s = advance(s, next => next.agents.Kyaw.hiddenUntil > next.time);
  assert.equal(s.agents.Kyaw.state, 'AWAY');
  assert.ok(s.agents.Kyaw.hiddenUntil - s.time >= 13.5);
  assert.equal(s.stats.toiletBreaks, 1);
});

test('CEO controls trigger physical travel, humorous dialog, and event statistics', () => {
  let s = createSimulation(19);
  s = reduceSimulation(s,{type:'ceo',command:'scold',target:'Beam'});
  assert.equal(s.agents.Kyaw.state,'WALKING'); assert.ok(s.agents.Kyaw.route.length>2);
  s = advance(s, next => next.agents.Kyaw.bubble.includes('Why is this project'));
  assert.ok(s.events.some(event => event.name==='Beam' && event.text.includes('boss')));
  assert.equal(s.stats.ceoScoldings, 1);
  s = advance(s, next => next.agents.Kyaw.state==='PLAYING' && next.ceoStory===null);
  assert.equal(s.agents.Kyaw.destination,'game');
  const meetingStart=s.time;
  const meetingsBefore=s.stats.pointlessMeetings;
  s = reduceSimulation(s,{type:'ceo',command:'meeting'});
  assert.ok(everyone.some(name => name!=='Kyaw' && s.agents[name].destination==='meeting'));
  s = advance(s, next => next.events.some(event => event.time>=meetingStart && event.text.includes('forgot why')));
  assert.equal(s.agents.Kyaw.pose,'sleep'); assert.equal(s.stats.pointlessMeetings, meetingsBefore + 1);
});

test('transitions remain deterministic, immutable, and zero-time ticks are inert', () => {
  const initial = createSimulation(42), copy = structuredClone(initial);
  const first = reduceSimulation(initial, { type: 'tick', dt: .25 });
  const second = reduceSimulation(initial, { type: 'tick', dt: .25 });
  assert.deepEqual(initial, copy); assert.deepEqual(first, second);
  assert.equal(reduceSimulation(initial, { type: 'tick', dt: 0 }), initial);
});
