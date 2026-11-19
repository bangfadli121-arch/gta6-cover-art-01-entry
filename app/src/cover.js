// Vice Cover Studio v2 — cover drawing engine.
// Hero-led poster: one BIG hero panel + supporting panels, every panel a
// DIFFERENT visual, faces kept whole by a face-aware crop, and one strong
// "Poster Ink" grade (sunset duotone wash + halftone print dots + cream
// gutters) unifying photos and procedural art. The caption lives in its
// OWN dedicated title band at the bottom — text never sits on a face.
// Layouts: classic (hero mosaic, 6 panels), wide (hero + strip, 4 panels),
// solo (one photo, 1 panel). Export sizes: 1080x1080, 1080x1350, 1920x1080.

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

export const GRADES = {
  sunset: { sky: ['#ff2e88', '#ff7a3d', '#ffb347', '#2b1a5e'], sun: '#ffd76a', tint: 'rgba(255,46,136,0.16)', deep: '#160a33' },
  poster: { sky: ['#ff2e88', '#ff5db1', '#ffb347', '#2b1a5e'], sun: '#ffd76a', tint: 'rgba(255,46,136,0.22)', deep: '#160a33' },
  golden: { sky: ['#ff9a3d', '#ffc46b', '#ffe9a8', '#3d2b6e'], sun: '#fff3c4', tint: 'rgba(255,154,61,0.18)', deep: '#241640' },
  neon: { sky: ['#1b0b3d', '#7b1fa2', '#ff2e88', '#12082b'], sun: '#ff5db1', tint: 'rgba(123,31,162,0.22)', deep: '#0d0524' },
  teal: { sky: ['#0e3a5c', '#12808a', '#ff7a3d', '#123a5c'], sun: '#ffe9a8', tint: 'rgba(18,128,138,0.18)', deep: '#0a1f33' },
};

export const ART_KINDS = ['skyline', 'palms', 'flamingo', 'neon-sun', 'waves', 'sportscar', 'neon-street', 'lifeguard'];

// Face focus points for the two kit sample photos, as fractions of the
// photo: boulevard woman's face sits near (0.52, 0.20), pier fisherman's
// near (0.47, 0.22). Any photo a user loads defaults to (0.5, 0.25) — the
// upper third, where a face usually is — so a crop never cuts a chin.
export const PHOTO_FOCUS = { photo0: { fx: 0.47, fy: 0.22 }, photo1: { fx: 0.52, fy: 0.20 } };

export function defaultPanels() {
  // Reading order, classic 6-panel hero mosaic:
  // HERO boulevard (2x2) | skyline | pier fisherman / sportscar | flamingo
  // lagoon | neon street. Each photo appears ONCE; every panel differs.
  // Indices 6-8 are spare art for the wide strip / shuffle pool.
  return [
    { src: 'photo1', zoom: 100, ox: 0, oy: 0, fx: 0.52, fy: 0.20 },
    { src: 'skyline', zoom: 100, ox: 0, oy: 0 },
    { src: 'photo0', zoom: 100, ox: 0, oy: 0, fx: 0.47, fy: 0.22 },
    { src: 'sportscar', zoom: 100, ox: 0, oy: 0 },
    { src: 'flamingo', zoom: 100, ox: 0, oy: 0 },
    { src: 'neon-street', zoom: 100, ox: 0, oy: 0 },
    { src: 'lifeguard', zoom: 100, ox: 0, oy: 0 },
    { src: 'waves', zoom: 100, ox: 0, oy: 0 },
    { src: 'neon-sun', zoom: 100, ox: 0, oy: 0 },
  ];
}

export function defaultState() {
  return {
    layout: 'classic', grade: 'poster', size: '1080x1080',
    title: 'VICE SUNSET', subtitle: 'VICE CITY · SUMMER 2026', tagline: 'chasing the last light',
    titleColor: 'white', titleScale: 100, fillArt: true,
    panels: defaultPanels(), selected: 0,
  };
}

/** Fit a font size so `text` fits `maxWidth`, starting from `start`. */
export function fitFont(ctx, text, start, maxWidth, family, weight = '') {
  let size = start;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

/** Sunset sky gradient for a rect, with an optional low sun. */
export function drawSunsetSky(ctx, x, y, w, h, grade, withSun = true) {
  const g = GRADES[grade];
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, g.sky[0]);
  sky.addColorStop(0.45, g.sky[1]);
  sky.addColorStop(0.75, g.sky[2]);
  sky.addColorStop(1, g.sky[3]);
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  if (withSun) {
    const r = Math.min(w, h) * 0.22;
    const cx = x + w * 0.5, cy = y + h * 0.42;
    const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.2);
    glow.addColorStop(0, 'rgba(255,215,106,0.85)');
    glow.addColorStop(1, 'rgba(255,215,106,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = g.sun;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    // Synthwave slats across the lower half of the sun.
    ctx.fillStyle = g.sky[0];
    for (let i = 0; i < 3; i++) {
      const sy = cy + r * (0.15 + i * 0.28);
      ctx.fillRect(cx - r, sy, r * 2, r * 0.09);
    }
  }
}

/** Tiny distant birds: a few two-stroke arcs in the sky. */
function drawBirds(ctx, x, y, w, h, n, color = 'rgba(22,10,51,0.75)') {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, w * 0.006);
  for (let i = 0; i < n; i++) {
    const bx = x + w * (0.12 + ((i * 37) % 70) / 100);
    const by = y + h * (0.1 + ((i * 23) % 22) / 100);
    const s = w * 0.03;
    ctx.beginPath();
    ctx.moveTo(bx - s, by); ctx.quadraticCurveTo(bx - s * 0.4, by - s * 0.7, bx, by);
    ctx.quadraticCurveTo(bx + s * 0.4, by - s * 0.7, bx + s, by);
    ctx.stroke();
  }
}

