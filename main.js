import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

/* ============================================================
   MALAMAXING 麻辣烫 - a playable low-poly 3D malatang shop
   Realism grounding (from public sources):
   - by-weight malatang shops charge ~S$2.4-2.98 / 100 g
   - Zhang Liang: S$2.88/100 g with a 300 g minimum bowl
   - most diners build a 450-600 g bowl
   Portion grams below are realistic per-grab estimates
   (e.g. fish ball ~20 g, quail egg ~10 g, noodle cake ~85 g).
   ============================================================ */

// ---------- palette ----------
const C = {
  cream: 0xf7ecda, paper: 0xfdf6e9,
  terra: 0xc1502f, terraD: 0x9c3b20, ink: 0x5a3b28,
  wood: 0xb98a5e, woodD: 0x8a5f3a, floor: 0xe8d3ae,
  pink: 0xe86a8a, steel: 0xb9bfc6, fridgeIn: 0xfef6e6,
  sky: 0xf9efe0,
};

// Real-shop rates, normalized per 100 g (sources in README):
//  - YGF Malatang Barcelona: EUR 2.19/100 g, 400 g minimum (2024 press)
//  - Yangguofu Malatang Berlin: EUR 3.19/100 g (official menu)
//  - YGF Malatang NYC: USD 15/lb = USD 3.31/100 g (Eater NY, 2024)
//  - Bone Soup Malatang Toronto: CAD 3.50/100 g, ~400 g minimum (2026 report)
const SHOPS = [
  { id:'es', flag:'🇪🇸', city:'Barcelona', name:'YGF Malatang', rate:2.19, cur:'€', min:400 },
  { id:'de', flag:'🇩🇪', city:'Berlin',    name:'Yangguofu Malatang', rate:3.19, cur:'€', min:300 },
  { id:'us', flag:'🇺🇸', city:'New York',  name:'YGF Malatang', rate:3.31, cur:'$', min:340 },
  { id:'ca', flag:'🇨🇦', city:'Toronto',   name:'Bone Soup Malatang', rate:3.50, cur:'CA$', min:400 },
];
function rate() { return G.shop.rate; }
function minG() { return G.shop.min; }
function fmt(p) { return G.shop.cur + p.toFixed(2); }

// ---------- ingredients (5 shelves x 6 trays) ----------
const SHELVES = [
  [ // greens & veg
    { id:'bokchoy',  name:'Bok Choy',    cn:'上海青', color:0x4f9b4f, g:60, shape:'leaf'  },
    { id:'napa',     name:'Napa Cabbage',cn:'白菜',   color:0x9cc47a, g:50, shape:'leaf'  },
    { id:'broccoli', name:'Broccoli',    cn:'西兰花', color:0x3f7d3a, g:45, shape:'ball'  },
    { id:'corn',     name:'Corn',        cn:'玉米',   color:0xf2c14e, g:50, shape:'stick' },
    { id:'potato',   name:'Potato',      cn:'土豆',   color:0xd9b06a, g:40, shape:'slice' },
    { id:'lotus',    name:'Lotus Root',  cn:'藕片',   color:0xe8d9c0, g:40, shape:'slice' },
  ],
  [ // mushrooms & tofu
    { id:'enoki',    name:'Enoki',       cn:'金针菇', color:0xf0e6d0, g:50, shape:'stick' },
    { id:'woodear',  name:'Wood Ear',    cn:'木耳',   color:0x4a3a30, g:20, shape:'leaf'  },
    { id:'kelp',     name:'Kelp',        cn:'海带',   color:0x2f5d4a, g:30, shape:'slice' },
    { id:'tofupuff', name:'Tofu Puff',   cn:'油豆腐', color:0xe8b45a, g:30, shape:'cube'  },
    { id:'frozentofu',name:'Frozen Tofu',cn:'冻豆腐', color:0xf5efdf, g:40, shape:'cube'  },
    { id:'porkblood',name:'Pork Blood',  cn:'猪血',   color:0x6e2a2a, g:40, shape:'cube'  },
  ],
  [ // noodles & staples
    { id:'glass',    name:'Sweet Potato Noodles',cn:'红薯粉', color:0xeef2f0, g:50, shape:'nest'  },
    { id:'instant',  name:'Instant Noodles',cn:'方便面',color:0xf0cf7a, g:85, shape:'nest' },
    { id:'ricecake', name:'Rice Cake',   cn:'年糕',   color:0xf8f4ec, g:60, shape:'stick' },
    { id:'quail',    name:'Quail Egg',   cn:'鹌鹑蛋', color:0xf3e9d8, g:30, shape:'ball'  },
    { id:'luncheon', name:'Luncheon Meat',cn:'午餐肉',color:0xd98a86, g:50, shape:'slice' },
    { id:'sausage',  name:'Sausage',     cn:'香肠',   color:0xb4503c, g:45, shape:'stick' },
  ],
  [ // seafood 1
    { id:'fishtofu', name:'Fish Tofu',   cn:'鱼豆腐', color:0xf2e3b3, g:45, shape:'cube'  },
    { id:'crab',     name:'Crab Stick',  cn:'蟹棒',   color:0xf08a6a, g:45, shape:'stick' },
    { id:'fishball', name:'Fish Ball',   cn:'鱼丸',   color:0xf0e8dc, g:40, shape:'ball'  },
    { id:'cuttlefish',name:'Cuttlefish', cn:'墨鱼仔', color:0xe8e0ee, g:40, shape:'ball'  },
    { id:'shrimp',   name:'Shrimp',      cn:'虾',     color:0xf28a5a, g:45, shape:'ball'  },
    { id:'octopus',  name:'Octopus',     cn:'八爪鱼', color:0xc98a9a, g:50, shape:'ball'  },
  ],
  [ // seafood 2 & meat
    { id:'clam',     name:'Clam',        cn:'蛤蜊',   color:0xc9b49a, g:40, shape:'ball'  },
    { id:'mussel',   name:'Mussel',      cn:'青口',   color:0x5a6a7a, g:45, shape:'ball'  },
    { id:'lamb',     name:'Lamb',        cn:'羊肉卷', color:0xc96a6a, g:50, shape:'slice' },
    { id:'beef',     name:'Beef',        cn:'牛肉',   color:0xa84a4a, g:50, shape:'slice' },
    { id:'cuttleball',name:'Cuttlefish Ball',cn:'墨鱼丸',color:0xe4d8e8, g:40, shape:'ball' },
    { id:'tofuskin', name:'Tofu Skin',   cn:'豆腐皮', color:0xecd9a8, g:30, shape:'slice' },
  ],
];
const ING = {}; SHELVES.flat().forEach(i => ING[i.id] = i);
const TRAYPOS = {};

