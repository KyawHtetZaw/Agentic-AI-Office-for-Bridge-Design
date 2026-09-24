import type { Dispatch, ReactNode } from 'react';
import { ArrowUpRight, Focus, Plus } from 'lucide-react';
import { assignedAgent, boardColumns, currentDepartment, projectColumn, projectProgress } from './simulation/management';
import { departments, everyone, profiles, stateIcons } from './simulation/model';
import type { Action, DecisionChoice, Person, Project, Simulation } from './simulation/model';

type Base = { simulation: Simulation; dispatch: Dispatch<Action> };
const pct = (value: number) => `${Math.round(value)}%`;

export function ProjectsView({ simulation, dispatch, openId, setOpenId, onFocus, onBoard, renderResults }: Base & {
  openId: string | null; setOpenId: (id: string | null) => void; onFocus: (name: Person) => void;
  onBoard: () => void; renderResults: (project: Project) => ReactNode;
}) {
  const items = [simulation.project, ...simulation.history];
  const project = items.find(item => item.id === openId);
  if (project) return <div className="project-dashboard">
    <button className="text-back" onClick={() => setOpenId(null)}>← ALL PROJECTS</button>
    <div className="management-hero"><div><span className="eyebrow">PROJECT DASHBOARD · {project.id}</span><h3>{project.title}</h3><p>{project.type} · {project.alignment} alignment · {project.spans} spans</p></div><span className="management-badge">{currentDepartment(project)}</span></div>
    <nav className="dashboard-jumps" aria-label="Project sections"><a href="#project-information">PROJECT INFORMATION</a><a href="#structural-section">STRUCTURAL</a><a href="#sustainability-section">SUSTAINABILITY</a><a href="#cost-section">COST</a><a href="#decision-section">DECISION</a><a href="#activity-section">AGENT ACTIVITY</a></nav>
    <div id="project-information" className="dashboard-facts"><span><b>PROJECT</b>{project.id}</span><span><b>DEPARTMENT</b>{currentDepartment(project)}</span><span><b>ASSIGNED</b>{project.status === 'COMPLETE' ? 'All departments' : assignedAgent(project)}</span><span><b>OVERALL PROGRESS</b>{project === simulation.project ? pct(projectProgress(project, simulation)) : '100%'}</span></div>
    {renderResults(project)}
    <section id="activity-section" className="result-section"><div className="result-title"><h3>Agent activity</h3><span>FICTIONAL OFFICE FEED</span></div><div className="activity-lines">{simulation.events.filter(event => event.time >= project.startedAt && event.time <= (project.completedAt ?? Infinity)).slice(0, 10).map(event => <p key={event.id}><b>{event.name}</b> {event.text}</p>)}{project !== simulation.project && <small>Only the latest 40 game events are kept in this session.</small>}</div></section>
  </div>;
  return <div className="management-view"><div className="management-hero"><div><span className="eyebrow">PROJECT PORTFOLIO</span><h3>Every tiny crossing has a story.</h3><p>Session projects and fictional progress, all in one notebook.</p></div><button className="primary-btn" disabled={simulation.project.status !== 'COMPLETE'} onClick={() => { dispatch({ type: 'new' }); setOpenId(null); }}><Plus size={15}/> NEW PROJECT</button></div>
    <div className="project-grid">{items.map(project => { const agent = assignedAgent(project); return <article className="management-card" key={project.id}><div className="project-card-top"><span>PROJECT {project.id}</span><b className={'stage-tag '+(project.status === 'NEEDS YOU' ? 'attention' : '')}>{project.status === 'COMPLETE' ? 'COMPLETE' : currentDepartment(project)}</b></div><h4>{project.title}</h4><dl><dt>Type</dt><dd>{project.type}</dd><dt>Alignment</dt><dd>{project.alignment}</dd><dt>Spans</dt><dd>{project.spans}</dd><dt>Current department</dt><dd>{currentDepartment(project)}</dd><dt>Assigned agent</dt><dd>{project.status === 'COMPLETE' ? 'All departments' : agent}</dd></dl><div className="progress-label"><span>Overall progress</span><b>{project === simulation.project ? pct(projectProgress(project, simulation)) : '100%'}</b></div><progress value={project === simulation.project ? projectProgress(project, simulation) : 100} max={100}/><div className="card-actions"><button onClick={() => setOpenId(project.id)}>VIEW PROJECT</button><button disabled={project.status === 'COMPLETE'} onClick={() => onFocus(agent)}>LOCATE AGENT</button><button onClick={onBoard}>OPEN DESIGN BOARD</button></div></article>; })}</div>
  </div>;
}

