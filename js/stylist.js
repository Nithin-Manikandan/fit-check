// The stylist: scores every possible combo of your clothes against current
// teen-guy trends ("vibes") and returns the best, most varied fits.
//
// Trends live in VIBES below. Edit the numbers to change what the app likes.
// aff = how much a vibe likes a piece type (0-3.5, negative = avoid).
import { SUB } from './catalog.js';
import { COLORS } from './color.js';

export const VIBES = [
  {
    id: 'clean', name: 'Clean Fit', blurb: 'Neutral, simple, nothing loud. The "clean fit" look.',
    aff: { tee: 3, 'long-sleeve': 2, sweatshirt: 2.5, 'quarter-zip': 2, polo: 1.5, sweater: 2, 'button-up': 1.5, hoodie: 1.5, 'graphic-tee': 0.5,
      jeans: 3, chinos: 3, cargo: 1, 'dress-pants': 1.5, shorts: 1.5, sweatpants: 0.5,
      bomber: 2, 'denim-jacket': 1.5, windbreaker: 1, coat: 2.5, 'work-jacket': 1.5, 'zip-hoodie': 1, fleece: 1, puffer: 1,
      sneakers: 3, loafers: 1.5, boots: 1.5, running: 1, 'high-tops': 1, skate: 1,
      watch: 2, cap: 1.5, belt: 1, sunglasses: 1 },
    good: ['white', 'black', 'cream', 'beige', 'grey', 'navy', 'denim', 'olive'], loudOk: false,
    fitBottom: { baggy: 0, regular: 0.5, slim: 0.2 },
    occ: { school: 1.1, hangout: 1, dressy: 0.6, gym: 0.2 },
  },
  {
    id: 'street', name: 'Streetwear', blurb: 'Oversized, baggy, chunky kicks. What everyone is wearing right now.',
    aff: { 'graphic-tee': 3, tee: 2, hoodie: 3, sweatshirt: 2, 'long-sleeve': 1.5, jersey: 2, tank: 0.5,
      jeans: 2.5, cargo: 3, sweatpants: 1.5, 'track-pants': 1.5, shorts: 1, 'athletic-shorts': 0.5,
      puffer: 2.5, bomber: 2, 'work-jacket': 2, varsity: 2, 'zip-hoodie': 1.5, 'track-jacket': 1.5, 'denim-jacket': 1.5, windbreaker: 1,
      sneakers: 3, 'high-tops': 2.5, skate: 2, running: 2,
      cap: 2.5, beanie: 2, bag: 1.5, chain: 2, sunglasses: 1.5 },
    good: ['black', 'grey', 'white', 'charcoal', 'olive', 'brown', 'tan'], loudOk: true,
    fitBottom: { baggy: 1, regular: 0, slim: -0.8 },
    occ: { school: 1.1, hangout: 1.1, dressy: 0.1, gym: 0.4 },
  },
  {
    id: 'skate', name: 'Skater', blurb: 'Baggy jeans, loose tee, skate shoes, cap. Effortless.',
    aff: { tee: 3, 'graphic-tee': 3, hoodie: 2, flannel: 2.5, 'long-sleeve': 1.5, sweatshirt: 1.5,
      jeans: 3, cargo: 2, shorts: 2, 'athletic-shorts': 0.5, sweatpants: 0.5,
      'denim-jacket': 2, 'work-jacket': 2, 'zip-hoodie': 1.5, windbreaker: 1, bomber: 1,
      skate: 3, 'high-tops': 2.5, sneakers: 2, running: 0.5,
      cap: 2.5, beanie: 2, bag: 1 },
    good: ['black', 'white', 'denim', 'grey', 'olive', 'red', 'brown'], loudOk: true,
    fitBottom: { baggy: 1.2, regular: 0, slim: -1 },
    occ: { school: 1.1, hangout: 1.1, dressy: 0, gym: 0.2 },
  },
  {
    id: 'prep', name: 'Quarter-Zip Prep', blurb: 'Quarter-zips, polos and chinos. Preppy and put together.',
    aff: { 'quarter-zip': 3, polo: 3, 'button-up': 2.5, sweater: 3, sweatshirt: 1, 'long-sleeve': 1, tee: 1,
      chinos: 3, jeans: 2, 'dress-pants': 1.5, shorts: 1.5, cargo: 0.5,
      blazer: 2, coat: 2, bomber: 1, windbreaker: 1, fleece: 1, 'denim-jacket': 1, 'work-jacket': 1,
      loafers: 3, sneakers: 2, boots: 1,
      watch: 2.5, belt: 2, cap: 1, sunglasses: 1 },
    good: ['navy', 'cream', 'beige', 'olive', 'brown', 'white', 'sky', 'burgundy', 'tan', 'denim'], loudOk: false,
    fitBottom: { baggy: -0.6, regular: 0.4, slim: 0.4 },
    occ: { school: 1.1, hangout: 0.9, dressy: 1.3, gym: 0 },
  },
  {
    id: 'gorp', name: 'Gorpcore', blurb: 'Outdoorsy layers: fleece, windbreaker, cargos, trail shoes.',
    aff: { 'long-sleeve': 2, tee: 2, hoodie: 2, 'quarter-zip': 2, sweatshirt: 1.5, flannel: 1.5,
      cargo: 3, sweatpants: 1.5, shorts: 1.5, 'track-pants': 1.5, jeans: 1,
      fleece: 3, windbreaker: 3, puffer: 3, 'work-jacket': 1.5, 'zip-hoodie': 1,
      running: 3, boots: 2.5, sneakers: 1.5, slides: 0.5,
      beanie: 3, cap: 2, bag: 2.5 },
    good: ['olive', 'green', 'brown', 'tan', 'black', 'grey', 'charcoal', 'orange'], loudOk: false,
    fitBottom: { baggy: 0.5, regular: 0.3, slim: -0.3 },
    occ: { school: 0.9, hangout: 1, dressy: 0, gym: 0.5 },
  },
  {
    id: 'sporty', name: 'Athleisure', blurb: 'Track jackets, joggers and runners. Comfy and sporty.',
    aff: { jersey: 3, tee: 2, tank: 1.5, hoodie: 1.5, sweatshirt: 1.5, 'graphic-tee': 1,
      sweatpants: 3, 'athletic-shorts': 3, 'track-pants': 3, shorts: 2,
      'track-jacket': 3, windbreaker: 2.5, 'zip-hoodie': 2, fleece: 1,
      running: 3, sneakers: 2.5, 'high-tops': 2, slides: 1.5,
      cap: 2, bag: 2, sunglasses: 1, watch: 1 },
    good: ['black', 'white', 'grey', 'navy', 'red', 'blue'], loudOk: true,
    fitBottom: { baggy: 0.3, regular: 0.3, slim: 0 },
    occ: { school: 0.7, hangout: 0.9, dressy: 0, gym: 2 },
  },
  {
    id: 'varsity', name: 'Varsity', blurb: 'Letterman jackets, bombers and jeans. Classic Americana.',
    aff: { tee: 2.5, 'long-sleeve': 2, hoodie: 2, sweatshirt: 2.5, polo: 1.5, jersey: 1, 'graphic-tee': 1.5,
      jeans: 3, chinos: 2, cargo: 1.5,
      varsity: 3.5, bomber: 3, 'denim-jacket': 2.5, 'work-jacket': 2,
      sneakers: 3, 'high-tops': 2, boots: 1.5, skate: 1,
      cap: 2.5, beanie: 1.5, watch: 1 },
    good: ['navy', 'red', 'cream', 'white', 'denim', 'grey', 'black', 'burgundy'], loudOk: false,
    fitBottom: { baggy: 0.2, regular: 0.5, slim: 0 },
    occ: { school: 1.1, hangout: 1, dressy: 0.2, gym: 0 },
  },
  {
    id: 'dressed', name: 'Dressed Up', blurb: 'Button-ups, nice trousers, loafers. For events and dates.',
    aff: { 'button-up': 3, sweater: 3, polo: 2, 'quarter-zip': 1.5, 'long-sleeve': 1,
      'dress-pants': 3, chinos: 2.5, jeans: 1,
      blazer: 3.5, coat: 3, bomber: 0.5,
      loafers: 3, boots: 2.5, sneakers: 1,
      watch: 3, belt: 3, sunglasses: 1 },
    good: ['black', 'navy', 'white', 'cream', 'grey', 'charcoal', 'beige', 'brown', 'burgundy', 'sky'], loudOk: false,
    fitBottom: { baggy: -1.5, regular: 0.3, slim: 0.6 },
    occ: { school: 0.3, hangout: 0.4, dressy: 1.8, gym: 0 },
  },
  {
    id: 'cozy', name: 'Cozy Fall', blurb: 'Earth tones, flannels, boots, beanie weather.',
    aff: { flannel: 3, sweater: 3, hoodie: 2.5, sweatshirt: 2.5, 'long-sleeve': 2, 'quarter-zip': 1.5,
      jeans: 2.5, cargo: 2.5, chinos: 2, sweatpants: 1,
      'work-jacket': 3, coat: 2.5, puffer: 1.5, bomber: 2, 'denim-jacket': 2, fleece: 2, varsity: 1.5,
      boots: 3, sneakers: 2,
      beanie: 3, cap: 1.5, bag: 1 },
    good: ['brown', 'tan', 'olive', 'burgundy', 'cream', 'beige', 'navy', 'denim', 'orange', 'yellow'], loudOk: true,
    fitBottom: { baggy: 0.3, regular: 0.3, slim: 0 },
    occ: { school: 1.1, hangout: 1.1, dressy: 0.2, gym: 0 },
  },
];

