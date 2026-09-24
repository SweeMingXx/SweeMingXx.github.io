'use strict';
/* Cross-cutting UI safeguards: top-layer status messages and immersive focus. */
(() => {
 const dialog=document.getElementById('dialog'),toast=document.getElementById('toast'),stage=document.getElementById('art-stage');
 function placeStatus(){const parent=dialog.open?dialog:document.body;if(toast.parentElement!==parent)parent.append(toast);}
 new MutationObserver(placeStatus).observe(dialog,{attributes:true,attributeFilter:['open']});
 new MutationObserver(placeStatus).observe(toast,{attributes:true,attributeFilter:['hidden'],childList:true});
 function enhanceDialog(){
  for(const region of dialog.querySelectorAll('.data-table-wrap')){
   region.tabIndex=0;region.setAttribute('role','region');region.setAttribute('aria-label','Original data values, scrollable table');
   region.onfocus=()=>{region.style.outline='3px solid #b94d2d';region.style.outlineOffset='3px';};
   region.onblur=()=>{region.style.outline='';region.style.outlineOffset='';};
  }
 }
 new MutationObserver(enhanceDialog).observe(document.getElementById('dialog-body'),{childList:true});
 document.addEventListener('keydown',e=>{
  if(e.key!=='Tab'||!stage.classList.contains('focus-view'))return;
  const controls=[...stage.querySelectorAll('button:not(:disabled)')];
  const first=controls[0],last=controls[controls.length-1];
  if(e.shiftKey&&(document.activeElement===first||!stage.contains(document.activeElement))){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&(document.activeElement===last||!stage.contains(document.activeElement))){e.preventDefault();first.focus();}
 });
 // Ignore repeated activations while the browser unlocks audio.
 const listen=document.getElementById('listen');let guard=false;
 listen.addEventListener('click',e=>{if(guard){e.preventDefault();e.stopImmediatePropagation();return;}guard=true;setTimeout(()=>guard=false,350);},true);
})();
