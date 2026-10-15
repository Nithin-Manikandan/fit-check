import * as DB from './db.js';
import { CATEGORIES, SUB, CAT, SUBTYPES, subsOf } from './catalog.js';
import { COLORS } from './color.js';
import { generateOutfits, OCCASIONS, TEMPS } from './stylist.js';
import { renderOutfit } from './layout.js';
import { processPhoto } from './pipeline.js';
import { toBlob, scaleCanvas, trim } from './images.js';
import { DEMO, drawDemoCanvas } from './demo.js';

const $ = (s, r = document) => r.querySelector(s);
const app = $('#app');

// ---------- state ----------
const state = {
  items: [], looks: [],
  tab: 'closet', filter: 'all',
  fits: { occasion: 'any', temp: 'any', anchor: null, seed: Date.now(), result: null, stale: true },
  settings: { cutout: 'ai' },
};
try { Object.assign(state.settings, JSON.parse(localStorage.getItem('fc.settings') || '{}')); } catch { /* ignore */ }
const saveSettings = () => { try { localStorage.setItem('fc.settings', JSON.stringify(state.settings)); } catch { /* ignore */ } };

const urls = new Map();
function urlFor(item, kind = 'thumb') {
  const key = item.id + kind;
  if (!urls.has(key)) urls.set(key, URL.createObjectURL(kind === 'full' ? item.img : item.thumb));
  return urls.get(key);
}
const dropUrls = (id) => { for (const k of ['thumb', 'full']) { const u = urls.get(id + k); if (u) { URL.revokeObjectURL(u); urls.delete(id + k); } } };

const itemName = (i) => `${COLORS[i.color].label} ${SUB[i.sub].label}`;
const byId = (id) => state.items.find((i) => i.id === id);

// ---------- icons ----------
const ic = {
  hanger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5a2.2 2.2 0 1 0-2.2-2.2"/><path d="M12 7.5v2L3.2 15.4A1.6 1.6 0 0 0 4.1 18.4h15.8a1.6 1.6 0 0 0 .9-3L12 9.5"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8z"/><path d="M18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-9-9.2C1.6 7.3 3.7 4.5 6.6 4.5c2 0 3.5 1.1 5.4 3 1.9-1.9 3.4-3 5.4-3 2.9 0 5 2.8 3.6 6.3C19 15.6 12 20 12 20z"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
};

// ---------- rendering ----------
function render() {
  let body = '', head = '';
  if (state.tab === 'closet') [head, body] = closetView();
  else if (state.tab === 'fits') [head, body] = fitsView();
  else if (state.tab === 'saved') [head, body] = savedView();
  else [head, body] = settingsView();
  const nav = [['closet', 'Closet', ic.hanger], ['fits', 'Fits', ic.spark], ['saved', 'Saved', ic.heart], ['settings', 'Settings', ic.gear]]
    .map(([id, l, i]) => `<button data-act="tab" data-tab="${id}" class="${state.tab === id ? 'on' : ''}">${i}<span>${l}</span></button>`).join('');
  const scroll = window.scrollY;
  app.innerHTML = `${head}${body}<nav class="nav"><div class="nav-in">${nav}</div></nav>`;
  if (state.tab === 'closet' && state.items.length) app.insertAdjacentHTML('beforeend', `<button class="fab" data-act="add" aria-label="Add clothes">${ic.plus}</button>`);
  window.scrollTo(0, scroll);
  drawCanvases();
}

function closetView() {
  const items = state.items.filter((i) => state.filter === 'all' || i.cat === state.filter)
    .sort((a, b) => b.added - a.added);
  const tabs = [{ id: 'all', label: 'All' }, ...CATEGORIES]
    .map((c) => `<button data-act="filter" data-id="${c.id}" class="${state.filter === c.id ? 'on' : ''}">${c.label}</button>`).join('');
  const head = `<header class="top"><h1>My Closet</h1><span class="count">${state.items.length} piece${state.items.length === 1 ? '' : 's'}</span></header>`;
  if (!state.items.length) {
    return [head, `<div class="empty"><h2>Your closet is empty</h2><p>Take or upload a photo of each piece. One item per photo works best. The app figures out what it is.</p>
      <div class="stack"><button class="pill-btn block" data-act="add">Add clothes</button><button class="pill-btn ghost block" data-act="demo">Try a demo closet</button></div></div>`];
  }
  const tiles = items.map((i) => `<button class="tile ${i.dirty ? 'dirty' : ''}" data-act="open" data-id="${i.id}">
      ${i.dirty ? '<span class="badge">WASH</span>' : ''}
      <span class="pic"><img src="${urlFor(i)}" alt="${itemName(i)}"></span>
      <span class="t-name">${SUB[i.sub].label}</span>
      <span class="t-sub"><i class="dot" style="background:${i.hex}"></i>${COLORS[i.color].label}</span></button>`).join('');
  return [head, `<div class="tabs">${tabs}</div>${items.length ? `<div class="grid">${tiles}</div>` : '<div class="empty"><p>Nothing in this category yet.</p></div>'}`];
}

