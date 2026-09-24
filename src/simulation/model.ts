export const people = ['Atlas', 'Beam', 'Check', 'Eco', 'Cash', 'Rank'] as const;
export type CorePerson = typeof people[number];
export const workers = ['Carbon', 'Durability', 'Maintain', 'Environment'] as const;
export const everyone = [...people, ...workers, 'Kyaw'] as const;
export type Worker = typeof workers[number];
export type Person = typeof everyone[number];
export type Department = 'Management' | 'Structural' | 'Sustainability' | 'Commercial & Decision';
export const departments: Record<Person, Department> = {
  Kyaw: 'Management', Atlas: 'Management', Beam: 'Structural', Check: 'Structural',
  Eco: 'Sustainability', Carbon: 'Sustainability', Durability: 'Sustainability', Maintain: 'Sustainability', Environment: 'Sustainability',
  Cash: 'Commercial & Decision', Rank: 'Commercial & Decision',
};
export type Point = [number, number];
export type Room = 'Structural' | 'Sustainability' | 'Cost & Decision' | 'CEO Office' | 'Meeting Room' | 'Outside';
export const rooms: Record<Room, Point> = {
  Structural: [0, 0], Sustainability: [12.5, 0], 'Cost & Decision': [12.5, 10],
  'CEO Office': [-2.5, 10], 'Meeting Room': [3.7, 10], Outside: [5, 22],
};
export type Place = 'desk' | 'bridge' | 'coffee' | 'whiteboard' | 'meeting' | 'sofa' | 'server' | 'plant' |
  'ceoOffice' | 'game' | 'window' | 'garden' | 'bench' | 'cat' | 'parking' | 'outside' | 'pantry' | 'toiletMen' | 'toiletWomen' | 'lobby' | 'ecoModel' | 'ecoMap';