const BROTHS = [
  { id:'red',    name:'Classic Spicy Red', cn:'经典红汤' },
  { id:'tomato', name:'Tomato',            cn:'番茄汤'   },
  { id:'bone',   name:'Golden Bone',       cn:'金汤'     },
  { id:'dry',    name:'Dry Mala',          cn:'干拌'     },
];
const SPICES = [
  { id:'mild',   name:'Mild',   cn:'微辣' },
  { id:'medium', name:'Medium', cn:'中辣' },
  { id:'extra',  name:'Extra',  cn:'特辣' },
];
const GUEST_NAMES = ['Wei','Lena','Marc','Aisha','Pau','Sofia','Jon','Marta','Chen','Nora','Oriol','Liu','Anna','Ravi','Júlia','Kenji'];

// ---------- renderer ----------
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(C.sky);
scene.fog = new THREE.Fog(C.sky, 18, 42);

const camera = new THREE.PerspectiveCamera(innerWidth/innerHeight < 0.75 ? 74 : 62, innerWidth/innerHeight, 0.1, 100);

// lights
const hemi = new THREE.HemisphereLight(0xfff4e0, 0xd8bd96, 0.85); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 1.35);
sun.position.set(6, 10, 8); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
sun.shadow.bias = -0.0004;
scene.add(sun);
const warmIn = new THREE.PointLight(0xffd9a0, 0.0, 12, 1.6); warmIn.position.set(0, 2.9, 0); scene.add(warmIn);

// ---------- helpers ----------
function box(w, h, d, color, opts = {}) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: opts.rough ?? 0.85, metalness: opts.metal ?? 0.02,
      transparent: !!opts.transparent, opacity: opts.opacity ?? 1, emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 1 })
  );
  m.castShadow = opts.cast ?? true; m.receiveShadow = opts.receive ?? true;
  return m;
}
function cyl(rt, rb, h, color, seg = 20, opts = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg),
    new THREE.MeshStandardMaterial({ color, roughness: opts.rough ?? 0.8, metalness: opts.metal ?? 0.02,
      transparent: !!opts.transparent, opacity: opts.opacity ?? 1, emissive: opts.emissive ?? 0x000000 }));
  m.castShadow = opts.cast ?? true; m.receiveShadow = opts.receive ?? true;
  return m;
}
function sph(r, color, opts = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14),
    new THREE.MeshStandardMaterial({ color, roughness: opts.rough ?? 0.75, metalness: 0.02,
      transparent: !!opts.transparent, opacity: opts.opacity ?? 1 }));
  m.castShadow = opts.cast ?? true; m.receiveShadow = opts.receive ?? true;
  return m;
}
function textTexture(lines, { w = 512, h = 256, bg = null, fg = '#5a3b28', font = 'bold 64px "Trebuchet MS", sans-serif', small = null, pad = 20 } = {}) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  const arr = Array.isArray(lines) ? lines : [lines];
  g.font = font;
  const lh = h / arr.length;
  arr.forEach((t, i) => {
    if (small && i > 0) g.font = small;
    g.fillText(t, w / 2, lh * (i + 0.5), w - pad * 2);
  });
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
  return tx;
}
function planeWith(tex, w, h, opts = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9,
      emissive: opts.emissive ?? 0x000000, emissiveIntensity: opts.ei ?? 0.4,
      emissiveMap: opts.emissive ? tex : null }));
  m.castShadow = false; m.receiveShadow = false;
  return m;
}
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];

// ---------- clickables ----------
const clickables = [];
function clickable(mesh, data) { mesh.userData.act = data; clickables.push(mesh); return mesh; }

/* ============================================================
   EXTERIOR
   ============================================================ */
const exterior = new THREE.Group(); scene.add(exterior);
const interiorVisInit = () => {}; // visibility managed below
{
  const street = box(40, 0.1, 10, 0xcbb79b, { cast:false }); street.position.set(0, -0.05, 6.5); exterior.add(street);
  const walk = box(40, 0.12, 4, 0xe6d4b4, { cast:false }); walk.position.set(0, 0, 0.8); exterior.add(walk);

  const wall = box(11, 4.6, 0.4, C.cream, { cast:false }); wall.position.set(0, 2.3, -1); exterior.add(wall);
  const base = box(11.2, 0.5, 0.5, C.terraD, { cast:false }); base.position.set(0, 0.25, -0.95); exterior.add(base);

  // terracotta sign
  const sign = box(8.6, 1.15, 0.28, C.terra); sign.position.set(0, 3.75, -0.72); exterior.add(sign);
  const signTex = textTexture(['MALAMAXING', '麻 辣 烫'], { w: 1024, h: 256, bg: '#c1502f', fg: '#f7ecda', font: 'bold 92px "Trebuchet MS", sans-serif', small: '64px "Trebuchet MS", sans-serif' });
  const signFace = planeWith(signTex, 8.2, 1.0, { emissive: 0xffffff, ei: 0.25 });
  signFace.position.set(0, 3.75, -0.565); exterior.add(signFace);

  // window glow
  const winFrame = box(4.9, 2.5, 0.08, C.woodD, { cast:false }); winFrame.position.set(-2.2, 1.7, -0.83); exterior.add(winFrame);
  const win = box(4.6, 2.2, 0.1, 0xffe9c4, { emissive: 0xffd9a0, emissiveIntensity: 0.7, cast:false });
  win.position.set(-2.2, 1.7, -0.76); exterior.add(win);

  // door
  const doorFrame = box(1.7, 2.7, 0.14, C.woodD, { cast:false }); doorFrame.position.set(2.9, 1.35, -0.8); exterior.add(doorFrame);
  const door = box(1.3, 2.4, 0.1, C.terra); door.position.set(2.9, 1.2, -0.72); exterior.add(door);
  const doorGlass = box(0.9, 1.2, 0.04, 0xffe9c4, { emissive: 0xffd9a0, emissiveIntensity: 0.6 }); doorGlass.position.set(2.9, 1.65, -0.66); exterior.add(doorGlass);
  clickable(door, { type: 'enter' }); clickable(doorGlass, { type: 'enter' }); clickable(doorFrame, { type: 'enter' });

  // awning
  const awn = box(6.4, 0.1, 1.4, C.terra, { cast:false }); awn.position.set(-1.2, 2.95, -0.1); awn.rotation.x = 0.28; exterior.add(awn);
  for (let i = 0; i < 6; i++) { const s = box(0.5, 0.02, 1.35, C.cream, { cast:false }); s.position.set(-3.9 + i * 1.1, 2.96, -0.09); s.rotation.x = 0.28; exterior.add(s); }

  // planters
  [-4.6, 4.6].forEach(x => {
    const pot = cyl(0.35, 0.28, 0.5, C.terra); pot.position.set(x, 0.25, 0.6); exterior.add(pot);
    const bush = sph(0.42, 0x6f9b57); bush.position.set(x, 0.85, 0.6); exterior.add(bush);
    const bush2 = sph(0.28, 0x86ad66); bush2.position.set(x + 0.2, 1.1, 0.5); exterior.add(bush2);
  });

  // neighbours
  [[-9.5, 0xd9c4a2], [9.5, 0xd3b894]].forEach(([x, c]) => {
    const b = box(7.5, 5.2, 0.6, c, { cast:false }); b.position.set(x, 2.6, -1.2); exterior.add(b);
    const r = box(7.9, 0.4, 0.9, 0x9c5f3a, { cast:false }); r.position.set(x, 5.3, -1.1); exterior.add(r);
  });

  // street lamp
  const pole = cyl(0.06, 0.08, 3.6, 0x6b5642); pole.position.set(-5.8, 1.8, 2.2); exterior.add(pole);
  const lampBall = sph(0.22, 0xffe2ae, { cast:false }); lampBall.material.emissive = new THREE.Color(0xffc978); lampBall.position.set(-5.8, 3.7, 2.2); exterior.add(lampBall);
}

