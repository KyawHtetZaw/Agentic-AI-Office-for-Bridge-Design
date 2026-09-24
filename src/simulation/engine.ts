import { people, workers, everyone, location } from './model.ts';
import type { Action, Agent, Alternative, Person, CorePerson, Project, Simulation, Worker, CeoCommand, Place, GameStats, Concept } from './model.ts';
import { move, travel, workPlaces, workPoses } from './behavior.ts';

const durations: Record<Person, number> = { Atlas: 7, Beam: 16, Check: 12, Eco: 10, Cash: 10, Rank: 12, Carbon: 11, Durability: 12, Maintain: 10, Environment: 13, Kyaw: 0 };
export const taskNames: Record<Person, string> = {
  Atlas: 'Organizing the fictional project brief', Beam: 'Generating a pretend box-girder concept', Check: 'Running fictional concept checks',
  Eco: 'Combining the department’s fictional results', Cash: 'Counting fictional game costs', Rank: 'Comparing imaginary alternatives',
  Carbon: 'Simulating concrete, steel and tendon carbon scores', Durability: 'Playing with pretend exposure and material scores',
  Maintain: 'Imagining inspection and maintenance access', Environment: 'Scoring fictional site and construction disturbance', Kyaw: 'Avoiding work',
};
const thoughts: Record<Person, string[]> = {
  Atlas: ['A little plan goes a long way.', 'Who has the tiny sticky notes?'],
  Beam: ['Trying another imaginary box depth…', 'More cells, more possibilities?'],
  Check: ['Checking the checks. Again.', 'My clipboard has a clipboard.'],
  Eco: ['Can this pretend bridge be greener?', 'The plant approves this idea.'],
  Cash: ['These dollars are 100% imaginary.', 'Budget for coffee: emotionally unlimited.'],
  Rank: ['Ranking ideas, not people.', 'The chart needs one more chart.'],
  Carbon: ['Counting pretend emissions…', 'The little tree approves.'],
  Durability: ['The fake rain is very dramatic.', 'Checking durability, in game points.'],
  Maintain: ['Can a tiny robot reach that?', 'Imaginary inspection hatch: located.'],
  Environment: ['How loud is pretend construction?', 'The birds would like less noise.'],
  Kyaw: ['I am absolutely working.', 'Has anyone seen the game controller?'],
};
function random(s: Simulation) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296; }
function integer(s: Simulation, min: number, max: number) { return Math.floor(random(s) * (max - min + 1)) + min; }
const emptyStats = (): GameStats => ({ projectsCompleted: 0, projectsRejected: 0, beamRevisions: 0, checkRejections: 0,
  carbonAssessments: 0, maintenanceComplaints: 0, environmentalWarnings: 0, costArguments: 0,
  sustainabilityMeetings: 0, coffeeConsumed: 0, ceoCoffeeConsumed: 0, ceoNaps: 0, ceoScoldings: 0, beamScoldings: 0, ceoGamingSessions: 0,
  pointlessMeetings: 0, toiletBreaks: 0 });
