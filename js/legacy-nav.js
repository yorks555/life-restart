// Desktop navigation for preserved tools and collection pages.
(function(){
  const nav=document.createElement('nav');nav.className='legacy-desktop-nav';nav.setAttribute('aria-label','小镇与资料馆导航');
  const links=[['index.html','栖迟小镇 / 回到游戏'],['archive.html#lab','全部工具'],['archive.html#tujian','命运图鉴'],['archive.html#me','个人档案']];
  links.forEach(([href,text])=>{const a=document.createElement('a');a.href=href;a.textContent=text;nav.append(a);});document.body.prepend(nav);
})();
