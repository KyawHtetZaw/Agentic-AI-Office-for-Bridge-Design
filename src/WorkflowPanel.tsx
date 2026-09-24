import { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import { ArrowUpRight, Coffee, Focus, Plus, X } from 'lucide-react';
import { people, workers, everyone, profiles, stateIcons } from './simulation/model';
import type { Action, Agent, Person, Project, Simulation, CeoCommand } from './simulation/model';

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
export function CEOPanel({agent,dispatch,onFocus}:{agent:Agent;dispatch:Dispatch<Action>;onFocus:()=>void}){
 return <section className="detail-card ceo-panel"><div className="section-top"><span className="eyebrow">KYAW Htet Zaw · CEO 👑</span><span className="state-pill">{agent.pose==='sleep'?'😴 CEO MODE':`${stateIcons[agent.state]} ${agent.state}`}</span></div>
  <h3>Chief Executive Officer</h3><dl className="agent-facts"><dt>Current activity</dt><dd>{agent.task}</dd><dt>Productivity</dt><dd>12% 😂</dd></dl><blockquote>“{agent.thought}”</blockquote>
  <div className="action-grid ceo-actions">{ceoControls.map(([command,label])=><button key={command} onClick={()=>dispatch({type:'ceo',command})}>{label}</button>)}<button onClick={onFocus}><Focus size={14}/> FOCUS CAMERA</button></div>
  <p>CEO productivity is a running joke in this fictional office.</p></section>
}
export function WorkflowCard({ simulation, dispatch, onOpen, onModel }: Shared & { onOpen: () => void; onModel: () => void }) {
  const p = simulation.project;
  return <section className="project-card workflow-card"><div className="section-top"><span className="eyebrow">LIVE FICTIONAL WORKFLOW</span><span className="concept-badge">{p.id}</span></div><h3>{p.title}</h3>
    <div className="pipeline" aria-label="Project workflow">{people.map(name => <span key={name} className={p.stage === name && p.status !== 'COMPLETE' ? 'current' : simulation.agents[name].progress === 100 ? 'done' : ''} title={profiles[name].role}>{name}</span>)}</div>
    {p.stage==='Eco'&&p.status==='ACTIVE'&&<div className="pipeline specialist-pipeline">{workers.map(name=><span key={name} className={simulation.agents[name].progress===100?'done':simulation.agents[name].state==='WORKING'?'current':''}>{name} {Math.round(simulation.agents[name].progress)}%</span>)}</div>}
    <p className="workflow-status">{p.status === 'COMPLETE' ? '✅ Project complete · ' + p.winner : p.status === 'NEEDS YOU' ? '🔴 Rank needs your favorite alternative' : p.phase === 'handoff' ? `${p.sender} → ${p.stage} · delivering the concept` : p.phase==='department'?'Eco’s four specialists are working in parallel':p.phase==='reports'?'Four specialists are walking their reports to Eco':`${p.stage} · ${simulation.agents[p.stage].task}`}</p>
    <p className="fictional-tag">SIMULATED GAME DATA · REVISION {p.revision}</p>
    <div className="workflow-buttons"><button className="primary-btn" onClick={onOpen}>{p.status === 'NEEDS YOU' ? 'CHOOSE A FAVORITE' : 'VIEW PROJECT'}<ArrowUpRight size={14}/></button><button className="icon-btn" aria-label="Focus on bridge model" onClick={onModel}><Focus size={17}/></button></div>
    {p.status === 'COMPLETE' && <button className="new-project-btn" onClick={() => dispatch({ type: 'new' })}><Plus size={14}/> NEW FICTIONAL PROJECT</button>}
  </section>;
}
function Metrics({ rows }: { rows: [string, string | number][] }) {
  return <dl className="metric-grid">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
function ProjectResults({ project: p, onChoose }: { project: Project; onChoose?: (name: string) => void }) {
  const review = p.reviews.at(-1), eco = p.sustainability, cost = p.cost;
  return <div className="results">
    <section className="result-section"><div className="result-title"><h3>Project brief · {p.id}</h3><span>FICTIONAL PROJECT VALUES</span></div><p>{p.type} · {p.alignment} alignment</p><Metrics rows={[["Spans", p.spans], ['Example span', `${p.span} m`], ['Deck width', `${p.width} m`], ['Pier height', `${p.pier} m`]]}/></section>
    <section className="result-section"><div className="result-title"><h3>Beam’s preliminary geometry</h3><span>SIMULATED GAME DATA</span></div>{p.geometry ? <Metrics rows={[["Box depth", `${p.geometry.depth.toFixed(1)} m`], ['Deck width', `${p.geometry.width} m`], ['Number of cells', p.geometry.cells], ['Pier height', `${p.geometry.pier} m`], ['Web thickness', `${p.geometry.web.toFixed(2)} m`]]}/> : <p className="pending-output">Beam hasn’t delivered a concept yet.</p>}<small>Chosen from predefined game ranges. No engineering formulas.</small></section>
    <section className="result-section"><div className="result-title"><h3>Check’s pretend review</h3><span>GAME CHECKS ONLY</span></div>{review ? <><Metrics rows={[["Geometry compatibility", review.geometry === 'PASS' ? '✅ PASS' : '⚠ REVIEW'], ['Serviceability simulation', review.serviceability === 'PASS' ? '✅ PASS' : '⚠ REVIEW'], ['Structural score', `${review.score} / 100`], ['Prestressing simulation', review.prestressing === 'PASS' ? '✅ PASS' : '⚠ REVIEW']]}/><p className={review.accepted ? 'accepted' : 'revision-note'}>{review.accepted ? 'Accepted for the fictional workflow. REVIEW badges are playful observations.' : 'Bridge concept requires revision. Beam is trying again.'}</p><div className="review-history">{p.reviews.map(r => <span key={r.revision}>Revision {r.revision}: {r.accepted ? 'accepted' : 'returned to Beam'}</span>)}</div></> : <p className="pending-output">Waiting for Beam’s concept.</p>}<small>No structural verification or engineering-code compliance is performed.</small></section>
    <section className="result-section sustainability-results"><div className="result-title"><h3>Eco’s sustainability department</h3><span>SIMULATED SUSTAINABILITY SCORES</span></div><p>Carbon, Durability, Maintain, and Environment work in parallel. Their independent pretend scores are delivered to Eco.</p><div className="worker-results">{workers.map(name=><div key={name} className="worker-result"><b>{profiles[name].avatar} {name}</b><span>{p.workerResults[name]?`${p.workerResults[name]!.score} / 100`:'Awaiting game score'}</span>{p.workerResults[name]&&<Metrics rows={p.workerResults[name]!.details.map(([label,value])=>[label,`${value} / 100`])}/>}</div>)}</div>{eco&&<><h4>Eco’s combined game result</h4><Metrics rows={[["Embodied carbon score", `${eco.carbon} / 100`], ['Durability score', `${eco.durability} / 100`], ['Maintainability score', `${eco.maintainability} / 100`], ['Environmental score', `${eco.environmental} / 100`]]}/></>}<small>All figures are randomly chosen game points, unrelated to real impact or durability.</small></section>
    <section className="result-section"><div className="result-title"><h3>Cash’s imaginary budget</h3><span>FICTIONAL GAME COST</span></div>{cost ? <Metrics rows={[["Concrete", `${cost.concrete.toLocaleString()} game units`], ['Prestressing', `${cost.prestressing.toLocaleString()} game units`], ['Reinforcement', `${cost.reinforcement.toLocaleString()} game units`], ['Estimated game cost', `$${cost.millions.toFixed(1)}M`], ['Cost score', `${cost.score} / 100`]]}/> : <p className="pending-output">Cash is waiting for Eco’s scorecard.</p>}<small>These numbers do not represent real construction estimates.</small></section>
    <section className="result-section"><div className="result-title"><h3>Rank’s playful shortlist</h3><span>ARCADE SCORES · NOT OPTIMIZATION</span></div>{p.alternatives ? <><p>Combined game score = average of the three game scores. B and C use small random variations on A’s scores. Higher is better only in this game.</p><div className="ranking-table"><table><thead><tr><th>Alternative</th><th>Structure</th><th>Eco</th><th>Cost</th><th>Combined</th><th>Favorite</th></tr></thead><tbody>{p.alternatives.map(a => <tr key={a.name}><th>{a.name}</th><td>{a.structural}</td><td>{a.sustainability}</td><td>{a.cost}</td><td><b>{a.score}</b></td><td>{onChoose && p.status === 'NEEDS YOU' ? <button onClick={() => onChoose(a.name)} aria-label={`Choose ${a.name}`}>Choose</button> : p.winner === a.name ? '🏆 Winner' : '—'}</td></tr>)}</tbody></table></div>{p.winner && <p className="accepted">🎉 {p.winner} wins the imaginary gold star. Project complete!</p>}</> : <p className="pending-output">Rank needs the structural, sustainability, and cost scores first.</p>}</section>
  </div>;
}
export function WorkflowWindow({ tab, simulation, dispatch, selected, onSelect, onClose }: Shared & { tab: string; selected: Person | null; onSelect: (name: Person) => void; onClose: () => void }) {
  const [projectId, setProjectId] = useState(simulation.project.id);
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
  const p = simulation.project, project = [p, ...simulation.history].find(item => item.id === projectId) ?? p;
  const choose = (alternative: string) => dispatch({ type: 'choose', alternative });
  return <div className="modal-backdrop" onClick={onClose}><section ref={dialog} className="modal workflow-window" role="dialog" aria-modal="true" aria-label={tab} onClick={e => e.stopPropagation()}><button className="close-modal icon-btn" aria-label="Close workflow panel" onClick={onClose}><X size={20}/></button>
    <span className="eyebrow">AGENTIC AI OFFICE · FICTIONAL WORKFLOW</span><h2>{tab === 'TEAM' ? 'Our very busy little company.' : tab === 'NEEDS YOU' ? 'Your team’s tiny decisions' : tab === 'PROJECTS' ? 'The project notebook' : 'The design board'}</h2>
    <div className="simulation-notice">SIMULATED GAME DATA — all dimensions, checks, costs, and scores are fictional. Never use them for engineering.</div>
    {tab === 'TEAM' ? <div className="team-directory">{everyone.map(name => { const a = simulation.agents[name]; return <button key={name} onClick={() => { onSelect(name); onClose(); }}><span className={'avatar avatar-'+name.toLowerCase()}><span>{profiles[name].avatar}</span></span><h3>{name==='Kyaw'?'KYAW Htet Zaw':name}</h3><p>{profiles[name].role}</p><span>{name==='Kyaw'?'👑':stateIcons[a.state]} {a.state} · {name==='Kyaw'?'12':Math.round(a.progress)}%</span><p>“{a.thought}”</p></button>; })}</div> : tab === 'NEEDS YOU' ? p.status === 'NEEDS YOU' ? <><p>Rank has compared three imaginary alternatives. Choose your favorite to finish {p.id} and celebrate with the team.</p><ProjectResults project={p} onChoose={choose}/></> : <div className="all-clear"><span>{p.status === 'COMPLETE' ? '🎉' : '☕'}</span><h3>{p.status === 'COMPLETE' ? `${p.id} is complete!` : 'All good in the neighborhood.'}</h3><p>{p.status === 'COMPLETE' ? 'The team is celebrating your favorite. Ready for another fictional project?' : 'The team will call you when Rank has a shortlist. Watch the little handoffs in the office.'}</p>{p.status === 'COMPLETE' && <button className="primary-btn" onClick={() => dispatch({ type: 'new' })}>New fictional project <Plus size={16}/></button>}</div> : <>
      {tab === 'PROJECTS' && <div className="project-picker">{[p, ...simulation.history].map(item => <button className={project.id === item.id ? 'active' : ''} key={item.id} onClick={() => setProjectId(item.id)}>{item.id} · {item.status.toLowerCase()}</button>)}<button disabled={p.status !== 'COMPLETE'} onClick={() => { dispatch({ type: 'new' }); setProjectId(''); }}><Plus size={13}/> New project</button></div>}
      {tab === 'DESIGN BOARD' && selected && <div className="task-summary"><b>{selected} · {stateIcons[simulation.agents[selected].state]} {simulation.agents[selected].state}</b><p>{simulation.agents[selected].task}</p><progress value={simulation.agents[selected].progress} max={100}/><span>{simulation.agents[selected].progress}% · {p.id}</span></div>}
      <ProjectResults project={tab === 'DESIGN BOARD' ? p : project} onChoose={choose}/>
    </>}
  </section></div>;
}
