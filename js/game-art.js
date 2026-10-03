// A single pixel icon vocabulary for town, menus, events and collections.
(function(root){
  const art={
    leaf:'<path fill="#7b9866" d="M3 10V6h2V4h8v6h-2v2H5v-2z"/><path fill="#496a46" d="M3 13h2v-2h2V9h2V7h2V5h2V3h1v3h-2v2h-2v2H8v2H6v2H3z"/>',
    coin:'<path fill="#ac8950" d="M4 2h8v2h2v8h-2v2H4v-2H2V4h2z"/><path fill="#d9bd7c" d="M5 3h6v2h2v6h-2v2H5v-2H3V5h2z"/><path fill="#94774c" d="M7 5h3v2H8v2h3v2H6V9h1z"/>',
    book:'<path fill="#6e8d88" d="M2 3h5l1 1 1-1h5v10H9l-1 1-1-1H2z"/><path fill="#e7d9b3" d="M3 4h4v8H3zm6 0h4v8H9z"/><path fill="#b8ab85" d="M4 6h2v1H4zm0 3h2v1H4zm6-3h2v1h-2zm0 3h2v1h-2z"/>',
    chat:'<path fill="#81936c" d="M2 3h12v8H8v2H6v1H4v-3H2z"/><path fill="#e5e3be" d="M4 5h8v1H4zm0 3h5v1H4z"/>',
    star:'<path fill="#c5a66c" d="M7 1h2v4h2v1h4v2h-4v2H9v5H7v-5H5V8H1V6h4V5h2z"/><path fill="#ebd6a0" d="M7 5h2v4H7z"/>',
    bag:'<path fill="#ad9270" d="M5 1h6v2h2v2h1v9H2V5h1V3h2z"/><path fill="#ddc59c" d="M4 5h8v7H4z"/><path fill="#827759" d="M6 7h4v1H6zm-1 3h6v1H5z"/>',
    heart:'<path fill="#b57e65" d="M2 3h4v2h4V3h4v6h-2v2h-2v2H6v-2H4V9H2z"/><path fill="#dba389" d="M3 4h2v3H3zm2 4h2v2H5z"/>',
    home:'<path fill="#947b58" d="M2 7h12v7H2z"/><path fill="#b8785b" d="M1 6h2V4h2V2h6v2h2v2h2v2H1z"/><path fill="#decfa6" d="M3 8h10v5H3z"/><path fill="#7e765c" d="M7 9h3v5H7z"/>',
    compass:'<path fill="#7f998b" d="M4 2h8v2h2v8h-2v2H4v-2H2V4h2z"/><path fill="#ddd4ad" d="M5 4h6v1h1v6h-1v1H5v-1H4V5h1z"/><path fill="#ac765c" d="M8 5h3v2H9v2H7v2H5V8h2V6h1z"/>',
    lock:'<path fill="#9ca88a" d="M5 2h6v2h2v4h1v6H2V8h1V4h2z"/><path fill="#efedda" d="M6 4h4v4H6z"/><path fill="#718060" d="M7 10h2v2H7z"/>',
    moon:'<path fill="#91a19b" d="M5 2h6v2H9v2H7v4h2v2h4v2H5v-2H3V4h2z"/>',
    scroll:'<path fill="#a99169" d="M3 2h11v12H3V4H1V2z"/><path fill="#e4d3aa" d="M4 3h8v10H4z"/><path fill="#a9956d" d="M5 5h5v1H5zm0 3h5v1H5zm0 3h3v1H5z"/>'
  };
  const map={ordinary:'home',market:'coin',memory:'book',night:'moon',social:'chat',thick:'leaf',save:'coin',optimist:'heart',scavenge:'compass',luck:'star',body:'leaf',money:'coin',mood:'heart',knowledge:'book',study:'book',work:'coin',rest:'home',adventure:'compass',odd:'star',shareholder:'scroll',scholar:'book',wealth:'coin',dance:'star',debt:'leaf',treasure:'bag',calm:'leaf'};
  function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 16 16');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','pixel-icon');svg.setAttribute('shape-rendering','crispEdges');svg.innerHTML=art[map[name]||name]||art.leaf;return svg;}
  root.GameArt={icon};
})(globalThis);
