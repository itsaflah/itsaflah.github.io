const mob = () => window.innerWidth <= 768 || 'ontouchstart' in window;

/* LOADER */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('gone');
    initReveal();
  }, 1450);
});

/* CANVAS PARTICLES */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let pts = [], mouse = {x:-9999,y:-9999};

function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }

class Pt {
  constructor(){
    this.x = Math.random()*canvas.width; this.y = Math.random()*canvas.height;
    this.vx=(Math.random()-.5)*.28; this.vy=(Math.random()-.5)*.28;
    this.sz=Math.random()*1.4+.3;
    this.a=Math.random()*.35+.05; this.ba=this.a;
    this.c=Math.random()>.65?'200,169,110':'123,110,232';
  }
  tick(){
    this.x+=this.vx; this.y+=this.vy;
    if(this.x<0||this.x>canvas.width)this.vx*=-1;
    if(this.y<0||this.y>canvas.height)this.vy*=-1;
    if(!mob()){
      const dx=this.x-mouse.x,dy=this.y-mouse.y,d=Math.hypot(dx,dy);
      if(d<110){this.x+=dx/d*.7;this.y+=dy/d*.7;this.a=Math.min(.75,this.ba*(110/d));}
      else this.a+=(this.ba-this.a)*.05;
    }
  }
  draw(){ ctx.beginPath();ctx.arc(this.x,this.y,this.sz,0,Math.PI*2);ctx.fillStyle=`rgba(${this.c},${this.a})`;ctx.fill(); }
}

function initPts(){ pts=Array.from({length:mob()?55:110},()=>new Pt()); }

function frame(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const maxD=mob()?70:110;
  for(let i=0;i<pts.length;i++){
    pts[i].tick(); pts[i].draw();
    for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.hypot(dx,dy);
      if(d<maxD){ ctx.beginPath();ctx.strokeStyle=`rgba(200,169,110,${.055*(1-d/maxD)})`;ctx.lineWidth=.5;ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke(); }
    }
  }
  requestAnimationFrame(frame);
}
resize(); initPts(); frame();
window.addEventListener('resize',()=>{resize();initPts();});

/* CUSTOM CURSOR */
if(!mob()){
  const cur=document.getElementById('cursor'),ring=document.getElementById('cursor-ring');
  let cx=0,cy=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;cx=e.clientX;cy=e.clientY;});
  (function ac(){ rx+=(cx-rx)*.1;ry+=(cy-ry)*.1;
    cur.style.left=cx+'px';cur.style.top=cy+'px';ring.style.left=rx+'px';ring.style.top=ry+'px';
    requestAnimationFrame(ac); })();
  document.querySelectorAll('a,.s-ind').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('ch'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('ch'));
  });
}

/* SCROLL PROGRESS */
const prog=document.getElementById('prog');
window.addEventListener('scroll',()=>{
  const tot=document.documentElement.scrollHeight-innerHeight;
  prog.style.width=(scrollY/tot*100)+'%';
  updInd(); updMobNav();
},{ passive:true });

/* LIVE TIME */
function updTime(){
  const t=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false});
  const a=document.getElementById('dt-time'),b=document.getElementById('mob-time');
  if(a)a.textContent=t; if(b)b.textContent=t;
}
updTime(); setInterval(updTime,30000);

/* SCROLL REVEAL */
function initReveal(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el=e.target, d=parseInt(el.dataset.d||0)*75;
        setTimeout(()=>el.classList.add('vis'),d);
        obs.unobserve(el);
      }
    });
  },{threshold:.08});
  document.querySelectorAll('.card,.sh,.pill-row').forEach(el=>obs.observe(el));
}

/* DESKTOP 3D TILT */
if(!mob()){
  document.querySelectorAll('.card').forEach(c=>{
    c.addEventListener('mousemove',e=>{
      const r=c.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      c.style.transform=`perspective(700px) rotateY(${x*5}deg) rotateX(${-y*3.5}deg) translateY(-2px) scale(1.008)`;
    });
    c.addEventListener('mouseleave',()=>c.style.transform='');
  });
}

/* MOBILE RIPPLE + HAPTIC */
if(mob()){
  document.querySelectorAll('.card').forEach(c=>{
    c.addEventListener('touchstart',e=>{
      const t=e.touches[0],r=c.getBoundingClientRect();
      const rpl=document.createElement('div'); rpl.className='ripple';
      rpl.style.cssText=`left:${t.clientX-r.left}px;top:${t.clientY-r.top}px;width:${r.width}px;height:${r.width}px;margin-left:-${r.width/2}px;margin-top:-${r.width/2}px;`;
      c.appendChild(rpl); setTimeout(()=>rpl.remove(),620);
      if(navigator.vibrate)navigator.vibrate(9);
    },{passive:true});
  });
}