function drawSkyline(ctx, x, y, w, h, grade) {
  drawSunsetSky(ctx, x, y, w, h, grade, true);
  const g = GRADES[grade];
  drawBirds(ctx, x, y, w, h * 0.4, 3);
  ctx.fillStyle = g.deep;
  // Back row of towers.
  let bx = x;
  while (bx < x + w) {
    const bw = w * (0.09 + ((bx * 7) % 10) / 90);
    const bh = h * (0.28 + ((bx * 13) % 10) / 28);
    ctx.fillRect(bx, y + h - bh, bw, bh);
    bx += bw + w * 0.02;
  }
  // Ferris wheel on the waterfront.
  const cx = x + w * 0.78, cy = y + h * 0.62, r = Math.min(w, h) * 0.17;
  ctx.strokeStyle = '#ffd76a'; ctx.lineWidth = Math.max(2, w * 0.008);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
  }
  ctx.fillStyle = '#ffd76a';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.1, 0, Math.PI * 2); ctx.fill();
  }
  // Lit windows on the front towers.
  ctx.fillStyle = 'rgba(255,215,106,0.9)';
  for (let i = 0; i < 26; i++) {
    const wx = x + ((i * 53) % 100) / 100 * w;
    const wy = y + h * 0.55 + ((i * 29) % 40) / 100 * h;
    ctx.fillRect(wx, wy, Math.max(2, w * 0.012), Math.max(2, w * 0.012));
  }
  // Water band with a little boat.
  const water = ctx.createLinearGradient(0, y + h * 0.88, 0, y + h);
  water.addColorStop(0, '#1b2a6b'); water.addColorStop(1, '#0d0524');
  ctx.fillStyle = water; ctx.fillRect(x, y + h * 0.88, w, h * 0.12);
  ctx.fillStyle = '#f5f0ff';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.14, y + h * 0.93); ctx.lineTo(x + w * 0.3, y + h * 0.93);
  ctx.lineTo(x + w * 0.26, y + h * 0.97); ctx.lineTo(x + w * 0.18, y + h * 0.97);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,215,106,0.5)'; ctx.lineWidth = Math.max(1, w * 0.004);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + h * (0.91 + i * 0.03));
    ctx.lineTo(x + w, y + h * (0.91 + i * 0.03));
    ctx.stroke();
  }
}

function drawPalms(ctx, x, y, w, h, grade) {
  drawSunsetSky(ctx, x, y, w, h, grade, true);
  const g = GRADES[grade];
  drawBirds(ctx, x, y, w, h * 0.35, 2);
  ctx.strokeStyle = g.deep; ctx.fillStyle = g.deep;
  const palm = (px, lean, s) => {
    ctx.lineWidth = Math.max(3, w * 0.02 * s);
    ctx.beginPath(); ctx.moveTo(px, y + h);
    ctx.quadraticCurveTo(px + lean * w * 0.12, y + h * 0.55, px + lean * w * 0.2, y + h * 0.28);
    ctx.stroke();
    const tx = px + lean * w * 0.2, ty = y + h * 0.28;
    ctx.lineWidth = Math.max(2, w * 0.012 * s);
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI + (k / 6) * Math.PI; // fan from left-down to right-down, over the top
      const len = w * 0.26 * s;
      const ex = tx + Math.cos(a) * len;
      const ey = ty + Math.sin(a) * len * 0.75;
      const mx = tx + Math.cos(a) * len * 0.5;
      const my = ty + Math.sin(a) * len * 0.5 - h * 0.12 * s;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
    }
  };
  palm(x + w * 0.22, 1, 1);
  palm(x + w * 0.82, -1, 0.8);
  // Sand strip at the bottom.
  ctx.fillStyle = '#e8b06a';
  ctx.fillRect(x, y + h * 0.94, w, h * 0.06);
}

