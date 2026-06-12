/* 鮨 海の道 — 共通スクリプト（言語切替・ナビ・リビール） */

// ---------- JP / EN ----------
function setLang(l){
  document.documentElement.lang=l;
  try{localStorage.setItem('uminomichi-lang',l)}catch(e){}
  document.querySelectorAll('.lang-switch button').forEach(function(b){
    b.classList.toggle('on',b.dataset.lang===l);
  });
  var t=document.querySelector('title');
  if(t&&t.dataset[l])document.title=t.dataset[l];
}
(function(){
  var saved='ja';
  try{saved=localStorage.getItem('uminomichi-lang')||'ja'}catch(e){}
  setLang(saved);
  document.querySelectorAll('.lang-switch button').forEach(function(b){
    b.addEventListener('click',function(){setLang(b.dataset.lang)});
  });
})();

// ---------- ローダー ----------
(function(){
  var loader=document.getElementById('loader');
  if(!loader)return;
  window.addEventListener('load',function(){
    setTimeout(function(){loader.classList.add('done')},700);
  });
  setTimeout(function(){loader.classList.add('done')},3000);
})();

// ---------- ナビ・進捗 ----------
(function(){
  var nav=document.getElementById('nav');
  var progress=document.getElementById('progress');
  var lastY=0,ticking=false;
  function onScroll(){
    var y=window.scrollY;
    nav.classList.toggle('scrolled',y>60);
    nav.classList.toggle('away',y>420&&y>lastY&&!document.body.classList.contains('menu-open'));
    if(progress){
      var doc=document.documentElement;
      progress.style.width=(y/(doc.scrollHeight-window.innerHeight)*100)+'%';
    }
    lastY=y;ticking=false;
  }
  window.addEventListener('scroll',function(){
    if(!ticking){requestAnimationFrame(onScroll);ticking=true}
  },{passive:true});
  onScroll();
})();

// ---------- モバイルメニュー ----------
(function(){
  var burger=document.getElementById('burger');
  if(!burger)return;
  burger.addEventListener('click',function(){
    var open=document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded',open);
  });
  document.querySelectorAll('#mnav a').forEach(function(a){
    a.addEventListener('click',function(){
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded','false');
    });
  });
})();

// ---------- スクロールリビール ----------
(function(){
  var els=Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function check(){
    for(var i=els.length-1;i>=0;i--){
      var r=els[i].getBoundingClientRect();
      if(r.top<window.innerHeight*.92||r.bottom<0){
        els[i].classList.add('in');
        els.splice(i,1);
      }
    }
  }
  window.addEventListener('scroll',check,{passive:true});
  window.addEventListener('load',check);
  check();
})();

// ---------- 波と金粉（トップのみ） ----------
(function(){
  var cv=document.getElementById('waves');
  if(!cv)return;
  var ctx=cv.getContext('2d'),w,h,dpr,t=0,raf=null;
  function resize(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    w=cv.clientWidth;h=cv.clientHeight;
    cv.width=w*dpr;cv.height=h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();window.addEventListener('resize',resize,{passive:true});
  var layers=[
    {amp:14,len:.0045,speed:.012,y:.45,color:'rgba(168,128,53,0.28)',width:1.2},
    {amp:20,len:.0032,speed:.008,y:.58,color:'rgba(120,150,170,0.22)',width:1},
    {amp:26,len:.0024,speed:.005,y:.72,color:'rgba(168,128,53,0.18)',width:1},
    {amp:34,len:.0019,speed:.0035,y:.86,color:'rgba(166,58,40,0.1)',width:1}
  ];
  var motes=[];
  for(var i=0;i<36;i++){
    motes.push({x:Math.random(),y:Math.random(),r:.6+Math.random()*1.5,
      vy:.0004+Math.random()*.001,sway:6+Math.random()*18,
      phase:Math.random()*Math.PI*2,a:.1+Math.random()*.3});
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    layers.forEach(function(L,i){
      ctx.beginPath();
      for(var x=0;x<=w;x+=4){
        var y=h*L.y
          +Math.sin(x*L.len*2*Math.PI+t*L.speed*60+i*1.7)*L.amp
          +Math.sin(x*L.len*Math.PI+t*L.speed*22+i)*L.amp*.45;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle=L.color;ctx.lineWidth=L.width;ctx.stroke();
    });
    motes.forEach(function(m){
      m.y-=m.vy;
      if(m.y<-.02){m.y=1.02;m.x=Math.random()}
      var px=m.x*w+Math.sin(t*.8+m.phase)*m.sway;
      var py=m.y*h;
      var tw=.55+.45*Math.sin(t*2.2+m.phase*3);
      ctx.beginPath();
      ctx.arc(px,py,m.r,0,Math.PI*2);
      ctx.fillStyle='rgba(168,128,53,'+(m.a*tw).toFixed(3)+')';
      ctx.fill();
    });
    t+=1/60;
    raf=requestAnimationFrame(draw);
  }
  var hero=document.querySelector('.hero');
  if(hero&&'IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){if(!raf)draw()}
        else{cancelAnimationFrame(raf);raf=null}
      });
    },{threshold:0}).observe(hero);
  }
  draw();
})();