/* ============================================================
   INTERIOR
   ============================================================ */
const interior = new THREE.Group(); interior.visible = false; scene.add(interior);
const ROOM = { x: 4.5, h: 3.4 };
let lcdTex, lcdCtx, lcdCanvasRef;

function drawLCD(weightG, priceE) {
  const g = lcdCtx; if (!g) return;
  g.fillStyle = '#1e3a24'; g.fillRect(0, 0, 512, 192);
  g.strokeStyle = '#2e5c38'; g.lineWidth = 8; g.strokeRect(6, 6, 500, 180);
  g.fillStyle = '#8dff9a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 74px "Courier New", monospace';
  g.fillText(`${weightG} g`, 256, 60);
  g.font = 'bold 54px "Courier New", monospace';
  g.fillText(`${(typeof G !== 'undefined' && G.shop) ? G.shop.cur : '€'}${priceE.toFixed(2)}`, 256, 140);
  lcdTex.needsUpdate = true;
}

{
  const floor = box(ROOM.x * 2 + 0.4, 0.12, 9.4, C.floor, { cast:false }); floor.position.set(0, -0.06, 0); interior.add(floor);
  for (let i = -4; i <= 4; i++) {
    const l1 = box(0.03, 0.005, 9.2, 0xd9c39c, { cast:false }); l1.position.set(i, 0.005, 0); interior.add(l1);
    const l2 = box(9.2, 0.005, 0.03, 0xd9c39c, { cast:false }); l2.position.set(0, 0.005, i); interior.add(l2);
  }
  const wallB = box(9.4, ROOM.h, 0.25, C.cream, { cast:false }); wallB.position.set(0, ROOM.h / 2, -4.5); interior.add(wallB);
  const wallL = box(0.25, ROOM.h, 9.4, C.cream, { cast:false }); wallL.position.set(-4.7, ROOM.h / 2, 0); interior.add(wallL);
  const wallR = box(0.25, ROOM.h, 9.4, C.cream, { cast:false }); wallR.position.set(4.7, ROOM.h / 2, 0); interior.add(wallR);
  const wallF = box(9.4, ROOM.h, 0.25, C.cream, { cast:false }); wallF.position.set(0, ROOM.h / 2, 4.5); interior.add(wallF);
  const ceil = box(9.4, 0.15, 9.4, 0xfaf2e2, { cast:false }); ceil.position.set(0, ROOM.h + 0.07, 0); interior.add(ceil);
  const sk = box(9.3, 0.22, 0.05, C.terra, { cast:false }); sk.position.set(0, 0.11, -4.35); interior.add(sk);

  // inside door
  const inDoor = box(1.3, 2.4, 0.1, C.terra); inDoor.position.set(2.9, 1.2, 4.42); interior.add(inDoor);
  clickable(inDoor, { type: 'exit' });
  const exitSign = planeWith(textTexture('EXIT', { w: 256, h: 80, bg: '#a03e22', fg: '#f7ecda', font: 'bold 44px "Trebuchet MS"' }), 0.8, 0.25, { emissive: 0xffffff, ei: 0.3 });
  exitSign.position.set(2.9, 2.62, 4.34); exitSign.rotation.y = Math.PI; interior.add(exitSign);

  // hanging lamps
  [-2.4, 0, 2.4].forEach(x => {
    const cord = cyl(0.015, 0.015, 0.5, 0x4a3a30, 8, { cast:false }); cord.position.set(x, ROOM.h - 0.25, 0); interior.add(cord);
    const shade = cyl(0.28, 0.12, 0.28, C.terra, 24); shade.position.set(x, ROOM.h - 0.62, 0); interior.add(shade);
    const bulb = sph(0.09, 0xffe2ae, { cast:false }); bulb.material.emissive = new THREE.Color(0xffc978); bulb.material.emissiveIntensity = 1.4; bulb.position.set(x, ROOM.h - 0.78, 0); interior.add(bulb);
  });

  // menu board - by-weight concept, broths & spice levels (inspired by real malatang shops)
  const menuTex = textTexture(
    ['TODAY 今日', 'Spicy Red 红汤 · Tomato 番茄', 'Golden Bone 金汤 · Dry Mala 干拌', 'Mild 微辣 Medium 中辣 Extra 特辣', 'pay by weight · per 100 g'],
    { w: 768, h: 512, bg: '#5a3b28', fg: '#f7ecda', font: 'bold 56px "Trebuchet MS"', small: '34px "Trebuchet MS"' });
  const menuFrame = box(0.08, 1.75, 2.55, C.woodD, { cast:false }); menuFrame.position.set(-4.6, 2.0, 0.4); interior.add(menuFrame);
  const menu = planeWith(menuTex, 2.4, 1.6, { emissive: 0xffffff, ei: 0.12 });
  menu.position.set(-4.53, 2.0, 0.4); menu.rotation.y = Math.PI / 2; interior.add(menu);

  // ------- ingredient fridge (front-facing, 5 shelves) -------
  const fridge = new THREE.Group(); fridge.position.set(0, 0, -3.95); interior.add(fridge);
  const fW = 6.4, fH = 2.9, fD = 0.95;
  const fBody = box(fW, fH, 0.22, 0xe4d2b2); fBody.position.set(0, fH / 2 + 0.12, -0.34); fridge.add(fBody);
  [-1, 1].forEach(sg => { const cheek = box(0.14, fH, fD, 0xe4d2b2); cheek.position.set(sg * (fW / 2 - 0.07), fH / 2 + 0.12, 0); fridge.add(cheek); });
  const fIn = box(fW - 0.3, fH - 0.35, 0.06, 0xe8f0e2, { emissive: 0xdcefe0, emissiveIntensity: 0.45, cast:false });
  fIn.position.set(0, fH / 2 + 0.16, -0.21); fridge.add(fIn);
  const fStrip = box(fW, 0.34, fD + 0.05, C.terra); fStrip.position.set(0, fH + 0.3, 0); fridge.add(fStrip);
  const fStripT = planeWith(textTexture(['FRESH INGREDIENTS 新鲜食材', 'pay by weight · priced per 100 g'], { w: 1024, h: 160, bg: '#c1502f', fg: '#f7ecda', font: 'bold 62px "Trebuchet MS"', small: '38px "Trebuchet MS"' }), 6.8, 0.32, { emissive: 0xffffff, ei: 0.25 });
  fStripT.scale.set(0.85,1,1); fStripT.position.set(0, fH + 0.3, fD / 2 + 0.04); fridge.add(fStripT);

  const shelfYs = [0.42, 0.94, 1.46, 1.98, 2.5];
  const trayW = 0.92, trayD = 0.62, trayH = 0.14;
  shelfYs.forEach((sy, si) => {
    const shelf = box(fW - 0.24, 0.05, fD - 0.16, 0xb08d5e); shelf.position.set(0, sy - 0.155, 0.1); fridge.add(shelf);
    SHELVES[si].forEach((ing, ti) => {
      const tx = -fW / 2 + 0.62 + ti * 1.04;
      const rim = box(trayW + 0.04, 0.03, trayD + 0.04, 0xe8d5b8, { cast:false }); rim.position.set(tx, sy - trayH / 2 - 0.015, 0.12); fridge.add(rim);
      const tray = box(trayW, trayH, trayD, 0xfbf1dd); tray.position.set(tx, sy, 0.12); fridge.add(tray);
      TRAYPOS[ing.id] = new THREE.Vector3(tx, sy + 0.15, -3.95 + 0.12);
      const pile = new THREE.Group(); pile.position.set(tx, sy + trayH / 2, 0.12); fridge.add(pile);
      addPile(pile, ing);
      const labTex = textTexture([ing.name, ing.cn], { w: 256, h: 110, bg: '#fdf6e9', fg: '#5a3b28', font: 'bold 40px "Trebuchet MS"', small: '30px "Trebuchet MS"' });
      const lab = planeWith(labTex, 0.78, 0.33); lab.position.set(tx, sy - 0.02, 0.12 + trayD / 2 + 0.045); lab.rotation.x = -0.25; fridge.add(lab);
      const hit = box(trayW, 0.55, trayD + 0.1, 0xffffff, { cast:false, receive:false });
      hit.material.visible = false; hit.position.set(tx, sy + 0.2, 0.12); fridge.add(hit);
      clickable(hit, { type: 'pick', ing: ing.id });
      clickable(tray, { type: 'pick', ing: ing.id });
    });
  });

  // ------- counter with basket + scale -------
  const counter = new THREE.Group(); counter.position.set(0, 0, 2.1); interior.add(counter);
  const cBody = box(6.6, 0.95, 1.0, 0xcf9a6a); cBody.position.set(0, 0.5, 0); counter.add(cBody);
  const cStripe = box(6.62, 0.18, 1.02, C.terra, { cast:false }); cStripe.position.set(0, 0.78, 0); counter.add(cStripe);
  const cTop = box(6.6, 0.12, 1.1, C.wood); cTop.position.set(0, 1.02, 0); counter.add(cTop);

  // basket (pink, translucent, with handle)
  const basket = new THREE.Group(); basket.position.set(-1.1, 1.08, 0); counter.add(basket);
  const bMat = new THREE.MeshStandardMaterial({ color: C.pink, transparent: true, opacity: 0.55, roughness: 0.35 });
  const bBase = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.06, 0.7), bMat); bBase.position.y = 0.03; basket.add(bBase);
  [[0, 0.22, 0.35, 1.05, 0.38, 0.04], [0, 0.22, -0.35, 1.05, 0.38, 0.04], [0.52, 0.22, 0, 0.04, 0.38, 0.7], [-0.52, 0.22, 0, 0.04, 0.38, 0.7]].forEach(a => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(a[3], a[4], a[5]), bMat); w.position.set(a[0], a[1], a[2]); basket.add(w);
  });
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 10, 24, Math.PI), bMat);
  handle.position.set(0, 0.42, 0); basket.add(handle);
  const basketItems = new THREE.Group(); basketItems.position.y = 0.07; basket.add(basketItems);
  basket.userData.itemsGroup = basketItems;
  window.__basket3d = basket;
  clickable(bBase, { type: 'basket' });

  // scale
  const scaleG = new THREE.Group(); scaleG.position.set(0.9, 1.08, 0); counter.add(scaleG);
  const sBase = box(0.85, 0.09, 0.65, C.steel, { rough: 0.4, metal: 0.4 }); sBase.position.y = 0.045; scaleG.add(sBase);
  const sPlate = cyl(0.3, 0.3, 0.04, 0xd8dde2, 28, { rough: 0.35, metal: 0.5 }); sPlate.position.y = 0.12; scaleG.add(sPlate);
  const sNeck = box(0.1, 0.34, 0.08, C.steel, { rough: 0.4, metal: 0.4 }); sNeck.position.set(0, 0.26, -0.28); scaleG.add(sNeck);
  const lcdCanvas = document.createElement('canvas'); lcdCanvasRef = lcdCanvas; lcdCanvas.width = 512; lcdCanvas.height = 192;
  lcdCtx = lcdCanvas.getContext('2d');
  lcdTex = new THREE.CanvasTexture(lcdCanvas); lcdTex.colorSpace = THREE.SRGBColorSpace;
  lcdTex.wrapS = THREE.RepeatWrapping; lcdTex.repeat.x = -1; // read correctly from the customer side
  const lcdFrame = box(0.82, 0.36, 0.06, 0x4a4038, { rough: 0.5 }); lcdFrame.position.set(0, 0.56, -0.32); scaleG.add(lcdFrame);
  const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.27),
    new THREE.MeshBasicMaterial({ map: lcdTex, side: THREE.DoubleSide }));
  lcd.position.set(0, 0.56, -0.365); lcd.rotation.x = -0.12; scaleG.add(lcd);
  clickable(sPlate, { type: 'weigh' }); clickable(sBase, { type: 'weigh' });

  // sauce pots
  [2.0, 2.45].forEach((x, i) => {
    const pot = cyl(0.14, 0.11, 0.18, i ? C.terra : 0x8a5f3a); pot.position.set(x, 1.17, 0.1); counter.add(pot);
  });

  // ------- guest NPC -------
  const guest = new THREE.Group(); guest.position.set(-2.1, 0, 3.1); interior.add(guest);
  const gBody = cyl(0.24, 0.3, 0.9, 0x7aa5c9); gBody.position.y = 0.85; guest.add(gBody);
  const gHead = sph(0.21, 0xf2c9a0); gHead.position.y = 1.55; guest.add(gHead);
  const gHair = sph(0.22, 0x4a3a30); gHair.scale.y = 0.7; gHair.position.y = 1.66; guest.add(gHair);
  const gEyeL = sph(0.025, 0x333333, { cast:false }); gEyeL.position.set(-0.07, 1.57, -0.18); guest.add(gEyeL);
  const gEyeR = gEyeL.clone(); gEyeR.position.x = 0.07; guest.add(gEyeR);
  guest.rotation.y = Math.PI;
  window.__guest = guest;

  // tables + stools
  [[3.4, -1.6], [3.4, 0.2]].forEach(([x, z]) => {
    const t = cyl(0.42, 0.42, 0.05, C.wood); t.position.set(x, 0.75, z); interior.add(t);
    const leg = cyl(0.05, 0.05, 0.72, C.woodD); leg.position.set(x, 0.38, z); interior.add(leg);
    [[0.75, 0], [-0.75, 0]].forEach(([dx, dz]) => {
      const st = cyl(0.18, 0.16, 0.42, C.terra); st.position.set(x + dx, 0.21, z + dz); interior.add(st);
    });
  });

  // plant corner
  const ppot = cyl(0.25, 0.2, 0.4, C.terra); ppot.position.set(-3.9, 0.2, 3.7); interior.add(ppot);
  const pleaf = sph(0.35, 0x6f9b57); pleaf.position.set(-3.9, 0.75, 3.7); interior.add(pleaf);
  const pleaf2 = sph(0.22, 0x86ad66); pleaf2.position.set(-3.7, 1.0, 3.6); interior.add(pleaf2);
}

