// Animated art pieces for marissacodes.com (Art section).
// Framework free. Works in React, Vite, plain HTML.
//
//   import { mountPiece, PIECES } from './art-pieces.js';
//   const stop = mountPiece(el, PIECES.dollhouse, '/art/dollhouse.webp');
//   stop(); // on unmount
//
// Every overlay coordinate is in the artwork's own pixel space, so the effects
// stay locked to the art at any display size.

const NS = 'http://www.w3.org/2000/svg';

const CSS = `
.ap-wrap{perspective:1400px;width:100%;max-width:100%;touch-action:manipulation}
.ap-stage{position:relative;width:100%;transform-style:preserve-3d;
  transition:transform .5s cubic-bezier(.2,.7,.2,1);will-change:transform;cursor:pointer;
  box-shadow:0 40px 80px -30px rgba(0,0,0,.85),0 0 0 1px rgba(255,255,255,.05);border-radius:3px;overflow:hidden;
  animation:ap-float 9s ease-in-out infinite;outline:none}
.ap-stage:focus-visible{box-shadow:0 0 0 3px #fff,0 0 0 6px #e0112f}
.ap-stage.ap-active{animation:none}
.ap-stage>*{position:absolute;inset:0;width:100%;height:100%}
.ap-stage img{object-fit:cover;display:block;user-select:none;-webkit-user-drag:none;max-width:none}
.ap-stage svg,.ap-stage canvas{pointer-events:none;overflow:visible}
.ap-sheen{pointer-events:none;mix-blend-mode:soft-light;opacity:.55;
  background:radial-gradient(circle at var(--sx,30%) var(--sy,20%),rgba(255,240,240,.6),transparent 45%)}
.ap-vig{pointer-events:none;background:radial-gradient(ellipse at 50% 45%,transparent 55%,rgba(10,0,4,.55) 100%)}
.ap-grain{pointer-events:none;opacity:.12;mix-blend-mode:overlay;animation:ap-grain .9s steps(4) infinite;
  inset:-20% !important;width:140% !important;height:140% !important;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
.ap-slice{pointer-events:none;opacity:0}
.ap-stage.ap-glitch .ap-slice{animation:ap-slice .22s steps(2) infinite}
.ap-stage.ap-glitch .ap-slice.b{animation-duration:.31s;animation-direction:reverse}
.ap-stage.ap-glitch{animation:ap-shake .12s linear infinite}
.ap-stage.ap-glitch img.ap-base{filter:contrast(1.15) saturate(1.3)}
.ap-stage.ap-bless img.ap-base{filter:brightness(1.12) saturate(1.1);transition:filter .3s}
.ap-draw{stroke-dasharray:640;stroke-dashoffset:640;animation:ap-draw 4.5s ease-in-out infinite}
.ap-pulse{animation:ap-pulse 3.2s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
.ap-breathe{animation:ap-breathe 6s ease-in-out infinite}
.ap-flap{animation:ap-flap 2.4s ease-in-out infinite;transform-box:fill-box}
.ap-flap.l{transform-origin:100% 60%}.ap-flap.r{transform-origin:0% 60%;animation-delay:-.05s}
.ap-halo{animation:ap-halo 4s ease-in-out infinite}
@keyframes ap-float{0%,100%{transform:translateY(0) rotateX(0) rotateY(0)}50%{transform:translateY(-8px) rotateX(1.2deg) rotateY(-1.5deg)}}
@keyframes ap-grain{0%{transform:translate(0,0)}25%{transform:translate(-5%,3%)}50%{transform:translate(4%,-4%)}75%{transform:translate(-3%,-2%)}}
@keyframes ap-draw{0%{stroke-dashoffset:640;opacity:0}15%{opacity:1}55%{stroke-dashoffset:0;opacity:1}85%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes ap-pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.85;transform:scale(1.06)}}
@keyframes ap-breathe{0%,100%{opacity:.12}50%{opacity:.34}}
@keyframes ap-flap{0%,100%{opacity:.35;transform:scale(1,1) rotate(0)}50%{opacity:.75;transform:scale(1.08,1.04) rotate(-2deg)}}
@keyframes ap-halo{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes ap-shake{0%{transform:translate(0,0)}25%{transform:translate(-3px,2px)}50%{transform:translate(3px,-1px)}75%{transform:translate(-2px,-2px)}100%{transform:translate(0,0)}}
@keyframes ap-slice{0%{opacity:1;transform:translateX(-14px)}100%{opacity:1;transform:translateX(12px)}}
@media (prefers-reduced-motion:reduce){
  .ap-stage,.ap-draw,.ap-pulse,.ap-breathe,.ap-grain,.ap-flap,.ap-halo{animation:none !important}
  .ap-draw{stroke-dashoffset:0;opacity:.6}
}`;

