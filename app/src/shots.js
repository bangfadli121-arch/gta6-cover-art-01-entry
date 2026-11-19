// Fixed scenes for screenshots: ?shot=cover shows the exported cover alone,
// ?shot=editor shows the editor with sample photos loaded, ?shot=wide and
// ?shot=portrait show the other layouts and sizes. window.__shotReady is set
// once the scene is painted with fonts loaded.
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

  // Curated panel recipes per scene so each screenshot is a real poster.
  if (shot === 'cover' || shot === 'portrait' || shot === 'wide') {
    if (state.layout === 'classic') {
      state.panels[0].src = photo2 ? 'photo1' : 'skyline';
      state.panels[1].src = 'photo0';
      state.panels[2].src = 'palms';
      state.panels[3].src = photo2 ? 'photo1' : 'waves';
      state.panels[4].src = 'photo0';
      state.panels[4].zoom = 112;
      state.panels[5].src = 'neon-sun';
      state.panels[6].src = photo2 ? 'photo1' : 'skyline';
      state.panels[7].src = 'photo0';
      state.panels[8].src = 'flamingo';
    } else if (state.layout === 'wide') {
      state.panels[0].src = 'photo0';
      state.panels[0].zoom = 105;
      state.panels[0].oy = 30;
      state.panels[1].src = 'skyline';
      state.panels[2].src = photo2 ? 'photo1' : 'palms';
      state.panels[3].src = 'flamingo';
    } else {
      state.panels[0].src = 'photo0';
      state.panels[0].zoom = 120;
    }
  }
  if (shot === 'editor') {
    state.panels[4].src = 'photo0';
    state.panels[0].src = 'skyline';
    state.panels[1].src = 'photo0';
    state.panels[2].src = 'palms';
    state.panels[8].src = 'flamingo';
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
