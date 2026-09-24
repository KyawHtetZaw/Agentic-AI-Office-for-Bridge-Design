import { memo, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { Room } from './simulation/model';

type Vec=[number,number,number];
function B({p=[0,0,0],s=[1,1,1],c='#ffffff',r=0}:{p?:Vec;s?:Vec;c?:string;r?:number}){return <mesh position={p} rotation={[0,r,0]} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.79}/></mesh>}
function C({p=[0,0,0],radius=.2,height=.4,c='#ffffff'}:{p?:Vec;radius?:number;height?:number;c?:string}){return <mesh position={p} castShadow><cylinderGeometry args={[radius,radius*.92,height,8]}/><meshStandardMaterial color={c} roughness={.8}/></mesh>}
function S({p=[0,0,0],size=.2,c='#ffffff'}:{p?:Vec;size?:number;c?:string}){return <mesh position={p} castShadow><sphereGeometry args={[size,10,8]}/><meshStandardMaterial color={c} roughness={.8}/></mesh>}
function Tree({x,z,tall=1}:{x:number;z:number;tall?:number}){return <group position={[x,-.35,z]} scale={tall}><C p={[0,.6,0]} radius={.14} height={1.2} c="#a77a4f"/><mesh position={[0,1.53,0]} castShadow><coneGeometry args={[.85,1.75,7]}/><meshStandardMaterial color="#65bc65"/></mesh><mesh position={[0,1.95,0]} castShadow><coneGeometry args={[.58,1.18,7]}/><meshStandardMaterial color="#8bd16a"/></mesh></group>}
function Shrub({x,z,c='#68ae57'}:{x:number;z:number;c?:string}){return <group position={[x,-.34,z]}><S p={[0,.24,0]} size={.34} c={c}/><S p={[-.22,.16,0]} size={.22} c="#80c668"/><S p={[.2,.2,.07]} size={.24} c={c}/></group>}
function Flower({x,z,c}:{x:number;z:number;c:string}){return <group position={[x,-.38,z]}><B p={[0,.15,0]} s={[.025,.3,.025]} c="#5c9d55"/><S p={[0,.32,0]} size={.085} c={c}/></group>}
function Doorway({p,width=2.2,c='#d8ae86'}:{p:Vec;width?:number;c?:string}){return <group position={p}><B p={[-width/2,1.35,0]} s={[.09,2.7,.2]} c={c}/><B p={[width/2,1.35,0]} s={[.09,2.7,.2]} c={c}/><B p={[0,2.69,0]} s={[width+.16,.12,.2]} c={c}/><B p={[-width/2+.15,1.1,.35]} s={[.07,2.1,.7]} c="#bd926d" r={-.65}/><S p={[-width/2+.28,1.1,.62]} size={.055} c="#f5d77b"/></group>}
function Seat({p,c='#e9946c'}:{p:Vec;c?:string}){return <group position={p}><B p={[0,.48,0]} s={[.7,.14,.64]} c={c}/><B p={[0,.78,.26]} s={[.7,.57,.13]} c={c}/>{[-.25,.25].map(x=><B key={x} p={[x,.22,0]} s={[.08,.43,.08]} c="#8a6b55"/>)}</group>}
function WorkDesk({p,c='#f7c981',wide=1,chart=false}:{p:Vec;c?:string;wide?:number;chart?:boolean}){return <group position={p}><B p={[0,.96,0]} s={[1.65*wide,.15,.9]} c={c}/>{[-.67,.67].map(x=><B key={x} p={[x*wide,.48,0]} s={[.09,.9,.7]} c="#e7b88f"/>)}<B p={[0,1.41,-.25]} s={[.73,.54,.07]} c="#324b5a"/><B p={[0,1.41,-.205]} s={[.65,.46,.01]} c={chart?'#fee5bc':'#9bdfcf'}/>{[0,1,2].map(i=><B key={i} p={[-.18+i*.18,1.32+i*.048,-.194]} s={[.07,.11+i*.08,.008]} c={chart?['#fa947f','#7988ba','#68b799'][i]:'#6cb198'}/>)}<B p={[0,1.1,.17]} s={[.43,.025,.17]} c="#f8f1df"/><Seat p={[0,0,.77]} c={chart?'#8492d4':'#8ac49d'}/></group>}
function Model(){return <group><B p={[0,.84,0]} s={[2,.13,1]} c="#e6b87c"/><B p={[0,1.1,0]} s={[1.6,.13,.35]} c="#74b9a6"/>{[-.54,.54].map(x=><B key={x} p={[x,1.01,0]} s={[.1,.28,.15]} c="#eceddb"/>)}<B p={[0,1.18,0]} s={[1.7,.035,.47]} c="#f0e6bd"/></group>}
function RoomSign({name,p,onClick}:{name:string;p:Vec;onClick:()=>void}){return <Html position={p} center distanceFactor={12} zIndexRange={[10,5]}><button className="room-sign" onClick={onClick}>{name} <span>↗</span></button></Html>}
function Car({p,c='#f8a86b',fancy=false}:{p:Vec;c?:string;fancy?:boolean}){return <group position={p}><B p={[0,.16,0]} s={[1.15,.38,2.05]} c={c}/><B p={[0,.47,-.17]} s={[1,.38,1.05]} c={fancy?'#f5d8ac':'#d5e4eb'}/><B p={[0,.5,.395]} s={[.84,.21,.015]} c="#79a2ac"/><B p={[0,.5,-.735]} s={[.84,.2,.015]} c="#79a2ac"/>{[-.57,.57].flatMap(x=>[-.62,.68].map(z=><group key={`${x}-${z}`}><C p={[x,-.05,z]} radius={.18} height={.11} c="#414b4e"/><C p={[x,-.05,z]} radius={.085} height={.12} c="#e5dbc5"/></group>))}<B p={[0,.12,1.04]} s={[.56,.09,.04]} c={fancy?'#f6df9b':'#f2e9cf'}/>{fancy&&<S p={[0,.76,-.24]} size={.1} c="#ffd668"/>}</group>}
function Animal({kind,p}:{kind:'cat'|'dog';p:Vec}){const coat=kind==='cat'?'#e9b46c':'#d6a479';return <group position={p}><S p={[0,.16,0]} size={kind==='cat'?.17:.23} c={coat}/><S p={[0,.3,.16]} size={kind==='cat'?.14:.18} c={coat}/>{[-.1,.1].map(x=><group key={x}><mesh position={[x,.42,.2]} rotation={[0,0,x>0?-.2:.2]}><coneGeometry args={[.07,.15,5]}/><meshStandardMaterial color={coat}/></mesh><S p={[x*.6,.33,.282]} size={.022} c="#354044"/></group>)}<S p={[0,.27,.304]} size={.025} c="#b86b73"/><B p={[.1,.18,-.23]} s={[.05,.05,.28]} c={coat} r={-.6}/></group>}
function Wildlife(){const bird=useRef<Group>(null),butterfly=useRef<Group>(null),dog=useRef<Group>(null);useFrame(({clock})=>{const t=clock.elapsedTime;if(bird.current){bird.current.position.set(-3+Math.sin(t*.32)*2,3.2+Math.sin(t*2)*.12,21+Math.cos(t*.32)*2);bird.current.rotation.y=t*.32}if(butterfly.current){butterfly.current.position.set(-4+Math.sin(t*.7)*1.2,.6+Math.sin(t*4)*.12,24+Math.cos(t*.7));butterfly.current.rotation.y=t*.7}if(dog.current){dog.current.position.set(16+Math.sin(t*.28)*1.9,-.23,24+Math.cos(t*.28)*.6);dog.current.rotation.y=-t*.28}});return <><group ref={bird}><S size={.13} c="#fff8df"/><B p={[-.17,.03,0]} s={[.27,.035,.13]} c="#fff8df" r={.35}/><B p={[.17,.03,0]} s={[.27,.035,.13]} c="#fff8df" r={-.35}/><mesh position={[0,0,.15]}><coneGeometry args={[.05,.12,5]}/><meshStandardMaterial color="#f3a55b"/></mesh></group><group ref={butterfly}><S size={.04} c="#4a6770"/>{[-.1,.1].map(x=><S key={x} p={[x,0,0]} size={.1} c={x<0?'#ff9dbe':'#ffcf76'}/>)}</group><group ref={dog}><Animal kind="dog" p={[0,0,0]}/></group></>}
function WorldExpansion({onRoom}:{onRoom:(room:Room)=>void}){
 const flowers=useMemo(()=>Array.from({length:24},(_,i)=>({x:-9.3+(i%8)*.9,z:21+Math.floor(i/8)*.85,c:['#ff8fa8','#ffd368','#a4a0f2','#fff2d0'][i%4]})),[]);
 return <group>
  <B p={[6,-.73,10]} s={[42,.36,42]} c="#87c86b"/><B p={[6,-.535,27]} s={[42,.04,4.2]} c="#6a7378"/><B p={[6,-.51,24.6]} s={[42,.07,1.1]} c="#d8d8c5"/>
  {Array.from({length:12},(_,i)=><B key={i} p={[-12+i*3.5,-.503,27]} s={[1.45,.012,.08]} c="#f5eccc"/>)}
  <B p={[11,-.32,19.8]} s={[26,.28,7.9]} c="#dad8c9"/><B p={[3.4,-.225,18.7]} s={[2.3,.08,4.7]} c="#f8d5ae"/><B p={[-3.3,-.24,21.8]} s={[2.8,.06,4.7]} c="#f0d9ac"/><B p={[3,-.24,22.4]} s={[11,.06,1.3]} c="#e8d7b5"/>
  <B p={[-6.6,-.35,21.7]} s={[8.6,.14,5]} c="#6eb96b"/>{flowers.map((f,i)=><Flower key={i} {...f}/>)}
  {[[ -9.1,20.1,.31],[-8.5,22.6,.2],[-7.2,19.9,.25],[-6.6,24,.34],[-5.7,22.5,.19],[-4.7,20.4,.27]].map(([x,z,size],i)=><mesh key={i} position={[x,-.27,z]} rotation={[.2,i*.7,.1]} castShadow><dodecahedronGeometry args={[size,0]}/><meshStandardMaterial color={i%2?'#b7ab93':'#d5c6a6'} roughness={.9}/></mesh>)}
  {[[-10,-5],[-10,3],[-10,13],[-10,25],[-6,26],[23,-5],[23,3],[23,13],[24,25]].map(([x,z],i)=><Tree key={i} x={x} z={z} tall={i%3===0?1.3:.9}/>)}
  {[-8.1,-6.5,-4.9,4.5,6.1,8.1,19.2,21.9].map((x,i)=><Shrub key={i} x={x} z={i%2?17:16.4} c={i%2?'#72ba68':'#58a95e'}/>)}
  <Animal kind="cat" p={[2.6,-.24,19.3]}/><Wildlife/>
  <group position={[-4.9,-.32,21.7]}><B p={[0,.4,0]} s={[1.3,.1,.45]} c="#f0b681"/>{[-.5,.5].map(x=><B key={x} p={[x,.18,0]} s={[.08,.42,.4]} c="#694f48"/>)}<B p={[0,.69,-.17]} s={[1.3,.5,.08]} c="#d89a79"/></group>
  {[-7.7,22.5].map((x,i)=><group key={i}><C p={[x,1.2,25]} radius={.06} height={2.5} c="#5d6960"/><S p={[x,2.45,25]} size={.24} c="#fff1af"/><C p={[x,.01,25]} radius={.28} height={.1} c="#767f6d"/></group>)}
  <group position={[15.1,0,20.45]}><B p={[0,-.35,0]} s={[16,.05,6.7]} c="#909a97"/>{[-5.8,-3.15,-.5,2.15,4.8,7.45].map((x,i)=><B key={i} p={[x,-.31,0]} s={[.055,.012,4.9]} c="#f7f1d6"/>)}<B p={[-7.1,-.31,0]} s={[.055,.012,4.9]} c="#f7f1d6"/><B p={[0,-.31,-2.48]} s={[15,.012,.07]} c="#f7f1d6"/><Car p={[-4.5,-.15,0]} c="#8ccfc7"/><Car p={[-1.85,-.15,0]} c="#e99a76"/><Car p={[.8,-.15,0]} c="#c4abd5"/><Car p={[5.95,-.15,0]} c="#f8bd5e" fancy/><Html position={[5.95,.02,-2.4]} center distanceFactor={11}><div className="parking-sign">CEO PARKING 😂</div></Html></group>
  <B p={[6.45,-.22,0]} s={[1.55,.22,8.85]} c="#f0cea5"/><B p={[6.1,-.22,5.25]} s={[24,.22,1.9]} c="#efd6b3"/>
  <Doorway p={[7,0,.35]}/><Doorway p={[12.5,0,6.35]} width={2.7} c="#c69c91"/><Doorway p={[-2.45,0,6.35]} width={2.4} c="#d8a887"/><Doorway p={[3.4,0,6.35]} width={2.25} c="#ddb48d"/><Doorway p={[3.4,0,18.2]} width={2.1} c="#d9ad80"/>
  <group onClick={e=>{e.stopPropagation();onRoom('Sustainability')}}>
    <B p={[12.5,-.28,0]} s={[11,.5,8.85]} c="#f7e5bb"/><B p={[12.5,.002,0]} s={[10.8,.055,8.6]} c="#f9ebcd"/>
    <B p={[12.5,1.5,-4.34]} s={[11,3.4,.18]} c="#f4d49c"/><B p={[18,1.5,0]} s={[.18,3.4,8.9]} c="#e2b788"/>
    <B p={[9,1.5,4.39]} s={[4,3.4,.16]} c="#f0d7a5"/><B p={[16,1.5,4.39]} s={[4,3.4,.16]} c="#f0d7a5"/>
    <B p={[7,1.5,-2.6]} s={[.16,3.4,3.5]} c="#f5d49c"/><B p={[7,1.5,3]} s={[.16,3.4,2.8]} c="#f5d49c"/>
    <B p={[12.5,2.2,-4.21]} s={[3.9,1.35,.06]} c="#c9e9dd"/><B p={[12.5,2.2,-4.16]} s={[.04,1.4,.07]} c="#f4efdf"/>
    <B p={[12.5,3.25,-4.35]} s={[11,.12,.3]} c="#fbe6b6"/>
    <RoomSign name="SUSTAINABILITY" p={[12.5,3.4,0]} onClick={()=>onRoom('Sustainability')}/>
    <WorkDesk p={[8.65,0,-2.75]} wide={1.3} c="#e7ab71"/>
    {[[10.9,-1.5],[14.1,-1.5],[10.9,1.5],[14.1,1.5]].map(([x,z],i)=><WorkDesk key={i} p={[x,0,z]} c={['#ffc98c','#efb79e','#e2c588','#a6d9b0'][i]}/>)}
    <B p={[16.55,.55,2.8]} s={[.9,1.1,1.1]} c="#dfae81"/>{[2.46,2.9,3.34].map((z,i)=><B key={z} p={[16.9,1.2,z]} s={[.35,.15,.32]} c={i%2?'#e3d188':'#8bcc9e'}/>)}
    <B p={[17.84,2.1,1.45]} s={[.045,1.35,2.1]} c="#f7eed5"/>{[-.45,.05,.5].map((z,i)=><B key={i} p={[17.8,2.2+i*.08,1.45+z]} s={[.02,.25,.42]} c={['#8bc9ac','#f5d391','#a9b4df'][i]}/>)}
    <C p={[17.05,.21,-2.8]} radius={.28} height={.4} c="#d9a56f"/><S p={[17.05,.64,-2.8]} size={.4} c="#8bd269"/>
    <group position={[16.5,0,-.9]}><Model/></group>
  </group>
  <group onClick={e=>{e.stopPropagation();onRoom('Cost & Decision')}}>
    <B p={[12.5,-.28,10.5]} s={[11,.5,8.2]} c="#f3d9bc"/><B p={[12.5,.005,10.5]} s={[10.8,.05,8]} c="#f8e8d5"/>
    <B p={[8.7,1.5,6.35]} s={[3.4,3.4,.17]} c="#efc7a1"/><B p={[16.3,1.5,6.35]} s={[3.4,3.4,.17]} c="#efc7a1"/><B p={[18,1.5,10.5]} s={[.18,3.4,8.2]} c="#e6bd9d"/>
    <B p={[8.7,1.5,14.55]} s={[3.4,3.4,.17]} c="#efc7a1"/><B p={[16.3,1.5,14.55]} s={[3.4,3.4,.17]} c="#efc7a1"/>
    <B p={[16,2.2,6.5]} s={[2.4,1.25,.04]} c="#d1e2ee"/><B p={[12.5,3.25,6.35]} s={[11,.12,.3]} c="#fce1c1"/>
    <RoomSign name="COST & DECISION" p={[12.5,3.4,10.5]} onClick={()=>onRoom('Cost & Decision')}/>
    <WorkDesk p={[10,0,7.3]} c="#f2b875" chart/><WorkDesk p={[15,0,7.3]} c="#b9b1e5" chart/>
    <B p={[12.5,.88,10.4]} s={[2.4,.13,1.12]} c="#ebbd88"/><Seat p={[11.65,0,11.3]} c="#91b8cf"/><Seat p={[13.35,0,11.3]} c="#b19bc8"/>
    <B p={[17.1,1.2,12]} s={[.9,2.3,1.65]} c="#f1c894"/><B p={[17.1,1.96,12]} s={[1,.06,1.8]} c="#f5e3c7"/>
    <B p={[9.1,2.35,6.52]} s={[2.8,1.3,.06]} c="#6a6f98"/>{[0,1,2,3].map(i=><B key={i} p={[8.3+i*.5,2.1+i*.14,6.57]} s={[.19,.2+i*.2,.018]} c={['#f7c66d','#a5c8c8','#f2a582','#d4bdd9'][i]}/>)}
  </group>
  <group onClick={e=>{e.stopPropagation();onRoom('CEO Office')}}>
    <B p={[-2.45,-.28,10.5]} s={[6.7,.5,8.2]} c="#f5d6bf"/><B p={[-2.45,.005,10.5]} s={[6.5,.05,8]} c="#f5e4cc"/>
    <B p={[-5.7,1.5,10.5]} s={[.18,3.4,8.2]} c="#eac3a7"/>
    <B p={[-4.65,1.5,6.35]} s={[2.1,3.4,.17]} c="#f4d6b8"/><B p={[-.2,1.5,6.35]} s={[1.4,3.4,.17]} c="#f4d6b8"/>
    <B p={[-4.75,1.5,14.55]} s={[1.9,3.4,.17]} c="#f4d6b8"/><B p={[-.3,1.5,14.55]} s={[1.6,3.4,.17]} c="#f4d6b8"/>
    <B p={[.8,1.5,7.45]} s={[.17,3.4,2.2]} c="#f0c8aa"/><B p={[.8,1.5,12.55]} s={[.17,3.4,4]} c="#f0c8aa"/>
    <B p={[-5.57,2.25,10.2]} s={[.04,1.28,2.5]} c="#bee3df"/><B p={[-2.45,3.25,6.35]} s={[6.7,.12,.3]} c="#ffe1bd"/>
    <RoomSign name="CEO OFFICE" p={[-2.45,3.4,10.5]} onClick={()=>onRoom('CEO Office')}/>
    <WorkDesk p={[-2.8,0,7.75]} wide={1.25} c="#e3a76f" chart/><B p={[-4.1,.53,11.65]} s={[2.4,.63,.97]} c="#e0a48a"/><B p={[-4.1,1.02,11.21]} s={[2.4,.9,.21]} c="#efb5a0"/>
    <B p={[-4.35,.85,12.6]} s={[.95,.12,.62]} c="#f5cc94"/><B p={[-4.35,1.05,12.35]} s={[.6,.38,.045]} c="#485789"/><B p={[-4.35,1.06,12.32]} s={[.5,.29,.015]} c="#ffa6c0"/>
    <B p={[-.15,1.15,11.5]} s={[.48,2.3,1.35]} c="#cba37b"/>{[.35,.95,1.55].map(y=><B key={y} p={[-.15,y,11.5]} s={[.52,.07,1.35]} c="#efd1a2"/>)}
    <group position={[-1.05,0,12.9]} scale={.62}><Model/></group>
  </group>
  <group onClick={e=>{e.stopPropagation();onRoom('Meeting Room')}}>
    <B p={[3.4,-.28,10.5]} s={[4.85,.5,8.2]} c="#f4e0ba"/><B p={[3.4,.005,10.5]} s={[4.7,.05,8]} c="#fff0d8"/>
    <B p={[3.4,.87,10]} s={[2.8,.16,1.5]} c="#e7b481"/>{[2.15,3.4,4.65].map(x=><Seat key={x} p={[x,0,11.17]} c="#8ebec8"/>)}
    <B p={[5.75,1.5,10.5]} s={[.16,3.4,8.2]} c="#f4d9b2"/>
    <RoomSign name="MEETING" p={[3.4,3.4,10.5]} onClick={()=>onRoom('Meeting Room')}/>
  </group>
  <B p={[3.4,-.28,16.5]} s={[4.9,.5,3.7]} c="#ead3b4"/><B p={[3.4,1.03,16.2]} s={[2.1,1.2,.48]} c="#daaa82"/><B p={[3.4,1.68,16.2]} s={[2.35,.11,.62]} c="#f7e8c7"/>
  <B p={[3.4,.25,18.2]} s={[2.15,.5,.15]} c="#d09671"/><B p={[3.4,2.7,18.25]} s={[2.45,.25,.25]} c="#f7d4aa"/>
  <group><B p={[-2.8,-.27,17.55]} s={[5.9,.47,3.5]} c="#e8d7b8"/>
    <B p={[-5.7,1.2,17.55]} s={[.16,2.6,3.5]} c="#f3ddc5"/><B p={[.15,1.2,17.55]} s={[.16,2.6,3.5]} c="#f3ddc5"/>
    <B p={[-2.7,1.2,17.8]} s={[.14,2.6,2.8]} c="#f3ddc5"/>
    {[-4.1,-1.2].map((x,i)=><group key={x}><B p={[x,2.2,16.12]} s={[1.45,.37,.08]} c={i?'#f4b7b8':'#96bcd7'}/><Html position={[x,2.3,16.03]} center distanceFactor={9}><span className="toilet-sign">{i?'WOMEN':'MEN'} 🚻</span></Html><C p={[x,.27,18.3]} radius={.2} height={.27} c="#f6f7ec"/><B p={[x,.55,18.48]} s={[.52,.28,.12]} c="#f6f7ec"/></group>)}
  </group>
  <group><B p={[15.8,.84,12.4]} s={[1.4,.15,.6]} c="#d99c6f"/><B p={[16.2,1.5,12.4]} s={[.38,.7,.38]} c="#4b675a"/><C p={[16.2,1.95,12.4]} radius={.12} height={.08} c="#f0bc6f"/><B p={[16.2,.94,12.55]} s={[.35,.08,.24]} c="#f5eee0"/></group>
 </group>
}
export default memo(WorldExpansion);