function addPile(group, ing) {
  const n = 7;
  for (let i = 0; i < n; i++) {
    let m;
    const s = rand(1.05, 1.45);
    if (ing.shape === 'ball') m = sph(0.055 * s, ing.color);
    else if (ing.shape === 'cube') m = box(0.09 * s, 0.07 * s, 0.09 * s, ing.color);
    else if (ing.shape === 'stick') { m = cyl(0.03 * s, 0.03 * s, 0.2 * s, ing.color, 8); m.rotation.z = Math.PI / 2 + rand(-0.3, 0.3); }
    else if (ing.shape === 'slice') { m = cyl(0.07 * s, 0.07 * s, 0.025 * s, ing.color, 14); m.rotation.x = rand(-0.4, 0.4); }
    else if (ing.shape === 'nest') { m = new THREE.Mesh(new THREE.TorusGeometry(0.07 * s, 0.028 * s, 8, 16), new THREE.MeshStandardMaterial({ color: ing.color, roughness: 0.8 })); m.rotation.x = Math.PI / 2 + rand(-0.3, 0.3); m.castShadow = true; }
    else { m = sph(0.06 * s, ing.color); m.scale.set(1, 1.5, 1); }
    m.position.set(rand(-0.3, 0.3), 0.03 + i * 0.022, rand(-0.16, 0.16));
    m.rotation.y = rand(0, Math.PI * 2);
    group.add(m);
  }
}