/** One detailed flamingo: S-curved neck, beak with black tip, wing, legs in the water. */
function drawOneFlamingo(ctx, x, y, w, h, cx, cy, s, facing) {
  const u = Math.min(w, h) * 0.01 * s; // unit
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(facing, 1);
  // Legs first (behind the body), standing in shallow water.
  ctx.strokeStyle = '#ff8fc0'; ctx.lineWidth = Math.max(2, u * 1.1);
  ctx.beginPath(); ctx.moveTo(-u * 1.5, u * 6); ctx.lineTo(-u * 2.2, u * 26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(u * 1.5, u * 6); ctx.lineTo(u * 3.4, u * 26); ctx.stroke();
  // Faint leg reflections under the waterline.
  ctx.strokeStyle = 'rgba(255,143,192,0.4)'; ctx.lineWidth = Math.max(1, u * 0.7);
  ctx.beginPath(); ctx.moveTo(-u * 2.2, u * 26); ctx.lineTo(-u * 1.6, u * 34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(u * 3.4, u * 26); ctx.lineTo(u * 2.6, u * 34); ctx.stroke();
  // Body.
  ctx.fillStyle = '#ff5da2';
  ctx.beginPath(); ctx.ellipse(0, 0, u * 11, u * 6, -0.12, 0, Math.PI * 2); ctx.fill();
  // Wing: darker pink fold with a black trailing edge.
  ctx.fillStyle = '#e83e8c';
  ctx.beginPath(); ctx.ellipse(-u * 1, u * 0.5, u * 6.5, u * 3.2, -0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#160a33';
  ctx.beginPath(); ctx.ellipse(-u * 5.5, u * 2.2, u * 3.4, u * 1.1, -0.3, 0, Math.PI * 2); ctx.fill();
  // S-neck rising from the front of the body.
  ctx.strokeStyle = '#ff5da2'; ctx.lineWidth = Math.max(3, u * 2.4); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(u * 7, -u * 2);
  ctx.bezierCurveTo(u * 13, -u * 9, u * 3, -u * 13, u * 8, -u * 18);
  ctx.stroke();
  // Head.
  ctx.fillStyle = '#ff5da2';
  ctx.beginPath(); ctx.arc(u * 8.5, -u * 19, u * 2.6, 0, Math.PI * 2); ctx.fill();
  // Beak: pale base, bent down, black tip.
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath(); ctx.moveTo(u * 10.5, -u * 20); ctx.lineTo(u * 15.5, -u * 18.5); ctx.lineTo(u * 13.5, -u * 15.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#160a33';
  ctx.beginPath(); ctx.moveTo(u * 13.2, -u * 19.2); ctx.lineTo(u * 15.5, -u * 18.5); ctx.lineTo(u * 13.5, -u * 15.5); ctx.closePath(); ctx.fill();
  // Eye.
  ctx.fillStyle = '#160a33';
  ctx.beginPath(); ctx.arc(u * 9.2, -u * 20, u * 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawFlamingo(ctx, x, y, w, h, grade) {
  // Layered sunset lagoon: magenta -> orange -> violet sky, low sun with a
  // shimmering reflection column, purple water, TWO flamingos, reeds.
  const sky = ctx.createLinearGradient(x, y, x, y + h * 0.62);
  sky.addColorStop(0, '#c2187a');
  sky.addColorStop(0.35, '#ff2e88');
  sky.addColorStop(0.7, '#ff7a3d');
  sky.addColorStop(1, '#ffb347');
  ctx.fillStyle = sky; ctx.fillRect(x, y, w, h * 0.62);
  // Low sun + glow.
  const sx = x + w * 0.68, sy = y + h * 0.34, sr = Math.min(w, h) * 0.13;
  const glow = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 2.4);
  glow.addColorStop(0, 'rgba(255,215,106,0.9)');
  glow.addColorStop(1, 'rgba(255,215,106,0)');
  ctx.fillStyle = glow; ctx.fillRect(x, y, w, h * 0.62);
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
  drawBirds(ctx, x, y, w, h * 0.3, 3, 'rgba(22,10,51,0.6)');
  // Distant palm silhouettes on the horizon.
  ctx.strokeStyle = '#2b1a5e'; ctx.lineWidth = Math.max(2, w * 0.008);
  const miniPalm = (px, s) => {
    ctx.beginPath(); ctx.moveTo(px, y + h * 0.62); ctx.lineTo(px + w * 0.02 * s, y + h * 0.5); ctx.stroke();
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI * 0.85 + (k / 4) * Math.PI * 0.7;
      ctx.beginPath(); ctx.moveTo(px + w * 0.02 * s, y + h * 0.5);
      ctx.lineTo(px + w * 0.02 * s + Math.cos(a) * w * 0.07 * s, y + h * 0.5 + Math.sin(a) * h * 0.06 * s);
      ctx.stroke();
    }
  };
  miniPalm(x + w * 0.1, 1); miniPalm(x + w * 0.2, 0.7); miniPalm(x + w * 0.9, 0.9);
  // Water: violet -> deep navy.
  const sea = ctx.createLinearGradient(x, y + h * 0.6, x, y + h);
  sea.addColorStop(0, '#7b2a8f');
  sea.addColorStop(0.45, '#4a1a6e');
  sea.addColorStop(1, '#160a33');
  ctx.fillStyle = sea; ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
  // Sun reflection column: gold dashes widening toward the viewer.
  ctx.fillStyle = 'rgba(255,215,106,0.75)';
  for (let i = 0; i < 7; i++) {
    const ry = y + h * (0.62 + i * 0.055);
    const rw = w * (0.05 + i * 0.018);
    ctx.fillRect(sx - rw / 2, ry, rw, Math.max(1.5, h * 0.008));
  }
  // Ripple rings around the birds.
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = Math.max(1, w * 0.004);
  for (const [rx, ry, rr] of [[0.42, 0.82, 0.16], [0.42, 0.88, 0.22], [0.72, 0.86, 0.13], [0.72, 0.92, 0.18]]) {
    ctx.beginPath(); ctx.ellipse(x + w * rx, y + h * ry, w * rr, h * 0.018, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // Two flamingos: big one right, smaller one left.
  drawOneFlamingo(ctx, x, y, w, h, x + w * 0.66, y + h * 0.64, 1.35, 1);
  drawOneFlamingo(ctx, x, y, w, h, x + w * 0.28, y + h * 0.68, 0.95, -1);
  // Reeds at the lower-left corner.
  ctx.strokeStyle = '#1d5c3a'; ctx.lineWidth = Math.max(2, w * 0.008);
  for (let i = 0; i < 5; i++) {
    const rx = x + w * (0.02 + i * 0.025);
    ctx.beginPath(); ctx.moveTo(rx, y + h); ctx.quadraticCurveTo(rx + w * 0.01, y + h * 0.9, rx + w * 0.015, y + h * (0.84 + (i % 2) * 0.03)); ctx.stroke();
  }
}

function drawNeonSun(ctx, x, y, w, h, grade) {
  ctx.fillStyle = '#0d0524'; ctx.fillRect(x, y, w, h);
  const cx = x + w * 0.5, cy = y + h * 0.38, r = Math.min(w, h) * 0.3;
  const glow = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.8);
  glow.addColorStop(0, 'rgba(255,46,136,0.7)'); glow.addColorStop(1, 'rgba(255,46,136,0)');
  ctx.fillStyle = glow; ctx.fillRect(x, y, w, h);
  const sun = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  sun.addColorStop(0, '#ffd76a'); sun.addColorStop(0.6, '#ff7a3d'); sun.addColorStop(1, '#ff2e88');
  ctx.fillStyle = sun;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0d0524';
  for (let i = 0; i < 4; i++) {
    const sy = cy + r * (0.05 + i * 0.22);
    ctx.fillRect(cx - r, sy, r * 2, r * (0.07 + i * 0.03));
  }
  // Perspective neon grid floor.
  ctx.strokeStyle = '#ff2e88'; ctx.lineWidth = Math.max(1, w * 0.006);
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(cx + i * w * 0.06, y + h * 0.72); ctx.lineTo(cx + i * w * 0.3, y + h); ctx.stroke();
  }
  ctx.strokeStyle = '#22d3ee';
  for (let i = 0; i < 4; i++) {
    const gy = y + h * (0.74 + i * 0.06);
    ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();
  }
}

function drawWaves(ctx, x, y, w, h, grade) {
  drawSunsetSky(ctx, x, y, w, h * 0.55, grade, false);
  const sea = ctx.createLinearGradient(0, y + h * 0.45, 0, y + h);
  sea.addColorStop(0, '#12808a'); sea.addColorStop(1, '#0a2a4d');
  ctx.fillStyle = sea; ctx.fillRect(x, y + h * 0.45, w, h * 0.55);
  // Speedboat: hull + wake + spray.
  ctx.fillStyle = '#f5f0ff';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.18, y + h * 0.62); ctx.lineTo(x + w * 0.82, y + h * 0.62);
  ctx.lineTo(x + w * 0.68, y + h * 0.74); ctx.lineTo(x + w * 0.3, y + h * 0.74);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(x + w * 0.42, y + h * 0.5, w * 0.18, h * 0.12);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = Math.max(2, w * 0.01);
  ctx.beginPath(); ctx.moveTo(x + w * 0.18, y + h * 0.74);
  ctx.quadraticCurveTo(x + w * 0.05, y + h * 0.85, x + w * 0.02, y + h * 0.95); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + w * 0.82, y + h * 0.74);
  ctx.quadraticCurveTo(x + w * 0.95, y + h * 0.85, x + w * 0.98, y + h * 0.95); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(x, y + h * (0.82 + i * 0.06)); ctx.lineTo(x + w, y + h * (0.82 + i * 0.06)); ctx.stroke();
  }
}

function drawSportscar(ctx, x, y, w, h, grade) {
  // Orange sportscar tearing down a sunset boulevard: sky, low sun, palm
  // silhouettes, asphalt with gold dashes, speed lines, headlight beam.
  drawSunsetSky(ctx, x, y, w, h * 0.62, grade, true);
  const g = GRADES[grade];
  // Palm silhouettes at both edges.
  ctx.strokeStyle = g.deep; ctx.lineWidth = Math.max(3, w * 0.014);
  const edgePalm = (px, lean) => {
    ctx.beginPath(); ctx.moveTo(px, y + h * 0.62);
    ctx.quadraticCurveTo(px + lean * w * 0.05, y + h * 0.4, px + lean * w * 0.09, y + h * 0.26); ctx.stroke();
    const tx = px + lean * w * 0.09, ty = y + h * 0.26;
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI * 0.9 + (k / 4) * Math.PI * 0.8;
      const ex = tx + Math.cos(a) * w * 0.16, ey = ty + Math.sin(a) * h * 0.12;
      ctx.beginPath(); ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + Math.cos(a) * w * 0.08, ty - h * 0.03, ex, ey); ctx.stroke();
    }
  };
  edgePalm(x + w * 0.04, 1); edgePalm(x + w * 0.96, -1);
  // Road.
  const road = ctx.createLinearGradient(0, y + h * 0.6, 0, y + h);
  road.addColorStop(0, '#3a2566'); road.addColorStop(1, '#12082b');
  ctx.fillStyle = road; ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
  ctx.fillStyle = '#ffd76a';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + w * (0.08 + i * 0.24), y + h * 0.93, w * 0.09, h * 0.02);
  // Speed lines behind the car.
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(1.5, w * 0.005);
  for (let i = 0; i < 3; i++) {
    const ly = y + h * (0.5 + i * 0.09);
    ctx.beginPath(); ctx.moveTo(x + w * 0.02, ly); ctx.lineTo(x + w * 0.2, ly); ctx.stroke();
  }
  // Headlight beam.
  const beam = ctx.createLinearGradient(x + w * 0.82, 0, x + w, 0);
  beam.addColorStop(0, 'rgba(255,240,180,0.85)'); beam.addColorStop(1, 'rgba(255,240,180,0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.82, y + h * 0.68); ctx.lineTo(x + w, y + h * 0.6);
  ctx.lineTo(x + w, y + h * 0.78); ctx.lineTo(x + w * 0.82, y + h * 0.74);
  ctx.closePath(); ctx.fill();
  // Ground shadow.
  ctx.fillStyle = 'rgba(13,5,36,0.55)';
  ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.86, w * 0.36, h * 0.045, 0, 0, Math.PI * 2); ctx.fill();
  // Car body: low wedge with a long hood.
  const body = ctx.createLinearGradient(0, y + h * 0.55, 0, y + h * 0.85);
  body.addColorStop(0, '#ff7a3d'); body.addColorStop(0.5, '#ff2e4d'); body.addColorStop(1, '#c2185b');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.14, y + h * 0.82);
  ctx.lineTo(x + w * 0.18, y + h * 0.68);
  ctx.lineTo(x + w * 0.38, y + h * 0.62);
  ctx.lineTo(x + w * 0.6, y + h * 0.6);
  ctx.lineTo(x + w * 0.72, y + h * 0.66);
  ctx.lineTo(x + w * 0.86, y + h * 0.7);
  ctx.lineTo(x + w * 0.88, y + h * 0.82);
  ctx.closePath(); ctx.fill();
  // Cabin glass with a sky streak.
  ctx.fillStyle = '#160a33';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.4, y + h * 0.62); ctx.lineTo(x + w * 0.58, y + h * 0.6);
  ctx.lineTo(x + w * 0.68, y + h * 0.66); ctx.lineTo(x + w * 0.42, y + h * 0.67);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,215,106,0.85)';
  ctx.fillRect(x + w * 0.47, y + h * 0.615, w * 0.05, h * 0.012);
  // Spoiler + headlight + grille.
  ctx.fillStyle = '#160a33';
  ctx.fillRect(x + w * 0.13, y + h * 0.63, w * 0.1, h * 0.025);
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath(); ctx.ellipse(x + w * 0.85, y + h * 0.72, w * 0.02, h * 0.02, 0, 0, Math.PI * 2); ctx.fill();
  // Wheels with gold rims and spokes.
  const wheel = (wx) => {
    ctx.fillStyle = '#0d0524';
    ctx.beginPath(); ctx.arc(wx, y + h * 0.82, h * 0.085, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath(); ctx.arc(wx, y + h * 0.82, h * 0.045, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0d0524'; ctx.lineWidth = Math.max(1.5, w * 0.006);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(wx, y + h * 0.82);
      ctx.lineTo(wx + Math.cos(a) * h * 0.045, y + h * 0.82 + Math.sin(a) * h * 0.045); ctx.stroke();
    }
  };
  wheel(x + w * 0.3); wheel(x + w * 0.72);
}