/* DESKTOP MAGNETIC PILLS */
if(!mob()){
  document.querySelectorAll('.pill').forEach(p=>{
    p.addEventListener('mousemove',e=>{
      const r=p.getBoundingClientRect();
      const x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2;
      p.style.transform=`translate(${x*.22}px,${y*.38}px) translateY(-2px)`;
    });
    p.addEventListener('mouseleave',()=>p.style.transform='');
  });
}

/* SECTION INDICATORS */
const SECS=['top','social','projects','writing'];
function updInd(){
  let cur='top';
  SECS.forEach(id=>{ const el=document.getElementById(id); if(el&&scrollY>=el.offsetTop-180)cur=id; });
  document.querySelectorAll('.s-ind').forEach(d=>d.classList.toggle('act',d.dataset.sec===cur));
}
document.querySelectorAll('.s-ind').forEach(d=>{
  d.addEventListener('click',()=>{ const t=document.getElementById(d.dataset.sec); if(t)t.scrollIntoView({behavior:'smooth'}); });
});

/* MOBILE NAV HIGHLIGHT */
function updMobNav(){
  let cur='#top';
  SECS.forEach(id=>{ const el=document.getElementById(id); if(el&&scrollY>=el.offsetTop-180)cur='#'+id; });
  document.querySelectorAll('.nb').forEach(b=>b.classList.toggle('act',b.getAttribute('href')===cur));
}

/* SMOOTH ANCHOR SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href').slice(1), t=document.getElementById(id);
    if(t){ e.preventDefault(); window.scrollTo({top:t.offsetTop-(mob()?76:0),behavior:'smooth'}); }
  });
});

/* ══════════════════════════════════════════════
   FAN CARD STACK — Vanilla JS port of CardStack
══════════════════════════════════════════════ */

const FAN_PROJECTS = [
  {
    id: 1,
    title: 'PPMHSS Kottukkara',
    description: 'School website · live concept by Aflah',
    tag: 'Education',
    href: 'https://school.aflah.online/',
    img: 'https://s.wordpress.com/mshots/v1/https%3A%2F%2Fschool.aflah.online%2F?w=640&h=400'
  },
  {
    id: 2,
    title: 'ForYou',
    description: 'Creative JS project · interactive surprise',
    tag: 'Creative',
    href: 'https://foryou.aflah.online/',
    img: 'https://s.wordpress.com/mshots/v1/https%3A%2F%2Fforyou.aflah.online%2F?w=640&h=400'
  },
  {
    id: 3,
    title: 'QUANTUM',
    description: 'Cyberpunk UI experiment',
    tag: 'Experiment',
    href: 'https://cyberweb.aflah.online/',
    img: 'https://s.wordpress.com/mshots/v1/https%3A%2F%2Fcyberweb.aflah.online%2F?w=640&h=400'
  },
  {
    id: 4,
    title: 'CreaVPN',
    description: 'Frontend UI demo · secure design',
    tag: 'UI Design',
    href: 'https://vpnweb.aflah.online/',
    img: 'https://s.wordpress.com/mshots/v1/https%3A%2F%2Fvpnweb.aflah.online%2F?w=640&h=400'
  },
  {
    id: 5,
    title: 'Blog — rvels',
    description: 'Study notes & tech writing',
    tag: 'Writing',
    href: 'https://rvels.aflah.online/',
    img: 'https://s.wordpress.com/mshots/v1/https%3A%2F%2Frvels.aflah.online%2F?w=640&h=400'
  }
];

class FanCards {
  constructor(stageEl, dotsEl, prevBtn, nextBtn, items, opts = {}) {
    this.stage   = stageEl;
    this.dotsEl  = dotsEl;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.items   = items;
    this.len     = items.length;
    this.active  = 0;
    this.hovering = false;
    this.timer   = null;

    // Config (mirrors the React component's props)
    this.o = Object.assign({
      maxVisible:    7,
      cardW:         480,
      cardH:         300,
      overlap:       0.48,
      spreadDeg:     46,
      depthOpacity:  true,
      activeLift:    22,
      activeScale:   1.04,
      inactiveScale: 0.93,
      loop:          true,
      autoAdvance:   true,
      intervalMs:    2800,
      pauseOnHover:  true
    }, opts);

    this._buildCards();
    this._buildDots();
    this._bindEvents();
    this._update();
    this._startAuto();
  }