function fitsView() {
  const f = state.fits;
  if (f.stale) regen();
  const head = `<header class="top"><h1>Fits</h1><button class="pill-btn" data-act="shuffle">Shuffle</button></header>`;
  const occ = OCCASIONS.map((o) => `<button class="chip ${f.occasion === o.id ? 'on' : ''}" data-act="occ" data-id="${o.id}">${o.label}</button>`).join('');
  const tmp = TEMPS.map((o) => `<button class="chip ${f.temp === o.id ? 'on' : ''}" data-act="temp" data-id="${o.id}">${o.label}</button>`).join('') +
    `<button class="chip" data-act="weather">Use today's weather</button>`;
  let anchor = '';
  const a = f.anchor && byId(f.anchor);
  if (a) anchor = `<div class="anchor"><img src="${urlFor(a)}" alt="">Styling around your ${itemName(a).toLowerCase()}<button data-act="unanchor" aria-label="Remove">✕</button></div>`;
  const controls = `<div class="label">Where to</div><div class="chips">${occ}</div><div class="label">Weather</div><div class="chips">${tmp}</div>${anchor}`;

  const r = f.result;
  if (r.problem === 'empty') {
    return [head, `<div class="empty"><h2>No clothes yet</h2><p>Add some pieces to your closet and I'll build fits.</p><div class="stack"><button class="pill-btn block" data-act="add">Add clothes</button><button class="pill-btn ghost block" data-act="demo">Try a demo closet</button></div></div>`];
  }
  if (r.problem === 'need-basics') {
    return [head, `${controls}<div class="empty"><h2>Need a few more pieces</h2><p>Add at least one top and one pair of bottoms (jeans, pants, shorts) and fits will show up here.</p><div class="stack"><button class="pill-btn block" data-act="add">Add clothes</button></div></div>`];
  }
  let notes = '';
  if (r.missing?.shoes) notes += `<div class="note"><b>Add shoes</b> to your closet to complete the fits.</div>`;
  if (!r.outfits.length) notes += `<div class="note">Nothing matched those filters. Try "Anything" or add more pieces. Pieces marked WASH are skipped.</div>`;
  const cards = r.outfits.map((o, n) => `<article class="fit"><div class="fit-head"><b>${o.vibe.name}</b><span class="pct">${o.pct}% match</span></div>
      <canvas data-fit="${n}"></canvas>
      <ul class="why">${[o.vibe.blurb, ...o.why].map((w) => `<li>${w}</li>`).join('')}</ul>
      <div class="fit-actions"><button class="pill-btn ${isSaved(o) ? '' : 'ghost'}" data-act="save" data-n="${n}">${isSaved(o) ? 'Saved ✓' : 'Save'}</button><button class="pill-btn ghost" data-act="share" data-n="${n}">Share</button></div></article>`).join('');
  return [head, `${controls}${notes}<div class="fits">${cards}</div>`];
}

function savedView() {
  const head = `<header class="top"><h1>Saved fits</h1><span class="count">${state.looks.length}</span></header>`;
  const resolved = state.looks.map(resolveLook).filter(Boolean).sort((a, b) => b.added - a.added);
  state.saved = resolved;
  if (!resolved.length) return [head, `<div class="empty"><h2>Nothing saved yet</h2><p>Tap Save on a fit you like and it shows up here.</p><button class="pill-btn" data-act="tab" data-tab="fits">See fits</button></div>`];
  return [head, `<div class="saved-grid">${resolved.map((o, n) => `<button class="fit" data-act="open-look" data-n="${n}"><div class="fit-head"><b>${o.vibe.name}</b></div><canvas data-saved="${n}"></canvas></button>`).join('')}</div>`];
}