export const OCCASIONS = [
  { id: 'any', label: 'Anything' },
  { id: 'school', label: 'School' },
  { id: 'hangout', label: 'Hanging out' },
  { id: 'dressy', label: 'Dressy' },
  { id: 'gym', label: 'Gym' },
];
export const TEMPS = [
  { id: 'any', label: 'Any weather' },
  { id: 'hot', label: 'Hot' },
  { id: 'mild', label: 'Mild' },
  { id: 'cold', label: 'Cold' },
];
const WARM_TARGET = { hot: [0, 3], mild: [3.2, 5.6], cold: [6.2, 99] };

// ---------- helpers ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const PAIR_CLASH = { 'black|brown': 0.9, 'black|navy': 0.7, 'brown|grey': 0.3, 'navy|olive': 0.3 };
const clash = (a, b) => PAIR_CLASH[`${a}|${b}`] ?? PAIR_CLASH[`${b}|${a}`] ?? 0;
const isLoud = (p) => !!(p.loud || SUB[p.sub]?.loud);

function colorScore(v, pieces, why) {
  const fams = pieces.map((p) => p.color);
  const chroma = fams.filter((f) => !COLORS[f].neutral);
  const uniq = [...new Set(chroma)];
  let s = 0;
  if (uniq.length === 0) { s += 1.6; why.neutral = true; }
  else if (uniq.length === 1) { s += 1; why.pop = uniq[0]; }
  else if (uniq.length === 2) {
    const d = hueDist(COLORS[uniq[0]].hue, COLORS[uniq[1]].hue);
    s += d <= 45 || Math.abs(d - 180) <= 35 ? 0.2 : -2;
  } else s -= 3.5;
  if (chroma.length >= 3) s -= 1.5;

  const groups = new Set(fams.map((f) => COLORS[f].group).filter((g) => g !== 'mono'));
  if (fams.length >= 3 && groups.size <= 1) {
    s += 1.2;
    why.tonal = groups.size ? [...groups][0] : 'mono';
  }
  for (let i = 0; i < fams.length; i++) for (let j = i + 1; j < fams.length; j++) s -= clash(fams[i], fams[j]);
  for (const f of fams) { if (v.good.includes(f)) s += 0.3; }
  return s;
}

