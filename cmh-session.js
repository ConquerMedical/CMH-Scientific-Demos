(()=>{
"use strict";
const path=(location.pathname.split('/').filter(Boolean).pop()||'').toLowerCase();
const CFG={
  'abp':{name:'ABP · AI as a Biological Primitive',file:'ABP_session_report.html',anchor:'#c',results:['#modeResultTitle','#resultPanel','#contrastLine','#ground','#inverseSection'],labels:{rt:'Radiation',tz:'Agent intensity',wk:'Treatment week',abpEvidence:'Evidence substrate',inverseObjective:'Inverse objective'},displays:{rt:'vRt',tz:'vTz',wk:'vWk'}},
  'aio':{name:'AIO · AI On…',file:'AIO_session_report.html',anchor:'#results',results:['#instant','#studyTitle','#studySub','#results','#plan'],labels:{field:'Field or question',sources:'Literature sources',depth:'Extraction depth',pay:'Paywalled full text',substrate:'Common substrate'}},
  'acquire':{name:'Acquire',file:'Acquire_session_report.html',anchor:'.canvasWrap',results:['#instant','#measured','#avoided','#saved','#value','#action','#guide'],labels:{layer:'Measurement family',frac:'Participants measured',cost:'Assay cost'},displays:{frac:'fracV',cost:'costV'}},
  'ctf':{name:'CTF · Clinical Trial Falsifier',file:'CTF_session_report.html',anchor:'#trialSvg',results:['#instant','#verdictText','#story','#meanEffect','#opposed','#placeboGap','#claimGap','#naiveTitle','#naiveText','#ctfTitle','#ctfText','#ladder','#actions'],labels:{claim:'Claim under test',responderShare:'Responder share',benefit:'Responder benefit',other:'Non-responder effect',endpoint:'Endpoint fidelity',follow:'Follow-up',marker:'Marker separation',mechanism:'Mechanism strength'},displays:{responderShare:'responderShareVal',benefit:'benefitVal',other:'otherVal',endpoint:'endpointVal',follow:'followVal',marker:'markerVal',mechanism:'mechanismVal'}},
  'deferra-anaesthesiology':{name:'Deferra · Anaesthesiology',file:'Deferra_anaesthesiology_session_report.html',anchor:'.wave',results:['#route','#reason','#notice','#measure','#course','#relation','#memory','#authority','#log'],labels:{quality:'Signal quality',dr:'Course departure',cs:'Response-relation change'},displays:{quality:'qv',dr:'drv',cs:'csv'}},
  'deferra-surgery':{name:'Deferra · Surgery',file:'Deferra_surgical_transcript_and_report.html',anchor:'#videoBox',results:['#route','#decision','#reason','#notice','#phase','#fieldModel','#visual','#motion','#obs','#overlayState'],keepNative:true,nudge:'Updated · ↓ download the surgical transcript and report'},
  'npis':{name:'NPIS · Nonparametric Information Sufficiency',file:'NPIS_session_report.html',anchor:'#cv',results:['#instant','#state','#statement','#pbrMeaning','#pimMeaning','#csMeaning','#drMeaning','#rpaMeaning','#faiMeaning','#tbMeaning','#niMeaning','#oppMeaning'],labels:{sample:'Construct / substrate',frac:'Data retained',k:'Neighborhood size',rich:'Measurement richness',contrast:'Branch contrast',depart:'Departure intensity'},displays:{frac:'fracV',k:'kV',rich:'richV',contrast:'contrastV',depart:'departV'}},
  'opticeil-surgical':{name:'OptiCeil',file:'OptiCeil_session_report.html',anchor:'.stage',results:['#instant','#vh','#vp','#rel','#cons','#kRate','#kSamp','#kVox','#kPh','#kUse','#kBl'],labels:{fov:'Field of view',dep:'Depth required',dur:'Recording duration',stable:'Estimator geometry agreement'},displays:{fov:'nFov',dep:'nDep',dur:'nDur',stable:'nStable'}},
  'topolai':{name:'TopolAI',file:'TopolAI_session_report.html',anchor:'.pipe',results:['#action','#summary','#guardtext','#n1s','#n1e','#n2s','#n2e','#n3s','#n3e','#n4s','#n4e','#n5s','#n5e']},
  'totemicai':{name:'TotemicAI',file:'TotemicAI_session_report.html',anchor:'.canvasWrap',results:['#instant','#state','#tdir','#rdir','#trel','#rrel'],labels:{d1:'Turning-point sensitivity',d2:'Relational sensitivity',budget:'Memory budget',noise:'Challenge / noise'},displays:{d1:'d1V',d2:'d2V',budget:'budgetV',noise:'noiseV'}}
};
const cfg=CFG[path]; if(!cfg)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const start=Date.now(), events=[]; let nudgeTimer=null;
function stamp(){const s=Math.max(0,Math.round((Date.now()-start)/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function labelFor(el){
  if(cfg.labels&&cfg.labels[el.id])return cfg.labels[el.id];
  if(el.id){const l=document.querySelector(`label[for="${CSS.escape(el.id)}"]`);if(l)return clean(l.textContent)}
  const box=el.closest('.control,.sl,.field,.row,section,aside'); if(box){const l=box.querySelector('label');if(l){const c=l.cloneNode(true);c.querySelectorAll('b,output').forEach(x=>x.remove());const t=clean(c.textContent);if(t)return t}}
  return el.name||el.id||el.type||'Control';
}
function valueFor(el){
  if(el.tagName==='SELECT')return clean(el.selectedOptions[0]?.textContent||el.value);
  if(el.type==='checkbox'||el.type==='radio')return el.checked?'On':'Off';
  const did=cfg.displays&&cfg.displays[el.id]; if(did){const d=document.getElementById(did);if(d&&clean(d.textContent))return clean(d.textContent)}
  return clean(el.value);
}
function controls(){
  return [...document.querySelectorAll('input,select,textarea')].filter(el=>el.type!=='hidden').map(el=>({id:el.id||el.name||'',label:labelFor(el),value:valueFor(el)}));
}
function digest(){
  const parts=[]; const seen=new Set();
  (cfg.results||[]).forEach(sel=>document.querySelectorAll(sel).forEach(el=>{let t=clean(el.textContent);if(!t||seen.has(t))return;seen.add(t); if(t.length>900)t=t.slice(0,897)+'…';parts.push(t)}));
  return parts.slice(0,14);
}
const initial=controls(); const initialMap=new Map(initial.map(x=>[x.id,x.value])); const lastMap=new Map(initialMap);
function resultSummary(){const d=digest();return d.length?d.slice(0,4).join(' · '):'Current demo state updated.'}
function record(type,text){events.push({time:stamp(),type,text,result:resultSummary()});showNudge()}
function showNudge(){const n=document.querySelector('.cmh-report-nudge');if(!n)return;n.classList.add('show');clearTimeout(nudgeTimer);nudgeTimer=setTimeout(()=>n.classList.remove('show'),3200)}
function findButton(){return document.getElementById('downloadReport')||document.getElementById('download')||[...document.querySelectorAll('button')].find(b=>/download.*report|report.*download/i.test(clean(b.textContent)))}
function placeDock(){
  let btn=findButton(); const anchor=document.querySelector(cfg.anchor); if(!btn||!anchor)return null;
  const dock=document.createElement('div');dock.className='cmh-report-dock';
  const n=document.createElement('div');n.className='cmh-report-nudge';n.textContent=cfg.nudge||'Updated · ↓ download this session report';dock.appendChild(n);
  anchor.insertAdjacentElement('afterend',dock);dock.appendChild(btn);
  if(!cfg.keepNative){const clone=btn.cloneNode(true);btn.replaceWith(clone);btn=clone;btn.textContent='Download session report';btn.addEventListener('click',downloadReport)}
  return btn;
}
function diffControls(before,after){const bm=new Map(before.map(x=>[x.id,x]));return after.filter(x=>bm.has(x.id)&&bm.get(x.id).value!==x.value).map(x=>`${x.label}: ${bm.get(x.id).value} → ${x.value}`)}
const pending=new Map();
function queueInput(el){
  if(!el.id&&!el.name)return; const key=el.id||el.name; const prior=pending.get(key);if(prior)clearTimeout(prior.timer);
  const from=prior?prior.from:(lastMap.get(key)??valueFor(el));
  const timer=setTimeout(()=>{pending.delete(key);const to=valueFor(el);if(from!==to){lastMap.set(key,to);record('Adjustment',`${labelFor(el)}: ${from} → ${to}`)}},350);
  pending.set(key,{from,timer});
}
function setupEvents(anchor,btn){
  document.addEventListener('input',e=>{const el=e.target;if(el.matches('input,select,textarea'))queueInput(el)});
  document.addEventListener('change',e=>{const el=e.target;if(el.matches('select,textarea,input:not([type="range"])'))queueInput(el)});
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b===btn||b.closest('.cmh-report-dock'))return;const txt=clean(b.textContent);if(!txt||/demo hub|request software access/i.test(txt))return;const before=controls();setTimeout(()=>{const after=controls();const d=diffControls(before,after);after.forEach(x=>lastMap.set(x.id,x.value));record('Action',txt+(d.length?' · '+d.join('; '):''))},180)},true);
  if(anchor){let sx=0,sy=0,moved=false;anchor.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;moved=false},{passive:true});anchor.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-sx,e.clientY-sy)>7)moved=true},{passive:true});anchor.addEventListener('pointerup',()=>{if(moved)record('Direct figure interaction','Viewer manipulated the primary figure directly.')},{passive:true});let wt=null;anchor.addEventListener('wheel',()=>{clearTimeout(wt);wt=setTimeout(()=>record('Direct figure interaction','Viewer adjusted the primary figure with scroll / wheel input.'),450)},{passive:true})}
}
function table(rows){return `<table><tr><th>Setting</th><th>Value</th></tr>${rows.map(x=>`<tr><td>${esc(x.label)}</td><td>${esc(x.value)}</td></tr>`).join('')}</table>`}
function downloadReport(e){if(e){e.preventDefault();e.stopPropagation()}
  const final=controls(), d=digest(), end=new Date();
  const transcript=events.length?`<table><tr><th>Session time</th><th>Event</th><th>Adjustment / action</th><th>Result after event</th></tr>${events.map(x=>`<tr><td>${esc(x.time)}</td><td>${esc(x.type)}</td><td>${esc(x.text)}</td><td>${esc(x.result)}</td></tr>`).join('')}</table>`:`<div class="box">No adjustments were made. This report records the demo's default state as opened.</div>`;
  const current=d.length?`<ul>${d.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>No separate result text was exposed by this demonstration state.</p>';
  const body=`<!doctype html><meta charset="utf-8"><title>${esc(cfg.name)} session report</title><style>body{font:15px/1.55 system-ui;max-width:1000px;margin:38px auto;padding:0 22px;color:#17212b}h1{font-size:28px;margin-bottom:4px}h2{margin-top:28px}table{border-collapse:collapse;width:100%}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}th{background:#f3f7f9}.box{padding:13px 15px;background:#fff7df;border-left:4px solid #d9a72a}.mut{color:#65737d}.tag{display:inline-block;background:#e8f7f2;color:#13614e;border-radius:999px;padding:3px 8px;font-weight:700;font-size:12px}</style><h1>${esc(cfg.name)} · session report</h1><p class="tag">Interactive demonstration record</p><p class="mut">Session opened ${esc(new Date(start).toLocaleString())} · report generated ${esc(end.toLocaleString())} · elapsed ${esc(stamp())}</p><div class="box"><b>What this is:</b> a record of the settings and interactions used during this visit to the public demonstration. It preserves the default state, every recorded adjustment, and the final on-screen result. It is not a clinical-use record or a substitute for production validation.</div><h2>Default state</h2>${table(initial)}<h2>Session transcript</h2>${transcript}<h2>Final settings</h2>${table(final)}<h2>Current result and interpretation</h2>${current}<h2>Change summary</h2><p>${events.length?`${events.length} recorded interaction${events.length===1?'':'s'} occurred during this visit. The final state above reflects all recorded adjustments.`:'The viewer downloaded the report without changing the default demonstration state.'}</p>`;
  const blob=new Blob([body],{type:'text/html'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=cfg.file;a.click();setTimeout(()=>URL.revokeObjectURL(u),5000)
}
function setup(){const btn=placeDock();const anchor=document.querySelector(cfg.anchor);if(!btn)return;setupEvents(anchor,btn);if(cfg.keepNative){btn.textContent='Download surgical transcript and report'} }
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(setup,60),{once:true});else setTimeout(setup,60);
})();