/* ============================================================
   PLAYER / CAMERA / MOVEMENT
   ============================================================ */
const player = { x: 0, z: 6.8, yaw: Math.PI, area: 'exterior' };
let camTween = null; // {fromPos, toPos, fromQ, toQ, t}
const NARROW = () => innerWidth < 600;
const camPose = {
  get fridge()  { return NARROW() ? { pos: [0, 1.55, -1.9], yaw: Math.PI } : { pos: [0, 1.5, -0.55], yaw: Math.PI }; },
  get counter() { return NARROW() ? { pos: [0.05, 1.78, -1.15], yaw: -0.06 } : { pos: [0.15, 1.62, 0.15], yaw: -0.14 }; },
};
function flyTo(posArr, yaw, tilt = -0.06) {
  const toPos = new THREE.Vector3(posArr[0], posArr[1], posArr[2]);
  const m = new THREE.Matrix4().lookAt(toPos, lookPointFor(toPos, yaw, tilt), new THREE.Vector3(0, 1, 0));
  camTween = {
    fromPos: camera.position.clone(), toPos,
    fromQ: camera.quaternion.clone(),
    toQ: new THREE.Quaternion().setFromRotationMatrix(m), t: 0,
    endX: posArr[0], endZ: posArr[2], endYaw: yaw,
  };
}
function lookPointFor(pos, yaw, tilt = -0.06) {
  return new THREE.Vector3(pos.x + Math.sin(yaw), pos.y + tilt, pos.z + Math.cos(yaw));
}
function applyFreeCam() {
  camera.position.set(player.x, 1.6, player.z);
  camera.lookAt(lookPointFor(new THREE.Vector3(player.x, 1.6, player.z), player.yaw));
}
applyFreeCam();