export function DesignBoardView({ simulation, onProject }: { simulation: Simulation; onProject: (id: string) => void }) {
  const items = [simulation.project, ...simulation.history];
  return <div className="management-view"><p className="board-intro">Cards move automatically through the fictional workflow. A “Needs You” card pauses until you make a game choice.</p><div className="kanban-board">{boardColumns.map(column => <section className="kanban-column" key={column}><header><span>{column}</span><b>{items.filter(project => projectColumn(project) === column).length}</b></header><div>{items.filter(project => projectColumn(project) === column).map(project => { const agent = assignedAgent(project); const progress = project === simulation.project ? projectProgress(project, simulation) : 100; return <button className="kanban-card" key={project.id} onClick={() => onProject(project.id)}><strong>{project.id}</strong><span>{project.title}</span><small>Current stage: {project.issue === 'ceoApproval' ? 'CEO review' : project.phase === 'department' ? `${agent} assessment` : currentDepartment(project)}</small><small>Assigned: {project.status === 'COMPLETE' ? 'Team' : agent}</small><div className="progress-label"><span>Progress</span><b>{pct(progress)}</b></div><progress value={progress} max={100}/>{project.status === 'NEEDS YOU' && <em>Needs a little CEO attention ↗</em>}</button>; })}</div></section>)}</div><p className="management-footnote">SIMULATED GAME DATA — this board does not track real engineering work.</p></div>;
}

export function TeamView({ simulation, onFocus, onTask }: { simulation: Simulation; onFocus: (name: Person) => void; onTask: (name: Person) => void }) {
  return <div className="management-view"><div className="management-hero"><div><span className="eyebrow">COMPLETE ORGANIZATION</span><h3>Eleven colleagues. One very small company.</h3></div><span className="management-badge">10 AGENTS + 1 CEO</span></div><div className="team-management-grid">{everyone.map(name => { const a = simulation.agents[name]; return <article className="management-card employee-card" key={name}><div className="employee-heading"><span className={'avatar avatar-'+name.toLowerCase()}><span>{profiles[name].avatar}</span></span><div><h4>{name === 'Kyaw' ? 'KYAW Htet Zaw' : name.toUpperCase()}</h4><p>{profiles[name].role}</p></div></div><dl><dt>Department</dt><dd>{departments[name]}</dd><dt>Status</dt><dd>{stateIcons[a.state]} {a.state}</dd><dt>Project</dt><dd>{a.projectId ?? 'Executive oversight'}</dd><dt>Task</dt><dd>{a.task}</dd></dl><div className="progress-label"><span>Progress</span><b>{name === 'Kyaw' ? '14% 😂' : pct(a.progress)}</b></div><progress value={name === 'Kyaw' ? 14 : a.progress} max={100}/><div className="card-actions"><button onClick={() => onFocus(name)}>VIEW EMPLOYEE</button><button onClick={() => onFocus(name)}>FOCUS CAMERA</button><button onClick={() => onTask(name)}>VIEW TASK</button></div></article>; })}</div></div>;
}