export type AgentState = 'IDLE' | 'WALKING' | 'WORKING' | 'WAITING' | 'NEEDS YOU' | 'BREAK' | 'COMPLETED' | 'MEETING' | 'AWAY' | 'BORED' | 'PLAYING' | 'WORKING VERY HARD';
export type Pose = 'normal' | 'typing' | 'inspect' | 'coffee' | 'water' | 'count' | 'chart' | 'celebrate' | 'sleep' | 'stretch' | 'game' | 'phone' | 'look';
export const stateIcons: Record<AgentState, string> = { IDLE: '⚪', WALKING: '🔵', WORKING: '🟢', WAITING: '🟡', 'NEEDS YOU': '🔴', BREAK: '☕', COMPLETED: '✅', MEETING: '🤝', AWAY: '🚻', BORED: '😐', PLAYING: '🎮', 'WORKING VERY HARD': '😰' };
export const profiles: Record<Person, { role: string; color: string; light: string; avatar: string; description: string }> = {
  Atlas: { role: 'Project Manager / Orchestrator Agent', color: '#ec8d58', light: '#ffe6c6', avatar: '👨‍💼', description: 'Keeps the big picture in a very small notebook.' },
  Beam: { role: 'Structural Design Agent', color: '#388db5', light: '#d8f2f5', avatar: '👷', description: 'Loves bridge models. Takes very small, very serious notes.' },
  Check: { role: 'Verification Agent', color: '#a777c5', light: '#f0dff4', avatar: '🧐', description: 'Checks the checks. Then checks those checks.' },
  Eco: { role: 'Sustainability Manager / Sustainability Agent', color: '#69ac5b', light: '#e3f4d8', avatar: '🌱', description: 'Leads four specialists and waters their plants.' },
  Cash: { role: 'Cost Agent', color: '#d49c30', light: '#fff0c5', avatar: '🪙', description: 'The budget is pretend. The love of spreadsheets is real.' },
  Rank: { role: 'Decision Agent', color: '#6277bc', light: '#e0e8fb', avatar: '📊', description: 'Has a chart for everything. Even the office biscuits.' },
  Carbon: { role: 'Embodied Carbon Specialist', color: '#52a27e', light: '#d9f0df', avatar: '🍃', description: 'Counts imaginary emissions, then counts office plants.' },
  Durability: { role: 'Durability Specialist', color: '#ca795a', light: '#f7e4d7', avatar: '🛡️', description: 'Wants every pretend bridge to last a pretend long time.' },
  Maintain: { role: 'Maintenance & Inspection Specialist', color: '#b4824d', light: '#f4e9d4', avatar: '🔧', description: 'Finds tiny imaginary places that are hard to reach.' },
  Environment: { role: 'Environmental Impact Specialist', color: '#649f99', light: '#def2ed', avatar: '🌳', description: 'Keeps imaginary disruption thoughtfully small.' },
  Kyaw: { role: 'CEO', color: '#d5547d', light: '#ffe0eb', avatar: '👑', description: 'Runs the company with confidence. Occasionally even awake.' },
};
export const originalTeam: Person[] = ['Atlas', 'Beam', 'Eco'];
export const desks: Record<Person, Point> = {
  Atlas: [-3.7, -2.3], Beam: [-.75, -2.3], Check: [4.15, .7], Eco: [8.65, -2.05],
  Carbon: [10.9, -.8], Durability: [14.1, -.8], Maintain: [10.9, 2.2], Environment: [14.1, 2.2],
  Cash: [10, 8], Rank: [15, 8], Kyaw: [-2.8, 8.45],
};
export function location(name: Person, place: Place): Point {
  const index = everyone.indexOf(name);
  if (place === 'desk') return [desks[name][0], desks[name][1] + .5];
  const spots: Record<Exclude<Place, 'desk'>, Point> = {
    bridge: [-1 + index % 3 * .65, 1.25], coffee: [2.2 + index % 2 * .5, 16],
    whiteboard: [3.75, -2.05], meeting: [2.1 + index % 3 * .75, 9 + Math.floor(index % 6 / 3) * 1.1],
    sofa: [-3.9 + index % 2 * .8, 11.6], server: [16.5, 8.8], plant: [9.1, 2.8],
    ceoOffice: [-2.8, 9], game: [-4.1, 12.25], window: [-5.25, 10.4], garden: [-3.5, 22], bench: [-4.9, 21.85],
    cat: [2.6, 19.3], parking: [20.6, 20.2], outside: [4, 22], pantry: [15.9, 11.7],
    toiletMen: [-3.6, 16.9], toiletWomen: [-.8, 16.9], lobby: [3.4, 16.7], ecoModel: [16.1, -.1], ecoMap: [16.4, 2.6],
  };
  return spots[place];
}
export interface Agent {
  name: Person; state: AgentState; projectId: string | null; task: string; thought: string; progress: number;
  position: Point; heading: number; destination: Place; route: Point[]; arrivalState: AgentState; pose: Pose;
  bubble: string; bubbleUntil: number; eventUntil: number; hiddenUntil: number;
  breakUntil: number; resume: { destination: Place; state: AgentState; task: string; pose: Pose; position: Point; route: Point[]; arrivalState: AgentState } | null;
}
export interface Geometry { depth: number; width: number; cells: number; pier: number; web: number }
export interface Review { geometry: 'PASS' | 'REVIEW'; serviceability: 'PASS' | 'REVIEW'; score: number; prestressing: 'PASS' | 'REVIEW'; accepted: boolean; revision: number }
export interface Sustainability { carbon: number; durability: number; maintainability: number; environmental: number }
export interface WorkerResult { score: number; details: [string, number][] }
export interface Cost { concrete: number; prestressing: number; reinforcement: number; millions: number; score: number }
export interface Concept { name: string; geometry: Geometry; structural: number; review: 'PENDING' | 'PASS' | 'REVIEW' }
export interface Alternative extends Concept { carbon: number; durability: number; maintainability: number; environmental: number; sustainability: number; cost: number; score: number }
export type DecisionIssue = 'checkRevision' | 'ecoTradeoff' | 'rankChoice' | 'ceoApproval';
export interface GameStats {
  projectsCompleted: number; projectsRejected: number; beamRevisions: number; checkRejections: number;
  carbonAssessments: number; maintenanceComplaints: number; environmentalWarnings: number; costArguments: number;
  sustainabilityMeetings: number; coffeeConsumed: number; ceoCoffeeConsumed: number; ceoNaps: number; ceoScoldings: number; beamScoldings: number;
  ceoGamingSessions: number; pointlessMeetings: number; toiletBreaks: number;
}
export interface Project {
  id: string; title: string; type: string; alignment: string; spans: number; span: number; width: number; pier: number;
  revision: number; status: 'ACTIVE' | 'NEEDS YOU' | 'COMPLETE'; stage: CorePerson; phase: 'travel' | 'work' | 'inspection' | 'handoff' | 'department' | 'reports' | 'ecoChoice' | 'decision' | 'ceoReview' | 'complete';
  sender: Person | null; workElapsed: number; geometry?: Geometry; reviews: Review[];
  concepts?: Concept[]; workerResults: Partial<Record<Worker, WorkerResult>>; sustainability?: Sustainability; cost?: Cost; alternatives?: Alternative[];
  winner?: string; issue?: DecisionIssue; ecoPreference?: 'A' | 'B'; ignored?: boolean; startedAt: number; completedAt?: number;
}
export interface LabEvent { id: number; name: Person; text: string; time: number }
export interface CeoStory { kind: string; target: Person | null; until: number; phase: 'travel' | 'scene' | 'return'; followup?: string; previousState?: AgentState; previousPose?: Pose }
export interface Simulation { agents: Record<Person, Agent>; project: Project; history: Project[]; events: LabEvent[]; stats: GameStats; time: number; seed: number; eventId: number; nextEvent: number; nextSocial: number; nextProject: number; nextCeo: number; celebrationUntil: number; lateCeoAt: number; ceoStory: CeoStory | null }
export type CeoCommand = 'office' | 'visit' | 'meeting' | 'game' | 'coffee' | 'nap' | 'roam' | 'scold' | 'phone' | 'window' | 'cat' | 'car' | 'garden' | 'toilet' | 'inspectBridge';
export type DecisionChoice = 'approveRevision' | 'sendBack' | 'askCheck' | 'chooseA' | 'chooseB' | 'askCash' | 'askBeam' | 'meeting' | 'ignore' | 'approveProject' | 'rejectProject' | 'sleep';
export type Action = { type: 'tick'; dt: number } | { type: 'break'; name: Person } | { type: 'resume'; name: Person } | { type: 'new' } | { type: 'choose'; alternative: string } | { type: 'decision'; choice: DecisionChoice } | { type: 'activity'; name: Person; place: Place } | { type: 'ceo'; command: CeoCommand; target?: Person };