const keys = {};
addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.key.toLowerCase() === 'e') tryPrompt(); });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// drag look + tap
let dragging = false, dragMoved = 0, lastX = 0, downX = 0, downY = 0;
renderer.domElement.addEventListener('pointerdown', e => {
  dragging = true; dragMoved = 0; lastX = downX = e.clientX; downY = e.clientY;
});
addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  dragMoved += Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY);
  lastX = e.clientX;
  if (!camTween && G.started) player.yaw -= dx * 0.005;
});
addEventListener('pointerup', e => {
  if (dragging && dragMoved < 12) handleTap(e.clientX, e.clientY);
  dragging = false;
});

// joystick
const joy = document.getElementById('joy'), knob = document.getElementById('joyknob');
let joyVec = { x: 0, y: 0 }, joyId = null;
joy.addEventListener('pointerdown', e => { joyId = e.pointerId; joy.setPointerCapture(joyId); e.stopPropagation(); });
joy.addEventListener('pointermove', e => {
  if (e.pointerId !== joyId) return;
  const r = joy.getBoundingClientRect();
  let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  const m = Math.hypot(dx, dy), max = 42;
  if (m > max) { dx *= max / m; dy *= max / m; }
  knob.style.left = (35 + dx) + 'px'; knob.style.top = (35 + dy) + 'px';
  joyVec = { x: dx / max, y: dy / max };
});
function joyEnd(e) { if (e.pointerId !== joyId) return; joyId = null; joyVec = { x: 0, y: 0 }; knob.style.left = '35px'; knob.style.top = '35px'; }
joy.addEventListener('pointerup', joyEnd); joy.addEventListener('pointercancel', joyEnd);

function clampPlayer() {
  if (player.area === 'exterior') {
    player.x = Math.max(-11, Math.min(11, player.x));
    player.z = Math.max(-0.4, Math.min(11, player.z));
  } else {
    player.x = Math.max(-4.1, Math.min(4.1, player.x));
    player.z = Math.max(-3.0, Math.min(4.0, player.z));
    if (player.z > 1.5 && player.z < 2.75 && Math.abs(player.x) < 3.3) player.z = 1.5; // counter block
  }
}

/* ============================================================
   GAME STATE
   ============================================================ */
const G = {
  started: false, shop: SHOPS[0], area: 'exterior', basket: [], guest: null, guestSince: 0,
  earnings: 0, served: 0, selBroth: null, selSpice: null,
};
const $ = id => document.getElementById('id'.length ? id : id);

function newGuest() {
  const reqCount = 2 + (Math.random() < 0.5 ? 1 : 0);
  const all = SHELVES.flat();
  const req = [];
  while (req.length < reqCount) { const c = pick(all); if (!req.includes(c)) req.push(c); }
  const targetW = Math.max(minG(), 380 + Math.round(Math.random() * 22) * 10); // >= shop minimum, 380-600 g realistic bowl range
  const budget = Math.round((targetW / 100 * rate()) * (1.12 + Math.random() * 0.35) * 2) / 2;
  G.guest = { name: pick(GUEST_NAMES), req, targetW, budget, broth: pick(BROTHS), spice: pick(SPICES) };
  G.guestSince = performance.now();
  G.basket = []; G.selBroth = null; G.selSpice = null;
  renderBasket3D(); updateTicket(); updateBasketBar(); drawLCD(0, 0);
  const npc = window.__guest;
  npc.children[0].material = npc.children[0].material.clone();
  npc.children[0].material.color.setHex(pick([0x7aa5c9, 0xc97a8a, 0x8ab27a, 0xc9a55a, 0x9a7ac9]));
}
function updateTicket() {
  const g = G.guest; if (!g) return;
  $('tname').textContent = g.name;
  $('tbudget').textContent = fmt(g.budget);
  $('ttarget').textContent = g.targetW + ' g';
  $('trate').textContent = `${fmt(rate())}/100 g · min ${minG()} g`;
  $('tbroth').textContent = g.broth.name + ' ' + g.broth.cn;
  $('tspice').textContent = g.spice.name + ' ' + g.spice.cn;
  const has = new Set(G.basket);
  $('treq').innerHTML = '<span style="font-size:11px;color:#a08362;width:100%">must have:</span>' +
    g.req.map(r => `<span class="chip ${has.has(r.id) ? 'got' : ''}">${r.name}</span>`).join('');
}
function basketWeight() { return G.basket.reduce((s, id) => s + ING[id].g, 0); }
function basketPrice() { return basketWeight() / 100 * rate(); }
function updateBasketBar() {
  const w = basketWeight(), p = basketPrice();
  $('btotal').textContent = `${w} g · ${fmt(p)}`;
  const counts = {};
  G.basket.forEach(id => counts[id] = (counts[id] || 0) + 1);
  $('basketitems').innerHTML = Object.entries(counts)
    .map(([id, n]) => `<span class="chip" data-ing="${id}">${ING[id].name}${n > 1 ? ' ×' + n : ''}</span>`).join('')
    || '<span style="font-size:11px;color:#b09a7c">empty - pick from the fridge</span>';
  $('basketbar').style.display = G.area === 'interior' ? 'block' : 'none';
  drawLCD(w, p);
  if (G.guest) updateTicket();
}
function renderBasket3D() {
  const grp = window.__basket3d.userData.itemsGroup;
  while (grp.children.length) grp.remove(grp.children[0]);
  G.basket.slice(0, 24).forEach(id => {
    const m = sph(0.055, ING[id].color);
    m.position.set(rand(-0.35, 0.35), 0.02 + rand(0, 0.12), rand(-0.2, 0.2));
    grp.add(m);
  });
}