const issueActions: Record<Exclude<Project['issue'], undefined>, { label: string; choice: DecisionChoice }[]> = {
  checkRevision: [{ label: 'APPROVE REVISION', choice: 'approveRevision' }, { label: 'SEND BACK TO BEAM', choice: 'sendBack' }, { label: 'ASK CHECK AGAIN', choice: 'askCheck' }, { label: 'CALL TEAM MEETING', choice: 'meeting' }, { label: 'IGNORE FOR NOW', choice: 'ignore' }],
  ecoTradeoff: [{ label: 'CHOOSE A', choice: 'chooseA' }, { label: 'CHOOSE B', choice: 'chooseB' }, { label: 'ASK CASH', choice: 'askCash' }, { label: 'ASK BEAM', choice: 'askBeam' }, { label: 'CALL MEETING', choice: 'meeting' }, { label: 'DECIDE LATER', choice: 'ignore' }],
  rankChoice: [{ label: 'CALL MEETING', choice: 'meeting' }, { label: 'IGNORE FOR NOW', choice: 'ignore' }],
  ceoApproval: [{ label: 'APPROVE PROJECT', choice: 'approveProject' }, { label: 'REJECT & REVISE', choice: 'rejectProject' }, { label: 'TAKE A NAP', choice: 'sleep' }, { label: 'CALL MEETING', choice: 'meeting' }, { label: 'IGNORE FOR NOW', choice: 'ignore' }],
};
export function NeedsYouView({ simulation, dispatch }: Base) {
  const p = simulation.project;
  if (p.status === 'COMPLETE') return <div className="all-clear"><span>🎉</span><h3>{p.id} is complete!</h3><p>The little company is celebrating your game choice.</p><button className="primary-btn" onClick={() => dispatch({ type: 'new' })}>START ANOTHER FICTIONAL PROJECT</button></div>;
  if (!p.issue) return <div className="all-clear"><span>☕</span><h3>All good in the neighborhood.</h3><p>The team will ask for your help when a game decision appears.</p></div>;
  const titles = { checkRevision: 'Check needs a tiny decision.', ecoTradeoff: 'Eco has a playful tradeoff.', rankChoice: 'Rank has three pretend alternatives.', ceoApproval: 'The CEO review is on your desk.' };
  return <div className="management-view"><div className="attention-card"><span className="eyebrow">NEEDS YOU · PROJECT {p.id}</span><h3>{titles[p.issue]}</h3><p>{p.issue === 'checkRevision' ? 'Beam submitted another pretend concept. Check wants a revision call; these are game choices only.' : p.issue === 'ecoTradeoff' ? 'Alternative A has the stronger fictional carbon story. Alternative B has the stronger fictional budget story. Choose a preference or ask a colleague.' : p.issue === 'rankChoice' ? 'Rank compared six fictional game scores per alternative. Choose the one you like, then Kyaw gets the final review.' : `${p.winner} is waiting for Kyaw. He might approve, reject, call a meeting, or nap.`}</p>{p.ignored && <div className="delay-banner">Project delayed because the CEO is busy doing absolutely nothing. 😂</div>}
    {p.issue === 'rankChoice' && <div className="choice-grid">{p.alternatives?.map(a => <button key={a.name} onClick={() => dispatch({ type: 'choose', alternative: a.name })}><strong>{a.name}</strong><b>{a.score} / 100</b><span>Structure {a.structural} · Carbon {a.carbon} · Cost {a.cost}</span><small>CHOOSE THIS ALTERNATIVE ↗</small></button>)}</div>}
    {p.issue === 'ecoTradeoff' && <div className="tradeoff-grid"><div><b>ALTERNATIVE A</b><span>Stronger carbon game score</span></div><div><b>ALTERNATIVE B</b><span>Stronger cost game score</span></div></div>}
    <div className="decision-actions">{issueActions[p.issue].map(item => <button key={item.choice} onClick={() => dispatch({ type: 'decision', choice: item.choice })}>{item.label}</button>)}</div><small>SIMULATED GAME DATA — NOT ENGINEERING DESIGN OR APPROVAL.</small></div></div>;
}

