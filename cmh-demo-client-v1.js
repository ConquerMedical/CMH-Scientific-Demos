(()=>{"use strict";
const BASE="https://cmh-public-demo-compute.onrender.com";
const slots=new Map();
async function post(path,payload,signal){
  const r=await fetch(BASE+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),signal,cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"});
  if(!r.ok) throw new Error(`CMH demo compute ${r.status}`);
  return await r.json();
}
function latest(key,path,payload,apply,delay=80,onError){
  let s=slots.get(key); if(!s) s={seq:0,timer:null,controller:null};
  s.seq++; const mine=s.seq; clearTimeout(s.timer); if(s.controller) s.controller.abort();
  s.timer=setTimeout(async()=>{s.controller=new AbortController();try{const data=await post(path,payload,s.controller.signal);if(mine===s.seq)apply(data)}catch(e){if(e.name!=="AbortError"&&mine===s.seq){console.warn(e);onError&&onError(e)}}},delay);
  slots.set(key,s);
}
window.CMHDemo=Object.freeze({BASE,post,latest});
})();