function say(s: Simulation, name: Person, text: string, seconds = 6) {
  const agent = s.agents[name]; agent.bubble = text; agent.bubbleUntil = s.time + seconds; agent.thought = text;
  s.events.unshift({ id: ++s.eventId, name, text, time: s.time }); s.events = s.events.slice(0, 40);
}
function makeProject(s: Simulation): Project {
  const number = s.nextProject++;
  return { id: `BG-${String(number).padStart(3, '0')}`, title: ['The Willow Crossing', 'The Maple Connection', 'The Pebble Link'][number % 3],
    type: 'Post-Tensioned Concrete Box Girder', alignment: 'Straight', spans: integer(s, 2, 4), span: integer(s, 30, 50),
    width: integer(s, 10, 15), pier: integer(s, 7, 12), revision: 0, status: 'ACTIVE', stage: 'Atlas', phase: 'travel',
    sender: null, workElapsed: 0, reviews: [], workerResults: {}, startedAt: s.time };
}
function beginWork(s: Simulation, name: CorePerson) {
  const a = s.agents[name]; a.eventUntil = 0; a.hiddenUntil = 0; a.progress = 0; a.task = taskNames[name]; a.projectId = s.project.id;
  s.project.stage = name; s.project.phase = 'travel'; s.project.sender = null; s.project.workElapsed = 0;
  if (a.resume) { a.resume = null; a.breakUntil = 0; }
  travel(a, workPlaces[name], 'WORKING', workPoses[name]);
  say(s, name, name === 'Beam' ? "I'll prepare a preliminary pretend concept." : thoughts[name][0]);
}
function handoff(s: Simulation, from: CorePerson, to: CorePerson) {
  const a = s.agents[from], recipient = s.agents[to];
  // A colleague who was on an idle wander returns to their workspace for the handoff.
  if (!recipient.resume) {
    recipient.eventUntil = 0; recipient.hiddenUntil = 0;
    travel(recipient, workPlaces[to], 'WAITING');
    recipient.task = `Waiting for ${from}'s handoff`;
  }
  s.project.phase = 'handoff'; s.project.stage = to; s.project.sender = from; s.project.workElapsed = 0;
  const target = location(to, workPlaces[to]); target[0] -= .65;
  a.task = `Delivering ${s.project.id} to ${to}`;
  travel(a, workPlaces[to], 'WAITING', 'normal', target);
  say(s, from, from === 'Atlas' ? 'New bridge project assigned!' : `${s.project.id} ${from === 'Check' && to === 'Beam' ? 'needs a tiny revision!' : 'ready for ' + to + '!'}`);
}
const workerDetails: Record<Worker, string[]> = {
  Carbon: ['Concrete carbon', 'Reinforcement carbon', 'Prestressing carbon'],
  Durability: ['Exposure game score', 'Material game score', 'Durability game score'],
  Maintain: ['Inspection access', 'Maintenance ease', 'Component access'],
  Environment: ['Construction disturbance', 'Site disturbance', 'Environmental effects'],
};
function beginDepartment(s: Simulation) {
  const p = s.project;
  p.phase = 'department'; p.workerResults = {}; p.workElapsed = 0;
  const eco = s.agents.Eco; eco.task = 'Checking on four fictional specialists'; eco.progress = 0;
  travel(eco, 'ecoModel', 'MEETING', 'inspect');
  say(s, 'Eco', 'Carbon, Durability, Maintain, Environment: tiny team, take your stations!');
  for (const name of workers) {
    const a = s.agents[name]; a.projectId = p.id; a.progress = 0; a.task = taskNames[name]; a.eventUntil = 0; a.hiddenUntil = 0;
    if (a.resume) { a.resume = null; a.breakUntil = 0; }
    travel(a, workPlaces[name], 'WORKING', workPoses[name]);
  }
}
function tickDepartment(s: Simulation, dt: number) {
  const p = s.project;
  if (p.phase === 'department') {
    // Start the four independent timers together after everyone reaches their station.
    if (!p.workElapsed && !workers.every(name => s.agents[name].state === 'WORKING')) return;
    p.workElapsed += dt;
    if (Math.floor((p.workElapsed - dt) / 4) !== Math.floor(p.workElapsed / 4)) {
      const name = workers[Math.floor(p.workElapsed / 4) % workers.length];
      if (!p.workerResults[name]) {
        const target = location(name, workPlaces[name]);
        travel(s.agents.Eco, workPlaces[name], 'MEETING', 'inspect', [target[0] - .55, target[1] + .35]);
        s.agents.Eco.task = `Checking ${name}'s fictional assessment`;
      }
    }
    for (const name of workers) {
      const a = s.agents[name];
      if (p.workerResults[name] || a.resume || a.state !== 'WORKING') continue;
      a.progress = Math.min(100, a.progress + dt / durations[name] * 100);
      if (a.progress < 100) continue;
      a.progress = 100; a.state = 'COMPLETED'; a.task = 'Fictional department score ready';
      const details = workerDetails[name].map(label => [label, integer(s, 62, 96)] as [string, number]);
      p.workerResults[name] = { details, score: integer(s, 65, 95) };
      if (name === 'Carbon') s.stats.carbonAssessments++;
      if (name === 'Maintain') s.stats.maintenanceComplaints++;
      if (name === 'Environment') s.stats.environmentalWarnings++;
      say(s, name, ({ Carbon: 'Carbon assessment complete.', Durability: 'Durability looks good.', Maintain: 'I still want better access.', Environment: 'The environment would appreciate Alternative B.' } as const)[name]);
    }
    if (workers.every(name => p.workerResults[name])) {
      p.phase = 'reports';
      const ecoPos = location('Eco', 'desk');
      workers.forEach((name, i) => {
        const a = s.agents[name];
        a.task = 'Walking to Eco with fictional results';
        travel(a, 'desk', 'MEETING', 'normal', [ecoPos[0] + (i % 2 ? .8 : -.8), ecoPos[1] + (i < 2 ? .7 : 1.3)]);
      });
      s.agents.Eco.state = 'WAITING'; s.agents.Eco.task = 'Waiting for all four reports';
      s.stats.sustainabilityMeetings++;
    }
  } else if (p.phase === 'reports' && workers.every(name => s.agents[name].state === 'MEETING')) {
    say(s, 'Eco', "Great. I'll combine everything.");
    for (const name of workers) { const a = s.agents[name]; a.task = 'Report delivered to Eco'; travel(a, 'desk', 'COMPLETED'); }
    beginWork(s, 'Eco');
  }
}
function finishWork(s: Simulation) {
  const p = s.project, name = p.stage, a = s.agents[name]; a.progress = 100; a.state = 'COMPLETED';
  if (name === 'Atlas') { handoff(s, name, 'Beam'); return; }
  if (name === 'Beam') {
    // Independent predefined ranges; no physical relationships or engineering formulas.
    p.geometry = { depth: integer(s, 20, 32) / 10, width: p.width, cells: integer(s, 2, 4), pier: p.pier, web: integer(s, 35, 55) / 100 };
    p.concepts = ['A', 'B', 'C'].map((label: string) => ({ name: `Alternative ${label}`,
      geometry: { depth: integer(s, 20, 32) / 10, width: p.width, cells: integer(s, 2, 4), pier: p.pier, web: integer(s, 35, 55) / 100 },
      structural: integer(s, 72, 94), review: 'PENDING' }) as Concept);
    say(s, name, `${p.geometry.depth.toFixed(1)} m looks good! In our imaginary universe.`);
    p.phase = 'inspection'; p.sender = 'Check'; p.workElapsed = 0;
    a.task = 'Inspecting three toy concepts at the bridge model';
    const check = s.agents.Check; check.eventUntil = 0; check.hiddenUntil = 0; check.task = 'Inspecting the little model with Beam';
    travel(a, 'bridge', 'MEETING', 'inspect');
    travel(check, 'bridge', 'MEETING', 'inspect', [1.15,1.3]);
    say(s, 'Check', 'I brought my clipboard. And a backup clipboard.'); return;
  }
  if (name === 'Check') {
    const accepted = p.revision >= 2 || random(s) > .35;
    p.concepts?.forEach((concept, i) => { concept.review = accepted && (i === 0 || random(s) > .42) ? 'PASS' : 'REVIEW'; });
    p.reviews.push({ geometry: 'PASS', serviceability: accepted ? 'PASS' : 'REVIEW', score: integer(s, accepted ? 76 : 55, accepted ? 94 : 70),
      prestressing: accepted ? (random(s) < .3 ? 'REVIEW' : 'PASS') : 'REVIEW', accepted, revision: p.revision });
    if (!accepted) {
      s.stats.checkRejections++;
      say(s, 'Check', 'Are you sure? 🤨 This concept needs a pretend revision.');
      say(s, 'Beam', '…maybe another box depth. 😂');
      p.status = 'NEEDS YOU'; p.issue = 'checkRevision'; p.phase = 'decision';
      a.state = 'NEEDS YOU'; a.task = 'Waiting for your revision decision';
      say(s, 'Atlas', `${p.id} needs your call: revise or ask Check again?`, 12);
    } else { say(s, name, 'Game checks accepted! No real engineering was checked.'); handoff(s, name, 'Eco'); }
    return;
  }
  if (name === 'Eco') {
    p.sustainability = { carbon: p.workerResults.Carbon!.score, durability: p.workerResults.Durability!.score,
      maintainability: p.workerResults.Maintain!.score, environmental: p.workerResults.Environment!.score };
    p.status = 'NEEDS YOU'; p.issue = 'ecoTradeoff'; p.phase = 'ecoChoice';
    a.state = 'NEEDS YOU'; a.task = 'Waiting for a playful sustainability preference';
    say(s, name, `Alternative A has its charms. B has others. Your call, boss!`); return;
  }
  if (name === 'Cash') {
    p.cost = { concrete: integer(s, 150, 220) * 10, prestressing: integer(s, 30, 60) * 10, reinforcement: integer(s, 55, 95) * 10, millions: integer(s, 60, 110) / 10, score: integer(s, 65, 95) };
    s.stats.costArguments++;
    say(s, 'Cash', 'Who keeps increasing the box depth?! My spreadsheet is crying.');
    say(s, 'Beam', 'Structural reasons!');
    handoff(s, name, 'Rank'); return;
  }
  const structural = p.reviews.at(-1)!.score;
  const eco = p.sustainability!;
  const sustainability = Math.round((eco.carbon + eco.durability + eco.maintainability + eco.environmental) / 4);
  const cost = p.cost!.score;
  // Six arcade scores are averaged for display, never for engineering optimization.
  p.alternatives = p.concepts!.map((concept, i): Alternative => {
    const adjust = (n: number) => Math.max(0, Math.min(100, n + (i === 0 ? 0 : integer(s, -8, 8))));
    const scores = { structural: adjust(Math.round((structural + concept.structural) / 2)),
      carbon: Math.max(0, Math.min(100, eco.carbon + (i === 0 ? 7 : i === 1 ? -5 : integer(s, -8, 8)))),
      durability: adjust(eco.durability), maintainability: adjust(eco.maintainability), environmental: adjust(eco.environmental),
      cost: Math.max(0, Math.min(100, cost + (i === 1 ? 7 : i === 0 ? -5 : integer(s, -8, 8)))) };
    const score = Math.round((scores.structural + scores.carbon + scores.durability + scores.maintainability + scores.environmental + scores.cost) / 6);
    return { ...concept, ...scores, sustainability: adjust(sustainability), score };
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  p.status = 'NEEDS YOU'; p.issue = 'rankChoice'; p.phase = 'decision'; a.state = 'NEEDS YOU'; a.task = 'Waiting for your favorite imaginary alternative';
  say(s, 'Rank', 'The shortlist is ready! Pick your favorite in NEEDS YOU.', 30);
}
function resume(s: Simulation, name: Person) {
  const a = s.agents[name], saved = a.resume; if (!saved) return;
  a.resume = null; a.breakUntil = 0; a.task = saved.task;
  // Walk back to the exact interruption point before continuing the interrupted route.
  travel(a, saved.destination, saved.state === 'WALKING' ? saved.arrivalState : saved.state, saved.pose, saved.position);
  if (saved.state === 'WALKING') a.route.push(...saved.route);
  say(s, name, 'Recharged. Picking up exactly where I left off.');
}
function startCeo(s: Simulation, command: CeoCommand, requested?: Person) {
  const boss = s.agents.Kyaw;
  if (s.ceoStory?.target && s.ceoStory.previousState && s.agents[s.ceoStory.target].state === 'WORKING VERY HARD') {
    s.agents[s.ceoStory.target].state = s.ceoStory.previousState;
    if (s.ceoStory.previousPose) s.agents[s.ceoStory.target].pose = s.ceoStory.previousPose;
  }
  const candidates = everyone.filter(name => name !== 'Kyaw' && name !== s.project.stage && name !== s.project.sender &&
    !(s.project.stage === 'Eco' && (s.project.phase === 'department' || s.project.phase === 'reports') && workers.some(worker => worker === name)) && !s.agents[name].resume);
  const target = command === 'visit' || command === 'scold' ?
    (requested && requested !== 'Kyaw' ? requested : candidates[integer(s, 0, candidates.length - 1)]) : null;
  const place: Record<CeoCommand, Place> = { office: 'ceoOffice', visit: 'desk', meeting: 'meeting', game: 'game', coffee: 'coffee',
    nap: 'ceoOffice', roam: 'lobby', scold: 'desk', phone: 'ceoOffice', window: 'window', cat: 'cat', car: 'parking', garden: 'garden', toilet: 'toiletMen', inspectBridge: 'bridge' };
  const state = command === 'meeting' ? 'MEETING' : command === 'game' ? 'PLAYING' : command === 'toilet' ? 'AWAY' : command === 'nap' || command === 'coffee' ? 'BREAK' : command === 'office' || command === 'phone' || command === 'window' ? 'BORED' : 'IDLE';
  const pose = command === 'game' ? 'game' : command === 'nap' ? 'sleep' : command === 'coffee' ? 'coffee' : command === 'phone' ? 'phone' : command === 'window' ? 'look' : command === 'inspectBridge' ? 'inspect' : 'normal';
  boss.task = ({ office: 'Avoiding work in the CEO office', visit: `Looking over ${target}'s shoulder`, meeting: 'Calling a very important meeting',
    game: 'Playing a game instead of working', coffee: 'Drinking the executive coffee', nap: 'CEO mode: sleeping', roam: 'Roaming around the building',
    scold: `Checking on ${target}`, phone: 'Scrolling on a tiny phone', window: 'Looking outside', cat: 'Visiting the office cat',
    car: 'Checking the CEO car', garden: 'Walking around the garden', toilet: 'Very important executive meeting 🚻', inspectBridge: 'Pretending to inspect the little bridge' } satisfies Record<CeoCommand, string>)[command];
  const targetPosition = target ? [s.agents[target].position[0] + .55, s.agents[target].position[1] + .5] as [number, number] : undefined;
  travel(boss, place[command], state, pose, targetPosition);
  s.ceoStory = { kind: command, target, phase: 'travel', until: 0 };
  if (command === 'coffee') { s.stats.coffeeConsumed++; s.stats.ceoCoffeeConsumed++; }
  if (command === 'nap') s.stats.ceoNaps++;
  if (command === 'scold') { s.stats.ceoScoldings++; if (target === 'Beam') s.stats.beamScoldings++; }
  if (command === 'game') s.stats.ceoGamingSessions++;
  if (command === 'meeting') s.stats.pointlessMeetings++;
  s.nextCeo = s.time + integer(s, 27, 43);
  if (command === 'meeting') {
    for (const name of candidates.slice(0, 5)) {
      const a = s.agents[name]; a.eventUntil = s.time + 27; a.task = 'Waiting for CEO meeting to make sense';
      travel(a, 'meeting', 'MEETING');
    }
  }
}
function tickCeo(s: Simulation) {
  const story = s.ceoStory, boss = s.agents.Kyaw;
  if (!story) return;
  if (story.phase === 'travel' && boss.state !== 'WALKING') {
    story.phase = 'scene'; story.until = s.time + (story.kind === 'toilet' ? 14 : 7);
    const lines: Record<string, string> = { office: 'I am overseeing things. From my sofa.', visit: 'Looking very busy in here!',
      meeting: 'Important meeting. I will explain in a moment.', game: 'Just one more level. For morale.', coffee: 'Executive decision: more coffee.',
      nap: '😴 CEO MODE', roam: 'My steps are my productivity.', scold: 'Why is this project still not finished?',
      phone: 'This phone is definitely a work tool.', window: 'Nice view. Good leadership.', cat: 'I came to inspect the cat.',
      car: 'CEO PARKING. Excellent strategic placement.', garden: 'Nature understands my management style.', toilet: 'Very important meeting. No follow-up questions. 🚻', inspectBridge: 'Yes. The bridge appears to be... a bridge.' };
    const greenVisit = story.kind === 'visit' && (story.target === 'Eco' || story.target === 'Carbon');
    const bridgeVisit = story.kind === 'visit' && story.target === 'Beam';
    const coffeeScold = story.kind === 'scold' && story.target === 'Beam' && (s.agents.Beam.destination === 'coffee' || s.agents.Beam.pose === 'coffee');
    const approvalScold = story.kind === 'scold' && story.target === 'Atlas' && s.project.issue === 'ceoApproval';
    if (coffeeScold) story.followup = 'coffee';
    if (approvalScold) story.followup = 'approval';
    say(s, 'Kyaw', coffeeScold ? 'Why are you drinking coffee?' : approvalScold ? `Why is Project ${s.project.id} delayed?` :
      story.kind === 'scold' && story.target === 'Check' ? 'Check, why did you reject Beam again?' :
      greenVisit ? 'Can we make the bridge greener?' : bridgeVisit ? 'Can we make the bridge look cooler?' : lines[story.kind], 7);
    if (greenVisit) { say(s, 'Carbon', 'Yes. 🌱', 7); say(s, 'Cash', 'NO. 💸', 7); }
    if (story.target) {
      const employee = s.agents[story.target];
      if (story.kind === 'scold' || story.kind === 'visit') {
        if (employee.state === 'WAITING' || employee.state === 'IDLE' || employee.state === 'WORKING') {
          story.previousState = employee.state; story.previousPose = employee.pose;
          employee.state = 'WORKING VERY HARD'; employee.pose = 'typing';
        }
        say(s, story.target, coffeeScold ? "I've been working for six hours." : approvalScold ? "It's waiting for your approval." : bridgeVisit ? "That's not exactly how structural design works." : story.target === 'Beam' ? "I'm working on it, boss 😭" : story.target === 'Check' ? 'Because Beam keeps changing the pretend box depth.' : 'Absolutely, boss. Very busy!');
        if (story.target === 'Check') say(s, 'Beam', 'Bro...', 5);
      }
    }
    if (story.kind === 'meeting') boss.pose = 'normal';
  } else if (story.phase === 'scene' && s.time >= story.until) {
    if (story.kind === 'meeting') {
      say(s, 'Kyaw', 'I forgot why I called this meeting. 😴', 6);
      boss.pose = 'sleep'; boss.state = 'BREAK'; boss.task = '😴 CEO MODE'; s.stats.ceoNaps++;
      story.kind = 'meeting-ending'; story.until = s.time + 6; return;
    }
    if (story.target && story.previousState && s.agents[story.target].state === 'WORKING VERY HARD') {
      s.agents[story.target].state = story.previousState;
      if (story.previousPose) s.agents[story.target].pose = story.previousPose;
    }
    if (story.kind === 'scold') say(s, 'Kyaw', story.followup === 'coffee' ? '...carry on. I need coffee too.' : story.followup === 'approval' ? '...oh.' : 'Everyone back to work! ...Where is my game controller?', 7);
    if (story.kind === 'visit' && story.target === 'Beam') say(s, 'Kyaw', '...make it cooler.', 7);
    const goGame = story.kind === 'scold' && story.followup !== 'coffee';
    const goCoffee = story.followup === 'coffee';
    if (goGame) s.stats.ceoGamingSessions++;
    if (goCoffee) { s.stats.coffeeConsumed++; s.stats.ceoCoffeeConsumed++; }
    travel(boss, goCoffee ? 'coffee' : goGame ? 'game' : 'ceoOffice', goCoffee ? 'BREAK' : goGame ? 'PLAYING' : 'BORED', goCoffee ? 'coffee' : goGame ? 'game' : 'normal');
    boss.task = goCoffee ? 'Getting coffee after scolding Beam' : goGame ? 'Playing a game after scolding everyone' : 'Avoiding work in the CEO office';
    story.phase = 'return';
  } else if (story.phase === 'return' && boss.state !== 'WALKING') s.ceoStory = null;
}
function idleEvent(s: Simulation) {
  const available = everyone.filter(name => name !== 'Kyaw' && (s.project.status === 'COMPLETE' || (name !== s.project.stage && name !== s.project.sender && !(s.project.stage === 'Eco' && (s.project.phase === 'department' || s.project.phase === 'reports') && workers.some(worker => worker === name)))) && !s.agents[name].resume && s.agents[name].eventUntil <= s.time && s.agents[name].state !== 'WALKING' && s.agents[name].state !== 'AWAY');
  if (!available.length) return;
  const name = available[integer(s, 0, available.length - 1)], a = s.agents[name];
  const signature = {
    Atlas: ['whiteboard', 'normal', 'Checking on everyone. Including the coffee machine.'],
    Beam: ['bridge', 'inspect', 'Staring at the model counts as brainstorming, right?'],
    Check: ['desk', 'inspect', 'Checking these pretend calculations for the fifth time. 😂'],
    Eco: ['plant', 'water', 'Hydrating my smallest colleague. 🌱'],
    Cash: ['desk', 'count', 'One pretend dollar, two pretend dollars…'],
    Rank: ['server', 'chart', 'This chart says we need more charts.'],
    Carbon: ['plant', 'water', 'The garden gave my game score a thumbs-up.'],
    Durability: ['desk', 'inspect', 'Testing pretend rain again.'],
    Maintain: ['whiteboard', 'chart', 'Where did I put the tiny inspection ladder?'],
    Environment: ['garden', 'look', 'Checking on our fictional butterflies.'],
    Kyaw: ['game', 'game', 'One more level!'],
  } as const;
  const options = [signature[name], ['coffee', 'coffee', 'Coffee: the only critical dependency.'], ['desk', 'sleep', 'Zzz… running a dream simulation.'],
    ['desk', 'stretch', 'Stretching my tiny decision muscles.'], ['meeting', 'normal', 'Team meeting: should our bridge have a snack lane?'],
    ['garden', 'look', 'A short garden walk is important research.'], ['bench', 'sleep', 'A bench break with a view of the birds.'], ['cat', 'inspect', 'Officially petting the office cat.'],
    ['parking', 'look', 'Watching the birds from the parking lot.'], [indexToilet(name), 'normal', 'Very important meeting. 🚻']] as const;
  const event = options[integer(s, 0, options.length - 1)];
  a.eventUntil = s.time + 20; a.task = event[2];
  if (event[0] === 'coffee') s.stats.coffeeConsumed++;
  travel(a, event[0], event[0] === 'meeting' ? 'MEETING' : event[0] === 'coffee' || event[1] === 'sleep' ? 'BREAK' : event[0] === 'toiletMen' || event[0] === 'toiletWomen' ? 'AWAY' : 'IDLE', event[1]);
  say(s, name, event[2], 10);
  if (event[0] === 'meeting') {
    const guest = available.find(person => person !== name);
    if (guest) {
      const colleague = s.agents[guest]; colleague.eventUntil = s.time + 20; colleague.task = 'Discussing very important imaginary snack lanes';
      travel(colleague, 'meeting', 'MEETING');
      say(s, guest, 'I support this proposal. Especially the snacks.', 10);
    }
  }
}
function socialEvent(s: Simulation) {
  const scripts: [Person, string, Person, string, Person?, string?][] = [
    ['Beam', 'Check rejected my design again.', 'Check', 'Because you changed everything again.'],
    ['Carbon', 'Alternative B has lower pretend carbon.', 'Cash', 'Alternative C is cheaper.', 'Eco', 'Here we go again.'],
    ['Maintain', 'How are inspectors supposed to reach this?', 'Beam', 'Very carefully. 😂'],
    ['Environment', 'We should minimize disturbance.', 'Cash', 'We should minimize cost.', 'Beam', 'We should minimize everyone talking to me.'],
  ];
  if (s.project.issue === 'rankChoice' && random(s) < .27) {
    for (const name of everyone) { const a = s.agents[name]; if (a.resume) continue;
      a.eventUntil = s.time + 22; a.task = 'A very serious pretend design-review meeting';
      travel(a, 'meeting', 'MEETING');
    }
    const p = s.project;
    say(s, 'Atlas', `Project ${p.id} design review.`, 12); say(s, 'Beam', 'Three alternatives prepared.', 12);
    say(s, 'Check', 'I rejected two.', 12); say(s, 'Carbon', 'B has the lowest game carbon.', 12);
    say(s, 'Durability', 'C has better game durability.', 12); say(s, 'Maintain', 'A is easier to maintain.', 12);
    say(s, 'Environment', 'B creates less pretend disturbance.', 12); say(s, 'Cash', 'A is cheaper.', 12);
    say(s, 'Rank', 'I have twelve charts.', 12); say(s, 'Kyaw', '...what?', 12);
    return;
  }
  const [a, lineA, b, lineB, c, lineC] = scripts[integer(s, 0, scripts.length - 1)];
  say(s, a, lineA, 8); say(s, b, lineB, 8); if (c && lineC) say(s, c, lineC, 8);
}
function indexToilet(name: Person): Place { return everyone.indexOf(name) % 2 ? 'toiletWomen' : 'toiletMen'; }
function completeProject(s: Simulation) {
  const p = s.project;
  p.status = 'COMPLETE'; p.issue = undefined; p.ignored = false; p.phase = 'complete'; p.completedAt = s.time;
  s.stats.projectsCompleted++; s.celebrationUntil = s.time + 22; s.lateCeoAt = s.time + 8;
  for (const name of everyone) {
    const a = s.agents[name]; a.resume = null; a.breakUntil = 0; a.eventUntil = s.time + 22;
    if (name === 'Kyaw') continue;
    a.progress = 100; a.task = name === 'Check' ? 'Celebrating while still inspecting the bridge' : `Celebrating ${p.id}`;
    travel(a, name === 'Check' ? 'bridge' : 'meeting', 'COMPLETED', name === 'Check' ? 'inspect' : 'celebrate');
  }
  say(s, 'Atlas', `🎉 PROJECT ${p.id} COMPLETED!`, 15);
  say(s, 'Carbon', '🌱', 12); say(s, 'Cash', '💰', 12); say(s, 'Rank', '📊', 12);
}
export function createSimulation(seed = 240924): Simulation {
  const agents = Object.fromEntries(everyone.map(name => [name, { name, state: name === 'Kyaw' ? 'BORED' : 'WAITING', projectId: name === 'Kyaw' ? null : 'BG-024', task: name === 'Kyaw' ? 'Avoiding work' : 'Waiting for the project brief', thought: thoughts[name][0], progress: name === 'Kyaw' ? 14 : 0,
    position: location(name, 'desk'), heading: Math.PI, destination: 'desk', route: [], arrivalState: 'WAITING', pose: 'normal', bubble: '', bubbleUntil: 0,
    eventUntil: 0, hiddenUntil: 0, breakUntil: 0, resume: null }])) as unknown as Record<Person, Agent>;
  const s = { agents, history: [], events: [], stats: emptyStats(), time: 0, seed, eventId: 0, nextEvent: 14, nextSocial: 38,
    nextProject: 24, nextCeo: 22, celebrationUntil: 0, lateCeoAt: 0, ceoStory: null } as unknown as Simulation;
  s.project = makeProject(s); beginWork(s, 'Atlas'); say(s, 'Atlas', `${s.project.id} just arrived. Tiny team, big pretend possibilities!`);
  return s;
}
/** Pure transition function. No React, Three.js, network calls, or real engineering. */
export function reduceSimulation(previous: Simulation, action: Action): Simulation {
  if (action.type === 'tick' && (!Number.isFinite(action.dt) || action.dt <= 0)) return previous;
  if (action.type === 'new' && previous.project.status !== 'COMPLETE') return previous;
  if (action.type === 'choose' && (previous.project.issue !== 'rankChoice' || !previous.project.alternatives?.some(a => a.name === action.alternative))) return previous;
  const s = structuredClone(previous), p = s.project;
  if (action.type === 'ceo') { startCeo(s, action.command, action.target); return s; }
  if (action.type === 'new') {
    s.history.unshift(structuredClone(p)); s.history = s.history.slice(0, 20); s.project = makeProject(s);
    s.celebrationUntil = 0; s.lateCeoAt = 0;
    for (const name of everyone) {
      const a = s.agents[name]; a.progress = 0; a.projectId = s.project.id; a.resume = null; a.breakUntil = 0; a.eventUntil = 0; a.hiddenUntil = 0;
      a.task = 'Waiting for the project brief'; travel(a, 'desk', 'WAITING');
    }
    s.agents.Kyaw.projectId = null; s.agents.Kyaw.progress = 14; s.agents.Kyaw.task = 'Avoiding work'; s.ceoStory = null;
    beginWork(s, 'Atlas'); say(s, 'Atlas', `New project ${s.project.id}! Let's make another little connection.`); return s;
  }
  if (action.type === 'choose') {
    p.winner = action.alternative; p.issue = 'ceoApproval'; p.phase = 'ceoReview'; p.ignored = false;
    s.agents.Rank.state = 'COMPLETED'; s.agents.Rank.task = `Sent ${p.winner} to CEO review`;
    s.agents.Kyaw.task = `Reviewing ${p.id}, eventually`; travel(s.agents.Kyaw, 'bridge', 'NEEDS YOU', 'inspect');
    say(s, 'Rank', `${p.winner} is headed to the CEO. He may be napping.`, 12); return s;
  }
  if (action.type === 'decision') {
    if (p.status !== 'NEEDS YOU' || !p.issue) return previous;
    const choice = action.choice;
    if (choice === 'meeting') { startCeo(s, 'meeting'); say(s, 'Atlas', `Design review for ${p.id}. I brought tiny charts.`); return s; }
    if (choice === 'ignore') { p.ignored = true; say(s, 'Kyaw', 'Project delayed because I am busy doing absolutely nothing. 😂', 12); return s; }
    if (p.issue === 'checkRevision') {
      if (choice === 'askCheck') { p.status = 'ACTIVE'; p.issue = undefined; p.ignored = false; beginWork(s, 'Check'); return s; }
      if (choice === 'approveRevision') {
        p.reviews[p.reviews.length - 1].accepted = true;
        if (p.concepts?.[0]) p.concepts[0].review = 'PASS';
        p.status = 'ACTIVE'; p.issue = undefined; p.ignored = false;
        say(s, 'Atlas', 'CEO accepted the fictional concept for the game. Eco, your turn.');
        handoff(s, 'Check', 'Eco'); return s;
      }
      if (choice === 'sendBack') {
        p.status = 'ACTIVE'; p.issue = undefined; p.ignored = false; p.revision++; s.stats.beamRevisions++;
        handoff(s, 'Check', 'Beam'); return s;
      }
    }
    if (p.issue === 'ecoTradeoff') {
      if (choice === 'askCash' || choice === 'askBeam') {
        const name = choice === 'askCash' ? 'Cash' : 'Beam';
        say(s, name, choice === 'askCash' ? 'Alternative C looks cheaper in my imaginary spreadsheet.' : 'All three alternatives are tiny and charming.'); return s;
      }
      if (choice === 'chooseA' || choice === 'chooseB') {
        p.ecoPreference = choice === 'chooseA' ? 'A' : 'B'; p.status = 'ACTIVE'; p.issue = undefined; p.ignored = false;
        say(s, 'Eco', `Noted: a playful preference for Alternative ${p.ecoPreference}.`);
        handoff(s, 'Eco', 'Cash'); return s;
      }
    }
    if (p.issue === 'ceoApproval') {
      if (choice === 'sleep') { startCeo(s, 'nap'); p.ignored = true; return s; }
      if (choice === 'approveProject') { completeProject(s); return s; }
      if (choice === 'rejectProject') {
        s.stats.projectsRejected++; s.stats.beamRevisions++; p.revision++; p.status = 'ACTIVE'; p.issue = undefined; p.ignored = false;
        p.winner = undefined; p.geometry = undefined; p.concepts = undefined; p.workerResults = {}; p.sustainability = undefined; p.cost = undefined; p.alternatives = undefined;
        say(s, 'Kyaw', 'Rejected! I have a mysterious CEO feeling about it.'); beginWork(s, 'Beam'); return s;
      }
    }
    return previous;
  }
  if (action.type === 'resume') { resume(s, action.name); return s; }
  if (action.type === 'break') {
    const a = s.agents[action.name]; if (action.name === 'Kyaw' || a.resume || a.state === 'NEEDS YOU' || a.state === 'AWAY') return previous;
    a.resume = { destination: a.destination, state: a.state, task: a.task, pose: a.pose, position: [...a.position], route: structuredClone(a.route), arrivalState: a.arrivalState };
    a.breakUntil = -1; a.task = 'A well-earned coffee break'; travel(a, 'coffee', 'BREAK', 'coffee'); s.stats.coffeeConsumed++;
    say(s, action.name, 'Saving my place. Coffee first, tiny bridge later.'); return s;
  }
  if (action.type === 'activity') {
    const a = s.agents[action.name];
    if (action.name === 'Kyaw' || action.name === p.stage || action.name === p.sender || (p.stage === 'Eco' && (p.phase === 'department' || p.phase === 'reports') && workers.some(name => name === action.name)) || a.resume) return previous;
    a.eventUntil = s.time + 20; a.task = `Visiting the ${action.place}`;
    travel(a, action.place, action.place === 'meeting' ? 'MEETING' : 'IDLE', action.place === 'sofa' ? 'sleep' : 'normal'); return s;
  }
  const dt = Math.min(action.dt, .5); s.time += dt;
  for (const name of everyone) {
    const a = s.agents[name]; move(a, dt);
    if (s.time >= a.bubbleUntil) a.bubble = '';
    if (a.state === 'AWAY' && !a.hiddenUntil) {
      a.hiddenUntil = s.time + (name === 'Kyaw' ? 14 : 7); a.task = 'Very important meeting. 🚻'; s.stats.toiletBreaks++;
    }
    if (a.hiddenUntil && s.time >= a.hiddenUntil) {
      a.hiddenUntil = 0; a.eventUntil = 0; a.task = 'Returning from a very important meeting';
      travel(a, 'desk', 'IDLE');
    }
    if (a.resume && a.state === 'BREAK') {
      if (a.breakUntil === -1) a.breakUntil = s.time + 10;
      if (s.time >= a.breakUntil) resume(s, name);
    }
    if (a.eventUntil && s.time > a.eventUntil && !a.resume && !a.hiddenUntil && name !== 'Kyaw' && (p.status === 'COMPLETE' || (name !== p.stage && name !== p.sender && !(p.stage === 'Eco' && (p.phase === 'department' || p.phase === 'reports') && workers.some(worker => worker === name))))) {
      a.eventUntil = 0; a.task = p.status === 'COMPLETE' ? 'Enjoying a quiet moment' : 'Waiting for the next handoff';
      travel(a, 'desk', p.status === 'COMPLETE' ? 'IDLE' : 'WAITING');
    }
  }
  if (p.status === 'ACTIVE') {
    const a = s.agents[p.stage];
    if (p.phase === 'inspection') {
      if (s.agents.Beam.state === 'MEETING' && s.agents.Check.state === 'MEETING') {
        p.workElapsed += dt;
        if (p.workElapsed >= 4) { say(s, 'Beam', 'Three little alternatives ready for Check.'); handoff(s, 'Beam', 'Check'); }
      }
    } else if (p.phase === 'handoff') {
      const sender = s.agents[p.sender!];
      if (!sender.resume && !a.resume && sender.state !== 'WALKING' && a.state !== 'WALKING') {
        sender.task = `Handed ${p.id} to ${a.name}`;
        travel(sender, 'desk', 'COMPLETED');
        beginWork(s, p.stage);
      }
    } else if (!a.resume && p.phase === 'travel' && (a.state === 'WORKING' || a.state === 'WORKING VERY HARD')) p.phase = 'work';
    else if (p.stage === 'Eco' && p.phase === 'work' && !Object.keys(p.workerResults).length) beginDepartment(s);
    else if (p.stage === 'Eco' && (p.phase === 'department' || p.phase === 'reports')) tickDepartment(s, dt);
    else if (!a.resume && p.phase === 'work' && (a.state === 'WORKING' || a.state === 'WORKING VERY HARD')) {
      p.workElapsed += dt; a.progress = Math.min(100, Math.floor(p.workElapsed / durations[a.name] * 100));
      a.thought = thoughts[a.name][Math.floor(p.workElapsed / 5) % 2];
      if (a.progress >= 100) finishWork(s);
    }
  }
  tickCeo(s);
  if (s.lateCeoAt && s.time >= s.lateCeoAt) {
    s.lateCeoAt = 0; s.ceoStory = null;
    travel(s.agents.Kyaw, 'meeting', 'COMPLETED', 'celebrate'); s.agents.Kyaw.task = 'Arriving late to the celebration';
    say(s, 'Kyaw', 'Good job everyone.'); say(s, 'Beam', 'We finished 20 minutes ago. 😂');
  }
  if (s.time >= s.nextCeo && !s.ceoStory && s.time >= s.celebrationUntil) {
    const activities: CeoCommand[] = ['game','nap','coffee','roam','phone','window','cat','car','garden','visit','scold','meeting','office','toilet','inspectBridge'];
    startCeo(s, activities[integer(s, 0, activities.length - 1)]);
  }
  if (s.time >= s.nextSocial) { socialEvent(s); s.nextSocial = s.time + integer(s, 36, 58); }
  if (s.time >= s.nextEvent) { idleEvent(s); s.nextEvent = s.time + integer(s, 10, 17); }
  return s;
}