function injectCSS() {
  if (document.getElementById('ap-css')) return;
  const s = document.createElement('style');
  s.id = 'ap-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

/* ------------------------------------------------------------------ */
/* Piece 1: the dollhouse                                              */
/* ------------------------------------------------------------------ */
const DOLL_EYES = [[805, 1315], [965, 1315]];
const DOLL_WINDOWS = [
  [252, 692, 216, 226],   // top left, dark eye
  [1046, 682, 212, 226],  // top right, engraved eye
  [252, 1302, 216, 228],  // middle left, eye photo
  [1196, 1290, 62, 100],  // middle right, the man peeking
];

const dollhouse = {
  id: 'dollhouse',
  w: 1640, h: 2360,
  alt: 'Collage: a vintage doll with red devil horns stands in front of a pink dollhouse inside a gothic arch, under red roses and two mirrored women in white lace, with eyes watching from the windows.',
  label: 'Tap to wake her up',
  mode: 'glitch',
  svg: () => `
    <defs>
      <filter id="dh-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
      <filter id="dh-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="dh-dg"><stop offset="0" stop-color="#ff1e3c"/><stop offset="1" stop-color="#ff1e3c" stop-opacity="0"/></radialGradient>
      <radialGradient id="dh-wg"><stop offset="0" stop-color="#ffd9a0"/><stop offset=".7" stop-color="#ff9a6a" stop-opacity=".5"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse class="ap-breathe dh-demon" cx="842" cy="330" rx="190" ry="250" fill="url(#dh-dg)" style="mix-blend-mode:screen"/>
    <g class="dh-wins">${DOLL_WINDOWS.map(([x, y, w, h]) => `<g>
      <rect x="${x - w * .25}" y="${y - h * .25}" width="${w * 1.5}" height="${h * 1.5}" fill="url(#dh-wg)" style="mix-blend-mode:screen" opacity="0"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1a0006" style="mix-blend-mode:multiply" opacity="0"/></g>`).join('')}</g>
    <g filter="url(#dh-glow)">
      <path class="ap-pulse" d="M662,915 C655,975 670,1045 710,1060 C735,1062 752,1040 755,1022 C715,1010 675,975 662,915 Z" fill="#e0112f"/>
      <path class="ap-pulse" style="animation-delay:-1.6s" d="M1067,915 C1074,975 1059,1045 1019,1060 C994,1062 977,1040 974,1022 C1014,1010 1054,975 1067,915 Z" fill="#e0112f"/>
    </g>
    <g class="dh-irises" style="opacity:0;transition:opacity .25s">
      ${DOLL_EYES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="27" fill="#ff0a2a" style="mix-blend-mode:color"/><circle cx="${x}" cy="${y}" r="34" fill="#ff0a2a" opacity=".55" filter="url(#dh-glow)" style="mix-blend-mode:screen"/>`).join('')}
    </g>
    <g class="dh-glints">
      ${DOLL_EYES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="#fff" opacity=".9"/><circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity=".7"/>`).join('')}
    </g>
    <path class="ap-draw" d="M138,2268 C96,2130 150,1995 318,1928" fill="none" stroke="#ff2d4d" stroke-width="12" stroke-linecap="round" filter="url(#dh-soft)"/>`,

  setup(svg) {
    const glints = [...svg.querySelectorAll('.dh-glints circle')];
    const wins = [...svg.querySelectorAll('.dh-wins > g')].map(g => ({
      light: g.children[0], dark: g.children[1], next: performance.now() + rand(800, 4800), seq: [],
    }));
    const look = (dx, dy) => glints.forEach((c, i) => {
      const [x, y] = DOLL_EYES[i >> 1];
      const k = i % 2 ? .45 : 1;
      c.setAttribute('cx', x + dx * 13 * k - 8 * (i % 2));
      c.setAttribute('cy', y + dy * 10 * k + 9 * (i % 2));
    });
    look(-.4, -.6);
    return {
      pointer(x, y) { look(clamp((x - 885) / 700, -1, 1), clamp((y - 1315) / 900, -1, 1)); },
      leave() { look(-.4, -.6); },
      activate() {
        svg.querySelector('.dh-irises').style.opacity = 1;
        const d = svg.querySelector('.dh-demon');
        d.style.animation = 'none'; d.style.opacity = .75;
      },
      deactivate() {
        svg.querySelector('.dh-irises').style.opacity = 0;
        const d = svg.querySelector('.dh-demon');
        d.style.animation = ''; d.style.opacity = '';
        wins.forEach(w => { w.light.setAttribute('opacity', 0); w.dark.setAttribute('opacity', 0); });
      },
      tick(now, active, reduce) {
        for (const w of wins) {
          if (active) {
            const on = Math.random() < .5;
            w.light.setAttribute('opacity', on ? .9 : 0);
            w.dark.setAttribute('opacity', on ? 0 : .8);
            continue;
          }
          if (reduce) continue;
          if (!w.seq.length && now > w.next) {
            w.seq = [[.55, 70], [0, 60], [.7, 90], [.1, 80], [.45, 900], [0, 0]];
            w.t = now;
            w.dark.setAttribute('opacity', Math.random() < .25 ? .5 : 0);
          }
          if (w.seq.length && now >= w.t) {
            const [o, d] = w.seq.shift();
            w.light.setAttribute('opacity', o);
            w.t = now + d;
            if (!w.seq.length) { w.next = now + rand(2500, 8500); w.dark.setAttribute('opacity', 0); }
          }
        }
      },
    };
  },

  // rose petals falling from the two roses
  particles: {
    count: 18,
    spawn(p, W, H, initial) {
      const left = Math.random() < .5;
      Object.assign(p, {
        x: left ? rand(60, 660) : rand(1000, 1560),
        y: initial ? rand(0, H) : rand(120, 540),
        vx: rand(-.3, .3), vy: rand(.6, 1.7), r: rand(30, 58),
        a: rand(0, 6.28), va: rand(-.02, .02), phase: rand(0, 6.28),
        hue: Math.random() < .8 ? rand(350, 358) : 340, l: rand(22, 40), life: 0,
      });
    },
    step(p, dt, ctx) {
      p.x += (p.vx + Math.sin(p.phase) * .9 + ctx.wind * 1.4 + (ctx.active ? Math.sin(ctx.now / 40 + p.r) * 6 : 0)) * dt;
      p.y += p.vy * dt * (ctx.active ? 3 : 1);
      return p.y > ctx.H + 60 || p.x < -80 || p.x > ctx.W + 80;
    },
    draw(c, p, s) {
      c.rotate(p.a);
      c.scale(1, .35 + Math.abs(Math.cos(p.phase * 1.3)) * .65);
      const r = p.r * s;
      const g = c.createRadialGradient(-r * .2, -r * .2, r * .1, 0, 0, r);
      g.addColorStop(0, `hsl(${p.hue} 85% ${p.l + 14}%)`);
      g.addColorStop(1, `hsl(${p.hue} 90% ${p.l}%)`);
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, -r);
      c.bezierCurveTo(r * .95, -r * .75, r * .8, r * .7, 0, r);
      c.bezierCurveTo(-r * .8, r * .7, -r * .95, -r * .75, 0, -r);
      c.fill();
    },
  },
};

/* ------------------------------------------------------------------ */
/* Piece 2: the angel                                                  */
/* ------------------------------------------------------------------ */
const EYE = [805, 545];
const HALO = { cx: 787, cy: 695, rx: 175, ry: 62 };
const CROSS = [1012, 1858];

const angel = {
  id: 'angel',
  w: 1441, h: 2160,
  alt: 'Collage: a woman in a sheer blue robe kneels on a red rose with cartoon angel wings and a yellow halo, beneath an engraved all-seeing eye, framed by black thorns, with a small gold crucifix at her knee.',
  label: 'Tap to bless her',
  mode: 'bless',
  svg: () => `
    <defs>
      <filter id="an-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
      <filter id="an-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="an-eg"><stop offset="0" stop-color="#fff6c8"/><stop offset=".5" stop-color="#ffe27a" stop-opacity=".35"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient>
      <radialGradient id="an-dark"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#050007" stop-opacity=".75"/></radialGradient>
    </defs>
    <rect class="an-thorn" x="0" y="0" width="1441" height="2160" fill="url(#an-dark)" style="mix-blend-mode:multiply;opacity:.4;transition:opacity .6s"/>
    <circle class="ap-breathe an-eye" cx="${EYE[0]}" cy="${EYE[1]}" r="330" fill="url(#an-eg)" style="mix-blend-mode:screen"/>
    <g class="an-iris">
      <circle cx="${EYE[0]}" cy="${EYE[1]}" r="11" fill="#111"/>
      <circle cx="${EYE[0]}" cy="${EYE[1]}" r="4" fill="#fff"/>
    </g>
    <g filter="url(#an-glow)" style="mix-blend-mode:screen">
      <path class="ap-flap l" d="M640,880 C560,800 420,790 360,860 C330,900 350,960 400,980 C360,1030 380,1100 440,1110 C470,1160 540,1180 600,1150 L640,1080 Z" fill="#9fd4ff"/>
      <path class="ap-flap r" d="M900,880 C980,800 1100,790 1145,860 C1170,900 1150,960 1110,980 C1140,1030 1120,1100 1070,1110 C1040,1160 980,1180 920,1150 L900,1080 Z" fill="#9fd4ff"/>
    </g>
    <ellipse class="ap-halo an-halo" cx="${HALO.cx}" cy="${HALO.cy}" rx="${HALO.rx}" ry="${HALO.ry}" fill="none" stroke="#fff3a6" stroke-width="44" filter="url(#an-glow)" style="mix-blend-mode:screen"/>
    <g class="an-glint" transform="translate(${CROSS[0]} ${CROSS[1]})" opacity="0">
      <path d="M0,-46 L7,-7 L46,0 L7,7 L0,46 L-7,7 L-46,0 L-7,-7 Z" fill="#fffbe0" filter="url(#an-soft)"/>
    </g>`,

  setup(svg) {
    const iris = svg.querySelector('.an-iris');
    const halo = svg.querySelector('.an-halo');
    const glint = svg.querySelector('.an-glint');
    const thorn = svg.querySelector('.an-thorn');
    let nextGlint = performance.now() + 1500, glintT = -1;
    const look = (dx, dy) => iris.setAttribute('transform', `translate(${dx * 38} ${dy * 16})`);
    look(0, .3);
    return {
      pointer(x, y) { look(clamp((x - EYE[0]) / 600, -1, 1), clamp((y - EYE[1]) / 900, -1, 1)); },
      leave() { look(0, .3); },
      activate() {
        halo.style.animation = 'none'; halo.style.opacity = 1; halo.setAttribute('stroke-width', 80);
        thorn.style.opacity = 0;
        glintT = performance.now();
      },
      deactivate() { halo.style.animation = ''; halo.style.opacity = ''; halo.setAttribute('stroke-width', 44); thorn.style.opacity = .4; },
      tick(now, active, reduce) {
        if (reduce) return;
        if (glintT < 0 && now > nextGlint) glintT = now;
        if (glintT >= 0) {
          const t = (now - glintT) / 700;
          if (t >= 1) { glintT = -1; nextGlint = now + rand(2500, 5000); glint.setAttribute('opacity', 0); }
          else {
            const s = Math.sin(t * Math.PI);
            glint.setAttribute('opacity', s);
            glint.setAttribute('transform', `translate(${CROSS[0]} ${CROSS[1]}) rotate(${t * 90}) scale(${.4 + s * .8})`);
          }
        }
      },
    };
  },

  // feathers drift down from the wings, gold motes rise from the rose
  particles: {
    count: 26,
    spawn(p, W, H, initial) {
      const feather = Math.random() < .45;
      if (feather) {
        const left = Math.random() < .5;
        Object.assign(p, {
          kind: 0, x: left ? rand(380, 620) : rand(920, 1120), y: initial ? rand(850, H) : rand(880, 1120),
          vx: rand(-.3, .3), vy: rand(.5, 1.1), r: rand(40, 62), a: rand(-.6, .6), va: 0, phase: rand(0, 6.28), life: 0,
        });
      } else {
        Object.assign(p, {
          kind: 1, x: rand(200, 1200), y: initial ? rand(300, H) : rand(1500, 2100),
          vx: rand(-.2, .2), vy: -rand(.5, 1.4), r: rand(5, 10), a: 0, va: 0, phase: rand(0, 6.28), life: 0,
        });
      }
    },
    step(p, dt, ctx) {
      const boost = ctx.active ? 3 : 1;
      if (p.kind === 0) {
        p.x += (p.vx + Math.sin(p.phase) * 1.6 + ctx.wind) * dt;
        p.y += p.vy * dt * boost;
        p.a = Math.sin(p.phase) * .7;
        return p.y > ctx.H + 60;
      }
      p.x += (p.vx + Math.sin(p.phase * 1.7) * .4 + ctx.wind * .6) * dt;
      p.y += p.vy * dt * boost;
      return p.y < 200;
    },
    draw(c, p, s) {
      if (p.kind === 1) {
        const r = p.r * s * (1 + .3 * Math.sin(p.phase * 4));
        const g = c.createRadialGradient(0, 0, 0, 0, 0, r * 3);
        g.addColorStop(0, 'rgba(255,248,200,1)');
        g.addColorStop(.3, 'rgba(255,220,120,.7)');
        g.addColorStop(1, 'rgba(255,200,80,0)');
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, r * 3, 0, 6.29); c.fill();
        return;
      }
      c.rotate(p.a);
      const r = p.r * s;
      c.fillStyle = 'rgba(236,246,255,.95)';
      c.strokeStyle = 'rgba(120,190,245,.9)';
      c.lineWidth = Math.max(1, 2.2 * s * 1.5);
      c.beginPath();
      c.moveTo(0, -r);
      c.bezierCurveTo(r * .55, -r * .6, r * .45, r * .5, 0, r);
      c.bezierCurveTo(-r * .45, r * .5, -r * .55, -r * .6, 0, -r);
      c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0, -r * .8); c.lineTo(0, r * 1.25); c.stroke();
    },
  },
};

export const PIECES = { dollhouse, angel };

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */
export function mountPiece(root, piece, src) {
  injectCSS();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { w: W, h: H } = piece;

  root.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'ap-wrap';
  const stage = document.createElement('div');
  stage.className = 'ap-stage';
  stage.style.aspectRatio = `${W} / ${H}`;
  stage.tabIndex = 0;
  stage.setAttribute('role', 'button');
  stage.setAttribute('aria-label', `${piece.alt} ${piece.label}.`);
  wrap.appendChild(stage);
  root.appendChild(wrap);

  const img = new Image();
  img.src = src; img.alt = ''; img.className = 'ap-base'; img.draggable = false;
  stage.appendChild(img);

  if (piece.mode === 'glitch') {
    [['a', 'inset(34% 0 52% 0)'], ['b', 'inset(61% 0 27% 0)']].forEach(([c, clip]) => {
      const s = img.cloneNode();
      s.className = 'ap-slice ' + c; s.style.clipPath = clip;
      stage.appendChild(s);
    });
  }

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = piece.svg();
  stage.appendChild(svg);
  const fx = piece.setup(svg);

  const canvas = document.createElement('canvas');
  stage.appendChild(canvas);
  for (const cls of ['ap-sheen', 'ap-vig', 'ap-grain']) {
    const d = document.createElement('div'); d.className = cls; stage.appendChild(d);
  }

  const c = canvas.getContext('2d');
  let scale = 1;
  const resize = () => {
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    scale = canvas.width / W;
  };
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();

  const P = piece.particles;
  const parts = Array.from({ length: P.count }, () => { const p = {}; P.spawn(p, W, H, true); return p; });

  let wind = 0, over = false, activeUntil = 0, wasActive = false, visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(stage);

  let raf, last = performance.now();
  const tick = now => {
    raf = requestAnimationFrame(tick);
    if (!visible) { last = now; return; }
    const dt = Math.min(2, (now - last) / 16.67); last = now;
    const active = now < activeUntil;
    if (wasActive && !active) {
      wasActive = false;
      stage.classList.remove('ap-glitch', 'ap-bless');
      fx.deactivate();
    }
    c.clearRect(0, 0, canvas.width, canvas.height);
    if (!reduce) {
      const ctx = { now, active, wind: over ? wind : 0, W, H };
      for (const p of parts) {
        p.life += dt; p.phase += .03 * dt; p.a += p.va * dt;
        if (P.step(p, dt, ctx)) P.spawn(p, W, H, false);
        c.save();
        c.globalAlpha = Math.min(1, p.life / 40) * .92;
        c.translate(p.x * scale, p.y * scale);
        P.draw(c, p, scale);
        c.restore();
      }
    }
    fx.tick(now, active, reduce);
  };
  raf = requestAnimationFrame(tick);

  const onMove = e => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    over = true; wind = x - .5;
    stage.classList.add('ap-active');
    if (!reduce && performance.now() > activeUntil) {
      stage.style.transform = `rotateY(${(x - .5) * 12}deg) rotateX(${-(y - .5) * 9}deg) scale(1.015)`;
    }
    stage.style.setProperty('--sx', `${x * 100}%`);
    stage.style.setProperty('--sy', `${y * 100}%`);
    fx.pointer(x * W, y * H);
  };
  const onLeave = () => {
    over = false; wind = 0;
    stage.style.transform = '';
    stage.classList.remove('ap-active');
    fx.leave();
  };
  const activate = () => {
    activeUntil = performance.now() + 1800;
    wasActive = true;
    stage.style.transform = '';
    stage.classList.add(piece.mode === 'glitch' ? 'ap-glitch' : 'ap-bless');
    fx.activate();
  };
  const onKey = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } };

  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerleave', onLeave);
  stage.addEventListener('click', activate);
  stage.addEventListener('keydown', onKey);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect(); io.disconnect();
    root.innerHTML = '';
  };
}
