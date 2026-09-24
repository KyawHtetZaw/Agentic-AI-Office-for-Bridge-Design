import { people, workers, everyone, location } from './model.ts';
import type { Action, Agent, Alternative, Person, CorePerson, Project, Simulation, Worker, CeoCommand, Place } from './model.ts';
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
  p.phase = 'department'; p.workerResults = {};
  const eco = s.agents.Eco; eco.state = 'MEETING'; eco.task = 'Coordinating four fictional specialists'; eco.progress = 0;
  say(s, 'Eco', 'Carbon, Durability, Maintain, Environment: tiny team, take your stations!');
  for (const name of workers) {
    const a = s.agents[name]; a.projectId = p.id; a.progress = 0; a.task = taskNames[name]; a.eventUntil = 0; a.hiddenUntil = 0;
    if (a.resume) { a.resume = null; a.breakUntil = 0; }
    travel(a, 'desk', 'WORKING', workPoses[name]);
  }
}
function tickDepartment(s: Simulation, dt: number) {
  const p = s.project;
  if (p.phase === 'department') {
    for (const name of workers) {
      const a = s.agents[name];
      if (p.workerResults[name] || a.resume || a.state !== 'WORKING') continue;
      a.progress = Math.min(100, a.progress + dt / durations[name] * 100);
      if (a.progress < 100) continue;
      a.progress = 100; a.state = 'COMPLETED'; a.task = 'Fictional department score ready';
      const details = workerDetails[name].map(label => [label, integer(s, 62, 96)] as [string, number]);
      p.workerResults[name] = { details, score: integer(s, 65, 95) };
      say(s, name, `${name} game score ready. Reporting to Eco!`);
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
    }
  } else if (p.phase === 'reports' && workers.every(name => s.agents[name].state === 'MEETING')) {
    say(s, 'Eco', 'Four pretend scorecards received. I shall combine the game points!');
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
    say(s, name, `${p.geometry.depth.toFixed(1)} m looks good! In our imaginary universe.`);
    handoff(s, name, 'Check'); return;
  }
  if (name === 'Check') {
    const accepted = p.revision >= 2 || random(s) > .35;
    p.reviews.push({ geometry: 'PASS', serviceability: accepted ? 'PASS' : 'REVIEW', score: integer(s, accepted ? 76 : 55, accepted ? 94 : 70),
      prestressing: accepted ? (random(s) < .3 ? 'REVIEW' : 'PASS') : 'REVIEW', accepted, revision: p.revision });
    if (!accepted) {
      p.revision++; s.agents.Beam.progress = 0;
      say(s, 'Check', 'Are you sure? 🤨 This concept needs a pretend revision.');
      say(s, 'Beam', '…maybe another box depth. 😂');
      handoff(s, name, 'Beam');
    } else { say(s, name, 'Game checks accepted! No real engineering was checked.'); handoff(s, name, 'Eco'); }
    return;
  }
  if (name === 'Eco') {
    p.sustainability = { carbon: p.workerResults.Carbon!.score, durability: p.workerResults.Durability!.score,
      maintainability: p.workerResults.Maintain!.score, environmental: p.workerResults.Environment!.score };
    handoff(s, name, 'Cash'); return;
  }
  if (name === 'Cash') {
    p.cost = { concrete: integer(s, 150, 220) * 10, prestressing: integer(s, 30, 60) * 10, reinforcement: integer(s, 55, 95) * 10, millions: integer(s, 60, 110) / 10, score: integer(s, 65, 95) };
    handoff(s, name, 'Rank'); return;
  }
  const structural = p.reviews.at(-1)!.score;
  const eco = p.sustainability!;
  const sustainability = Math.round((eco.carbon + eco.durability + eco.maintainability + eco.environmental) / 4);
  const cost = p.cost!.score;
  // An arcade score average, not optimization or an engineering recommendation.
  p.alternatives = ['A', 'B', 'C'].map((name, i): Alternative => {
    const adjust = (n: number) => Math.max(0, Math.min(100, n + (i === 0 ? 0 : integer(s, -8, 8))));
    const scores = { structural: adjust(structural), sustainability: adjust(sustainability), cost: adjust(cost) };
    return { name: `Alternative ${name}`, ...scores, score: Math.round((scores.structural + scores.sustainability + scores.cost) / 3) };
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  p.status = 'NEEDS YOU'; p.phase = 'decision'; a.state = 'NEEDS YOU'; a.task = 'Waiting for your favorite imaginary alternative';
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
  if (s.ceoStory?.target && s.ceoStory.previousState) {
    s.agents[s.ceoStory.target].state = s.ceoStory.previousState;
    if (s.ceoStory.previousPose) s.agents[s.ceoStory.target].pose = s.ceoStory.previousPose;
  }
  const candidates = everyone.filter(name => name !== 'Kyaw' && name !== s.project.stage && name !== s.project.sender &&
    !(s.project.stage === 'Eco' && (s.project.phase === 'department' || s.project.phase === 'reports') && workers.some(worker => worker === name)) && !s.agents[name].resume);
  const target = command === 'visit' || command === 'scold' ?
    (requested && requested !== 'Kyaw' ? requested : candidates[integer(s, 0, candidates.length - 1)]) : null;
  const place: Record<CeoCommand, Place> = { office: 'ceoOffice', visit: 'desk', meeting: 'meeting', game: 'game', coffee: 'coffee',
    nap: 'ceoOffice', roam: 'lobby', scold: 'desk', phone: 'ceoOffice', window: 'window', cat: 'cat', car: 'parking', garden: 'garden' };
  const state = command === 'meeting' ? 'MEETING' : command === 'game' ? 'PLAYING' : command === 'nap' || command === 'coffee' ? 'BREAK' : command === 'office' || command === 'phone' || command === 'window' ? 'BORED' : 'IDLE';
  const pose = command === 'game' ? 'game' : command === 'nap' ? 'sleep' : command === 'coffee' ? 'coffee' : command === 'phone' ? 'phone' : command === 'window' ? 'look' : 'normal';
  boss.task = ({ office: 'Avoiding work in the CEO office', visit: `Looking over ${target}'s shoulder`, meeting: 'Calling a very important meeting',
    game: 'Playing a game instead of working', coffee: 'Drinking the executive coffee', nap: 'CEO mode: sleeping', roam: 'Roaming around the building',
    scold: `Checking on ${target}`, phone: 'Scrolling on a tiny phone', window: 'Looking outside', cat: 'Visiting the office cat',
    car: 'Checking the CEO car', garden: 'Walking around the garden' } satisfies Record<CeoCommand, string>)[command];
  const targetPosition = target ? [s.agents[target].position[0] + .55, s.agents[target].position[1] + .5] as [number, number] : undefined;
  travel(boss, place[command], state, pose, targetPosition);
  s.ceoStory = { kind: command, target, phase: 'travel', until: 0 };
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
    story.phase = 'scene'; story.until = s.time + 7;
    const lines: Record<string, string> = { office: 'I am overseeing things. From my sofa.', visit: 'Looking very busy in here!',
      meeting: 'Important meeting. I will explain in a moment.', game: 'Just one more level. For morale.', coffee: 'Executive decision: more coffee.',
      nap: '😴 CEO MODE', roam: 'My steps are my productivity.', scold: 'Why is this project still not finished?',
      phone: 'This phone is definitely a work tool.', window: 'Nice view. Good leadership.', cat: 'I came to inspect the cat.',
      car: 'CEO PARKING. Excellent strategic placement.', garden: 'Nature understands my management style.' };
    const greenVisit = story.kind === 'visit' && (story.target === 'Eco' || story.target === 'Carbon');
    const bridgeVisit = story.kind === 'visit' && story.target === 'Beam';
    say(s, 'Kyaw', story.kind === 'scold' && story.target === 'Check' ? 'Check, why did you reject Beam again?' :
      greenVisit ? 'Can we make the bridge greener?' : bridgeVisit ? 'Can we make the bridge look cooler?' : lines[story.kind], 7);
    if (greenVisit) { say(s, 'Carbon', 'Yes. 🌱', 7); say(s, 'Cash', 'NO. 💸', 7); }
    if (story.target) {
      const employee = s.agents[story.target];
      if (story.kind === 'scold' || story.kind === 'visit') {
        if (employee.state === 'WAITING' || employee.state === 'IDLE' || employee.state === 'WORKING') {
          story.previousState = employee.state; story.previousPose = employee.pose;
          employee.state = 'WORKING VERY HARD'; employee.pose = 'typing';
        }
        say(s, story.target, bridgeVisit ? "That's not exactly how structural design works." : story.target === 'Beam' ? "I'm working on it, boss 😭" : story.target === 'Check' ? 'Because Beam keeps changing the pretend box depth.' : 'Absolutely, boss. Very busy!');
        if (story.target === 'Check') say(s, 'Beam', 'Bro...', 5);
      }
    }
    if (story.kind === 'meeting') boss.pose = 'normal';
  } else if (story.phase === 'scene' && s.time >= story.until) {
    if (story.kind === 'meeting') {
      say(s, 'Kyaw', 'I forgot why I called this meeting. 😴', 6);
      boss.pose = 'sleep'; boss.state = 'BREAK'; boss.task = '😴 CEO MODE';
      story.kind = 'meeting-ending'; story.until = s.time + 6; return;
    }
    if (story.target && story.previousState) {
      s.agents[story.target].state = story.previousState;
      if (story.previousPose) s.agents[story.target].pose = story.previousPose;
    }
    if (story.kind === 'scold') say(s, 'Kyaw', 'Everyone back to work! ...Where is my game controller?', 7);
    if (story.kind === 'visit' && story.target === 'Beam') say(s, 'Kyaw', '...make it cooler.', 7);
    const goGame = story.kind === 'scold';
    travel(boss, goGame ? 'game' : 'ceoOffice', goGame ? 'PLAYING' : 'BORED', goGame ? 'game' : 'normal');
    boss.task = goGame ? 'Playing a game after scolding everyone' : 'Avoiding work in the CEO office';
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
  const options = [signature[name], ['coffee', 'coffee', 'Coffee: the only critical dependency.'], ['desk', 'sleep', 'Zzz… running a dream simulation.'], ['desk', 'stretch', 'Stretching my tiny decision muscles.'], ['meeting', 'normal', 'Team meeting: should our bridge have a snack lane?'], [indexToilet(name), 'normal', 'Very important meeting. 🚻']] as const;
  const event = options[integer(s, 0, options.length - 1)];
  a.eventUntil = s.time + 20; a.task = event[2];
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
function indexToilet(name: Person): Place { return everyone.indexOf(name) % 2 ? 'toiletWomen' : 'toiletMen'; }
export function createSimulation(seed = 240924): Simulation {
  const agents = Object.fromEntries(everyone.map(name => [name, { name, state: name === 'Kyaw' ? 'BORED' : 'WAITING', projectId: name === 'Kyaw' ? null : 'BG-024', task: name === 'Kyaw' ? 'Avoiding work' : 'Waiting for the project brief', thought: thoughts[name][0], progress: name === 'Kyaw' ? 12 : 0,
    position: location(name, 'desk'), heading: Math.PI, destination: 'desk', route: [], arrivalState: 'WAITING', pose: 'normal', bubble: '', bubbleUntil: 0,
    eventUntil: 0, hiddenUntil: 0, breakUntil: 0, resume: null }])) as unknown as Record<Person, Agent>;
  const s = { agents, history: [], events: [], time: 0, seed, eventId: 0, nextEvent: 14, nextProject: 24, nextCeo: 22, ceoStory: null } as unknown as Simulation;
  s.project = makeProject(s); beginWork(s, 'Atlas'); say(s, 'Atlas', `${s.project.id} just arrived. Tiny team, big pretend possibilities!`);
  return s;
}
/** Pure transition function. No React, Three.js, network calls, or real engineering. */
export function reduceSimulation(previous: Simulation, action: Action): Simulation {
  if (action.type === 'tick' && (!Number.isFinite(action.dt) || action.dt <= 0)) return previous;
  if (action.type === 'new' && previous.project.status !== 'COMPLETE') return previous;
  if (action.type === 'choose' && (previous.project.status !== 'NEEDS YOU' || !previous.project.alternatives?.some(a => a.name === action.alternative))) return previous;
  const s = structuredClone(previous), p = s.project;
  if (action.type === 'ceo') { startCeo(s, action.command, action.target); return s; }
  if (action.type === 'new') {
    s.history.unshift(structuredClone(p)); s.history = s.history.slice(0, 20); s.project = makeProject(s);
    for (const name of everyone) {
      const a = s.agents[name]; a.progress = 0; a.projectId = s.project.id; a.resume = null; a.breakUntil = 0; a.eventUntil = 0; a.hiddenUntil = 0;
      a.task = 'Waiting for the project brief'; travel(a, 'desk', 'WAITING');
    }
    s.agents.Kyaw.projectId = null; s.agents.Kyaw.progress = 12; s.agents.Kyaw.task = 'Avoiding work'; s.ceoStory = null;
    beginWork(s, 'Atlas'); say(s, 'Atlas', `New project ${s.project.id}! Let's make another little connection.`); return s;
  }
  if (action.type === 'choose') {
    p.winner = action.alternative; p.status = 'COMPLETE'; p.phase = 'complete'; p.completedAt = s.time;
    for (const name of everyone) {
      const a = s.agents[name]; a.resume = null; a.breakUntil = 0; a.progress = 100; a.task = `Celebrating ${p.id}`; a.eventUntil = s.time + 20;
      travel(a, 'meeting', 'COMPLETED', 'celebrate');
    }
    say(s, 'Atlas', `${p.id} complete! ${p.winner} wins our imaginary gold star. 🎉`, 14); return s;
  }
  if (action.type === 'resume') { resume(s, action.name); return s; }
  if (action.type === 'break') {
    const a = s.agents[action.name]; if (action.name === 'Kyaw' || a.resume || a.state === 'NEEDS YOU' || a.state === 'AWAY') return previous;
    a.resume = { destination: a.destination, state: a.state, task: a.task, pose: a.pose, position: [...a.position], route: structuredClone(a.route), arrivalState: a.arrivalState };
    a.breakUntil = -1; a.task = 'A well-earned coffee break'; travel(a, 'coffee', 'BREAK', 'coffee'); say(s, action.name, 'Saving my place. Coffee first, tiny bridge later.'); return s;
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
      a.hiddenUntil = s.time + 7; a.task = 'Very important meeting. 🚻';
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
    if (p.phase === 'handoff') {
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
  if (s.time >= s.nextCeo && !s.ceoStory) {
    const activities: CeoCommand[] = ['game','nap','coffee','roam','phone','window','cat','car','garden','visit','scold','meeting','office'];
    startCeo(s, activities[integer(s, 0, activities.length - 1)]);
  }
  if (s.time >= s.nextEvent) { idleEvent(s); s.nextEvent = s.time + integer(s, 10, 17); }
  return s;
}