// audio blips
let AC = null;
function blip(f = 660, d = 0.08, type = 'sine', vol = 0.12) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + d);
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + d);
  } catch (e) {}
}

/* ============================================================
   INTERACTIONS
   ============================================================ */
const ray = new THREE.Raycaster();
function handleTap(x, y) {
  if (!G.started) return;
  ray.setFromCamera(new THREE.Vector2((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1), camera);
  const hits = ray.intersectObjects(clickables, false);
  if (!hits.length) return;
  if (hits[0].distance > 4.2) { showPrompt('Walk closer! 🚶', 1200); return; }
  act(hits[0].object.userData.act);
}

function act(a) {
  if (!a) return;
  if (a.type === 'enter') enterShop();
  else if (a.type === 'exit') exitShop();
  else if (a.type === 'pick') {
    if (G.area !== 'interior') return;
    if (G.basket.length >= 30) { showPrompt('Basket is full! 🧺', 1200); return; }
    G.basket.push(a.ing);
    blip(720 + Math.random() * 120, 0.07, 'triangle');
    renderBasket3D(); updateBasketBar();
  }
  else if (a.type === 'weigh') {
    if (!G.basket.length) { showPrompt('Basket is empty - pick ingredients first! 🥬', 1500); return; }
    blip(440, 0.15, 'square', 0.08); setTimeout(() => blip(880, 0.2, 'sine'), 160);
    drawLCD(basketWeight(), basketPrice());
    showPrompt(`${basketWeight()} g · ${fmt(basketPrice())}`, 1500);
  }
  else if (a.type === 'basket') {
    if (G.basket.length) { G.basket.pop(); blip(330, 0.09, 'triangle'); renderBasket3D(); updateBasketBar(); }
  }
}

function enterShop() {
  hidePrompt();
  G.area = 'interior'; player.area = 'interior';
  exterior.visible = false; interior.visible = true;
  player.x = 2.6; player.z = 3.4; player.yaw = Math.PI;
  warmIn.intensity = 0.9;
  scene.fog = new THREE.Fog(0xf7ecda, 20, 45);
  flyTo(camPose.fridge.pos, camPose.fridge.yaw, 0.03);
  $('views').style.display = 'flex'; $('ticket').style.display = 'block'; $('earnings').style.display = 'block';
  updateBasketBar();
  blip(520, 0.12, 'triangle'); setTimeout(() => blip(780, 0.14, 'triangle'), 120);
}
function exitShop() {
  hidePrompt();
  G.area = 'exterior'; player.area = 'exterior';
  exterior.visible = true; interior.visible = false;
  player.x = 2.9; player.z = 1.2; player.yaw = Math.PI;
  warmIn.intensity = 0.0;
  scene.fog = new THREE.Fog(C.sky, 18, 42);
  camTween = null; applyFreeCam();
  $('views').style.display = 'none'; $('basketbar').style.display = 'none';
}

let promptTimer = null;
function showPrompt(text, ms = 0) {
  const p = $('prompt');
  if (p.textContent !== text) p.textContent = text;
  p.style.display = 'block';
  clearTimeout(promptTimer);
  if (ms) promptTimer = setTimeout(() => { p.style.display = 'none'; }, ms);
}
function hidePrompt() { $('prompt').style.display = 'none'; clearTimeout(promptTimer); }
$('prompt').addEventListener('click', () => tryPrompt());
function tryPrompt() {
  if (G.area === 'exterior' && Math.abs(player.x - 2.9) < 2.2 && player.z < 1.6) enterShop();
}

/* ---------- serve flow ---------- */
function openServe() {
  if (!G.basket.length) { showPrompt('Basket is empty - pick ingredients first! 🥬', 1600); return; }
  const w = basketWeight();
  if (w < minG()) { showPrompt(`${G.shop.name} minimum is ${minG()} g - your basket is ${w} g ⚖️`, 2200); return; }
  const g = G.guest;
  $('brothreq').textContent = `${g.name} asked for ${g.broth.name} ${g.broth.cn}, ${g.spice.name} ${g.spice.cn} · target ${g.targetW} g · budget ${fmt(g.budget)}`;
  const bo = $('brothopts'); bo.innerHTML = '';
  BROTHS.forEach(b => {
    const d = document.createElement('div'); d.className = 'opt' + (G.selBroth === b.id ? ' sel' : '');
    d.innerHTML = `${b.name}<small>${b.cn}</small>`;
    d.onclick = () => { G.selBroth = b.id; blip(600, 0.06, 'triangle'); openServe(); };
    bo.appendChild(d);
  });
  const so = $('spiceopts'); so.innerHTML = '';
  SPICES.forEach(s => {
    const d = document.createElement('div'); d.className = 'opt' + (G.selSpice === s.id ? ' sel' : '');
    d.innerHTML = `${s.name}<small>${s.cn}</small>`;
    d.onclick = () => { G.selSpice = s.id; blip(640, 0.06, 'triangle'); openServe(); };
    so.appendChild(d);
  });
  $('brothmodal').style.display = 'flex';
}
$('servebtn').addEventListener('click', () => {
  if (!G.selBroth || !G.selSpice) { $('brothreq').textContent = 'Pick a broth AND a spice level first!'; return; }
  $('brothmodal').style.display = 'none';
  serveGuest();
});
function serveGuest() {
  const g = G.guest;
  const w = basketWeight(), price = basketPrice();
  const secs = (performance.now() - G.guestSince) / 1000;
  const has = new Set(G.basket);
  const reqHit = g.req.filter(r => has.has(r.id)).length;
  const order = Math.round(reqHit / g.req.length * 60)
    + (G.selBroth === g.broth.id ? 20 : 0) + (G.selSpice === g.spice.id ? 20 : 0);
  const wErr = Math.abs(w - g.targetW);
  let weightS = Math.max(0, Math.round(100 - (wErr / g.targetW) * 200));
  const over = price > g.budget;
  if (over) weightS = Math.max(0, weightS - Math.min(50, Math.round((price - g.budget) / g.budget * 100)));
  const speed = Math.max(20, Math.min(100, Math.round(130 - secs * 1.6)));
  const overall = (order + weightS + speed) / 3;
  const cents = v => Math.round(v * 100);
  const priceC = cents(price), budgetC = cents(g.budget);
  const tipC = over ? 0 : Math.max(0, budgetC - priceC) * (overall / 100) * 0.5;
  const tip = Math.round(tipC) / 100;
  const earned = (Math.min(priceC, budgetC) + Math.round(tipC)) / 100;
  G.earnings += earned; G.served++;
  $('earnings').textContent = '💰 ' + fmt(G.earnings);

  $('rweight').textContent = w + ' g';
  $('rtarget').textContent = g.targetW + ' g';
  $('rerror').textContent = (w > g.targetW ? '+' : '-') + wErr + ' g';
  $('rprice').textContent = fmt(priceC / 100);
  $('rbudget').textContent = fmt(g.budget) + (over ? ' ⚠️ OVER' : '');
  $('rtip').textContent = fmt(tip);
  $('rtotal').textContent = fmt(earned);
  $('sorder').textContent = order; $('border').style.width = order + '%';
  $('sweight').textContent = weightS; $('bweight').style.width = weightS + '%';
  $('sspeed').textContent = speed; $('bspeed').style.width = speed + '%';
  $('rstamp').textContent = over ? 'OVER BUDGET' : 'PAID';
  $('rstamp').style.borderColor = $('rstamp').style.color = over ? '#a03030' : '#c1502f';
  $('rcomment').textContent =
    overall >= 90 ? pick(['"Perfect bowl! 太好吃了!" 😍', '"You read my mind!" 🤩', '"Best malatang in town!" 🏆']) :
    overall >= 70 ? pick(['"Pretty good!" 😊', '"Nice bowl, thanks!" 🍜', '"Almost perfect!" 👍']) :
    overall >= 50 ? pick(['"Hmm, not quite my order…" 😅', '"It\'s okay, I guess." 😐']) :
    over ? '"This costs more than my budget!" 😡' : '"This is not what I ordered…" 😢';
  $('receipt').style.display = 'flex';
  blip(523, 0.12); setTimeout(() => blip(659, 0.12), 120); setTimeout(() => blip(overall >= 50 ? 784 : 392, 0.25), 240);
}
$('nextguest').addEventListener('click', () => { $('receipt').style.display = 'none'; newGuest(); });

// HUD buttons
$('v-fridge').onclick = () => { if (G.area === 'interior') flyTo(camPose.fridge.pos, camPose.fridge.yaw, 0.03); };
$('v-counter').onclick = () => { if (G.area === 'interior') flyTo(camPose.counter.pos, camPose.counter.yaw); };
$('v-door').onclick = () => { if (G.area === 'interior') exitShop(); };
$('v-serve').onclick = () => openServe();
$('basketitems').addEventListener('click', e => {
  const id = e.target.dataset && e.target.dataset.ing;
  if (!id) return;
  const i = G.basket.indexOf(id);
  if (i >= 0) { G.basket.splice(i, 1); blip(330, 0.09, 'triangle'); renderBasket3D(); updateBasketBar(); }
});

/* ============================================================
   START / LOOP
   ============================================================ */
// shop selector on title screen
SHOPS.forEach(sh => {
  const d = document.createElement('div');
  d.className = 'opt' + (sh.id === G.shop.id ? ' sel' : '');
  d.innerHTML = `${sh.flag} ${sh.city}<small>${sh.name} · ${sh.cur}${sh.rate.toFixed(2)}/100 g · min ${sh.min} g</small>`;
  d.onclick = () => {
    G.shop = sh; blip(600, 0.06, 'triangle');
    document.querySelectorAll('#shopopts .opt').forEach(o => o.classList.remove('sel'));
    d.classList.add('sel');
    drawLCD(0, 0);
  };
  $('shopopts').appendChild(d);
});

$('startbtn').addEventListener('click', () => {
  $('title').style.display = 'none';
  G.started = true;
  if (NARROW()) { player.yaw = Math.PI - 0.38; applyFreeCam(); } // aim at the door on phones
  newGuest();
  showPrompt('Walk to the door and click it to go in 🚪', 5000);
});
document.getElementById('loading').textContent = '';

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < 0.75 ? 74 : 62;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// debug/testing hook
function screenXY(ingId) {
  const v = TRAYPOS[ingId].clone().project(camera);
  return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight };
}
window.__game = { G, act, lcdCanvasRef: () => lcdCanvasRef, enterShop, exitShop, openServe, serveGuest, newGuest, player, basketWeight, basketPrice, flyTo, camPose, screenXY };