// ---------- scoring one combo ----------
function scoreCombo(v, c, ctx) {
  const why = {};
  const core = [c.top, c.bottom, c.outer, c.shoes].filter(Boolean);
  let aff = 0;
  for (const p of core) aff += v.aff[p.sub] ?? 0;
  const avg = aff / core.length;
  let s = avg * 4;

  s += colorScore(v, core, why);

  // fit balance
  const bf = c.bottom.fit || 'regular';
  s += v.fitBottom[bf] ?? 0;
  const tf = c.top.fit || 'regular';
  if (bf === 'baggy' && tf === 'slim') { s += 0.7; why.balance = true; }
  if (bf === 'baggy' && tf === 'baggy' && !(v.id === 'street' || v.id === 'skate')) s -= 0.6;
  if (bf === 'slim' && tf === 'slim' && v.id === 'street') s -= 0.4;

  // formality spread
  const fs = core.map((p) => SUB[p.sub].formal);
  const spread = Math.max(...fs) - Math.min(...fs);
  if (spread > 2) s -= (spread - 2) * 1.6;

  // loud pieces
  const loud = core.filter(isLoud).length;
  if (loud >= 2) s -= 2.5;
  else if (loud === 1 && !v.loudOk) s -= 0.5;

  // pairing rules
  const topS = c.top.sub, botS = c.bottom.sub, outS = c.outer?.sub, shoeS = c.shoes?.sub;
  if (outS === 'zip-hoodie' && topS === 'hoodie') s -= 4;
  if (outS === 'blazer' && ['hoodie', 'sweatshirt', 'tank', 'jersey'].includes(topS)) s -= 1.2;
  if (c.outer && ['puffer', 'coat'].includes(outS) && ['shorts', 'athletic-shorts'].includes(botS)) s -= 2.5;
  if (shoeS === 'slides' && c.outer) s -= 1;
  if (shoeS === 'loafers' && ['sweatpants', 'athletic-shorts', 'track-pants'].includes(botS)) s -= 2;
  if (shoeS === 'boots' && ['shorts', 'athletic-shorts'].includes(botS)) s -= 1;
  if (c.outer) { if (ctx.temp === 'mild') s += 0.6; why.layered = true; }

  // weather
  const warmth = SUB[topS].warmth + SUB[botS].warmth + (c.outer ? SUB[outS].warmth : 0);
  if (ctx.temp !== 'any') {
    const [lo, hi] = WARM_TARGET[ctx.temp];
    const dist = warmth < lo ? lo - warmth : warmth > hi ? warmth - hi : 0;
    s -= dist * 2.2;
  }

  // light randomness so "shuffle" gives new results
  s += ctx.rand() * 1.1;
  return { score: s, why, avg };
}

