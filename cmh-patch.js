/* ==========================================================================
   CMH DEMO PATCH v3 — final mobile interaction pass
   ========================================================================== */
(function(){
"use strict";

/* Generic video fallback is only for pages that do NOT manage their own source
   playlist. Deferra-Surgery is explicitly page-managed. */
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
  if(!v.currentSrc||v.readyState===0)setTimeout(function(){if(v.readyState===0)next();},1200);
  v.muted=true;v.playsInline=true;v.play().catch(function(){});
  document.addEventListener("pointerdown",function(){v.play().catch(function(){});},{once:true});
});

/* Move an instant-result callout immediately after the visual when a page put it
   before the visual. This does not reorder controls or overwrite page grids. */
function reflow(){
  if(innerWidth>900)return;
  Array.prototype.forEach.call(document.querySelectorAll("section.card"),function(card){
    var visual=card.querySelector(".canvasWrap,.fieldwrap,.stage,.videoBox,canvas,svg");
    var inst=card.querySelector(".instant");
    if(visual&&inst&&(visual.compareDocumentPosition(inst)&Node.DOCUMENT_POSITION_PRECEDING))visual.insertAdjacentElement("afterend",inst);
  });
}
reflow();addEventListener("resize",reflow);

/* Pin the largest visual only after it scrolls to the top. Initial reading order
   remains title/caption -> visual -> controls. The spacer preserves layout. */
var pinState={box:null,sp:null,anchor:0,on:false};
function findVisualBox(){
  var el=null,area=0;
  Array.prototype.forEach.call(document.querySelectorAll("canvas,video,svg"),function(n){
    var r=n.getBoundingClientRect(),a=r.width*r.height;
    if(a>area&&r.height>120){area=a;el=n;}
  });
  if(!el)return null;
  var box=el.parentElement;
  if(!box||box.tagName==="BODY")return null;
  return box;
}
function preparePin(){
  if(innerWidth>900){
    if(pinState.box)pinState.box.classList.remove("cmh-sticky");
    if(pinState.sp)pinState.sp.style.display="none";
    pinState={box:null,sp:null,anchor:0,on:false};return;
  }
  var box=findVisualBox();if(!box)return;
  if(pinState.box!==box){
    if(pinState.box)pinState.box.classList.remove("cmh-sticky");
    var sp=box.previousElementSibling;
    if(!sp||!sp.classList.contains("cmh-spacer")){sp=document.createElement("div");sp.className="cmh-spacer";box.parentElement.insertBefore(sp,box);}
    pinState={box:box,sp:sp,anchor:box.getBoundingClientRect().top+scrollY,on:false};
  }
  updatePin();
}
function updatePin(){
  if(innerWidth>900||!pinState.box)return;
  var should=scrollY>pinState.anchor-4;
  if(should===pinState.on)return;
  pinState.on=should;
  var h=Math.min(380,Math.round(innerHeight*.44));
  pinState.box.classList.toggle("cmh-sticky",should);
  pinState.sp.style.height=should?h+"px":"0px";pinState.sp.style.display=should?"block":"none";
  requestAnimationFrame(function(){dispatchEvent(new Event("resize"));setTimeout(function(){dispatchEvent(new Event("resize"));},120);});
}
preparePin();addEventListener("resize",function(){pinState.anchor=0;pinState.box=null;preparePin();});addEventListener("scroll",updatePin,{passive:true});
})();