function drawNeonStreet(ctx, x, y, w, h, grade) {
  // Night street: violet sky, moon, lit towers, neon signs, wet road with
  // smeared colour reflections.
  const sky = ctx.createLinearGradient(x, y, x, y + h * 0.7);
  sky.addColorStop(0, '#12082b'); sky.addColorStop(0.6, '#3d1a6e'); sky.addColorStop(1, '#7b1fa2');
  ctx.fillStyle = sky; ctx.fillRect(x, y, w, h * 0.7);
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath(); ctx.arc(x + w * 0.8, y + h * 0.14, Math.min(w, h) * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,233,168,0.25)';
  ctx.beginPath(); ctx.arc(x + w * 0.8, y + h * 0.14, Math.min(w, h) * 0.14, 0, Math.PI * 2); ctx.fill();
  const g = GRADES[grade];
  // Building silhouettes with lit windows kept INSIDE each building.
  const buildings = [
    { bx: 0, by: 0.3, bw: 0.3, bh: 0.42 },
    { bx: 0.68, by: 0.22, bw: 0.32, bh: 0.5 },
    { bx: 0.36, by: 0.42, bw: 0.28, bh: 0.3 },
  ];
  ctx.fillStyle = g.deep;
  for (const b of buildings) ctx.fillRect(x + w * b.bx, y + h * b.by, w * b.bw, h * b.bh);
  const winColors = ['#ffd76a', '#22d3ee', '#ff2e88'];
  for (let bi = 0; bi < buildings.length; bi++) {
    const b = buildings[bi];
    for (let i = 0; i < 10; i++) {
      const wx = x + w * (b.bx + 0.03 + ((i * 37) % 70) / 100 * (b.bw - 0.06));
      const wy = y + h * (b.by + 0.04 + ((i * 53) % 70) / 100 * (b.bh - 0.08));
      ctx.fillStyle = winColors[(bi + i) % 3];
      ctx.globalAlpha = 0.55 + ((i * 7) % 40) / 100;
      ctx.fillRect(wx, wy, Math.max(2, w * 0.014), Math.max(2, w * 0.014));
    }
  }
  ctx.globalAlpha = 1;
  // Neon signs: glowing OPEN sign (pink) and a cyan bar sign.
  ctx.save();
  ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = w * 0.03;
  ctx.strokeStyle = '#ff5db1'; ctx.lineWidth = Math.max(2, w * 0.008);
  ctx.strokeRect(x + w * 0.06, y + h * 0.36, w * 0.2, h * 0.1);
  ctx.fillStyle = '#ffd7ef';
  ctx.font = `${Math.max(12, h * 0.055)}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('OPEN', x + w * 0.16, y + h * 0.41);
  ctx.restore();
  ctx.save();
  ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = w * 0.03;
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(x + w * 0.72, y + h * 0.3, w * 0.05, h * 0.22);
  ctx.fillStyle = '#0d0524';
  ctx.fillRect(x + w * 0.735, y + h * 0.33, w * 0.02, h * 0.16);
  ctx.restore();
  // Wet road + smeared reflections.
  const road = ctx.createLinearGradient(0, y + h * 0.7, 0, y + h);
  road.addColorStop(0, '#241640'); road.addColorStop(1, '#0d0524');
  ctx.fillStyle = road; ctx.fillRect(x, y + h * 0.7, w, h * 0.3);
  for (const [rx, col, rw] of [[0.16, '#ff2e88', 0.05], [0.74, '#22d3ee', 0.04], [0.5, '#ffd76a', 0.03]]) {
    const refl = ctx.createLinearGradient(0, y + h * 0.72, 0, y + h);
    refl.addColorStop(0, col); refl.addColorStop(1, 'rgba(13,5,36,0)');
    ctx.globalAlpha = 0.7; ctx.fillStyle = refl;
    ctx.fillRect(x + w * (rx - rw / 2), y + h * 0.72, w * rw, h * 0.26);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,215,106,0.8)'; ctx.lineWidth = Math.max(1.5, w * 0.005);
  ctx.setLineDash([w * 0.06, w * 0.05]);
  ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h * 0.86); ctx.lineTo(x + w * 0.5, y + h); ctx.stroke();
  ctx.setLineDash([]);
}

function drawLifeguard(ctx, x, y, w, h, grade) {
  // Beach: sunset sky, sea band, sand, striped lifeguard tower + umbrella.
  drawSunsetSky(ctx, x, y, w, h * 0.5, grade, true);
  drawBirds(ctx, x, y, w, h * 0.3, 2);
  const sea = ctx.createLinearGradient(0, y + h * 0.48, 0, y + h * 0.68);
  sea.addColorStop(0, '#12808a'); sea.addColorStop(1, '#0a5a7a');
  ctx.fillStyle = sea; ctx.fillRect(x, y + h * 0.48, w, h * 0.2);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = Math.max(1.5, w * 0.005);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(x, y + h * (0.53 + i * 0.05));
    ctx.quadraticCurveTo(x + w * 0.5, y + h * (0.51 + i * 0.05), x + w, y + h * (0.53 + i * 0.05)); ctx.stroke();
  }
  ctx.fillStyle = '#f2cf9a';
  ctx.fillRect(x, y + h * 0.68, w, h * 0.32);
  // Tower: angled legs, platform, striped roof, flag.
  const tx = x + w * 0.5;
  ctx.strokeStyle = '#f5f0ff'; ctx.lineWidth = Math.max(3, w * 0.016);
  ctx.beginPath(); ctx.moveTo(tx - w * 0.12, y + h * 0.96); ctx.lineTo(tx - w * 0.05, y + h * 0.52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx + w * 0.12, y + h * 0.96); ctx.lineTo(tx + w * 0.05, y + h * 0.52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx - w * 0.09, y + h * 0.78); ctx.lineTo(tx + w * 0.09, y + h * 0.78); ctx.stroke();
  ctx.fillStyle = '#f5f0ff';
  ctx.fillRect(tx - w * 0.09, y + h * 0.48, w * 0.18, h * 0.05);
  // Striped roof.
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? '#ff2e88' : '#f5f0ff';
    ctx.beginPath();
    ctx.moveTo(tx - w * 0.11 + (i * w * 0.22) / 6, y + h * 0.48);
    ctx.lineTo(tx - w * 0.11 + ((i + 1) * w * 0.22) / 6, y + h * 0.48);
    ctx.lineTo(tx - w * 0.07 + ((i + 1) * w * 0.14) / 6, y + h * 0.4);
    ctx.lineTo(tx - w * 0.07 + (i * w * 0.14) / 6, y + h * 0.4);
    ctx.closePath(); ctx.fill();
  }
  // Flag.
  ctx.strokeStyle = '#160a33'; ctx.lineWidth = Math.max(2, w * 0.008);
  ctx.beginPath(); ctx.moveTo(tx + w * 0.07, y + h * 0.4); ctx.lineTo(tx + w * 0.07, y + h * 0.28); ctx.stroke();
  ctx.fillStyle = '#ff2e88';
  ctx.beginPath(); ctx.moveTo(tx + w * 0.07, y + h * 0.28); ctx.lineTo(tx + w * 0.15, y + h * 0.31); ctx.lineTo(tx + w * 0.07, y + h * 0.34); ctx.closePath(); ctx.fill();
  // Striped umbrella on the sand.
  const ux = x + w * 0.82, uy = y + h * 0.82;
  ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = Math.max(2, w * 0.008);
  ctx.beginPath(); ctx.moveTo(ux, uy); ctx.lineTo(ux, y + h * 0.97); ctx.stroke();
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? '#22d3ee' : '#f5f0ff';
    ctx.beginPath();
    ctx.moveTo(ux, uy);
    ctx.arc(ux, uy, w * 0.09, Math.PI + (i * Math.PI) / 6, Math.PI + ((i + 1) * Math.PI) / 6);
    ctx.closePath(); ctx.fill();
  }
}

/** Paint one procedural Vice-art panel. */
export function drawViceArt(ctx, kind, x, y, w, h, grade) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (kind === 'skyline') drawSkyline(ctx, x, y, w, h, grade);
  else if (kind === 'palms') drawPalms(ctx, x, y, w, h, grade);
  else if (kind === 'flamingo') drawFlamingo(ctx, x, y, w, h, grade);
  else if (kind === 'neon-sun') drawNeonSun(ctx, x, y, w, h, grade);
  else if (kind === 'sportscar') drawSportscar(ctx, x, y, w, h, grade);
  else if (kind === 'neon-street') drawNeonStreet(ctx, x, y, w, h, grade);
  else if (kind === 'lifeguard') drawLifeguard(ctx, x, y, w, h, grade);
  else drawWaves(ctx, x, y, w, h, grade);
  ctx.restore();
}

/** The one grade that unifies every panel: a warm magenta wash (stronger
 *  at the bottom) + vignette, applied identically to photos and art. */
export function applyGradeWash(ctx, x, y, w, h, grade) {
  const g = GRADES[grade];
  const wash = ctx.createLinearGradient(0, y, 0, y + h);
  wash.addColorStop(0, 'rgba(255,122,61,0)');
  wash.addColorStop(0.6, g.tint);
  wash.addColorStop(1, 'rgba(43,26,94,0.42)');
  ctx.fillStyle = wash; ctx.fillRect(x, y, w, h);
  const vig = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.35, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(10,5,30,0.35)');
  ctx.fillStyle = vig; ctx.fillRect(x, y, w, h);
}

/** Halftone print dots over a rect — the "Poster Ink" texture that makes
 *  photos and procedural art read as one printed poster. */
export function applyPosterInk(ctx, x, y, w, h) {
  const step = Math.max(7, Math.min(12, w * 0.014));
  ctx.fillStyle = 'rgba(18,8,43,0.07)';
  for (let py = y + step / 2; py < y + h; py += step) {
    for (let px = x + step / 2; px < x + w; px += step) {
      ctx.beginPath(); ctx.arc(px, py, step * 0.16, 0, Math.PI * 2); ctx.fill();
    }
  }
}

/**
 * Draw a photo face-safe into a rect. Instead of cover-fit from the centre
 * (which slices a face off in a wide panel), the source window is cut to
 * the panel's aspect ratio and centred on the panel's face focus point
 * (fx, fy as fractions of the photo), so the whole face stays in frame.
 * Zoom shrinks the source window around the focus; ox/oy pan it.
 */
export function drawPhotoPanel(ctx, photo, panel, x, y, w, h, grade) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const nw = photo.naturalWidth, nh = photo.naturalHeight;
  const aspect = w / h;
  let sw, sh;
  if (nw / nh > aspect) { sh = nh; sw = nh * aspect; }
  else { sw = nw; sh = nw / aspect; }
  const zoom = Math.max(100, panel.zoom || 100) / 100;
  sw /= zoom; sh /= zoom;
  const fx = panel.fx ?? 0.5, fy = panel.fy ?? 0.25;
  let sx = fx * nw - sw / 2;
  let sy = fy * nh - sh / 2;
  sx = Math.max(0, Math.min(nw - sw, sx));
  sy = Math.max(0, Math.min(nh - sh, sy));
  sx += ((panel.ox || 0) / 100) * sw;
  sy += ((panel.oy || 0) / 100) * sh;
  sx = Math.max(0, Math.min(nw - sw, sx));
  sy = Math.max(0, Math.min(nh - sh, sy));
  try { ctx.filter = 'saturate(1.28) contrast(1.1)'; } catch { /* older canvas */ }
  ctx.drawImage(photo, sx, sy, sw, sh, x, y, w, h);
  try { ctx.filter = 'none'; } catch { /* ignore */ }
  applyGradeWash(ctx, x, y, w, h, grade);
  ctx.restore();
}

/**
 * Wide-hero photo: a 4:1 hero can never hold a whole face with a cover
 * crop (the source window is shorter than a face), so the hero shows the
 * photo contain-fit — the whole photo, face whole — over the same photo
 * blurred dark as a backdrop. The grade wash unifies both layers.
 */
export function drawHeroPhoto(ctx, photo, panel, x, y, w, h, grade) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const nw = photo.naturalWidth, nh = photo.naturalHeight;
  // Blurred cover backdrop.
  const bgScale = Math.max(w / nw, h / nh);
  const bw = nw * bgScale, bh = nh * bgScale;
  try { ctx.filter = 'blur(18px) brightness(0.62) saturate(1.35)'; } catch { /* older canvas */ }
  ctx.drawImage(photo, x + (w - bw) / 2, y + (h - bh) / 2, bw, bh);
  try { ctx.filter = 'none'; } catch { /* ignore */ }
  // Sharp contain-fit photo, whole face visible, centred on the focus x.
  const zoom = Math.max(100, panel.zoom || 100) / 100;
  const fgScale = Math.min(w / nw, h / nh) * zoom;
  const fw = nw * fgScale, fh = nh * fgScale;
  const fx = panel.fx ?? 0.5;
  const fcx = x + w * (0.5 + (fx - 0.5) * 0.3);
  try { ctx.filter = 'saturate(1.28) contrast(1.1)'; } catch { /* older canvas */ }
  ctx.drawImage(photo, fcx - fw / 2, y + (h - fh) / 2, fw, fh);
  try { ctx.filter = 'none'; } catch { /* ignore */ }
  applyGradeWash(ctx, x, y, w, h, grade);
  ctx.restore();
}

/** Bold condensed title with a hard offset shadow, fitted to maxWidth and maxHeight. */
export function drawTitleBlock(ctx, state, cx, baselineY, maxWidth, maxHeight = Infinity) {
  const title = (state.title || '').trim().toUpperCase();
  if (!title) return 0;
  const palettes = {
    white: ['#ffd76a', '#ff7a3d', '#ff2e88', '#ff5db1'],
    yellow: ['#ffd76a', '#ffb347', '#ff7a3d', '#160a33'],
    pink: ['#ff5db1', '#ff2e88', '#ff7a3d', '#ffffff'],
    cyan: ['#22d3ee', '#7dd3fc', '#ff2e88', '#ff5db1'],
  };
  const stops = palettes[state.titleColor] || palettes.white;
  const shadow = state.titleColor === 'yellow' ? '#160a33' : '#ff2e88';
  let size = fitFont(ctx, title, (maxWidth * 0.16) * (state.titleScale / 100), maxWidth, '"Anton", "Archivo Black", sans-serif');
  size = Math.min(size, maxHeight);
  ctx.font = `${size}px "Anton", "Archivo Black", sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const metrics = ctx.measureText(title);
  const grad = ctx.createLinearGradient(cx - metrics.width / 2, 0, cx + metrics.width / 2, 0);
  grad.addColorStop(0, stops[0]); grad.addColorStop(0.45, stops[1]);
  grad.addColorStop(0.75, stops[2]); grad.addColorStop(1, stops[3]);
  const off = Math.max(3, size * 0.06);
  ctx.fillStyle = shadow;
  ctx.fillText(title, cx + off, baselineY + off);
  ctx.fillStyle = grad;
  ctx.fillText(title, cx, baselineY);
  return size;
}