// ---------- accessories ----------
function pickAccessories(v, outfit, accs, ctx, forced, accUse) {
  const core = [outfit.top, outfit.bottom, outfit.outer, outfit.shoes].filter(Boolean);
  const chosen = [];
  if (forced) chosen.push(forced);
  const used = new Set(chosen.map((a) => a.sub));
  const headwear = () => chosen.some((a) => a.sub === 'cap' || a.sub === 'beanie');
  const ranked = accs
    .filter((a) => a !== forced)
    .map((a) => {
      let s = v.aff[a.sub] ?? 0;
      if (a.sub === 'beanie' && (ctx.temp === 'hot')) s = -9;
      if (a.sub === 'sunglasses' && ctx.temp === 'cold') s -= 1;
      s += colorScore(v, [...core, a], {}) * 0.15 + ctx.rand() * 0.8 - (accUse.get(a.id) || 0) * 1.1;
      return { a, s };
    })
    .filter((x) => x.s >= 1.6)
    .sort((p, q) => q.s - p.s);
  for (const { a } of ranked) {
    if (chosen.length >= 3) break;
    if (used.has(a.sub)) continue;
    if ((a.sub === 'cap' || a.sub === 'beanie') && headwear()) continue;
    chosen.push(a); used.add(a.sub);
  }
  return chosen;
}

