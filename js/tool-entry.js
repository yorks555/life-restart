// Compatibility entry points open inside the shared town. Embedded tools keep
// their existing engines and local storage, with a common presentation layer.
(function(){
  const file=location.pathname.split('/').pop(),name=file.replace('.html','');
  if(new URLSearchParams(location.search).get('embed')!=='1'){
    const hash=file==='archive.html'?(location.hash||'#lab'):'';
    location.replace(file==='archive.html'?'index.html'+hash:'index.html?tool='+encodeURIComponent(name));return;
  }
  document.documentElement.dataset.module=name;
  document.addEventListener('click',e=>{
    const link=e.target.closest('a[href]');if(!link||window.parent===window)return;
    const url=new URL(link.href,location.href);if(url.origin!==location.origin)return;
    e.preventDefault();parent.postMessage({type:'town:navigate',file:url.pathname.split('/').pop(),hash:url.hash},location.origin==='null'?'*':location.origin);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&parent!==window&&!document.querySelector('dialog[open]')){e.preventDefault();parent.postMessage({type:'town:close'},location.origin==='null'?'*':location.origin);}});
  document.addEventListener('DOMContentLoaded',()=>{
    // Decorative emoji from older modules are replaced by the common pixel art
    // in the parent window; their named labels and results remain readable.
    const strip=text=>text.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu,'');
    function clean(node){if(node.nodeType===3){if(node.parentElement?.closest('script,style,textarea'))return;const text=strip(node.nodeValue);if(text!==node.nodeValue)node.nodeValue=text;}else if(node.nodeType===1&&!node.matches('script,style,textarea'))for(const child of node.childNodes)clean(child);}
    clean(document.body);new MutationObserver(records=>records.forEach(r=>{if(r.type==='characterData')clean(r.target);else r.addedNodes.forEach(clean);})).observe(document.body,{childList:true,subtree:true,characterData:true});
  });
})();
