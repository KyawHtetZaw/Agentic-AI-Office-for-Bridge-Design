import type { Person, Project, Simulation } from './model.ts';

export const boardColumns = ['NEW PROJECT', 'STRUCTURAL DESIGN', 'VERIFICATION', 'SUSTAINABILITY', 'COST', 'DECISION', 'CEO REVIEW', 'NEEDS YOU', 'COMPLETED'] as const;
export type BoardColumn = typeof boardColumns[number];

export function assignedAgent(project: Project): Person {
  if (project.issue === 'ceoApproval') return 'Kyaw';
  if (project.stage === 'Eco' && project.phase === 'department') {
    return (['Carbon', 'Durability', 'Maintain', 'Environment'] as const).find(name => !project.workerResults[name]) ?? 'Eco';
  }
  return project.stage;
}

export function projectColumn(project: Project): BoardColumn {
  if (project.status === 'COMPLETE') return 'COMPLETED';
  if (project.issue === 'ceoApproval') return 'CEO REVIEW';
  if (project.status === 'NEEDS YOU') return 'NEEDS YOU';
  if (project.stage === 'Atlas') return 'NEW PROJECT';
  return ({ Beam: 'STRUCTURAL DESIGN', Check: 'VERIFICATION', Eco: 'SUSTAINABILITY', Cash: 'COST', Rank: 'DECISION' } as const)[project.stage];
}

export function projectProgress(project: Project, simulation: Simulation): number {
  if (project.status === 'COMPLETE') return 100;
  const floor = { Atlas: 4, Beam: 17, Check: 33, Eco: 48, Cash: 73, Rank: 84 }[project.stage];
  if (project.issue === 'ceoApproval') return 96;
  if (project.issue === 'rankChoice') return 92;
  if (project.issue === 'ecoTradeoff') return 70;
  if (project.issue === 'checkRevision') return 39;
  const task = project.phase === 'department' ? (['Carbon', 'Durability', 'Maintain', 'Environment'] as const)
    .reduce((sum, name) => sum + simulation.agents[name].progress, 0) / 4 : simulation.agents[project.stage].progress;
  return Math.min(98, Math.round(floor + task * (project.stage === 'Eco' ? .2 : .1)));
}

export function currentDepartment(project: Project): string {
  if (project.status === 'COMPLETE') return 'Completed';
  if (project.issue === 'ceoApproval') return 'CEO Review';
  if (project.issue === 'checkRevision') return 'Verification · needs you';
  if (project.issue === 'ecoTradeoff') return 'Sustainability · needs you';
  if (project.issue === 'rankChoice') return 'Decision · needs you';
  return projectColumn(project).toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
}
