/* Prototype-only namespace. Synchronous head script; no storage means readable fallback. */
(function(){
 'use strict';
 var root=document.documentElement,base='/design-preview',prefs={};
 var query=new URLSearchParams(location.search);
 try{if(query.get('storage')!=='blocked')prefs=JSON.parse(localStorage.getItem('five-minutes-prototype-v1')||'{}')||{};}catch(_){}
 root.dataset.appearance=['light','dark'].includes(prefs.appearance)?prefs.appearance:'system';
 root.dataset.textSize=prefs.textSize==='large'?'large':'normal';
 root.dataset.activity=prefs.activity==='tokens'?'tokens':'modules';
 root.dataset.figure=prefs.figure==='none'?'none':'explain';
 var map={};map[base]='';map[base+'/library']='library';map[base+'/topics']='topics';map[base+'/search']='search';
 if(Object.prototype.hasOwnProperty.call(map,location.pathname)&&['adult','teen'].includes(prefs.edition)){
  var suffix=map[location.pathname];var target=base+'/editions/'+prefs.edition+(suffix?'/'+suffix:'');
  location.replace(target+location.search+location.hash);
 }
})();