const statNames: [keyof Simulation['stats'], string][] = [
  ['projectsCompleted', 'Projects Completed'], ['projectsRejected', 'Projects Rejected'], ['beamRevisions', 'Beam Revisions'],
  ['checkRejections', 'Check Rejections'], ['carbonAssessments', 'Carbon Assessments'], ['maintenanceComplaints', 'Maintenance Complaints'],
  ['environmentalWarnings', 'Environmental Warnings'], ['costArguments', 'Cost Arguments'], ['sustainabilityMeetings', 'Sustainability Meetings'],
  ['coffeeConsumed', 'Coffee Consumed'], ['ceoNaps', 'CEO Naps'], ['ceoScoldings', 'CEO Scoldings'], ['ceoGamingSessions', 'CEO Gaming Sessions'],
  ['pointlessMeetings', 'Pointless Meetings'], ['toiletBreaks', 'Toilet Breaks 😂'],
];
export function CEOView({ simulation, dispatch }: Base) {
  const stats = simulation.stats, working = everyone.filter(name => simulation.agents[name].state === 'WORKING' || simulation.agents[name].state === 'WORKING VERY HARD').length;
  const breaks = everyone.filter(name => simulation.agents[name].state === 'BREAK').length;
  const achievements = [
    { title: '🏆 PROFESSIONAL NAPPER', earned: stats.ceoNaps >= 2 }, { title: '🏆 MEETING WITHOUT A PURPOSE', earned: stats.pointlessMeetings >= 1 },
    { title: '🏆 SCOLDED BEAM 10 TIMES', earned: stats.beamScoldings >= 10 }, { title: '🏆 PLAYED GAMES FOR 2 HOURS', earned: stats.ceoGamingSessions >= 3 },
    { title: '🏆 ACTUALLY APPROVED A PROJECT', earned: stats.projectsCompleted >= 1 },
  ];
  return <div className="management-view"><div className="management-hero ceo-hero"><div><span className="eyebrow">EXECUTIVE DASHBOARD 👑</span><h3>KYAW Htet Zaw</h3><p>Chief Executive Officer · Current activity: {simulation.agents.Kyaw.task}</p></div><strong>CEO PRODUCTIVITY TODAY<br/><span>14% 😂</span></strong></div>
    <div className="ceo-summary-grid">{[['Employees Working',working],['Employees on Break',breaks],['Projects Active',simulation.project.status === 'COMPLETE' ? 0 : 1],['Projects Waiting for CEO',simulation.project.issue === 'ceoApproval' ? 1 : 0],['CEO Coffee Consumed',stats.ceoCoffeeConsumed],['CEO Naps',stats.ceoNaps],['Employees Scolded',stats.ceoScoldings],['Games Played During Office Hours',stats.ceoGamingSessions],['Pointless Meetings',stats.pointlessMeetings]].map(([label,value]) => <div key={label}><b>{value}</b><span>{label}</span></div>)}</div>
    <h4>Executive achievements</h4><div className="achievement-grid">{achievements.map(item => <div className={item.earned ? 'earned' : ''} key={item.title}><b>{item.title}</b><span>{item.earned ? 'UNLOCKED' : 'Still on the CEO to-do list'}</span></div>)}</div>
    <h4>Company game statistics</h4><div className="stats-grid">{statNames.map(([key,label]) => <div key={key}><span>{label}</span><b>{stats[key]}</b></div>)}</div>
    <div className="card-actions"><button onClick={() => dispatch({ type: 'ceo', command: 'game' })}>PLAY GAME</button><button onClick={() => dispatch({ type: 'ceo', command: 'meeting' })}>CALL MEETING</button><button onClick={() => dispatch({ type: 'ceo', command: 'toilet' })}>VERY IMPORTANT MEETING 🚻</button></div><p className="management-footnote">All statistics count events in this browser session. Project and employee activity is a fictional game.</p>
  </div>;
}
