import {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Search, ArrowUpRight, Cpu, FlaskConical, GraduationCap, Shield, BookOpen, Orbit} from 'lucide-react';
import './styles.css';

export const projects=[
 {title:'CareTaxi',cat:'Product',progress:86,icon:Shield,summary:'Family transportation coordination, dispatch, recurring trips, driver/parent/admin views.'},
 {title:'Unit Circle Clock Lab',cat:'Math',progress:84,icon:Orbit,summary:'Animated unit-circle clocks that connect angle, time, triangles and trig waves.'},
 {title:'Math Pattern Lab',cat:'Math',progress:82,icon:GraduationCap,summary:'Visual and interactive pattern models designed for mathematical intuition.'},
 {title:'Memory Palace',cat:'Learning',progress:80,icon:BookOpen,summary:'Spatial learning environment for storing concepts in an explorable memory palace.'},
 {title:'PROTECT Robotics',cat:'Robotics',progress:79,icon:Cpu,summary:'Robotics simulation for inspection, navigation, forensics support and remote operation.'},
 {title:'Chemistry Interactive Labs',cat:'Science',progress:83,icon:FlaskConical,summary:'High-school chemistry curriculum with animated models, labs, quizzes and progress tracking.'}
];

export function App(){
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState('All');
 const cats=['All',...new Set(projects.map(p=>p.cat))];
 const shown=useMemo(()=>projects.filter(p=>(filter==='All'||p.cat===filter)&&(`${p.title} ${p.summary}`.toLowerCase().includes(query.toLowerCase()))),[query,filter]);
 return <main className="shell">
  <header className="hero">
   <div className="eyebrow">Interactive Portfolio System</div>
   <h1>Projects as working instruments, not static case studies.</h1>
   <p>A portable GitHub-first portfolio for interactive education, science, robotics and product systems.</p>
  </header>

  <section className="console" aria-label="Portfolio projects">
   <div className="controls">
    <label className="search"><Search size={18} aria-hidden="true"/><span className="sr-only">Search projects</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search projects" aria-label="Search projects"/></label>
    <div className="chips" role="group" aria-label="Filter projects by category">{cats.map(c=><button key={c} className={filter===c?'active':''} aria-pressed={filter===c} onClick={()=>setFilter(c)}>{c}</button>)}</div>
   </div>
   <div className="grid">{shown.map(p=>{const Icon=p.icon;return <article className="card" key={p.title} tabIndex="0" aria-label={`${p.title}, ${p.progress}% ready`}>
    <div className="cardTop"><span className="icon"><Icon size={20} aria-hidden="true"/></span><span className="progress">{p.progress}%</span></div>
    <div><div className="category">{p.cat}</div><h2>{p.title}</h2><p>{p.summary}</p></div>
    <div className="meter" role="progressbar" aria-label={`${p.title} readiness`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={p.progress}><span style={{width:`${p.progress}%`}}/></div>
    <button className="open" type="button">Open case study <ArrowUpRight size={17} aria-hidden="true"/></button>
   </article>})}</div>
  </section>
 </main>
}

const root=document.getElementById('root');
if(root) createRoot(root).render(<App/>);
