import { location } from './model.ts';
import type { Agent, AgentState, Person, Place, Point, Pose } from './model.ts';

// Floor navigation only. These coordinates describe office furniture, never bridge engineering.
const obstacles = [
  [-4.86, -2.52, -3.68, -2.42], [-1.91, .41, -3.68, -2.42], [1.14, 3.46, -3.68, -2.42],
  [-2.12, 1.52, -1, 1], [1.08, 3.82, 1.4, 2.9], [-5.3, -2.65, 2.16, 3.62],
  [-5.55, -4.34, -.85, 1.02], [4.38, 5.57, -3.07, -1.74],
];
const blocked = ([x, z]: Point) => obstacles.some(([x1, x2, z1, z2]) => x >= x1 && x <= x2 && z >= z1 && z <= z2);

/** Grid BFS around the existing furniture, with short final approaches to chairs. */
export function planRoute(start: Point, end: Point): Point[] {
  const step = .3, columns = 35, rows = 27;
  const point = (n: number): Point => [-5.1 + n % columns * step, -3.9 + Math.floor(n / columns) * step];
  const nearest = (p: Point) => {
    let best = 0, distance = Infinity;
    for (let n = 0; n < columns * rows; n++) {
      const q = point(n); if (blocked(q)) continue;
      const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d < distance) { distance = d; best = n; }
    }
    return best;
  };
  const from = nearest(start), to = nearest(end), queue = [from];
  const previous = new Map<number, number>([[from, -1]]);
  for (let head = 0; head < queue.length && !previous.has(to); head++) {
    const n = queue[head];
    for (const next of [n - 1, n + 1, n - columns, n + columns]) {
      if (next < 0 || next >= columns * rows || previous.has(next)) continue;
      if (Math.abs(next % columns - n % columns) > 1 || blocked(point(next))) continue;
      previous.set(next, n); queue.push(next);
    }
  }
  if (!previous.has(to)) return [end];
  const route: Point[] = [];
  for (let n = to; n !== -1; n = previous.get(n)!) route.unshift(point(n));
  // Keep corners, dropping collinear grid steps.
  const simplified = route.filter((p, i) => i === 0 || i === route.length - 1 ||
    Math.abs((p[0] - route[i-1][0]) * (route[i+1][1] - p[1]) - (p[1] - route[i-1][1]) * (route[i+1][0] - p[0])) > .001);
  return [...simplified, end];
}
export function travel(agent: Agent, place: Place, arrivalState: AgentState, pose: Pose = 'normal', target?: Point) {
  agent.destination = place;
  agent.route = planRoute(agent.position, target ?? location(agent.name, place));
  agent.state = 'WALKING'; agent.arrivalState = arrivalState; agent.pose = pose;
}
export function move(agent: Agent, dt: number) {
  if (agent.state !== 'WALKING') return;
  let remaining = dt * 1.35;
  while (remaining > 0 && agent.route.length) {
    const target = agent.route[0];
    const dx = target[0] - agent.position[0], dz = target[1] - agent.position[1];
    const distance = Math.hypot(dx, dz);
    if (distance > .001) agent.heading = Math.atan2(dx, dz);
    if (distance <= remaining) { agent.position = [...target]; agent.route.shift(); remaining -= distance; }
    else { agent.position[0] += dx / distance * remaining; agent.position[1] += dz / distance * remaining; remaining = 0; }
  }
  if (!agent.route.length) {
    agent.state = agent.arrivalState;
    agent.heading = agent.destination === 'coffee' ? -Math.PI / 2 : agent.destination === 'sofa' || (agent.destination === 'meeting' && agent.position[1] < 2) ? 0 : Math.PI;
  }
}
export const workPlaces: Record<Person, Place> = { Atlas: 'desk', Beam: 'desk', Check: 'desk', Eco: 'bridge', Cash: 'desk', Rank: 'server' };
export const workPoses: Record<Person, Pose> = { Atlas: 'typing', Beam: 'typing', Check: 'inspect', Eco: 'inspect', Cash: 'count', Rank: 'chart' };
