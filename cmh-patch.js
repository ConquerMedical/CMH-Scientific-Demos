/* CMH Scientific corrective interaction layer v3.1 */
(function(){
"use strict";

/* Phone landscape should behave like the desktop/iPad composition instead of
   stacking a portrait mobile layout. iPads/tablets retain their native viewport. */
var meta=document.querySelector('meta[name="viewport"]');
var base=meta?meta.getAttribute('content'):'width=device-width,initial-scale=1,viewport-fit=cover';
function phoneLandscape(){
  return window.matchMedia('(orientation: landscape)').matches &&
         Math.min(screen.width,screen.height)<=600;
}
function setViewport(){
  if(!meta)return;
  var desired=phoneLandscape()?'width=1180,viewport-fit=cover':base;
  if(meta.getAttribute('content')!==desired)meta.setAttribute('content',desired);
}
setViewport();
window.addEventListener('orientationchange',function(){setTimeout(setViewport,80)});
window.addEventListener('resize',setViewport);

/* Generic video fallback only for pages which do not own their source. */
var CANDIDATES=["field.mp4","assets/field.mp4","Deferra_Synthetic_Operative_Field_Clean.mp4","assets/Deferra_Synthetic_Operative_Field_Clean.mp4","../assets/field.mp4"];
Array.prototype.forEach.call(document.querySelectorAll("video"),function(v){
  if(v.dataset.cmhManaged==="1") return;
  var wrap=v.parentElement;if(!wrap)return;
  if(getComputedStyle(wrap).position==="static")wrap.style.position="relative";
  var msg=document.createElement("div");msg.className="cmh-vidfail";
  msg.innerHTML="<div><b>Video clip not found</b>Place a cleared clip beside this page as <code>field.mp4</code>.</div>";
  wrap.appendChild(msg);
  var i=-1,done=false;
  function next(){if(done)return;i++;if(i>=CANDIDATES.length){msg.classList.add("on");return;}v.src=CANDIDATES[i];v.load();}
  v.addEventListener("error",next);
  v.addEventListener("loadeddata",function(){done=true;msg.classList.remove("on");});
});

/* The old v3 patch pinned the largest canvas/video with position:fixed.
   Explicitly unwind that state if cached markup/script left classes behind. */
function unpin(){
  document.querySelectorAll('.cmh-sticky').forEach(function(x){x.classList.remove('cmh-sticky')});
  document.querySelectorAll('.cmh-spacer').forEach(function(x){x.remove()});
}
unpin();
document.addEventListener('DOMContentLoaded',unpin,{once:true});
})();