  /* ─── DOM construction ─── */
  _buildCards() {
    this.cardEls = this.items.map((item, i) => {
      const el = document.createElement('a');
      el.className = 'fan-card';
      el.href      = item.href || '#';
      el.target    = '_blank';
      el.rel       = 'noopener noreferrer';
      el.setAttribute('aria-label', item.title);
      el.style.width  = this._cardW() + 'px';
      el.style.height = this._cardH() + 'px';

      const imgHTML = item.img
        ? `<img src="${item.img}" alt="${item.title}" loading="eager">`
        : `<div class="fc-img-placeholder">${item.title}</div>`;

      el.innerHTML = `
        <div class="fc-img">${imgHTML}</div>
        <div class="fc-grad"></div>
        <div class="fc-body">
          ${item.tag ? `<span class="fc-tag">${item.tag}</span>` : ''}
          <div class="fc-title">${item.title}</div>
          ${item.description ? `<div class="fc-desc">${item.description}</div>` : ''}
          <div class="fc-cta">
            Visit site
            <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </div>
        </div>`;

      // Click inactive cards → select them; active card → follow href
      el.addEventListener('click', e => {
        if (i !== this.active) {
          e.preventDefault();
          this._goto(i);
        }
      });

      this.stage.appendChild(el);
      return el;
    });
  }

  _buildDots() {
    this.dotEls = this.items.map((item, i) => {
      const btn = document.createElement('button');
      btn.className = 'fan-dot';
      btn.setAttribute('aria-label', `Go to ${item.title}`);
      btn.addEventListener('click', () => this._goto(i));
      this.dotsEl.appendChild(btn);
      return btn;
    });
  }

  /* ─── Responsive sizing — fluid based on actual stage width ─── */
  _stageW() {
    return this.stage.getBoundingClientRect().width || this.stage.offsetWidth || 320;
  }
  _cardW() {
    const sw = this._stageW();
    // Mobile: one card fills ~88% of stage; Desktop: capped at o.cardW or 70% of stage
    if (sw <= 480) return Math.round(sw * 0.82);
    if (sw <= 700) return Math.round(sw * 0.72);
    return Math.min(this.o.cardW, Math.round(sw * 0.68));
  }
  _cardH() {
    // 5:3 aspect ratio
    return Math.round(this._cardW() * 300 / 480);
  }
  _maxVis() {
    const sw = this._stageW();
    if (sw <= 480) return 1;   // mobile: only active card
    if (sw <= 700) return 3;   // tablet: active + 1 on each side
    return this.o.maxVisible;  // desktop: full fan
  }
  _spread() {
    const sw = this._stageW();
    if (sw <= 480) return 0;   // mobile: no rotation
    if (sw <= 700) return 22;  // tablet: subtle
    return this.o.spreadDeg;   // desktop: full spread
  }

  /* ─── Core layout update ─── */
  _update() {
    const { activeLift, activeScale, inactiveScale } = this.o;
    const maxOff  = Math.floor(this._maxVis() / 2);
    const cW      = this._cardW();
    const cH      = this._cardH();
    const overlap = maxOff === 0 ? 0 : this.o.overlap;
    const spacing = Math.round(cW * (1 - overlap));
    const stepDeg = maxOff > 0 ? this._spread() / maxOff : 0;
    // Sync stage height to card height + breathing room
    this.stage.style.height = (cH + 60) + 'px';

    this.cardEls.forEach((el, i) => {
      // Wrap-aware signed offset
      let off = i - this.active;
      if (this.o.loop && this.len > 1) {
        const alt = off > 0 ? off - this.len : off + this.len;
        if (Math.abs(alt) < Math.abs(off)) off = alt;
      }
      const abs     = Math.abs(off);
      const visible = abs <= maxOff;
      const isAct   = off === 0;

      el.style.visibility    = visible ? 'visible' : 'hidden';
      el.style.pointerEvents = visible ? 'auto' : 'none';
      el.style.zIndex        = 100 - abs;
      el.style.width         = cW + 'px';
      el.style.height        = cH + 'px';
      el.dataset.active      = isAct ? '1' : '0';

      const scale  = isAct ? activeScale : inactiveScale;
      const rotZ   = off * stepDeg;
      const tx     = off * spacing;
      // arc-down for side cards + active lift
      const ty     = abs * 8 + (isAct ? -activeLift : 0);
      // halve the standard margin so card centers in stage
      const ml     = -(cW / 2);

      el.style.marginLeft = ml + 'px';
      el.style.transform  = visible
        ? `translateX(${tx}px) translateY(${ty}px) rotateZ(${rotZ}deg) scale(${scale})`
        : `translateX(${tx}px) translateY(${ty + 20}px) rotateZ(${rotZ}deg) scale(${scale * 0.8})`;
      el.style.opacity = !visible ? '0' : isAct ? '1' : (0.55 + 0.35 * (1 - abs / maxOff)).toFixed(2);
    });

    // Dots
    this.dotEls.forEach((d, i) => d.classList.toggle('on', i === this.active));

    // Arrow states
    if (!this.o.loop) {
      this.prevBtn.disabled = this.active === 0;
      this.nextBtn.disabled = this.active === this.len - 1;
    }
  }