/** The dedicated title band: tagline, giant gradient title, subtitle and
 *  two sticker badges — all on solid navy, never over any photo. */
export function drawTitleBand(ctx, state, W, H) {
  const bandH = Math.round(H * 0.235);
  const by = H - bandH;
  ctx.fillStyle = '#12082b';
  ctx.fillRect(0, by, W, bandH);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, by, W, Math.max(4, bandH * 0.025));
  const cx = W / 2;
  // Measure the badges FIRST: the title only gets the width that is left
  // between them, so a long title can never run under a badge.
  const pillH = Math.min(bandH * 0.3, W * 0.055);
  let pillFont = pillH * 0.52;
  const pillText = 'NEW · SUMMER 2026';
  ctx.font = `${pillFont}px "Bebas Neue", sans-serif`;
  let pillW = ctx.measureText(pillText).width + pillH * 1.1;
  if (pillW > W * 0.26) {
    pillFont *= (W * 0.26) / pillW;
    ctx.font = `${pillFont}px "Bebas Neue", sans-serif`;
    pillW = ctx.measureText(pillText).width + pillH * 1.1;
  }
  const stampR = Math.min(bandH * 0.3, W * 0.075);
  const titleMaxW = Math.max(W - pillW - stampR * 2 - 100, W * 0.3);
  // Tagline in neon script, gold-pink with a soft glow.
  const tag = (state.tagline || '').trim();
  if (tag) {
    ctx.font = `${Math.max(16, bandH * 0.15)}px "Pacifico", cursive`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = bandH * 0.09;
    ctx.fillStyle = '#ffd7ef';
    ctx.fillText(tag, cx, by + bandH * 0.22);
    ctx.shadowBlur = 0;
  }
  const size = drawTitleBlock(ctx, state, cx, by + bandH * 0.6, titleMaxW, bandH * 0.36);
  void size;
  const sub = (state.subtitle || '').trim().toUpperCase();
  if (sub) {
    try { ctx.letterSpacing = '4px'; } catch { /* ignore */ }
    const sSize = Math.min(fitFont(ctx, sub, bandH * 0.13, Math.min(W * 0.5, titleMaxW), '"Bebas Neue", sans-serif'), bandH * 0.13);
    ctx.font = `${sSize}px "Bebas Neue", sans-serif`;
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffd76a';
    ctx.fillText(sub, cx, by + bandH * 0.88);
    try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
  }
  // Sticker badges: a tilted "NEW · SUMMER 2026" pill (left) and a round
  // "EST. 2026" stamp (right). They sit in the band's empty corners, clear
  // of the centred title and never clipped by the canvas edge.
  ctx.save();
  const pillX = pillW / 2 + 14;
  ctx.translate(pillX, by + bandH * 0.52);
  ctx.rotate(-0.07);
  ctx.fillStyle = '#ff2e88';
  ctx.font = `${pillFont}px "Bebas Neue", sans-serif`;
  ctx.beginPath();
  ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(pillText, 0, pillH * 0.03);
  ctx.restore();
  const r = stampR;
  const stampX = W - r - 14, stampY = by + bandH * 0.52;
  ctx.save();
  ctx.beginPath(); ctx.arc(stampX, stampY, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,215,106,0.12)'; ctx.fill();
  ctx.strokeStyle = '#ffd76a'; ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.stroke();
  ctx.fillStyle = '#ffd76a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${r * 0.42}px "Bebas Neue", sans-serif`;
  ctx.fillText('EST.', stampX, stampY - r * 0.22);
  ctx.fillText('2026', stampX, stampY + r * 0.28);
  ctx.restore();
  return { x: 0, y: by, w: W, h: bandH };
}

