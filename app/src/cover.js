// Vice Cover Studio — cover drawing engine.
// Draws a GTA-poster-style cover on any canvas: a 3x3 comic-book panel grid
// (classic), a hero-wide band with a strip (wide), or one full-bleed scene
// (solo), with a sunset / neon grade, bold condensed lettering and a hard
// offset shadow. Photos are drawn cover-fit per panel; panels without a
// photo get procedurally painted Vice art (skyline, palms, flamingo, neon
// sun) so the poster never has an empty hole.

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

export const GRADES = {
  sunset: { sky: ['#ff2e88', '#ff7a3d', '#ffb347', '#2b1a5e'], sun: '#ffd76a', tint: 'rgba(255,46,136,0.16)', deep: '#160a33' },
  golden: { sky: ['#ff9a3d', '#ffc46b', '#ffe9a8', '#3d2b6e'], sun: '#fff3c4', tint: 'rgba(255,154,61,0.18)', deep: '#241640' },
  neon: { sky: ['#1b0b3d', '#7b1fa2', '#ff2e88', '#12082b'], sun: '#ff5db1', tint: 'rgba(123,31,162,0.22)', deep: '#0d0524' },
  teal: { sky: ['#0e3a5c', '#12808a', '#ff7a3d', '#123a5c'], sun: '#ffe9a8', tint: 'rgba(18,128,138,0.18)', deep: '#0a1f33' },
};

export const ART_KINDS = ['skyline', 'palms', 'flamingo', 'neon-sun', 'waves'];

export function defaultPanels() {
  // Classic grid reading order: skyline, photo A, palms / photo B, HERO, waves /
  // neon-sun, photo C, flamingo. The centre cell (index 4) is the hero.
  const kinds = ['skyline', 'photo0', 'palms', 'photo1', 'photo0', 'waves', 'neon-sun', 'photo2', 'flamingo'];
  return kinds.map((src) => ({ src, zoom: 110, ox: 0, oy: 0 }));
}