  /* ─── Navigation ─── */
  _wrap(n) { return ((n % this.len) + this.len) % this.len; }
  _goto(idx) { this.active = this._wrap(idx); this._update(); }
  next()  { this._goto(this.active + 1); }
  prev()  { this._goto(this.active - 1); }

  /* ─── Event binding ─── */
  _bindEvents() {
    // Arrow buttons
    this.nextBtn.addEventListener('click', () => this.next());
    this.prevBtn.addEventListener('click', () => this.prev());

    // Keyboard on stage
    this.stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft')  this.prev();
    });

    // Pointer drag (active card only) — velocity-based swipe
    let startX = null, startT = null;

    this.stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.fan-card')?.dataset.active !== '1') return;
      startX = e.clientX; startT = Date.now();
      this.stage.setPointerCapture(e.pointerId);
    });

    this.stage.addEventListener('pointerup', e => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      const dt = Math.max(1, Date.now() - startT);
      const v  = dx / dt; // px/ms
      const threshold = Math.min(120, this._cardW() * 0.2);
      if (dx > threshold || v > 0.5)  this.prev();
      else if (dx < -threshold || v < -0.5) this.next();
      startX = null; startT = null;
    });

    this.stage.addEventListener('pointercancel', () => { startX = null; });

    // Hover pause
    this.stage.addEventListener('mouseenter', () => { this.hovering = true; });
    this.stage.addEventListener('mouseleave', () => { this.hovering = false; });

    // Resize — update card sizes
    window.addEventListener('resize', () => this._update());

    // Cursor integration — register .fan-card links with the main cursor system
    if (!mob()) {
      this.cardEls.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
      });
      this.dotEls.forEach(d => {
        d.addEventListener('mouseenter', () => document.body.classList.add('ch'));
        d.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
      });
      [this.prevBtn, this.nextBtn].forEach(b => {
        b.addEventListener('mouseenter', () => document.body.classList.add('ch'));
        b.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
      });
    }
  }

  /* ─── Auto-advance ─── */
  _startAuto() {
    if (!this.o.autoAdvance) return;
    this.timer = setInterval(() => {
      if (this.o.pauseOnHover && this.hovering) return;
      this.next();
    }, Math.max(700, this.o.intervalMs));
  }

  destroy() { if (this.timer) clearInterval(this.timer); }
}

/* Bootstrap the fan cards after loader fades (reuse the same load gate) */
window.addEventListener('load', () => {
  setTimeout(() => {
    const stage   = document.getElementById('fan-stage');
    const dots    = document.getElementById('fan-dots');
    const prevBtn = document.getElementById('fan-prev');
    const nextBtn = document.getElementById('fan-next');

    if (stage && dots && prevBtn && nextBtn) {
      new FanCards(stage, dots, prevBtn, nextBtn, FAN_PROJECTS, {
        autoAdvance: true,
        intervalMs:  2800,
        loop:        true,
        pauseOnHover: true
      });
    }

    // Make the preview section dot visible in section indicators
    const secInd = document.getElementById('sec-ind');
    if (secInd && !secInd.querySelector('[data-sec="preview"]')) {
      const dot = document.createElement('div');
      dot.className = 's-ind';
      dot.dataset.sec = 'preview';
      dot.dataset.lbl = 'Preview';
      dot.addEventListener('click', () => {
        const t = document.getElementById('preview');
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      });
      // Insert before the projects dot
      const projDot = secInd.querySelector('[data-sec="projects"]');
      secInd.insertBefore(dot, projDot);
    }
  }, 1500);
});

