const $=x=>document.getElementById(x),cv=$('cv'),ctx=cv.getContext('2d');let lastM=null;function size(){let r=cv.parentElement.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);cv.width=r.width*d;cv.height=430*d;ctx.setTransform(d,0,0,d,0,0)}
/* ---- local evaluation from the published COPDGene selective-acquisition results ----
   Anchors (fraction of universal measurement value recovered, by fraction acquired):
     History                          30% 71.0 · 40% 85.6 · 50% 96.9
     History + integrated repn.       30% 68.8 · 40% 83.5 · 50% 92.4
     Integrated representation        30% 54.8 · 40% 76.1 · 50% 92.8
   n = 785 participants (Ewing, Acquire: Inverse Measurement Design, 2026, Table 3). */
const LAYERS={
 'History':{anchors:[[30,.710],[40,.856],[50,.969]]},
 'History + integrated representation':{anchors:[[30,.688],[40,.835],[50,.924]]},
 'Integrated representation':{anchors:[[30,.548],[40,.761],[50,.928]]}};
const ACQ_N=785;
function curveFor(key){
  const A=LAYERS[key]||LAYERS['History'],pts=[[0,0]].concat(A.anchors,[[100,1]]),out=[];
  for(let f=0;f<=100;f+=2){
    let i=0;while(i<pts.length-2&&pts[i+1][0]<f)i++;
    const [x0,y0]=pts[i],[x1,y1]=pts[i+1],u=x1===x0?0:(f-x0)/(x1-x0);
    out.push([f,Math.max(0,Math.min(1.02,y0+(y1-y0)*(u*u*(3-2*u))))]);     // smooth through the anchors
  }
  return out;
}
function localEvaluate(p){
  const curve=curveFor(p.layer),v=curve.reduce((b,c)=>Math.abs(c[0]-p.fraction)<Math.abs(b[0]-p.fraction)?c:b)[1];
  const measured=Math.round(ACQ_N*p.fraction/100),avoided=ACQ_N-measured;
  const action=v>=.9?'STOP · value recovered':v>=.6?'CONTINUE SELECTIVELY':'CONTINUE SELECTIVELY · low recovery';
  return {layer:p.layer,fraction:p.fraction,cost:p.cost,N:ACQ_N,measured,avoided,
          saved:avoided*p.cost,value:v,action,curve,anchors:LAYERS[p.layer].anchors};
}
function payload(){return{layer:$('layer').value,fraction:+$('frac').value,cost:+$('cost').value}}function apply(m){lastM=m;$('layerV').textContent=m.layer;$('fracV').textContent=m.fraction+'%';$('costV').textContent='$'+m.cost.toLocaleString();$('measured').textContent=m.measured+' / '+m.N;$('avoided').textContent=m.avoided.toLocaleString();$('saved').textContent='$'+m.saved.toLocaleString();$('value').textContent=(m.value*100).toFixed(1)+'%';$('action').textContent=m.action;$('instant').innerHTML=`<b>Measure ${m.measured} of ${m.N}, not all ${m.N}.</b> ${m.avoided} added measurements are avoided — <b>$${m.saved.toLocaleString()}</b> at $${m.cost.toLocaleString()} each — while this frozen curve retains <b>${(m.value*100).toFixed(1)}%</b> of universal measurement value.`;$('guide').innerHTML=m.value>.9?'<b>Most of the tested universal value is already recovered.</b> The remaining measurements buy little additional value on this frozen curve.':'<b>Additional targeted measurement still has material value.</b> Acquire would continue on the patients or information dimensions expected to reduce unresolved ambiguity.';draw(m)}
let phase=0,lastTs=0;
function frame(ts){const dt=lastTs?Math.min(.05,(ts-lastTs)/1000):0;lastTs=ts;phase+=dt;if(lastM)draw(lastM);requestAnimationFrame(frame)}
function draw(m){let W=cv.clientWidth,H=cv.clientHeight;ctx.fillStyle='#03070a';ctx.fillRect(0,0,W,H);let z={l:48,r:22,t:30,b:45},ww=W-z.l-z.r,hh=H-z.t-z.b;ctx.strokeStyle='#203945';ctx.beginPath();ctx.moveTo(z.l,z.t);ctx.lineTo(z.l,H-z.b);ctx.lineTo(W-z.r,H-z.b);ctx.stroke();const arr=m.curve||[];
  // participants, filling in as acquisition proceeds
  for(let i=0;i<120;i++){const u=i/119,px=z.l+ww*u,sel=u*100<=m.fraction,
    py=H-z.b-hh*(0.06+0.52*Math.abs(Math.sin(i*1.7))) - (sel?6*Math.sin(phase*2+i*.5):0);
    ctx.globalAlpha=sel?.75:.18;ctx.fillStyle=sel?'#70e7b2':'#3a5361';ctx.beginPath();ctx.arc(px,py,2.6,0,Math.PI*2);ctx.fill()}
  ctx.globalAlpha=1;
  ctx.strokeStyle='#62d8ff';ctx.lineWidth=3;ctx.beginPath();arr.forEach((p,i)=>{const x=z.l+ww*p[0]/100,py=H-z.b-hh*p[1];i?ctx.lineTo(x,py):ctx.moveTo(x,py)});ctx.stroke();for(const p of m.anchors||[]){const x=z.l+ww*p[0]/100,py=H-z.b-hh*p[1];ctx.fillStyle='#70e7b2';ctx.beginPath();ctx.arc(x,py,4,0,Math.PI*2);ctx.fill()}const x=z.l+ww*m.fraction/100,py=H-z.b-hh*m.value;ctx.strokeStyle='#ffd36b';ctx.beginPath();ctx.moveTo(x,z.t);ctx.lineTo(x,H-z.b);ctx.stroke();ctx.fillStyle='#ffd36b';ctx.beginPath();ctx.arc(x,py,6+1.6*Math.sin(phase*3),0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(255,211,107,.45)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,py,10+5*((phase*.6)%1),0,Math.PI*2);ctx.stroke();ctx.fillStyle='#8ea4af';ctx.font='11px system-ui';ctx.fillText('fraction receiving added measurement',W/2-85,H-12);ctx.save();ctx.translate(12,H/2+60);ctx.rotate(-Math.PI/2);ctx.fillText('fraction of universal measurement value recovered',0,0);ctx.restore()}function calc(delay=70){
  const p=payload();
  apply(localEvaluate(p));                              // published curve, evaluated here: responds at once
  if(window.CMHDemo)CMHDemo.latest('acquire','/v1/acquire/evaluate',p,apply,delay,()=>{});
}let acqDrag=false;function setAcquireFromPointer(e){const r=cv.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));$('frac').value=Math.round((10+x*90)/5)*5;$('cost').value=Math.round((50+(1-y)*1950)/50)*50;calc()}cv.addEventListener('pointerdown',e=>{acqDrag=true;cv.setPointerCapture(e.pointerId);setAcquireFromPointer(e)});cv.addEventListener('pointermove',e=>{if(acqDrag)setAcquireFromPointer(e)});cv.addEventListener('pointerup',()=>acqDrag=false);cv.addEventListener('pointercancel',()=>acqDrag=false);cv.addEventListener('wheel',e=>{e.preventDefault();$('frac').value=Math.max(10,Math.min(100,+$('frac').value-Math.sign(e.deltaY)*5));calc()},{passive:false});['layer','frac','cost'].forEach(id=>$(id).addEventListener('input',()=>calc()));window.addEventListener('resize',()=>{size();if(lastM)draw(lastM)});size();calc(0);requestAnimationFrame(frame);document.getElementById('downloadReport').onclick=()=>{const m=lastM;if(!m)return;const body=`<!doctype html><meta charset="utf-8"><title>Acquire current report</title><h1>Acquire · current selective-measurement report</h1><p><b>${m.action}</b><br>${$('guide').textContent}</p><p>${m.layer} · ${m.fraction}% measured · ${m.measured}/${m.N} participants · ${(m.value*100).toFixed(1)}% universal measurement value recovered · $${m.saved.toLocaleString()} scenario cost avoided.</p>`;const blob=new Blob([body],{type:'text/html'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='Acquire_current_report.html';a.click();setTimeout(()=>URL.revokeObjectURL(u),5000)};
