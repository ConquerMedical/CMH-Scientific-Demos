const $=x=>document.getElementById(x),cv=$('cv'),ctx=cv.getContext('2d');let t=0,run=false,challenge=false,last=performance.now(),M={tdir:.63,rdir:.33,trel:.42,rrel:.06,path:[],totems:[],challenge:false};function size(){let r=cv.parentElement.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);cv.width=r.width*d;cv.height=430*d;ctx.setTransform(d,0,0,d,0,0)}
/* ---- local structural memory ------------------------------------------------
   Anchored on the published dedicated 1% AML reconstruction (Ewing, TotemicAI white paper):
   direction fidelity 0.571 structural vs 0.292 random; relational 0.376 vs 0.026.
   Totems are chosen here as the turning points of the trajectory, which is what the
   structural policy retains; the trajectory itself is illustrative, as the panel says. */
const A_INT=32,B_INT=65,CHAL=82;
function buildPath(d1,d2,chal){
  const out=[];
  for(let i=0;i<=200;i++){
    const x=i/2;let v=.42+.03*Math.sin(x*.18);
    if(x>A_INT)v+=d1*.34*(1-Math.exp(-(x-A_INT)/6));
    if(x>B_INT)v+=d2*.34*(1-Math.exp(-(x-B_INT)/5))*(chal?-1:1);
    if(chal&&x>CHAL)v+=-.5*(1-Math.exp(-(x-CHAL)/4));   // the stored relation no longer holds
    out.push([x,Math.max(.03,Math.min(.95,v))]);
  }
  return out;
}
function pickTotems(path,budget){
  const curv=path.map((p,i)=>{
    if(i===0||i===path.length-1)return {x:p[0],c:0};
    return {x:p[0],c:Math.abs(path[i-1][1]-2*p[1]+path[i+1][1])};
  });
  const keep=Math.max(3,Math.round(path.length*budget/100));
  return curv.sort((a,b)=>b.c-a.c).slice(0,keep).map(o=>o.x).sort((a,b)=>a-b);
}
function localEvaluate(p){
  const b=p.budget,nz=p.noise/100;
  const rise=(lo,hi,k)=>lo+(hi-lo)*(1-Math.exp(-(Math.max(b,1)-1)/k));
  let tdir=rise(.571,.79,9)*(1-.55*nz), rdir=rise(.292,.54,14)*(1-.35*nz);
  let trel=rise(.376,.63,10)*(1-.6*nz),  rrel=rise(.026,.23,18)*(1-.35*nz);
  if(p.challenge){tdir*=.78;trel*=.52}
  const path=buildPath(p.d1,p.d2,p.challenge);
  return {tdir,rdir,trel,rrel,path,totems:pickTotems(path,b),challenge:p.challenge};
}
function payload(){return{d1:+$('d1').value,d2:+$('d2').value,budget:+$('budget').value,noise:+$('noise').value,challenge}}function apply(m){M=m;const d1=+$('d1').value,d2=+$('d2').value,b=+$('budget').value,n=+$('noise').value;$('d1V').textContent=d1.toFixed(2);$('d2V').textContent=d2.toFixed(2);$('budgetV').textContent=b+'%';$('noiseV').textContent=Math.round(n)+'%';$('tdir').textContent=m.tdir.toFixed(3);$('rdir').textContent=m.rdir.toFixed(3);$('trel').textContent=m.trel.toFixed(3);$('rrel').textContent=m.rrel.toFixed(3);$('instant').innerHTML=challenge?'<b>The stored history just broke.</b> TotemicAI detects the challenge and restarts acquisition instead of silently overwriting the memory.':`<b>${b}% memory keeps the turning points.</b> Direction fidelity is ${m.tdir.toFixed(3)} versus ${m.rdir.toFixed(3)} for equal-budget random memory in this illustrative trajectory.`;$('state').innerHTML=challenge?'<b>Structural challenge detected.</b> New observations no longer fit the stored local relation; reacquisition/recompilation is triggered.':'<b>Structural record coherent.</b> Totems retain the turning points needed to reconstruct direction and relation after compression.';draw()}function calc(delay=70){
  const p=payload();
  apply(localEvaluate(p));                                 // responds at once
  if(window.CMHDemo)CMHDemo.latest('totem','/v1/totemicai/evaluate',p,apply,delay,()=>{});
}function atPath(x){const arr=M.path||[];if(!arr.length)return 0;const idx=Math.max(0,Math.min(arr.length-1,Math.round(x*2)));return arr[idx][1]}function draw(){let W=cv.clientWidth,H=cv.clientHeight;ctx.fillStyle='#03070a';ctx.fillRect(0,0,W,H);let x0=30,y0=H*.58,ww=W-60,hh=H*.42,upto=run?Math.min(100,t):100,n=+$('noise').value/100;ctx.strokeStyle='#17303b';ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(W-30,y0);ctx.stroke();ctx.strokeStyle='#62d8ff';ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<(M.path||[]).length;i++){let [x,v]=(M.path||[])[i];if(x>upto)break;const px=x0+ww*x/100,py=y0-(v+Math.sin(i*2.31)*n*.08)*hh;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke();[32,65,82].forEach((x,i)=>{if(x>upto)return;ctx.strokeStyle=i===2&&challenge?'#ff6778':'#ffd36b';let px=x0+ww*x/100;ctx.beginPath();ctx.moveTo(px,36);ctx.lineTo(px,H-30);ctx.stroke();ctx.fillStyle=ctx.strokeStyle;ctx.font='10px system-ui';ctx.fillText(i===0?'intervention A':i===1?'intervention B':'challenge',px+5,50+i*12)});for(const x of M.totems||[]){if(x>upto)continue;let v=atPath(x),px=x0+ww*x/100,py=y0-v*hh;const pulse=1+.35*Math.sin(phase*2.4+px*.05);
    ctx.fillStyle='#70e7b2';ctx.beginPath();ctx.arc(px,py,4.4*pulse,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(112,231,178,.75)';ctx.beginPath();ctx.moveTo(px,py-13);ctx.lineTo(px,py+13);ctx.stroke()}
  {const u=(phase*12)%100,px=x0+ww*u/100,py=y0-atPath(u)*hh;
   ctx.fillStyle='rgba(98,216,255,.9)';ctx.beginPath();ctx.arc(px,py,3.4,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#8ea4af';ctx.font='11px system-ui';ctx.fillText('time',W-55,H-16);ctx.fillText('response trajectory',30,20)}let phase=0;
function tick(now){const dt=Math.min(.05,(now-last)/1000);phase+=dt;
  if(run){t+=(now-last)/60;if(t>100){t=100;run=false;$('play').textContent='↻ Replay trajectory'}}
  draw();last=now;requestAnimationFrame(tick)}['d1','d2','budget','noise'].forEach(id=>$(id).addEventListener('input',()=>calc()));$('play').onclick=()=>{if(t>=100)t=0;run=!run;$('play').textContent=run?'❚❚ Pause':'▶ Continue'};$('reset').onclick=()=>{t=0;run=false;challenge=false;$('play').textContent='▶ Run trajectory';calc(0)};$('challenge').onclick=()=>{challenge=!challenge;calc(0)};let tmDrag=false;function setTotemFromPointer(e){const r=cv.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));if(x<.5)$('d1').value=(1-y).toFixed(2);else $('d2').value=(1-y).toFixed(2);calc()}cv.addEventListener('pointerdown',e=>{tmDrag=true;cv.setPointerCapture(e.pointerId);setTotemFromPointer(e)});cv.addEventListener('pointermove',e=>{if(tmDrag)setTotemFromPointer(e)});cv.addEventListener('pointerup',()=>tmDrag=false);cv.addEventListener('pointercancel',()=>tmDrag=false);cv.addEventListener('wheel',e=>{e.preventDefault();$('budget').value=Math.max(1,Math.min(30,+$('budget').value-Math.sign(e.deltaY)));calc()},{passive:false});window.addEventListener('resize',()=>{size();draw()});size();calc(0);requestAnimationFrame(tick);document.getElementById('downloadReport').onclick=()=>{const body=`<!doctype html><meta charset="utf-8"><title>TotemicAI current report</title><h1>TotemicAI · current structural-memory report</h1><p><b>${document.getElementById('state').textContent}</b></p><p>Memory budget ${document.getElementById('budgetV').textContent} · direction fidelity ${document.getElementById('tdir').textContent} vs ${document.getElementById('rdir').textContent} random.</p>`;const blob=new Blob([body],{type:'text/html'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='TotemicAI_current_report.html';a.click();setTimeout(()=>URL.revokeObjectURL(u),5000)};