// ---------- main ----------
export function generateOutfits(allItems, opts = {}) {
  const { occasion = 'any', temp = 'any', anchor = null, seed = Date.now(), count = 6 } = opts;
  const rand = rng(seed);
  const ctx = { temp, rand };
  const items = allItems.filter((i) => !i.dirty);
  const by = (cat) => items.filter((i) => i.cat === cat);
  let tops = by('top'), bottoms = by('bottom'), outers = by('outer'), shoes = by('shoes'), accs = by('acc');

  if (!tops.length || !bottoms.length) {
    return { outfits: [], problem: !allItems.length ? 'empty' : 'need-basics' };
  }

  // anchor ("build a fit around this piece")
  let forcedAcc = null, forceOuter = false;
  if (anchor) {
    const a = items.find((i) => i.id === anchor);
    if (a) {
      if (a.cat === 'top') tops = [a];
      else if (a.cat === 'bottom') bottoms = [a];
      else if (a.cat === 'outer') { outers = [a]; forceOuter = true; }
      else if (a.cat === 'shoes') shoes = [a];
      else forcedAcc = a;
    }
  }
  const outerOpts = temp === 'hot' && !forceOuter ? [null]
    : forceOuter || (temp === 'cold' && outers.length) ? outers
      : [null, ...outers];
  const shoeOpts = shoes.length ? shoes : [null];

  const vibes = VIBES.filter((v) => occasion === 'any' || (v.occ[occasion] ?? 1) >= 0.9)
    .map((v) => ({ v, mult: occasion === 'any' ? 1 : v.occ[occasion] ?? 1 }));

  // score everything
  const cands = [];
  for (const top of tops) for (const bottom of bottoms) for (const outer of outerOpts) for (const sh of shoeOpts) {
    const combo = { top, bottom, outer, shoes: sh };
    let best = null;
    for (const { v, mult } of vibes) {
      const r = scoreCombo(v, combo, ctx);
      if (r.avg < 1.3) continue;
      const total = r.score * (mult >= 1 ? 1 : mult) + (mult > 1 ? (mult - 1) * 3 : 0);
      if (!best || total > best.total) best = { v, r, total };
    }
    if (best) cands.push({ combo, ...best });
  }
  if (!cands.length) {
    // nothing matches any trend well: fall back to a basic best-effort pick
    const v = VIBES[0];
    for (const top of tops) for (const bottom of bottoms) for (const outer of outerOpts) for (const sh of shoeOpts) {
      const combo = { top, bottom, outer, shoes: sh };
      const r = scoreCombo(v, combo, ctx);
      cands.push({ combo, v, r, total: r.score });
    }
  }

  // keep only combos the trend actually likes (unless that leaves too few)
  const liked = cands.filter((c) => c.r.avg >= 1.8);
  if (liked.length >= 3) { cands.length = 0; cands.push(...liked); }

  // greedy pick with variety: don't repeat pieces or vibes too much
  const picked = [];
  const useCount = new Map();
  const vibeCount = {};
  while (picked.length < count && cands.length) {
    let bi = -1, bs = -Infinity;
    for (let i = 0; i < cands.length; i++) {
      const c = cands[i];
      const pieces = [c.combo.top, c.combo.bottom, c.combo.outer, c.combo.shoes].filter(Boolean);
      let pen = (vibeCount[c.v.id] || 0) * 3.2;
      for (const p of pieces) if (!anchor || p.id !== anchor) pen += (useCount.get(p.id) || 0) * 1.4;
      const val = c.total - pen;
      if (val > bs) { bs = val; bi = i; }
    }
    if (bi < 0) break;
    const c = cands.splice(bi, 1)[0];
    if (picked.length >= 3 && bs < 2) break;
    picked.push(c);
    vibeCount[c.v.id] = (vibeCount[c.v.id] || 0) + 1;
    for (const p of [c.combo.top, c.combo.bottom, c.combo.outer, c.combo.shoes].filter(Boolean)) {
      useCount.set(p.id, (useCount.get(p.id) || 0) + 1);
    }
  }

  const accUse = new Map();
  const outfits = picked.map((c, n) => {
    const acc = pickAccessories(c.v, c.combo, accs, ctx, forcedAcc, accUse);
    acc.forEach((a) => accUse.set(a.id, (accUse.get(a.id) || 0) + 1));
    const warmth = SUB[c.combo.top.sub].warmth + SUB[c.combo.bottom.sub].warmth + (c.combo.outer ? SUB[c.combo.outer.sub].warmth : 0);
    return {
      id: `${seed}-${n}`,
      vibe: { id: c.v.id, name: c.v.name, blurb: c.v.blurb },
      top: c.combo.top, bottom: c.combo.bottom, outer: c.combo.outer, shoes: c.combo.shoes, acc,
      pct: Math.max(55, Math.min(98, Math.round(62 + (c.total - 8) * 2.3))),
      why: explain(c, acc, warmth, temp),
    };
  });
  return { outfits, problem: null, missing: { shoes: !shoes.length, outer: !outers.length } };
}

function explain(c, acc, warmth, temp) {
  const lines = [];
  const { why } = c.r, { combo } = c;
  const name = (f) => COLORS[f].label.toLowerCase();
  if (why.tonal === 'mono') lines.push('Tonal black, grey and white palette');
  else if (why.tonal === 'earth') lines.push('Earth-tone palette, very in right now');
  else if (why.tonal === 'cool') lines.push('Cool blue-toned palette');
  else if (why.neutral) lines.push('All neutrals, easy to wear');
  if (why.pop) lines.push(`One pop of ${name(why.pop)} to stand out`);
  if (why.balance) lines.push('Baggy bottoms balanced with a fitted top');
  else if (combo.bottom.fit === 'baggy' && (c.v.id === 'street' || c.v.id === 'skate')) lines.push('Baggy bottoms are the move');
  if (combo.outer && why.layered) lines.push(`Layered with the ${SUB[combo.outer.sub].label.toLowerCase()}`);
  if (temp === 'cold' && warmth >= 6) lines.push('Warm enough for cold days');
  if (temp === 'hot' && warmth <= 3) lines.push('Light for hot days');
  if (acc.length) lines.push(`Finished with ${acc.map((a) => SUB[a.sub].label.toLowerCase()).join(' + ')}`);
  return lines.slice(0, 3);
}
