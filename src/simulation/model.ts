export const people = ['Atlas', 'Beam', 'Check', 'Eco', 'Cash', 'Rank'] as const;
export type Person = typeof people[number];
export type Point = [number, number];
export type Place = 'desk' | 'bridge' | 'coffee' | 'whiteboard' | 'meeting' | 'sofa' | 'server' | 'plant';
export type AgentState = 'IDLE' | 'WALKING' | 'WORKING' | 'WAITING' | 'NEEDS YOU' | 'BREAK' | 'COMPLETED' | 'MEETING';
export type Pose = 'normal' | 'typing' | 'inspect' | 'coffee' | 'water' | 'count' | 'chart' | 'celebrate' | 'sleep' | 'stretch';
export const stateIcons: Record<AgentState, string> = { IDLE: '⚪', WALKING: '🔵', WORKING: '🟢', WAITING: '🟡', 'NEEDS YOU': '🔴', BREAK: '☕', COMPLETED: '✅', MEETING: '🤝' };
export const profiles: Record<Person, { role: string; color: string; light: string; avatar: string; description: string }> = {
  Atlas: { role: 'Project Manager / Orchestrator Agent', color: '#d49771', light: '#f3e0cd', avatar: '👨‍💼', description: 'Keeps the big picture in a very small notebook.' },
  Beam: { role: 'Structural Design Agent', color: '#709aae', light: '#dce9ed', avatar: '👷', description: 'Loves bridge models. Takes very small, very serious notes.' },
  Check: { role: 'Verification Agent', color: '#9c8bb1', light: '#ece5f2', avatar: '🧐', description: 'Checks the checks. Then checks those checks.' },
  Eco: { role: 'Sustainability Agent', color: '#80a475', light: '#e2edda', avatar: '🌱', description: 'Growing greener imaginary bridges, one plant at a time.' },
  Cash: { role: 'Cost Agent', color: '#cfac51', light: '#f3e9c9', avatar: '🪙', description: 'The budget is pretend. The love of spreadsheets is real.' },
  Rank: { role: 'Decision Agent', color: '#7388b3', light: '#e2e8f4', avatar: '📊', description: 'Has a chart for everything. Even the office biscuits.' },
};
// Existing workstations stay in place. New employees share the meeting and server areas.
export const desks: Record<Person, Point> = { Atlas: [-3.7, -2.3], Beam: [-.75, -2.3], Eco: [2.3, -2.3], Check: [1.8, 2.55], Cash: [3.1, 2.55], Rank: [4.25, -1.25] };
export const originalTeam: Person[] = ['Atlas', 'Beam', 'Eco'];
export function location(name: Person, place: Place): Point {
  const index = people.indexOf(name);
  if (place === 'desk') return [desks[name][0], desks[name][1] + .5];
  const spots: Record<Exclude<Place, 'desk'>, Point> = {
    bridge: [-1 + index % 3 * .7, 1.25], coffee: [-4.15, .1 + index % 2 * .45],
    whiteboard: [3.75, -2.05], meeting: [1.7 + index % 3 * .75, index < 3 ? 1.2 : 3.12],
    sofa: [-4.1 + index % 2 * .8, 2.9], server: [4.4, -1.2], plant: [4.35, 3.45],
  };
  return spots[place];
}
export interface Agent {
  name: Person; state: AgentState; projectId: string | null; task: string; thought: string; progress: number;
  position: Point; heading: number; destination: Place; route: Point[]; arrivalState: AgentState; pose: Pose;
  bubble: string; bubbleUntil: number; eventUntil: number;
  breakUntil: number; resume: { destination: Place; state: AgentState; task: string; pose: Pose; position: Point; route: Point[]; arrivalState: AgentState } | null;
}
export interface Geometry { depth: number; width: number; cells: number; pier: number; web: number }
export interface Review { geometry: 'PASS' | 'REVIEW'; serviceability: 'PASS' | 'REVIEW'; score: number; prestressing: 'PASS' | 'REVIEW'; accepted: boolean; revision: number }
export interface Sustainability { carbon: number; durability: number; maintainability: number; environmental: number }
export interface Cost { concrete: number; prestressing: number; reinforcement: number; millions: number; score: number }
export interface Alternative { name: string; structural: number; sustainability: number; cost: number; score: number }
export interface Project {
  id: string; title: string; type: string; alignment: string; spans: number; span: number; width: number; pier: number;
  revision: number; status: 'ACTIVE' | 'NEEDS YOU' | 'COMPLETE'; stage: Person; phase: 'travel' | 'work' | 'handoff' | 'decision' | 'complete';
  sender: Person | null; workElapsed: number; geometry?: Geometry; reviews: Review[];
  sustainability?: Sustainability; cost?: Cost; alternatives?: Alternative[]; winner?: string; startedAt: number; completedAt?: number;
}
export interface LabEvent { id: number; name: Person; text: string; time: number }
export interface Simulation { agents: Record<Person, Agent>; project: Project; history: Project[]; events: LabEvent[]; time: number; seed: number; eventId: number; nextEvent: number; nextProject: number }
export type Action = { type: 'tick'; dt: number } | { type: 'break'; name: Person } | { type: 'resume'; name: Person } | { type: 'new' } | { type: 'choose'; alternative: string } | { type: 'activity'; name: Person; place: Place };
