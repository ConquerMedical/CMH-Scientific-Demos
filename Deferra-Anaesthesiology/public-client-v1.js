const $=id=>document.getElementById(id);function displayRoute(r){return r==='DEFER'?'NO INTERRUPTION':r==='WITHHOLD'?'HOLD GUIDANCE':r==='REACQUIRE'?'CORRECT MEASUREMENT':r}
let n=0,events=[],lastD=null;const vals=()=>({quality:+quality.value,dr:+dr.value,cs:+cs.value,observations:n});
function add(msg){events.unshift({n,msg});log.innerHTML=events.slice(0,7).map(e=>`<div class="event"><span>obs ${e.n}</span><b>${e.msg}</b></div>`).join('')}

/* live physiological trace: runs continuously; interventions arrive and scroll with it.
   course departure bends the level after an intervention; a change in the response relation
   changes the response to the intervention itself; signal quality sets the noise. */
const SVGNS='http://www.w3.org/2000/svg';
const W=900,H=260,SPAN=14;
const svg=$('svg');
let samples=[],inters=[],clock=0,lastTs=0,nextInter=1.2,gEl={};
const mkEl=(t,a,txt)=>{const e=document.createElementNS(SVGNS,t);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e};
function buildSvg(){
  svg.innerHTML='';
  for(let y=40;y<H;y+=40) svg.appendChild(mkEl('line',{x1:0,y1:y,x2:W,y2:y,stroke:'#17313a'}));
  gEl.band=mkEl('g',{}); svg.appendChild(gEl.band);
  gEl.marks=mkEl('g',{}); svg.appendChild(gEl.marks);
  gEl.sig=mkEl('polyline',{fill:'none',stroke:'#50e1cd','stroke-width':2.6,'stroke-linejoin':'round'}); svg.appendChild(gEl.sig);
  svg.appendChild(mkEl('line',{x1:W-1,y1:14,x2:W-1,y2:H-8,stroke:'rgba(234,244,248,.5)','stroke-width':1.5}));
  svg.appendChild(mkEl('text',{x:8,y:20,fill:'#93aab7','font-size':11},'last '+SPAN+' s · live'));
}
function signalAt(t){
  const q=+quality.value,drf=+dr.value/100,csh=+cs.value/100;
  let v=150-16*Math.sin(t*2*Math.PI*1.15)-5*Math.sin(t*2*Math.PI*.27);
  for(const it of inters){
    if(t<it.t) continue;
    const a=t-it.t;
    // response to this intervention: weakens, then inverts, as the relation changes
    v-=36*(1-2.3*csh)*Math.exp(-a/3.0)*(1-Math.exp(-a/.35));
    // course departure: a sustained shift away from the level, not a transient
    v-=drf*26*(1-Math.exp(-a/4.0));
  }
  v+=(100-q)/100*26*(Math.sin(t*37.1)*.6+Math.sin(t*11.7)*.4);
  return Math.max(20,Math.min(H-16,v));
}
function stepTrace(dt){
  clock+=dt;
  const rate=60,want=Math.floor(clock*rate);
  while(samples.length&&samples[0].k<want-SPAN*rate) samples.shift();
  const from=samples.length?samples[samples.length-1].k+1:want-SPAN*rate;
  for(let k=Math.max(from,want-SPAN*rate);k<=want;k++){const t=k/rate;samples.push({k,t,v:signalAt(t)})}
  nextInter-=dt;
  if(nextInter<=0){inters.push({t:clock});nextInter=2.6+Math.random()*1.1}
  inters=inters.filter(it=>it.t>clock-SPAN-1);
}
function drawTrace(){
  if(!samples.length)return;
  const t1=clock,t0=t1-SPAN,X=t=>(t-t0)/SPAN*W;
  gEl.sig.setAttribute('points',samples.map(s=>X(s.t).toFixed(1)+','+s.v.toFixed(1)).join(' '));
  gEl.marks.innerHTML='';gEl.band.innerHTML='';
  for(const it of inters){
    const x=X(it.t); if(x<-40) continue;
    const x0=Math.max(0,x),w=Math.max(0,Math.min(W-x0,X(it.t+1.6)-x0));
    gEl.band.appendChild(mkEl('rect',{x:x0,y:14,width:w,height:H-22,fill:'rgba(255,200,92,.07)'}));
    gEl.marks.appendChild(mkEl('line',{x1:x,y1:14,x2:x,y2:H-8,stroke:'#ffc85c','stroke-dasharray':'6 5','stroke-width':1.6}));
    if(x<W-70) gEl.marks.appendChild(mkEl('text',{x:x+5,y:28,fill:'#ffc85c','font-size':11},'intervention'));
  }
}
function frame(ts){const dt=lastTs?Math.min(.05,(ts-lastTs)/1000):0;lastTs=ts;stepTrace(dt);drawTrace();requestAnimationFrame(frame)}

