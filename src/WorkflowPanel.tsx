import { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import { ArrowUpRight, Coffee, Focus, Plus, X } from 'lucide-react';
import { people, workers, profiles, stateIcons } from './simulation/model';
import type { Action, Agent, Person, Project, Simulation, CeoCommand } from './simulation/model';
import { CEOView, DesignBoardView, NeedsYouView, ProjectsView, TeamView } from './ManagementViews';

type Shared = { simulation: Simulation; dispatch: Dispatch<Action> };
export function AgentPanel({ agent, onTask, onFocus, onBreak, onResume }: { agent: Agent; onTask: () => void; onFocus: () => void; onBreak: () => void; onResume: () => void }) {
  return <section className="detail-card agent-detail">
    <div className="section-top"><span className="eyebrow">{agent.name.toUpperCase()} · AGENT DETAILS</span><span className={'state-pill state-' + agent.state.replace(' ', '-').toLowerCase()}>{stateIcons[agent.state]} {agent.state}</span></div>
    <h3>{profiles[agent.name].role}</h3><dl className="agent-facts"><dt>Current project</dt><dd>{agent.projectId ?? 'None'}</dd><dt>Current task</dt><dd>{agent.task}</dd></dl>
    <div className="progress-label"><span>Task progress</span><b>{agent.progress}%</b></div><progress value={agent.progress} max={100} aria-label={`${agent.name} task progress`}/>
    <blockquote>“{agent.thought}”</blockquote>
    <div className="action-grid"><button onClick={onTask}><ArrowUpRight size={14}/> VIEW TASK</button><button onClick={onFocus}><Focus size={14}/> FOCUS CAMERA</button><button className="break-button" disabled={agent.state === 'NEEDS YOU'} onClick={agent.resume ? onResume : onBreak}><Coffee size={14}/>{agent.resume ? 'RETURN TO TASK' : 'SEND TO BREAK'}</button></div>
    {agent.resume && <p>Progress saved. Returns automatically after coffee, or whenever you’re ready.</p>}
  </section>;
}
const ceoControls: [CeoCommand, string][] = [
  ['office','GO TO OFFICE'], ['visit','VISIT EMPLOYEE'], ['meeting','CALL MEETING'], ['game','PLAY GAME'],
  ['coffee','GET COFFEE'], ['nap','TAKE A NAP'], ['roam','ROAM AROUND'], ['scold','SCOLD RANDOM EMPLOYEE'],
];
export function CEOPanel({agent,dispatch,onFocus,onDashboard}:{agent:Agent;dispatch:Dispatch<Action>;onFocus:()=>void;onDashboard:()=>void}){
 return <section className="detail-card ceo-panel"><div className="section-top"><span className="eyebrow">KYAW Htet Zaw · CEO 👑</span><span className="state-pill">{agent.pose==='sleep'?'😴 CEO MODE':`${stateIcons[agent.state]} ${agent.state}`}</span></div>
  <h3>Chief Executive Officer</h3><dl className="agent-facts"><dt>Current activity</dt><dd>{agent.task}</dd><dt>Productivity</dt><dd>14% 😂</dd></dl><blockquote>“{agent.thought}”</blockquote>
  <div className="action-grid ceo-actions">{ceoControls.map(([command,label])=><button key={command} onClick={()=>dispatch({type:'ceo',command})}>{label}</button>)}<button onClick={onFocus}><Focus size={14}/> FOCUS CAMERA</button><button onClick={onDashboard}>OPEN CEO DASHBOARD</button></div>
  <p>CEO productivity is a running joke in this fictional office.</p></section>
}
export function WorkflowCard({ simulation, dispatch, onOpen, onModel }: Shared & { onOpen: () => void; onModel: () => void }) {
  const p = simulation.project;
  return <section className="project-card workflow-card"><div className="section-top"><span className="eyebrow">LIVE FICTIONAL WORKFLOW</span><span className="concept-badge">{p.id}</span></div><h3>{p.title}</h3>
    <div className="pipeline" aria-label="Project workflow">{[...people,'Kyaw' as const].map(name => <span key={name} className={(p.issue==='ceoApproval'?name==='Kyaw':p.stage===name)&&p.status!=='COMPLETE'?'current':simulation.agents[name].progress===100?'done':''} title={profiles[name].role}>{name}</span>)}</div>
    {p.stage==='Eco'&&p.status==='ACTIVE'&&<div className="pipeline specialist-pipeline">{workers.map(name=><span key={name} className={simulation.agents[name].progress===100?'done':simulation.agents[name].state==='WORKING'?'current':''}>{name} {Math.round(simulation.agents[name].progress)}%</span>)}</div>}
    <p className="workflow-status">{p.status === 'COMPLETE' ? '✅ Project complete · ' + p.winner : p.status === 'NEEDS YOU' ? `🔴 ${p.issue==='ceoApproval'?'Kyaw':p.stage} needs a game decision${p.ignored?' · delayed by CEO':''}` : p.phase === 'handoff' ? `${p.sender} → ${p.stage} · delivering the concept` : p.phase==='department'?'Eco’s four specialists are working in parallel':p.phase==='reports'?'Four specialists are walking their reports to Eco':`${p.stage} · ${simulation.agents[p.stage].task}`}</p>
    <p className="fictional-tag">SIMULATED GAME DATA · REVISION {p.revision}</p>
    <div className="workflow-buttons"><button className="primary-btn" onClick={onOpen}>{p.status === 'NEEDS YOU' ? 'MAKE A GAME DECISION' : 'VIEW PROJECT'}<ArrowUpRight size={14}/></button><button className="icon-btn" aria-label="Focus on bridge model" onClick={onModel}><Focus size={17}/></button></div>
    {p.status === 'COMPLETE' && <button className="new-project-btn" onClick={() => dispatch({ type: 'new' })}><Plus size={14}/> NEW FICTIONAL PROJECT</button>}
  </section>;
}
function Metrics({ rows }: { rows: [string, string | number][] }) {
  return <dl className="metric-grid">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
function ProjectResults({ project: p }: { project: Project }) {
  const review = p.reviews.at(-1), eco = p.sustainability, cost = p.cost;
  const combined = eco ? Math.round((eco.carbon + eco.durability + eco.maintainability + eco.environmental) / 4) : null;
  return <div className="results">
    <section id="project-brief" className="result-section"><div className="result-title"><h3>Project information · {p.id}</h3><span>FICTIONAL PROJECT VALUES</span></div><p>{p.type} · {p.alignment} alignment</p><Metrics rows={[["Spans", p.spans], ['Example span', `${p.span} m`], ['Deck width', `${p.width} m`], ['Pier height', `${p.pier} m`]]}/></section>
    <section id="structural-section" className="result-section"><div className="result-title"><h3>Structural alternatives</h3><span>SIMULATED GAME DATA — NOT ENGINEERING DESIGN</span></div>{p.concepts ? <div className="concept-grid">{p.concepts.map(concept => <div key={concept.name}><h4>{concept.name}</h4><Metrics rows={[["Box depth", `${concept.geometry.depth.toFixed(2)} m`], ['Deck width', `${concept.geometry.width.toFixed(1)} m`], ['Cells', concept.geometry.cells], ['Pier height', `${concept.geometry.pier.toFixed(1)} m`], ['Structural game score', concept.structural], ['Check game review', concept.review === 'PASS' ? '✅ PASS' : concept.review === 'REVIEW' ? '⚠ REVIEW' : '🟡 PENDING']]}/></div>)}</div> : <p className="pending-output">Beam hasn’t delivered three pretend alternatives yet.</p>}<small>Values are sampled from arbitrary ranges without engineering formulas.</small></section>
    <section className="result-section"><div className="result-title"><h3>Check’s pretend review</h3><span>GAME CHECKS ONLY</span></div>{review ? <><Metrics rows={[["Geometry compatibility", review.geometry === 'PASS' ? '✅ PASS' : '⚠ REVIEW'], ['Serviceability simulation', review.serviceability === 'PASS' ? '✅ PASS' : '⚠ REVIEW'], ['Structural game score', `${review.score} / 100`], ['Prestressing simulation', review.prestressing === 'PASS' ? '✅ PASS' : '⚠ REVIEW']]}/><p className={review.accepted ? 'accepted' : 'revision-note'}>{review.accepted ? 'Accepted for the fictional workflow.' : 'Check wants your revision decision in NEEDS YOU.'}</p><div className="review-history">{p.reviews.map((r,i) => <span key={i}>Revision {r.revision}: {r.accepted ? 'accepted' : 'returned for a game decision'}</span>)}</div></> : <p className="pending-output">Waiting for Beam’s concepts.</p>}<small>No structural verification or engineering-code compliance is performed.</small></section>
    <section id="sustainability-section" className="result-section sustainability-results"><div className="result-title"><h3>Eco’s sustainability department</h3><span>SIMULATED SUSTAINABILITY SCORES</span></div><p>Four specialists work independently and deliver their pretend scores to Eco.</p><div className="worker-results">{workers.map(name => <div key={name} className="worker-result"><b>{profiles[name].avatar} {name}</b><span>{p.workerResults[name] ? '✅ COMPLETE' : '🟡 WAITING'}</span><p>{profiles[name].role}</p><strong>{p.workerResults[name] ? `${p.workerResults[name]!.score} / 100 game points` : 'Awaiting game score'}</strong>{p.workerResults[name] && <Metrics rows={p.workerResults[name]!.details.map(([label,value]) => [label, `${value} / 100`])}/>}</div>)}</div>{eco && <><h4>Eco’s combined sustainability game score: {combined} / 100</h4><Metrics rows={[["Carbon", eco.carbon], ['Durability', eco.durability], ['Maintainability', eco.maintainability], ['Environmental disturbance', eco.environmental]]}/></>}<small>These randomly chosen game points do not measure real-world impact.</small></section>
    <section id="cost-section" className="result-section"><div className="result-title"><h3>Cash’s imaginary budget</h3><span>FICTIONAL GAME ESTIMATE</span></div>{cost ? <Metrics rows={[["Concrete", `${cost.concrete.toLocaleString()} game units`], ['Prestressing', `${cost.prestressing.toLocaleString()} game units`], ['Reinforcement', `${cost.reinforcement.toLocaleString()} game units`], ['Estimated game cost', `$${cost.millions.toFixed(1)} million`], ['Cost game score', `${cost.score} / 100`]]}/> : <p className="pending-output">Cash is waiting for Eco’s scorecard.</p>}<small>These numbers do not represent construction estimates.</small></section>
    <section id="decision-section" className="result-section"><div className="result-title"><h3>Rank’s playful shortlist</h3><span>SIMULATED DECISION SCORE</span></div>{p.alternatives ? <><p>Six unrelated game scores are averaged for a playful ranking. This is not engineering optimization.</p><div className="ranking-table"><table><thead><tr><th>Alternative</th><th>Structure</th><th>Carbon</th><th>Durability</th><th>Maintain</th><th>Environment</th><th>Cost</th><th>Game rank</th></tr></thead><tbody>{p.alternatives.map(a => <tr key={a.name}><th>{a.name}</th><td>{a.structural}</td><td>{a.carbon}</td><td>{a.durability}</td><td>{a.maintainability}</td><td>{a.environmental}</td><td>{a.cost}</td><td><b>{a.score}</b></td></tr>)}</tbody></table></div>{p.winner && <p className="accepted">{p.status === 'COMPLETE' ? '🎉' : '👑 CEO REVIEW:'} {p.winner}</p>}</> : <p className="pending-output">Rank needs the structural, sustainability, and cost game scores first.</p>}</section>
  </div>;
}
export function WorkflowWindow({ tab, simulation, dispatch, selected, onSelect, onClose, onNavigate }: Shared & { tab: string; selected: Person | null; onSelect: (name: Person) => void; onClose: () => void; onNavigate: (tab: string) => void }) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const first = dialog.current?.querySelector<HTMLButtonElement>('button'); first?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], [tabindex="0"]') ?? []);
      const first = items[0], last = items.at(-1);
      if (!dialog.current?.contains(document.activeElement)) { e.preventDefault(); first?.focus(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => { document.removeEventListener('keydown', trap); previousFocus?.focus(); };
  }, []);
  useEffect(() => { if (dialog.current) dialog.current.scrollTop = 0; }, [tab, projectId]);
  const focus = (name: Person) => { onSelect(name); onClose(); };
  const openBoard = () => onNavigate('DESIGN BOARD');
  return <div className="modal-backdrop" onClick={onClose}><section ref={dialog} className="modal workflow-window" role="dialog" aria-modal="true" aria-label={tab} onClick={e => e.stopPropagation()}><button className="close-modal icon-btn" aria-label="Close workflow panel" onClick={onClose}><X size={20}/></button>
    <span className="eyebrow">AGENTIC AI OFFICE · FICTIONAL MANAGEMENT GAME</span><h2>{tab === 'TEAM' ? 'Our very busy little company.' : tab === 'NEEDS YOU' ? 'Your team’s tiny decisions' : tab === 'PROJECTS' ? 'The project notebook' : tab === 'CEO' ? 'Executive headquarters' : 'The design board'}</h2>
    <div className="simulation-notice">Agentic AI Office for Box Girder Bridge Design is a fictional simulation game. It does not perform structural engineering design and must not be used for engineering decisions.</div>
    {tab === 'TEAM' && <TeamView simulation={simulation} onFocus={focus} onTask={name => { onSelect(name); openBoard(); }}/>}
    {tab === 'PROJECTS' && <ProjectsView simulation={simulation} dispatch={dispatch} openId={projectId} setOpenId={setProjectId} onFocus={focus} onBoard={openBoard} renderResults={project => <ProjectResults project={project}/>}/>}
    {tab === 'DESIGN BOARD' && <>{selected && <div className="task-summary"><b>{selected} · {stateIcons[simulation.agents[selected].state]} {simulation.agents[selected].state}</b><p>{simulation.agents[selected].task}</p><progress value={simulation.agents[selected].progress} max={100}/><span>{simulation.agents[selected].progress}% · {simulation.project.id}</span></div>}<DesignBoardView simulation={simulation} onProject={id => { setProjectId(id); onNavigate('PROJECTS'); }}/></>}
    {tab === 'NEEDS YOU' && <NeedsYouView simulation={simulation} dispatch={dispatch}/>}
    {tab === 'CEO' && <CEOView simulation={simulation} dispatch={dispatch}/>}
  </section></div>;
}