export function defaultState() {
  return {
    layout: 'classic', grade: 'sunset', size: '1080x1080',
    title: 'SUNSET HEIST', subtitle: 'VICE CITY · 2026', tagline: 'one last ride',
    titleColor: 'white', titleScale: 100, fillArt: true,
    panels: defaultPanels(), selected: 4,
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

function drawSkyline(ctx, x, y, w, h, grade) {
  drawSunsetSky(ctx, x, y, w, h, grade, true);
  const g = GRADES[grade];
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
  // Water band.
  const water = ctx.createLinearGradient(0, y + h * 0.88, 0, y + h);
  water.addColorStop(0, '#1b2a6b'); water.addColorStop(1, '#0d0524');
  ctx.fillStyle = water; ctx.fillRect(x, y + h * 0.88, w, h * 0.12);
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
}

function drawFlamingo(ctx, x, y, w, h, grade) {
  const g = GRADES[grade];
  const sea = ctx.createLinearGradient(x, y, x, y + h);
  sea.addColorStop(0, '#ff7a9e'); sea.addColorStop(0.5, '#ff2e88'); sea.addColorStop(1, '#2b1a5e');
  ctx.fillStyle = sea; ctx.fillRect(x, y, w, h);
  // Water ripples.
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = Math.max(1, w * 0.005);
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * (0.72 + i * 0.07), w * (0.3 + i * 0.06), h * 0.02, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Flamingo silhouette: body, S-neck, head, long legs.
  ctx.fillStyle = '#ff5da2'; ctx.strokeStyle = '#ff5da2';
  const cx = x + w * 0.52, cy = y + h * 0.42;
  ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.2, h * 0.11, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = Math.max(4, w * 0.03);
  ctx.beginPath(); ctx.moveTo(cx + w * 0.14, cy - h * 0.05);
  ctx.bezierCurveTo(cx + w * 0.3, cy - h * 0.2, cx + w * 0.08, cy - h * 0.24, cx + w * 0.16, cy - h * 0.3);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + w * 0.17, cy - h * 0.32, w * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#160a33';
  ctx.beginPath(); ctx.arc(cx + w * 0.19, cy - h * 0.33, w * 0.012, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ff8fc0'; ctx.lineWidth = Math.max(2, w * 0.012);
  ctx.beginPath(); ctx.moveTo(cx - w * 0.04, cy + h * 0.1); ctx.lineTo(cx - w * 0.05, y + h * 0.78); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + w * 0.05, cy + h * 0.1); ctx.lineTo(cx + w * 0.1, y + h * 0.78); ctx.stroke();
  // Wing shading.
  ctx.fillStyle = 'rgba(22,10,51,0.22)';
  ctx.beginPath(); ctx.ellipse(cx - w * 0.02, cy + h * 0.02, w * 0.09, h * 0.045, -0.2, 0, Math.PI * 2); ctx.fill();
}

function drawNeonSun(ctx, x, y, w, h, grade) {
  const g = GRADES[grade];
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

/** Paint one procedural Vice-art panel. */
export function drawViceArt(ctx, kind, x, y, w, h, grade) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (kind === 'skyline') drawSkyline(ctx, x, y, w, h, grade);
  else if (kind === 'palms') drawPalms(ctx, x, y, w, h, grade);
  else if (kind === 'flamingo') drawFlamingo(ctx, x, y, w, h, grade);
  else if (kind === 'neon-sun') drawNeonSun(ctx, x, y, w, h, grade);
  else drawWaves(ctx, x, y, w, h, grade);
  ctx.restore();
}

/** Draw a photo cover-fit into a rect, with zoom and pan offsets. */
export function drawPhotoPanel(ctx, photo, panel, x, y, w, h, grade) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const zoom = (panel.zoom || 110) / 100;
  const base = Math.max(w / photo.naturalWidth, h / photo.naturalHeight) * zoom;
  const pw = photo.naturalWidth * base, ph = photo.naturalHeight * base;
  const ox = ((panel.ox || 0) / 100) * w, oy = ((panel.oy || 0) / 100) * h;
  try { ctx.filter = 'saturate(1.28) contrast(1.1)'; } catch { /* older canvas */ }
  ctx.drawImage(photo, x + (w - pw) / 2 + ox, y + (h - ph) / 2 + oy, pw, ph);
  try { ctx.filter = 'none'; } catch { /* ignore */ }
  // Sunset grade wash + vignette, stronger at the bottom.
  const g = GRADES[grade];
  const wash = ctx.createLinearGradient(0, y, 0, y + h);
  wash.addColorStop(0, 'rgba(255,122,61,0)');
  wash.addColorStop(0.6, g.tint);
  wash.addColorStop(1, 'rgba(43,26,94,0.42)');
  ctx.fillStyle = wash; ctx.fillRect(x, y, w, h);
  const vig = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.35, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(10,5,30,0.35)');
  ctx.fillStyle = vig; ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** Bold condensed title with a hard offset shadow, fitted to maxWidth and maxHeight. */
export function drawTitleBlock(ctx, state, cx, baselineY, maxWidth, maxHeight = Infinity) {
  const title = (state.title || '').trim().toUpperCase();
  if (!title) return 0;
  const palettes = {
    white: ['#ffffff', '#ff2e88'],
    yellow: ['#ffd76a', '#160a33'],
    pink: ['#ff2e88', '#ffffff'],
    cyan: ['#22d3ee', '#ff2e88'],
  };
  const [main, offset] = palettes[state.titleColor] || palettes.white;
  let size = fitFont(ctx, title, (maxWidth * 0.16) * (state.titleScale / 100), maxWidth, '"Anton", "Archivo Black", sans-serif');
  size = Math.min(size, maxHeight);
  ctx.font = `${size}px "Anton", "Archivo Black", sans-serif`;
  const off = Math.max(3, size * 0.06);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = offset;
  ctx.fillText(title, cx + off, baselineY + off);
  ctx.fillStyle = main;
  ctx.fillText(title, cx, baselineY);
  return size;
}

export function drawCaptionLines(ctx, state, cx, y, maxWidth, maxHeight = Infinity) {
  const sub = (state.subtitle || '').trim().toUpperCase();
  if (sub) {
    try { ctx.letterSpacing = '4px'; } catch { /* ignore */ }
    let size = fitFont(ctx, sub, maxWidth * 0.045, maxWidth, '"Bebas Neue", sans-serif');
    size = Math.min(size, maxHeight);
    ctx.font = `${size}px "Bebas Neue", sans-serif`;
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffd76a';
    ctx.fillText(sub, cx, y + size);
    try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
    return size;
  }
  return 0;
}

export function drawTagline(ctx, state, cx, y) {
  const tag = (state.tagline || '').trim();
  if (!tag) return;
  ctx.font = `${Math.max(18, y * 0.045)}px "Pacifico", cursive`;
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = 24;
  ctx.fillStyle = '#ffd7ef';
  ctx.fillText(tag, cx, y);
  ctx.shadowBlur = 0;
}

/** Compute the panel rectangles for a layout. Returns [{x,y,w,h}, ...]. */
export function panelRects(layout, W, H) {
  const gut = Math.round(Math.min(W, H) * 0.012);
  const border = Math.round(Math.min(W, H) * 0.014);
  const inner = { x: border, y: border, w: W - border * 2, h: H - border * 2 };
  if (layout === 'solo') return [{ ...inner }];
  if (layout === 'wide') {
    const heroH = Math.round(inner.h * 0.64);
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
  // classic 3x3
  const cw = (inner.w - gut * 2) / 3;
  const ch = (inner.h - gut * 2) / 3;
  const rects = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      rects.push({ x: inner.x + c * (cw + gut), y: inner.y + r * (ch + gut), w: cw, h: ch });
    }
  }
  return rects;
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
  const g = GRADES[state.grade] || GRADES.sunset;
  ctx.fillStyle = '#0d0524';
  ctx.fillRect(0, 0, W, H);
  const rects = panelRects(state.layout, W, H);
  const count = state.layout === 'classic' ? 9 : state.layout === 'wide' ? 4 : 1;
  for (let i = 0; i < count; i++) {
    const r = rects[i];
    const panel = state.panels[i] || { src: 'skyline', zoom: 110, ox: 0, oy: 0 };
    const photo = panelPhoto(panel, photos);
    if (photo) {
      drawPhotoPanel(ctx, photo, panel, r.x, r.y, r.w, r.h, state.grade);
    } else if (state.fillArt) {
      const kind = ART_KINDS.includes(panel.src) ? panel.src : ART_KINDS[i % ART_KINDS.length];
      drawViceArt(ctx, kind, r.x, r.y, r.w, r.h, state.grade);
    } else {
      drawSunsetSky(ctx, r.x, r.y, r.w, r.h, state.grade, false);
    }
    // Thin ink outline around every panel, comic-book style.
    ctx.strokeStyle = 'rgba(13,5,36,0.9)';
    ctx.lineWidth = Math.max(2, Math.min(W, H) * 0.006);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
  }

  // Hero rim-light: a warm glow along the centre panel's edge (classic).
  if (state.layout === 'classic') {
    const c = rects[4];
    const rim = ctx.createLinearGradient(c.x, c.y, c.x + c.w, c.y + c.h);
    rim.addColorStop(0, 'rgba(255,215,106,0.28)');
    rim.addColorStop(0.5, 'rgba(255,46,136,0)');
    rim.addColorStop(1, 'rgba(255,122,61,0.2)');
    ctx.fillStyle = rim; ctx.fillRect(c.x, c.y, c.w, c.h);
  }

  // Caption band: title + subtitle + tagline, placed by layout.
  const cx = W / 2;
  if (state.layout === 'solo') {
    const bandH = H * 0.3;
    const band = ctx.createLinearGradient(0, H - bandH, 0, H);
    band.addColorStop(0, 'rgba(13,5,36,0)');
    band.addColorStop(1, 'rgba(13,5,36,0.88)');
    ctx.fillStyle = band; ctx.fillRect(0, H - bandH, W, bandH);
    drawTagline(ctx, state, cx, H * 0.74);
    const size = drawTitleBlock(ctx, state, cx, H * 0.9, W * 0.92, H * 0.13);
    drawCaptionLines(ctx, state, cx, H * 0.92, W * 0.8, H * 0.035);
    void size;
  } else if (state.layout === 'wide') {
    const hero = rects[0];
    const band = ctx.createLinearGradient(0, hero.y + hero.h * 0.55, 0, hero.y + hero.h);
    band.addColorStop(0, 'rgba(13,5,36,0)');
    band.addColorStop(1, 'rgba(13,5,36,0.85)');
    ctx.fillStyle = band; ctx.fillRect(hero.x, hero.y + hero.h * 0.55, hero.w, hero.h * 0.45);
    drawTitleBlock(ctx, state, cx, hero.y + hero.h * 0.88, W * 0.86, hero.h * 0.24);
    drawCaptionLines(ctx, state, cx, hero.y + hero.h * 0.9, W * 0.7, hero.h * 0.07);
    drawTagline(ctx, state, cx, hero.y + hero.h * 0.62);
  } else {
    // Classic: title ribbon across the bottom-centre, tagline above it.
    const bottom = rects[6];
    const ribbonH = bottom.h * 0.46;
    const ry = bottom.y + bottom.h - ribbonH;
    ctx.fillStyle = 'rgba(13,5,36,0.92)';
    ctx.fillRect(bottom.x - 2, ry, W - (bottom.x - 2) * 2, ribbonH);
    ctx.fillStyle = '#ff2e88';
    ctx.fillRect(bottom.x - 2, ry, W - (bottom.x - 2) * 2, Math.max(3, ribbonH * 0.07));
    drawTagline(ctx, state, cx, ry - H * 0.018);
    const size = drawTitleBlock(ctx, state, cx, ry + ribbonH * 0.52, W * 0.94, ribbonH * 0.6);
    drawCaptionLines(ctx, state, cx, ry + ribbonH * 0.56 + size * 0.3, W * 0.8, ribbonH * 0.26);
  }
  return rects;
}