function settingsView() {
  const s = state.settings;
  const cut = [['ai', 'Best (AI)'], ['fast', 'Fast'], ['off', 'Off']]
    .map(([id, l]) => `<button data-act="cutout" data-id="${id}" class="${s.cutout === id ? 'on' : ''}">${l}</button>`).join('');
  const demoCount = state.items.filter((i) => i.demo).length;
  return [`<header class="top"><h1>Settings</h1></header>`, `<div style="padding:0 18px">
    <div class="field"><span>Background removal</span><div class="seg">${cut}</div>
      <p class="note" style="margin:8px 0 0"><b>Best</b> uses a small AI model (downloads once, then works offline). <b>Fast</b> works when the photo is on a plain wall, bed or floor. <b>Off</b> keeps the photo as is.</p></div>
    <div class="row"><div>Back up my closet<small>Saves a file with all your clothes and fits.</small></div><button class="pill-btn ghost" data-act="export">Export</button></div>
    <div class="row"><div>Restore a backup<small>Load a file you exported before.</small></div><button class="pill-btn ghost" data-act="import">Import</button></div>
    <div class="row"><div>Demo closet<small>${demoCount ? `${demoCount} demo pieces in your closet.` : 'Fill your closet with sample clothes to try it.'}</small></div>
      <button class="pill-btn ghost" data-act="${demoCount ? 'rm-demo' : 'demo'}">${demoCount ? 'Remove' : 'Add'}</button></div>
    <div class="row"><div>Delete everything<small>Clears all clothes and saved fits from this phone.</small></div><button class="pill-btn danger" data-act="wipe">Delete</button></div>
    <p class="note" style="margin:18px 0 0">Everything stays on this phone. Nothing is uploaded and there are no accounts. Tip: on iPhone use Share → Add to Home Screen so Safari doesn't clear your closet. Back up now and then.</p>
  </div>`];
}

// ---------- canvases ----------
function drawCanvases() {
  document.querySelectorAll('canvas[data-fit]').forEach((c) => {
    renderOutfit(c, state.fits.result.outfits[+c.dataset.fit], urlFor, 720, 900).catch(console.warn);
  });
  document.querySelectorAll('canvas[data-saved]').forEach((c) => {
    renderOutfit(c, state.saved[+c.dataset.saved], urlFor, 540, 675).catch(console.warn);
  });
}