let lastT = performance.now();
function loop() {
  requestAnimationFrame(loop);
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;

  if (G.started && !camTween) {
    let mx = 0, mz = 0;
    if (keys['w'] || keys['arrowup']) mz += 1;
    if (keys['s'] || keys['arrowdown']) mz -= 1;
    if (keys['a'] || keys['arrowleft']) mx -= 1;
    if (keys['d'] || keys['arrowright']) mx += 1;
    mx += joyVec.x; mz -= joyVec.y;
    const m = Math.hypot(mx, mz);
    if (m > 0.05) {
      if (m > 1) { mx /= m; mz /= m; }
      const sp = 3.4 * dt;
      const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
      player.x += (sin * mz + cos * mx) * sp;
      player.z += (cos * mz - sin * mx) * sp;
      clampPlayer();
    }
    applyFreeCam();
    if (G.area === 'exterior') {
      if (Math.abs(player.x - 2.9) < 2.2 && player.z < 1.6) showPrompt('Click the door to enter 🚪');
      else if ($('prompt').textContent.startsWith('Click the door')) hidePrompt();
    }
  } else if (camTween) {
    camTween.t += dt * 1.5;
    const k = Math.min(1, camTween.t);
    const e = 1 - Math.pow(1 - k, 3);
    camera.position.lerpVectors(camTween.fromPos, camTween.toPos, e);
    camera.quaternion.slerpQuaternions(camTween.fromQ, camTween.toQ, e);
    if (k >= 1) {
      player.x = camTween.endX; player.z = camTween.endZ; player.yaw = camTween.endYaw;
      camTween = null; applyFreeCam();
    }
  }

  if (window.__guest) window.__guest.position.y = Math.sin(now / 480) * 0.02;

  renderer.render(scene, camera);
}
loop();
