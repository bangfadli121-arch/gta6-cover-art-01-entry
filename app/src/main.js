// Vice Cover Studio — page wiring: photo slots, panel picker, caption
// controls, live preview and PNG export in 1080x1080 / 1080x1350 / 1920x1080.
import { SIZES, defaultState, drawCoverArt, ART_KINDS } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const state = defaultState();
const photos = [null, null, null];
let fontsReady = false;

const PANEL_LABELS = ['Skyline', 'Palms', 'Flamingo', 'Neon sun', 'Waves'];

function panelCount() {
  return state.layout === 'classic' ? 9 : state.layout === 'wide' ? 4 : 1;
}

function sourceOptions() {
  const opts = [
    ['photo0', 'Photo A'], ['photo1', 'Photo B'], ['photo2', 'Photo C'],
    ...ART_KINDS.map((k) => [k, `Vice art: ${k}`]),
  ];
  return opts;
}

function buildPanelGrid() {
  const grid = $('panelGrid');
  grid.innerHTML = '';
  const n = panelCount();
  grid.style.setProperty('--cols', state.layout === 'classic' ? 3 : state.layout === 'wide' ? 4 : 1);
  for (let i = 0; i < n; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'panel-btn' + (i === state.selected ? ' selected' : '');
    b.textContent = state.layout === 'classic' ? `Panel ${i + 1}${i === 4 ? ' ★ hero' : ''}` : `Panel ${i + 1}${i === 0 ? ' ★ hero' : ''}`;
    b.title = `Select panel ${i + 1}`;
    b.addEventListener('click', () => { state.selected = i; syncPanelControls(); redraw(); });
    grid.appendChild(b);
  }
}

function syncPanelControls() {
  const sel = $('panelSource');
  const p = state.panels[state.selected] || { src: 'skyline', zoom: 110, ox: 0, oy: 0 };
  sel.innerHTML = '';
  for (const [value, label] of sourceOptions()) {
    const o = document.createElement('option');
    o.value = value; o.textContent = label + (value.startsWith('photo') && !photos[Number(value.slice(5))] ? ' (empty)' : '');
    if (value === p.src) o.selected = true;
    sel.appendChild(o);
  }
  $('zoom').value = p.zoom; $('zoomOut').textContent = `${p.zoom}%`;
  $('offX').value = p.ox; $('offXOut').textContent = p.ox;
  $('offY').value = p.oy; $('offYOut').textContent = p.oy;
  document.querySelectorAll('.panel-btn').forEach((b, i) => b.classList.toggle('selected', i === state.selected));
  document.querySelectorAll('.slot').forEach((s, i) => {
    s.classList.toggle('filled', !!photos[i]);
    s.querySelector('.slot-state').textContent = photos[i] ? 'loaded' : 'empty';
  });
}

function redraw() {
  const [w, h] = SIZES[state.size];
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  drawCoverArt(canvas, state, photos);
  $('sizeLabel').textContent = `${w} × ${h}`;
}

function currentPanel() {
  if (!state.panels[state.selected]) state.panels[state.selected] = { src: 'skyline', zoom: 110, ox: 0, oy: 0 };
  return state.panels[state.selected];
}

