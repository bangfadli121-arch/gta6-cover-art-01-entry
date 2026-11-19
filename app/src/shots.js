// Fixed scenes for screenshots: ?shot=cover shows the exported cover alone,
// ?shot=editor shows the editor with sample photos loaded, ?shot=wide and
// ?shot=portrait show the other layouts and sizes. window.__shotReady is set
// once the scene is painted with fonts loaded.
// v2: classic is a 6-panel hero mosaic (hero boulevard 2x2 + skyline +
// pier + sportscar + flamingo + neon street); every photo appears ONCE and
// the caption lives in its own title band, never over a face.
export async function runShot(shot, query, app) {
  const { state, setPhotoSlot, redraw, buildPanelGrid, syncPanelControls } = app;
  const caption = query.get('caption');
  const grade = query.get('grade');
  if (caption) state.title = caption;
  if (query.get('subtitle')) state.subtitle = query.get('subtitle');
  if (query.get('tagline')) state.tagline = query.get('tagline');
  if (grade) state.grade = grade;
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('size')) state.size = query.get('size');
  if (query.get('color')) state.titleColor = query.get('color');

  const photo = query.get('photo') ?? 'pier';
  const photo2 = query.get('photo2');
  await setPhotoSlot(0, `samples/${photo}.jpg`);
  if (photo2) await setPhotoSlot(1, `samples/${photo2}.jpg`);
  // Resolve which slot holds which sample: 'photo0' is `photo`, 'photo1'
  // is `photo2`. The hero is always the boulevard woman, the pier
  // fisherman gets his own single panel — each used exactly once.
  const bvd = photo === 'boulevard' ? 'photo0' : 'photo1';
  const pier = photo === 'pier' ? 'photo0' : 'photo1';
  const heroFocus = { zoom: 100, ox: 0, oy: 0, fx: 0.52, fy: 0.20 };
  const pierFocus = { zoom: 100, ox: 0, oy: 0, fx: 0.47, fy: 0.22 };

  if (shot === 'cover' || shot === 'portrait' || shot === 'wide') {
    if (state.layout === 'classic') {
      state.panels[0].src = bvd; Object.assign(state.panels[0], heroFocus);
      state.panels[1].src = 'skyline';
      state.panels[2].src = pier; Object.assign(state.panels[2], pierFocus);
      state.panels[3].src = 'sportscar';
      state.panels[4].src = 'flamingo';
      state.panels[5].src = 'neon-street';
    } else if (state.layout === 'wide') {
      state.panels[0].src = photo2 ? bvd : 'photo0';
      Object.assign(state.panels[0], photo2 ? heroFocus : pierFocus);
      state.panels[1].src = 'skyline';
      state.panels[2].src = 'lifeguard';
      state.panels[3].src = 'flamingo';
    } else {
      state.panels[0].src = photo2 ? bvd : 'photo0';
      Object.assign(state.panels[0], photo2 ? heroFocus : pierFocus);
    }
  }
  if (shot === 'editor') {
    state.panels[0].src = bvd; Object.assign(state.panels[0], heroFocus);
    state.panels[1].src = 'skyline';
    state.panels[2].src = pier; Object.assign(state.panels[2], pierFocus);
    state.panels[3].src = 'sportscar';
    state.panels[4].src = 'flamingo';
    state.panels[5].src = 'neon-street';
  }

  const titleInput = document.getElementById('title');
  const subInput = document.getElementById('subtitle');
  const tagInput = document.getElementById('tagline');
  if (titleInput) titleInput.value = state.title;
  if (subInput) subInput.value = state.subtitle;
  if (tagInput) tagInput.value = state.tagline;
  const layoutSel = document.getElementById('layout');
  const gradeSel = document.getElementById('grade');
  const sizeSel = document.getElementById('size');
  if (layoutSel) layoutSel.value = state.layout;
  if (gradeSel) gradeSel.value = state.grade;
  if (sizeSel) sizeSel.value = state.size;
  const status = document.getElementById('status');
  if (status) status.textContent = `Cover ready — ${state.size.replace('x', ' × ')} · ${state.layout} · ${state.grade} grade.`;

  buildPanelGrid();
  syncPanelControls();
  if (shot === 'cover' || shot === 'portrait' || shot === 'wide') document.body.classList.add('shot-cover');
  redraw();
  try { await document.fonts.ready; } catch { /* ignore */ }
  redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