function apply(d){lastD=d;route.textContent=displayRoute(d.route);reason.textContent=d.why;mstate.textContent=d.measurement==='SUFFICIENT'?'YES':'NO';dstate.textContent=d.course==='DEPARTED'?'YES':'NO';cstate.textContent=d.relation==='CHANGED'||d.relation==='EMERGING'?'YES':'NO';estate.textContent=(d.mature?'YES':'NO')+' · '+Math.min(n,4)+'/4';measure.textContent=d.measurement;course.textContent=d.course;relation.textContent=d.relation;memory.textContent=d.memory;authority.textContent='CLINICIAN';notice.className='notice '+(d.cls||'');notice.textContent=d.why;for(let i=1;i<=4;i++)$('e'+i).classList.toggle('on',i<=n)}
function localEvaluate(z){
  const adequate=z.quality>=60,highDR=z.dr>=60,highCS=z.cs>=60,mature=z.observations>=4;
  let route='DEFER',why='No alert is issued: the measurement is adequate and no supported change requires interruption.',cls='';
  if(!adequate){route='REACQUIRE';why='Measurement is inadequate, so a change in the intervention-response relation cannot be assessed. Correct the measurement first.';cls='warn'}
  else if(highCS&&!mature){route='WITHHOLD';why='A change in the intervention-response relation is emerging but has not reached the four-observation action point. Guidance is held.';cls='warn'}
  else if(highDR&&highCS){route='REASSESS';why='Both the course and the supported intervention-response relation have changed. Reassess before continuing.';cls='stop'}
  else if(!highDR&&highCS){route='FLAG';why='Silent shift: the intervention-response relation changed before a large course departure.';cls='stop'}
  else if(highDR&&!highCS){route='MONITOR';why='The course moved while the supported response relation remained intact. Continue monitoring.';cls='warn'}
  return {route,why,cls,measurement:adequate?'SUFFICIENT':'INADEQUATE',course:highDR?'DEPARTED':'ON COURSE',relation:highCS?(mature?'CHANGED':'EMERGING'):'UNCHANGED',memory:highCS&&mature?'CHALLENGED':'UNCHALLENGED',mature}
}
function classify(delay=60){
  const z=vals();
  apply(localEvaluate(z));
  if(window.CMHDemo) CMHDemo.latest('da','/v1/deferra/anesthesia/evaluate',z,d=>apply(Object.assign({},d,{cls:d.cls||localEvaluate(z).cls})),delay,()=>{});
}
function labels(){qv.textContent=quality.value+'%';drv.textContent=dr.value+'%';csv.textContent=cs.value+'%'}
[quality,dr,cs].forEach(x=>x.oninput=()=>{labels();classify()});
advance.onclick=()=>{n=Math.min(4,n+1);inters.push({t:clock+.15});nextInter=2.8;add('New observation incorporated; measurement and response relation re-evaluated.');classify(0)};
reset.onclick=()=>{n=0;events=[];log.innerHTML='';inters=[];classify(0)};
const P={stable:[92,20,20],course:[92,80,20],silent:[92,20,82],both:[92,82,82]};
document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const v=P[b.dataset.p];quality.value=v[0];dr.value=v[1];cs.value=v[2];n=0;events=[];log.innerHTML='';inters=[{t:clock+.2}];nextInter=2.8;labels();classify(0)});
svg.style.touchAction='none';let waveDrag=false;
function waveSet(e){const r=svg.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));dr.value=Math.round(x*100);cs.value=Math.round((1-y)*100);labels();classify()}
svg.addEventListener('pointerdown',e=>{waveDrag=true;svg.setPointerCapture(e.pointerId);waveSet(e)});
svg.addEventListener('pointermove',e=>{if(waveDrag)waveSet(e)});
svg.addEventListener('pointerup',()=>waveDrag=false);
svg.addEventListener('pointercancel',()=>waveDrag=false);
labels();buildSvg();classify(0);requestAnimationFrame(frame);

