// A single soft illustrated icon vocabulary for town, menus, events and collections.
(function(root){
  const art={
    leaf:'<path fill="#a9bd8b" d="M3 12C2 4 7 2 14 2c0 7-3 11-9 11"/><path d="M2 14 11 5m-5 6V7m2 2h3"/>',
    coin:'<circle cx="8" cy="8" r="6" fill="#dec394"/><path d="M9.5 5.2H7a1.4 1.4 0 0 0 0 2.8h2a1.4 1.4 0 0 1 0 2.8H6.5M8 4v8"/>',
    book:'<path fill="#eee3ca" d="M2 3.5c2-1 4-1 6 .5 2-1.5 4-1.5 6-.5v9c-2-1-4-1-6 .5-2-1.5-4-1.5-6-.5Z"/><path d="M8 4v9m-4-7h2m4 0h2M4 8h2m4 0h2"/>',
    chat:'<path fill="#becbab" d="M5 2.5h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H7l-3 2v-2a3 3 0 0 1-2-3v-4a3 3 0 0 1 3-3Z"/><path d="M5 6h6M5 9h4"/>',
    star:'<path fill="#e2c88f" d="m8 1.5 2 4.3 4.5.6-3.3 3.2.8 4.5-4-2.2-4 2.2.8-4.5L1.5 6.4l4.5-.6Z"/>',
    bag:'<rect x="3" y="4" width="10" height="10" rx="2" fill="#d3b692"/><path d="M5.5 4V3a2.5 2.5 0 0 1 5 0v1M3 7h10M6 10h4"/>',
    heart:'<path fill="#d5a38c" d="M8 13.5C-3 7.5 3-.7 8 4c5-4.7 11 3.5 0 9.5Z"/>',
    home:'<path fill="#e7d7b7" d="M3 7h10v7H3Z"/><path fill="#bb947b" d="m1.5 7 4-5h5l4 5Z"/><path d="M6.5 14v-4h3v4M4.5 8.5h1"/>',
    compass:'<circle cx="8" cy="8" r="6" fill="#cad8c9"/><path fill="#c09a7c" d="m10.5 5.5-1 4-4 1 1-4Z"/>',
    lock:'<rect x="3" y="7" width="10" height="7" rx="2" fill="#c7cbb8"/><path d="M5 7V5a3 3 0 0 1 6 0v2M8 10v2"/>',
    moon:'<path fill="#adbdc4" d="M11.5 2.5C3-.2-.8 10.4 7 13.5a6 6 0 0 0 7-3C8.5 12 5.5 5 11.5 2.5Z"/>',
    scroll:'<path fill="#e5d4b0" d="M3 2h9v12H4V4H2V2Z"/><path d="M6 5h4M6 8h4M6 11h2"/>'
  };
  const map={ordinary:'home',market:'coin',memory:'book',night:'moon',social:'chat',thick:'leaf',save:'coin',optimist:'heart',scavenge:'compass',luck:'star',body:'leaf',money:'coin',mood:'heart',knowledge:'book',study:'book',work:'coin',rest:'home',adventure:'compass',odd:'star',shareholder:'scroll',scholar:'book',wealth:'coin',dance:'star',debt:'leaf',treasure:'bag',calm:'leaf'};
  function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 16 16');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','pixel-icon');svg.setAttribute('fill','none');svg.setAttribute('stroke','#7c8066');svg.setAttribute('stroke-width','1');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.innerHTML=art[map[name]||name]||art.leaf;return svg;}
  root.GameArt={icon};
})(globalThis);
