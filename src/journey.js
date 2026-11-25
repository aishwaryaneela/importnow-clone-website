import { voyageAt, STEP_THRESHOLDS } from './voyage-timeline.js';

/** Scroll controls are independent of WebGL so the six-step journey always works. */
export function mountJourney() {
  const section=document.getElementById('journey');
  const items=[...section.querySelectorAll('.journey-steps li')];
  const fill=section.querySelector('.route-fill');
  const ship=section.querySelector('.route-ship');
  const day=section.querySelector('.journey-day');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let progress=0, active=-1, scene=null, queued=false;
  const clamp=value=>Math.max(0,Math.min(1,value));
  function update(){
    const box=section.getBoundingClientRect();
    if(!reduced)progress=clamp(-box.top/Math.max(1,section.offsetHeight-innerHeight));
    const state=voyageAt(progress);
    const index=state.step;
    if(active!==index){
      active=index;
      items.forEach((item,i)=>{item.classList.toggle('active',i===index);item.classList.toggle('complete',i<index);const button=item.querySelector('button');if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    }
    fill.style.width=state.distance*100+'%';ship.style.left=state.distance*100+'%';day.textContent='Day '+state.day;
    section.dataset.phase=state.phase;
    section.dataset.shipX=state.shipX.toFixed(3);
    scene?.setProgress(progress);queued=false;
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update,{passive:true});
  items.forEach((item,i)=>item.querySelector('button').addEventListener('click',()=>{
    const target=STEP_THRESHOLDS[i]+.01;
    if(reduced){progress=target;update();return;}
    const top=scrollY+section.getBoundingClientRect().top;
    scrollTo({top:top+target*(section.offsetHeight-innerHeight),behavior:'smooth'});
  }));
  update();
  // Load the expensive water renderer only as the visitor approaches the section.
  const loader=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting))return;
    loader.disconnect();
    import('./voyage-scene.js').then(({createVoyage})=>{scene=createVoyage(section,reduced);update();}).catch(()=>section.classList.add('scene-unavailable'));
  },{rootMargin:'1000px'});
  loader.observe(section);
}
