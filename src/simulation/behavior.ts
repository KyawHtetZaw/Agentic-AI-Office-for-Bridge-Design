import { location } from './model.ts';
import type { Agent, AgentState, Person, Place, Point, Pose } from './model.ts';

// Navigable office floor plan. Wall gaps match the doors in WorldExpansion.tsx.
// This only drives character motion and has no engineering meaning.
export const officeObstacles = [
  [-4.86,-2.52,-3.68,-2.42], [-1.91,.41,-3.68,-2.42], [1.14,3.46,-3.68,-2.42],
  [-2.12,1.52,-1,1], [-5.3,-2.65,2.16,3.62], [-5.55,-4.34,-.85,1.02],
  [4.65,5.55,-3.15,-1.65], [-5.8,-5.5,-4.5,4.4], [-5.8,5.8,-4.5,-4.2],
  [6.88,7.12,-4.4,-.8], [6.88,7.12,1.5,4.4], [7,18,-4.5,-4.2],
  [17.9,18.2,-4.5,14.6], [7,10.5,4.3,4.55], [13.5,18,4.3,4.55],
  [7,10.5,6.25,6.5], [13.5,18,6.25,6.5], [7,10.5,14.45,14.7], [13.5,18,14.45,14.7],
  [-5.8,-5.5,6.3,14.65], [-5.8,-3.5,6.25,6.5], [-1.3,.7,6.25,6.5],
  [.65,.95,6.4,8.5], [.65,.95,10.5,14.5], [-5.8,-3.8,14.45,14.7], [-1.5,.8,14.45,14.7],
  [7.1,10.2,-2.9,-1.5], [9.9,11.9,-1.8,-.5], [13.1,15.1,-1.8,-.5],
  [9.9,11.9,1.2,2.6], [13.1,15.1,1.2,2.6],
  [9.1,11.2,7.0,8.3], [14,16.2,7.0,8.3], [11,14,9.3,11],
  [-4.1,-1.3,7,8.4], [-4.9,-2.5,10.8,12.6],
] as const;
export const blocked = ([x,z]: Point) => officeObstacles.some(([x1,x2,z1,z2]) => x>=x1&&x<=x2&&z>=z1&&z<=z2);
const STEP=.4, COLS=97, ROWS=99, MIN_X=-12, MIN_Z=-8;
const nodePoint=(n:number):Point=>[MIN_X+n%COLS*STEP,MIN_Z+Math.floor(n/COLS)*STEP];
function nearest(p:Point){let best=0,distance=Infinity;for(let n=0;n<COLS*ROWS;n++){const q=nodePoint(n);if(blocked(q))continue;const d=(q[0]-p[0])**2+(q[1]-p[1])**2;if(d<distance){distance=d;best=n}}return best}
export function planRoute(start:Point,end:Point):Point[]{
  const from=nearest(start),to=nearest(end),queue=[from],previous=new Int32Array(COLS*ROWS).fill(-2);previous[from]=-1;
  for(let head=0;head<queue.length&&previous[to]===-2;head++){
    const n=queue[head];for(const next of [n-1,n+1,n-COLS,n+COLS]){
      if(next<0||next>=COLS*ROWS||previous[next]!==-2||Math.abs(next%COLS-n%COLS)>1||blocked(nodePoint(next)))continue;
      previous[next]=n;queue.push(next);
    }
  }
  if(previous[to]===-2)return[end];
  const path:Point[]=[];for(let n=to;n!==-1;n=previous[n])path.unshift(nodePoint(n));
  const corners=path.filter((p,i)=>i===0||i===path.length-1||Math.abs((p[0]-path[i-1][0])*(path[i+1][1]-p[1])-(p[1]-path[i-1][1])*(path[i+1][0]-p[0]))>.001);
  return [...corners,end];
}
export function travel(agent:Agent,place:Place,arrivalState:AgentState,pose:Pose='normal',target?:Point){
  agent.destination=place;agent.route=planRoute(agent.position,target??location(agent.name,place));
  agent.state='WALKING';agent.arrivalState=arrivalState;agent.pose=pose;
}
export function move(agent:Agent,dt:number){
  if(agent.state!=='WALKING')return;
  let remaining=dt*1.8;
  while(remaining>0&&agent.route.length){const target=agent.route[0],dx=target[0]-agent.position[0],dz=target[1]-agent.position[1],distance=Math.hypot(dx,dz);
    if(distance>.001)agent.heading=Math.atan2(dx,dz);
    if(distance<=remaining){agent.position=[...target];agent.route.shift();remaining-=distance}
    else{agent.position[0]+=dx/distance*remaining;agent.position[1]+=dz/distance*remaining;remaining=0}
  }
  if(!agent.route.length){agent.state=agent.arrivalState;agent.heading=agent.destination==='coffee'?-Math.PI/2:agent.destination==='sofa'||(agent.destination==='meeting'&&agent.position[1]<10)?0:Math.PI}
}
export const workPlaces:Record<Person,Place>={Atlas:'desk',Beam:'desk',Check:'desk',Eco:'desk',Cash:'desk',Rank:'desk',Carbon:'desk',Durability:'desk',Maintain:'desk',Environment:'desk',Kyaw:'ceoOffice'};
export const workPoses:Record<Person,Pose>={Atlas:'typing',Beam:'typing',Check:'inspect',Eco:'inspect',Cash:'count',Rank:'chart',Carbon:'typing',Durability:'inspect',Maintain:'chart',Environment:'inspect',Kyaw:'game'};