/** Compute the panel rectangles for a layout. Returns [{x,y,w,h}, ...]
 *  in panel order; the title band takes the bottom 23.5% of the canvas. */
export function panelRects(layout, W, H) {
  const gut = Math.round(Math.min(W, H) * 0.012);
  const border = Math.round(Math.min(W, H) * 0.014);
  const bandH = Math.round(H * 0.235);
  const gridBottom = H - bandH - gut;
  const inner = { x: border, y: border, w: W - border * 2, h: gridBottom - border };
  if (layout === 'solo') return [{ ...inner }];
  if (layout === 'wide') {
    const heroH = Math.round(inner.h * 0.6);
    const stripY = inner.y + heroH + gut;
    const stripH = inner.h - heroH - gut;
    const cw = (inner.w - gut * 2) / 3;
    return [
      { x: inner.x, y: inner.y, w: inner.w, h: heroH },
      { x: inner.x, y: stripY, w: cw, h: stripH },
      { x: inner.x + cw + gut, y: stripY, w: cw, h: stripH },
      { x: inner.x + (cw + gut) * 2, y: stripY, w: cw, h: stripH },
    ];
  }
  // classic: hero mosaic — panel 0 spans 2x2, the rest are single cells.
  const cw = (inner.w - gut * 2) / 3;
  const ch = (inner.h - gut * 2) / 3;
  const cell = (c, r) => ({ x: inner.x + c * (cw + gut), y: inner.y + r * (ch + gut), w: cw, h: ch });
  return [
    { x: inner.x, y: inner.y, w: cw * 2 + gut, h: ch * 2 + gut }, // hero
    cell(2, 0), // skyline
    cell(2, 1), // pier fisherman
    cell(0, 2), // sportscar
    cell(1, 2), // flamingo lagoon
    cell(2, 2), // neon street
  ];
}