document.getElementById("downloadReport").onclick=()=>{
  const z=vals(), adequate=z.q>=60, highDR=z.dr>=60, highCS=z.cs>=60, mature=n>=4;
  let routeNow='NO INTERRUPTION', interpretation='No supported change requires interruption.';
  if(!adequate){routeNow='CORRECT MEASUREMENT';interpretation='Measurement is inadequate, so response change is not assessed.'}
  else if(highCS&&!mature){routeNow='OBSERVE';interpretation='A relation change is emerging but has not reached the four-observation action point.'}
  else if(highDR&&highCS){routeNow='REASSESS';interpretation='Both the course and the supported intervention-response relation have changed.'}
  else if(!highDR&&highCS){routeNow='FLAG · RESPONSE CHANGED';interpretation='Silent shift: the intervention-response relation changed before a large course departure.'}
  else if(highDR&&!highCS){routeNow='MONITOR';interpretation='The course moved while the supported response relation remained intact.'}
  const body=`<!doctype html><meta charset="utf-8"><title>Deferra anaesthesiology current report</title>
  <style>body{font:15px/1.55 system-ui;max-width:860px;margin:40px auto;padding:0 20px;color:#17212b}h1{font-size:28px}table{border-collapse:collapse;width:100%}td{padding:8px;border-bottom:1px solid #ddd}td:first-child{color:#667}.box{padding:14px;background:#f3f7f9;border-left:4px solid #20a98d}</style>
  <h1>Deferra · anaesthesiology current report</h1>
  <div class="box"><b>Current route: ${routeNow}</b><br>${interpretation}</div>
  <h2>Measurement and response state</h2><table>
  <tr><td>Signal quality</td><td>${z.q}%</td></tr>
  <tr><td>DR · course departure</td><td>${(z.dr/100).toFixed(2)}</td></tr>
  <tr><td>CS · response-relation change</td><td>${(z.cs/100).toFixed(2)}</td></tr>
  <tr><td>Evidence maturity</td><td>${n}/4 observations</td></tr>
  <tr><td>Measurement gate</td><td>${adequate?'SUFFICIENT':'INADEQUATE'}</td></tr>
  <tr><td>Autonomous control</td><td>NOT AUTHORIZED</td></tr>
  <tr><td>Dosing recommendation</td><td>NOT AUTHORIZED</td></tr></table>
  <h2>Interpretation</h2><p>Deferra separates course departure from change in the intervention-response relation. Departure alone does not authorize rewriting the response law. Measurement adequacy has precedence over both.</p>
  <h2>Validation basis</h2><p>Retrospective real-data evidence includes MIMIC-IV norepinephrine/MAP routing and PhysioNet Sepsis. The interactive waveform is a controllable physiologic response stream used to expose the routing logic; the validation results are from the cited critical-care datasets.</p>`;
  const blob=new Blob([body],{type:"text/html"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="Deferra_Anaesthesiology_current_report.html";a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
};