// ---------- fits logic ----------
function regen(newSeed = false) {
  const f = state.fits;
  if (newSeed) f.seed = Date.now();
  f.result = generateOutfits(state.items, { occasion: f.occasion, temp: f.temp, anchor: f.anchor, seed: f.seed });
  f.stale = false;
}
const lookKey = (o) => [o.top, o.bottom, o.outer, o.shoes, ...(o.acc || [])].filter(Boolean).map((i) => i.id).sort().join('|');
const isSaved = (o) => state.looks.some((l) => l.key === lookKey(o));
function resolveLook(l) {
  const g = (id) => (id ? byId(id) : null);
  const top = g(l.top), bottom = g(l.bottom);
  if (!top || !bottom) return null;
  return { id: l.id, key: l.key, added: l.added, vibe: { name: l.vibe }, top, bottom, outer: g(l.outer), shoes: g(l.shoes), acc: (l.acc || []).map(g).filter(Boolean) };
}
async function toggleSave(o) {
  const existing = state.looks.find((l) => l.key === lookKey(o));
  if (existing) { await DB.del('looks', existing.id); state.looks = state.looks.filter((l) => l !== existing); toast('Removed from saved'); }
  else {
    const l = { id: DB.uid(), key: lookKey(o), vibe: o.vibe.name, top: o.top.id, bottom: o.bottom.id, outer: o.outer?.id || null, shoes: o.shoes?.id || null, acc: (o.acc || []).map((a) => a.id), added: Date.now() };
    await DB.put('looks', l); state.looks.push(l); toast('Saved ✓');
  }
  render();
}
async function shareOutfit(o) {
  const c = document.createElement('canvas');
  await renderOutfit(c, o, urlFor, 1080, 1350);
  const blob = await toBlob(c, 'image/png');
  const file = new File([blob], 'fit.png', { type: 'image/png' });
  try {
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: o.vibe.name }); return; }
  } catch (e) { if (e.name === 'AbortError') return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `fit-${o.vibe.name.toLowerCase().replace(/\W+/g, '-')}.png`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function useWeather() {
  if (!navigator.geolocation) return toast("Can't get location here, pick the weather yourself");
  toast('Checking the weather…');
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude: la, longitude: lo } = pos.coords;
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m&temperature_unit=fahrenheit`);
      const t = (await r.json()).current.temperature_2m;
      state.fits.temp = t >= 78 ? 'hot' : t >= 55 ? 'mild' : 'cold';
      state.fits.stale = true; state.fits.seed = Date.now();
      toast(`${Math.round(t)}°F near you → ${TEMPS.find((x) => x.id === state.fits.temp).label}`);
      render();
    } catch { toast("Couldn't load the weather"); }
  }, () => toast("Couldn't get your location, pick the weather yourself"), { timeout: 8000 });
}

// ---------- sheets / toast ----------
let sheetEl = null;
function openSheet(html) {
  closeSheet();
  sheetEl = document.createElement('div');
  sheetEl.className = 'sheet-wrap';
  sheetEl.innerHTML = `<div class="backdrop" data-act="close"></div><div class="sheet"><div class="grab"></div><div class="sheet-body">${html}</div></div>`;
  document.body.appendChild(sheetEl);
  document.body.style.overflow = 'hidden';
  return $('.sheet-body', sheetEl);
}
function setSheet(html) { if (sheetEl) $('.sheet-body', sheetEl).innerHTML = html; }
function closeSheet() { if (sheetEl) { sheetEl.remove(); sheetEl = null; document.body.style.overflow = ''; } }
let toastT;
function toast(msg) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2600);
}

// ---------- shared form bits ----------
const typeSelect = (sel, attr) => `<select class="sel" ${attr}>${CATEGORIES.map((c) =>
  `<optgroup label="${c.label}">${subsOf(c.id).map((s) => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${s.label}</option>`).join('')}</optgroup>`).join('')}</select>`;
const swatches = (sel, attr) => `<div class="swatches">${Object.entries(COLORS).map(([id, c]) =>
  `<button class="sw ${id === sel ? 'on' : ''}" ${attr} data-color="${id}" style="background:${c.hex}" title="${c.label}" aria-label="${c.label}"></button>`).join('')}</div>`;
const fitSeg = (sel, attr) => `<div class="seg">${['baggy', 'regular', 'slim'].map((f) =>
  `<button ${attr} data-fit-val="${f}" class="${sel === f ? 'on' : ''}">${f[0].toUpperCase() + f.slice(1)}</button>`).join('')}</div>`;

// ---------- item sheet ----------
function openItem(id) {
  const i = byId(id);
  if (!i) return;
  const body = () => `<div class="big-pic"><img src="${urlFor(i, 'full')}" alt=""></div>
    <div class="sheet-head"><h2>${itemName(i)}</h2><button data-act="close" class="chip">Done</button></div>
    <div class="field"><span>What is it</span>${typeSelect(i.sub, 'data-edit="sub"')}</div>
    <div class="field"><span>Color</span>${swatches(i.color, 'data-edit="color"')}</div>
    ${i.cat === 'top' || i.cat === 'bottom' ? `<div class="field"><span>Fit</span>${fitSeg(i.fit || 'regular', 'data-edit="fit"')}</div>` : ''}
    <div class="row"><div>Statement piece<small>Loud print or pattern. Won't be paired with other loud pieces.</small></div><button class="switch ${i.loud ? 'on' : ''}" data-edit="loud" aria-label="Statement piece"></button></div>
    <div class="row"><div>In the wash<small>Skip this piece when making fits.</small></div><button class="switch ${i.dirty ? 'on' : ''}" data-edit="dirty" aria-label="In the wash"></button></div>
    <div class="btn-col"><button class="pill-btn block" data-act="anchor" data-id="${i.id}">Build fits with this</button><button class="pill-btn danger block" data-act="delete" data-id="${i.id}">Delete piece</button></div>`;
  openSheet(body());
  sheetEl.dataset.item = id;
  sheetEl._rerender = () => setSheet(body());
}
async function editItem(el) {
  const i = byId(sheetEl?.dataset.item);
  if (!i) return;
  const k = el.dataset.edit;
  if (k === 'sub') { i.sub = el.value; i.cat = SUB[i.sub].cat; i.loud = !!SUB[i.sub].loud || i.loud; }
  else if (k === 'color') { i.color = el.dataset.color; i.hex = COLORS[i.color].hex; }
  else if (k === 'fit') i.fit = el.dataset.fitVal;
  else if (k === 'loud') i.loud = !i.loud;
  else if (k === 'dirty') i.dirty = !i.dirty;
  await DB.put('items', i);
  state.fits.stale = true;
  sheetEl._rerender(); render();
}

// ---------- add flow ----------
let drafts = [];
const dl = { files: {}, label: '' };
function dlPct() {
  const f = Object.values(dl.files);
  const t = f.reduce((a, x) => a + (x.total || 0), 0), l = f.reduce((a, x) => a + (x.loaded || 0), 0);
  return t ? Math.round((l / t) * 100) : 0;
}
const onModelProgress = (e) => {
  if (e.status === 'progress' && e.file) { dl.files[e.file] = { loaded: e.loaded, total: e.total }; dl.active = true; updateAddSheet(); }
  else if (e.status === 'done' || e.status === 'ready') updateAddSheet();
};

async function handleFiles(files) {
  files = [...files].filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
  if (!files.length) return;
  drafts = files.map((file, n) => ({ n, file, status: 'wait', stage: 'Waiting', sub: 'tee', color: 'grey', hex: COLORS.grey.hex, fit: 'regular', loud: false }));
  openSheet('');
  sheetEl.dataset.mode = 'add';
  updateAddSheet();
  for (const d of drafts) {
    if (d.status === 'removed') continue;
    d.status = 'busy';
    try {
      const r = await processPhoto(d.file, state.settings.cutout, (s) => { d.stage = s; updateAddSheet(); }, onModelProgress);
      d.canvas = r.canvas; d.hasCut = r.hasCut; d.color = r.color.family; d.hex = r.color.hex;
      d.guess = r.guess;
      if (r.guess?.[0]) { d.sub = r.guess[0].id; d.loud = !!SUB[d.sub].loud; }
      else d.noGuess = true;
      d.preview = URL.createObjectURL(await toBlob(scaleCanvas(d.canvas, 300)));
      d.status = 'done';
    } catch (e) {
      console.error(e); d.status = 'error'; d.stage = "Couldn't read this photo";
    }
    updateAddSheet();
  }
  dl.active = false; updateAddSheet();
}

function updateAddSheet() {
  if (!sheetEl || sheetEl.dataset.mode !== 'add') return;
  const busy = drafts.filter((d) => d.status === 'wait' || d.status === 'busy');
  const done = drafts.filter((d) => d.status === 'done');
  const cur = drafts.find((d) => d.status === 'busy');
  let html = `<div class="sheet-head"><h2>${busy.length ? 'Adding clothes' : 'Check these'}</h2><button class="chip" data-act="close">Cancel</button></div>`;
  if (busy.length) {
    const pct = Math.round(((drafts.length - busy.length) / drafts.length) * 100);
    html += `<p><span class="spin"></span>${cur ? cur.stage : 'Starting'} (${drafts.length - busy.length + 1} of ${drafts.length})</p><div class="prog"><i style="width:${pct}%"></i></div>`;
    if (dl.active && dlPct() < 100) html += `<div class="note"><b>Downloading the AI (one time only)</b> ${dlPct()}%. Next time it's instant.</div>`;
  }
  html += `<div class="drafts">${done.map((d) => draftCard(d)).join('')}</div>`;
  const bad = drafts.filter((d) => d.status === 'error').length;
  if (bad) html += `<div class="note">${bad} photo${bad > 1 ? 's' : ''} couldn't be read.</div>`;
  if (!busy.length) {
    html += done.length ? `<button class="pill-btn block" data-act="commit">Add ${done.length} to my closet</button>` : `<button class="pill-btn ghost block" data-act="close">Close</button>`;
  }
  setSheet(html);
}
function draftCard(d) {
  const alts = (d.guess || []).slice(1, 3).filter((g) => g.score > 0.08)
    .map((g) => `<button class="chip" data-act="alt" data-n="${d.n}" data-id="${g.id}">${SUB[g.id].label}?</button>`).join(' ');
  return `<div class="draft"><button class="x" data-act="d-remove" data-n="${d.n}" aria-label="Remove">×</button>
    <div class="d-img"><img src="${d.preview}" alt=""></div>
    <div><div class="field"><span>${d.noGuess ? 'Pick what it is' : 'Looks like'}</span>${typeSelect(d.sub, `data-d="${d.n}" data-dk="sub"`)}${alts ? `<div class="guess">Or maybe: ${alts}</div>` : ''}</div>
    <div class="field"><span>Color</span>${swatches(d.color, `data-d="${d.n}" data-dk="color"`)}</div>
    ${SUB[d.sub].cat === 'top' || SUB[d.sub].cat === 'bottom' ? `<div class="field"><span>Fit</span>${fitSeg(d.fit, `data-d="${d.n}" data-dk="fit"`)}</div>` : ''}</div></div>`;
}
function editDraft(el) {
  const d = drafts[+el.dataset.d];
  const k = el.dataset.dk;
  if (k === 'sub') { d.sub = el.value; d.loud = !!SUB[d.sub].loud; }
  else if (k === 'color') { d.color = el.dataset.color; d.hex = COLORS[d.color].hex; }
  else if (k === 'fit') d.fit = el.dataset.fitVal;
  updateAddSheet();
}
async function commitDrafts() {
  const ready = drafts.filter((d) => d.status === 'done');
  setSheet(`<p><span class="spin"></span>Saving…</p>`);
  const added = [];
  for (const d of ready) {
    const item = {
      id: DB.uid(), cat: SUB[d.sub].cat, sub: d.sub, color: d.color, hex: d.hex, fit: d.fit, loud: d.loud, dirty: false,
      hasCut: d.hasCut, img: await toBlob(d.canvas), thumb: await toBlob(scaleCanvas(d.canvas, 360)), added: Date.now(),
    };
    added.push(item);
  }
  await DB.putMany('items', added);
  state.items.push(...added);
  state.fits.stale = true;
  DB.askPersist();
  drafts.forEach((d) => d.preview && URL.revokeObjectURL(d.preview));
  drafts = [];
  closeSheet(); render();
  toast(`Added ${added.length} piece${added.length === 1 ? '' : 's'}`);
}

// ---------- demo / backup ----------
async function addDemo() {
  toast('Adding demo clothes…');
  const added = [];
  for (const [shape, hex, cat, sub, color, extra = {}] of DEMO) {
    const c = trim(await drawDemoCanvas(shape, hex, extra));
    added.push({ id: DB.uid(), cat, sub, color, hex, fit: extra.fit || 'regular', loud: !!extra.loud, dirty: false, hasCut: true, demo: true,
      img: await toBlob(c), thumb: await toBlob(scaleCanvas(c, 360)), added: Date.now() });
  }
  await DB.putMany('items', added);
  state.items.push(...added); state.fits.stale = true;
  state.tab = 'closet'; render(); toast('Demo closet added');
}
async function removeItems(pred) {
  for (const i of state.items.filter(pred)) { await DB.del('items', i.id); dropUrls(i.id); }
  state.items = state.items.filter((i) => !pred(i));
  const ids = new Set(state.items.map((i) => i.id));
  for (const l of state.looks.filter((l) => ![l.top, l.bottom].every((x) => ids.has(x)))) await DB.del('looks', l.id);
  state.looks = state.looks.filter((l) => [l.top, l.bottom].every((x) => ids.has(x)));
  state.fits.stale = true;
}
const blobToData = (b) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });
async function exportAll() {
  const items = [];
  for (const i of state.items) items.push({ ...i, img: await blobToData(i.img), thumb: await blobToData(i.thumb) });
  const blob = new Blob([JSON.stringify({ app: 'fitcheck', v: 1, items, looks: state.looks })], { type: 'application/json' });
  const file = new File([blob], `fit-check-backup-${new Date().toISOString().slice(0, 10)}.json`, { type: 'application/json' });
  try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file] }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function importAll(file) {
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== 'fitcheck') throw new Error('bad file');
    const items = [];
    for (const i of data.items) items.push({ ...i, img: await (await fetch(i.img)).blob(), thumb: await (await fetch(i.thumb)).blob() });
    await DB.putMany('items', items); await DB.putMany('looks', data.looks || []);
    state.items = await DB.all('items'); state.looks = await DB.all('looks');
    state.fits.stale = true; render(); toast(`Restored ${items.length} pieces`);
  } catch (e) { console.error(e); toast("That file didn't work"); }
}