/** Load an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

async function setPhotoSlot(i, url) {
  try {
    photos[i] = await loadImage(url);
    syncPanelControls(); redraw();
    $('status').textContent = `Photo ${'ABC'[i]} loaded — pick panels to place it.`;
  } catch {
    $('status').textContent = 'That image could not be loaded. Try another file.';
  }
}

function bindFileInput(inputId, i) {
  $(inputId).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await setPhotoSlot(i, URL.createObjectURL(file));
  });
}
bindFileInput('file0', 0);
bindFileInput('file1', 1);
bindFileInput('file2', 2);

$('samplePier').addEventListener('click', () => setPhotoSlot(0, 'samples/pier.jpg'));
$('sampleBoulevard').addEventListener('click', () => setPhotoSlot(1, 'samples/boulevard.jpg'));
$('sampleBoth').addEventListener('click', async () => {
  await setPhotoSlot(0, 'samples/pier.jpg');
  await setPhotoSlot(1, 'samples/boulevard.jpg');
  state.panels[0].src = 'photo1'; state.panels[2].src = 'photo0';
  state.panels[4].src = 'photo0'; state.panels[6].src = 'photo1';
  syncPanelControls(); redraw();
});

$('layout').addEventListener('change', (e) => {
  state.layout = e.target.value;
  state.selected = 0;
  buildPanelGrid(); syncPanelControls(); redraw();
});
$('grade').addEventListener('change', (e) => { state.grade = e.target.value; redraw(); });
$('size').addEventListener('change', (e) => { state.size = e.target.value; redraw(); });
$('fillArt').addEventListener('change', (e) => { state.fillArt = e.target.checked; redraw(); });

$('panelSource').addEventListener('change', (e) => {
  currentPanel().src = e.target.value;
  syncPanelControls(); redraw();
});
function bindRange(id, outId, key, fmt) {
  $(id).addEventListener('input', (e) => {
    const v = Number(e.target.value);
    currentPanel()[key] = v;
    $(outId).textContent = fmt(v);
    redraw();
  });
}
bindRange('zoom', 'zoomOut', 'zoom', (v) => `${v}%`);
bindRange('offX', 'offXOut', 'ox', (v) => `${v}`);
bindRange('offY', 'offYOut', 'oy', (v) => `${v}`);

$('shuffle').addEventListener('click', () => {
  const kinds = [...ART_KINDS];
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }
  const n = panelCount();
  for (let i = 0; i < n; i++) {
    if (i === 4 && state.layout === 'classic') continue; // hero keeps the photo
    if (i === 0 && state.layout !== 'classic') continue;
    const p = state.panels[i];
    if (!p.src.startsWith('photo')) p.src = kinds[i % kinds.length];
  }
  syncPanelControls(); redraw();
});

$('fillPhotos').addEventListener('click', () => {
  const loaded = photos.map((p, i) => (p ? `photo${i}` : null)).filter(Boolean);
  if (!loaded.length) { $('status').textContent = 'Load a photo first (or a sample).'; return; }
  const n = panelCount();
  for (let i = 0; i < n; i++) state.panels[i].src = loaded[i % loaded.length];
  syncPanelControls(); redraw();
  $('status').textContent = 'Your photos now fill every panel — drag zoom / move per panel.';
});

$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
$('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
$('titleColor').addEventListener('change', (e) => { state.titleColor = e.target.value; redraw(); });
$('titleScale').addEventListener('input', (e) => {
  state.titleScale = Number(e.target.value);
  $('titleScaleOut').textContent = `${state.titleScale}%`;
  redraw();
});

/** Export the current cover at `sizeKey` as a PNG download. */
export function exportCover(sizeKey) {
  const [w, h] = SIZES[sizeKey];
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const saved = state.size;
  state.size = sizeKey;
  drawCoverArt(off, state, photos);
  state.size = saved;
  off.toBlob((blob) => {
    if (!blob) { $('status').textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${w}x${h}.png`;
    a.click();
    $('status').textContent = `Saved vice-cover-${w}x${h}.png`;
  }, 'image/png');
}

$('export').addEventListener('click', () => exportCover(state.size));
$('exportAll').addEventListener('click', () => {
  for (const key of Object.keys(SIZES)) setTimeout(() => exportCover(key), 150);
  $('status').textContent = 'Exporting all 3 sizes…';
});

// Click a panel on the preview canvas to select it.
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const py = ((e.clientY - rect.top) / rect.height) * canvas.height;
  import('./cover.js').then(({ panelRects }) => {
    const rects = panelRects(state.layout, canvas.width, canvas.height);
    const hit = rects.findIndex((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
    if (hit >= 0) { state.selected = hit; syncPanelControls(); redraw(); }
  });
});

// Boot: wait for the poster fonts, then paint. ?shot= scenes (screenshots)
// take over the state instead of the default demo.
async function boot() {
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 2500)),
    ]);
    fontsReady = true;
  } catch { /* fonts fall back to system sans */ }
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    await runShot(shot, params, { state, photos, setPhotoSlot, redraw, buildPanelGrid, syncPanelControls });
  } else {
    buildPanelGrid(); syncPanelControls(); redraw();
  }
  window.__viceReady = fontsReady;
}
boot();
