(function(){
  'use strict';
  const boot=document.getElementById('gameBoot'),status=document.getElementById('bootStatus'),retry=document.getElementById('bootRetry');
  if(!boot)return;
  document.documentElement.classList.add('game-booting');
  const started=performance.now();let failed=false,finished=false;
  const hint=setTimeout(()=>{if(!failed&&!finished)status.textContent='还在准备小镇，请稍等片刻……';},8000);
  function failure(){
    if(finished||failed)return;failed=true;clearTimeout(hint);
    status.textContent='小镇暂时没能打开，请重新载入。';retry.hidden=false;
    document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
    boot.querySelector('.game-boot-dots').hidden=true;retry.focus();
  }
  function onError(event){if(event.target?.tagName==='SCRIPT'||event instanceof ErrorEvent)failure();}
  window.addEventListener('error',onError,true);
  retry.addEventListener('click',()=>location.reload());
  window.addEventListener('load',async()=>{
    if(failed)return;
    if(!globalThis.GameUI||!globalThis.GamePanels||!document.getElementById('worldCanvas')){failure();return;}
    const portrait=document.querySelector('.portrait-frame img');
    if(portrait?.decode)await portrait.decode().catch(()=>{});
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(failed)return;
      status.textContent='小镇已准备好，欢迎回来。';
      const delay=matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.max(0,500-(performance.now()-started));
      setTimeout(()=>{
        if(failed)return;finished=true;clearTimeout(hint);window.removeEventListener('error',onError,true);
        document.documentElement.classList.remove('game-booting');boot.classList.add('leaving');
        setTimeout(()=>boot.remove(),300);
      },delay);
    }));
  },{once:true});
})();