function panelPhoto(panel, photos) {
  if (!panel || typeof panel.src !== 'string') return null;
  if (panel.src.startsWith('photo')) {
    const i = Number(panel.src.slice(5));
    return photos[i] || null;
  }
  return null;
}

/** Draw the whole cover onto `canvas` at its own pixel size. */
export function drawCoverArt(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  // Warm cream paper: gutters read as a printed poster, not a dark grid.
  ctx.fillStyle = '#fdf0d5';
  ctx.fillRect(0, 0, W, H);
  const rects = panelRects(state.layout, W, H);
  const count = state.layout === 'classic' ? 6 : state.layout === 'wide' ? 4 : 1;
  // Art kinds already on the cover, so a fallback never repeats a kind
  // that is already showing (e.g. an empty photo slot falling back to the
  // same art as a neighbour).
  const usedKinds = new Set();
  const pickArtKind = (wanted, i) => {
    let kind = ART_KINDS.includes(wanted) ? wanted : ART_KINDS[i % ART_KINDS.length];
    let guard = 0;
    while (usedKinds.has(kind) && guard < ART_KINDS.length) {
      kind = ART_KINDS[(ART_KINDS.indexOf(kind) + 1) % ART_KINDS.length];
      guard++;
    }
    usedKinds.add(kind);
    return kind;
  };
  for (let i = 0; i < count; i++) {
    const r = rects[i];
    const panel = state.panels[i] || { src: 'skyline', zoom: 100, ox: 0, oy: 0 };
    const photo = panelPhoto(panel, photos);
    if (photo) {
      if (state.layout === 'wide' && i === 0) drawHeroPhoto(ctx, photo, panel, r.x, r.y, r.w, r.h, state.grade);
      else drawPhotoPanel(ctx, photo, panel, r.x, r.y, r.w, r.h, state.grade);
    } else if (state.fillArt) {
      const kind = pickArtKind(panel.src, i);
      drawViceArt(ctx, kind, r.x, r.y, r.w, r.h, state.grade);
      applyGradeWash(ctx, r.x, r.y, r.w, r.h, state.grade);
    } else {
      drawSunsetSky(ctx, r.x, r.y, r.w, r.h, state.grade, false);
    }
    // One print pass over every panel, so photos and art share the grade.
    applyPosterInk(ctx, r.x, r.y, r.w, r.h);
    // Thick ink outline around every panel, comic-book style.
    ctx.strokeStyle = 'rgba(18,8,43,0.95)';
    ctx.lineWidth = Math.max(2, Math.min(W, H) * 0.006);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
  }
  // Dedicated caption band — the title never touches a photo.
  drawTitleBand(ctx, state, W, H);
  return rects;
}
