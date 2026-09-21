/* CMH Scientific: common return-to-menu control */
(function(){
  "use strict";
  function mount(){
    if(document.querySelector('.cmh-main-menu,.cmh-main-menu-global')) return;
    var a=document.createElement('a');
    a.className='cmh-main-menu-global';
    a.href='../';
    a.setAttribute('aria-label','Back to CMH Scientific main demo menu');
    a.textContent='← Main demo menu';
    document.body.appendChild(a);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