// ---------- events ----------
document.addEventListener('click', async (e) => {
  const edit = e.target.closest('[data-edit]');
  if (edit && edit.tagName !== 'SELECT') return editItem(edit);
  const dk = e.target.closest('[data-dk]');
  if (dk && dk.tagName !== 'SELECT') return editDraft(dk);
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const a = el.dataset.act, id = el.dataset.id, n = +el.dataset.n;
  switch (a) {
    case 'tab': state.tab = el.dataset.tab; window.scrollTo(0, 0); render(); break;
    case 'filter': state.filter = id; render(); break;
    case 'add': $('#file').click(); break;
    case 'open': openItem(id); break;
    case 'close': closeSheet(); break;
    case 'commit': commitDrafts(); break;
    case 'd-remove': drafts[n].status = 'removed'; updateAddSheet(); break;
    case 'alt': { const d = drafts[n]; d.sub = id; d.loud = !!SUB[id].loud; updateAddSheet(); break; }
    case 'delete': if (confirm('Delete this piece?')) { await removeItems((i) => i.id === id); closeSheet(); render(); } break;
    case 'anchor': state.fits.anchor = id; state.fits.stale = true; state.fits.seed = Date.now(); state.tab = 'fits'; closeSheet(); window.scrollTo(0, 0); render(); break;
    case 'unanchor': state.fits.anchor = null; state.fits.stale = true; render(); break;
    case 'occ': state.fits.occasion = id; state.fits.stale = true; render(); break;
    case 'temp': state.fits.temp = id; state.fits.stale = true; render(); break;
    case 'weather': useWeather(); break;
    case 'shuffle': regen(true); render(); window.scrollTo(0, 0); break;
    case 'save': toggleSave(state.fits.result.outfits[n]); break;
    case 'share': shareOutfit(state.fits.result.outfits[n]); break;
    case 'open-look': {
      const o = state.saved[n];
      const body = openSheet(`<div class="sheet-head"><h2>${o.vibe.name}</h2><button class="chip" data-act="close">Done</button></div><div class="fit"><canvas id="lookc"></canvas></div>
        <div class="btn-col"><button class="pill-btn block" data-act="share-look" data-n="${n}">Share</button><button class="pill-btn danger block" data-act="del-look" data-n="${n}">Remove from saved</button></div>`);
      renderOutfit($('#lookc', body), o, urlFor, 720, 900); break;
    }
    case 'share-look': shareOutfit(state.saved[n]); break;
    case 'del-look': { const o = state.saved[n]; await DB.del('looks', o.id); state.looks = state.looks.filter((l) => l.id !== o.id); closeSheet(); render(); break; }
    case 'cutout': state.settings.cutout = id; saveSettings(); render(); break;
    case 'demo': await addDemo(); break;
    case 'rm-demo': await removeItems((i) => i.demo); render(); toast('Demo pieces removed'); break;
    case 'export': exportAll(); break;
    case 'import': $('#import').click(); break;
    case 'wipe': if (confirm('Delete ALL clothes and saved fits from this phone?')) { await removeItems(() => true); await DB.clear('looks'); state.looks = []; render(); toast('Deleted'); } break;
  }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'file') { handleFiles(t.files); t.value = ''; }
  else if (t.id === 'import') { if (t.files[0]) importAll(t.files[0]); t.value = ''; }
  else if (t.dataset.edit === 'sub') editItem(t);
  else if (t.dataset.dk === 'sub') editDraft(t);
});

// ---------- boot ----------
(async function init() {
  try {
    [state.items, state.looks] = await Promise.all([DB.all('items'), DB.all('looks')]);
  } catch (e) {
    app.innerHTML = `<div class="empty"><h2>Storage is blocked</h2><p>Fit Check saves your closet on this device. Turn off private browsing and try again.</p></div>`;
    return;
  }
  render();
  window.__fitcheck = { state, addDemo, generateOutfits, render };
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
