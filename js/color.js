// Colour families, naming a pixel, and finding the main colour of a garment.

// neutral: goes with everything. group: used to spot tonal outfits.
// hue: only matters for non-neutral colours (clash check).
export const COLORS = {
  black: { label: 'Black', hex: '#1b1b1d', neutral: true, group: 'mono' },
  charcoal: { label: 'Charcoal', hex: '#44464a', neutral: true, group: 'mono' },
  grey: { label: 'Grey', hex: '#9a9da3', neutral: true, group: 'mono' },
  white: { label: 'White', hex: '#f4f4f2', neutral: true, group: 'mono' },
  cream: { label: 'Cream', hex: '#efe6d2', neutral: true, group: 'earth' },
  beige: { label: 'Beige', hex: '#d3bf9f', neutral: true, group: 'earth' },
  tan: { label: 'Tan', hex: '#b29467', neutral: true, group: 'earth' },
  brown: { label: 'Brown', hex: '#6b4a32', neutral: true, group: 'earth' },
  olive: { label: 'Olive', hex: '#6b6d3a', neutral: true, group: 'earth' },
  navy: { label: 'Navy', hex: '#1f2c4d', neutral: true, group: 'cool' },
  denim: { label: 'Denim', hex: '#4f6e94', neutral: true, group: 'cool' },
  sky: { label: 'Light blue', hex: '#a9c6e6', neutral: true, group: 'cool' },
  blue: { label: 'Blue', hex: '#2f63d0', neutral: false, group: 'cool', hue: 220 },
  teal: { label: 'Teal', hex: '#1f8f8a', neutral: false, group: 'cool', hue: 178 },
  green: { label: 'Green', hex: '#2f8f4e', neutral: false, group: 'earth', hue: 130 },
  red: { label: 'Red', hex: '#c8302f', neutral: false, group: 'bright', hue: 0 },
  burgundy: { label: 'Burgundy', hex: '#6d1f2c', neutral: false, group: 'earth', hue: 350 },
  orange: { label: 'Orange', hex: '#e07a24', neutral: false, group: 'bright', hue: 25 },
  yellow: { label: 'Yellow', hex: '#e6bf2e', neutral: false, group: 'bright', hue: 50 },
  pink: { label: 'Pink', hex: '#e58fb0', neutral: false, group: 'bright', hue: 335 },
  purple: { label: 'Purple', hex: '#6b46b0', neutral: false, group: 'bright', hue: 275 },
};

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

export function familyOf(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);
  if (l < 0.14) return 'black';
  if (s < 0.1) {
    if (l < 0.24) return 'black';
    if (l < 0.4) return 'charcoal';
    if (l < 0.88) return 'grey';
    return 'white';
  }
  if (l > 0.93) return 'white';
  if (h < 15 || h >= 345) {
    if (l < 0.3) return 'burgundy';
    if (l > 0.72) return 'pink';
    if (s < 0.3) return l < 0.5 ? 'brown' : 'beige';
    return 'red';
  }
  if (h < 45) { // orange / brown / tan / beige
    if (l > 0.86) return 'cream';
    if (l > 0.7) return s < 0.7 ? 'beige' : 'orange';
    if (s < 0.5) return l > 0.45 ? 'tan' : l > 0.2 ? 'brown' : 'black';
    if (l < 0.4) return 'brown';
    return h <= 36 ? 'orange' : 'yellow';
  }
  if (h < 70) { // yellow / khaki / olive
    if (l > 0.86) return 'cream';
    if (l > 0.72) return s < 0.5 ? 'cream' : 'yellow';
    if (s < 0.5) return l > 0.45 ? 'tan' : 'olive';
    if (l < 0.45) return 'olive';
    return 'yellow';
  }
  if (h < 165) { // green
    if (l < 0.42 && (s < 0.55 || h < 100)) return 'olive';
    return 'green';
  }
  if (h < 200) return l < 0.22 ? 'navy' : 'teal';
  if (h < 252) { // blue
    if (l < 0.3) return 'navy';
    if (l > 0.74) return 'sky';
    if (s < 0.42) return 'denim';
    if (l < 0.42 && s < 0.6) return 'denim';
    return 'blue';
  }
  if (h < 290) return l < 0.22 ? 'navy' : 'purple';
  if (l < 0.35) return 'burgundy';
  return l > 0.65 ? 'pink' : 'purple';
}

// Main colour of the garment (ignores transparent pixels).
export function dominantColor(canvas, hasCutout) {
  const max = 96;
  const s = Math.min(1, max / Math.max(canvas.width, canvas.height));
  const w = Math.max(1, Math.round(canvas.width * s));
  const h = Math.max(1, Math.round(canvas.height * s));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(canvas, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const votes = {}, sums = {};
  const x0 = hasCutout ? 0 : w * 0.2, x1 = hasCutout ? w : w * 0.8;
  const y0 = hasCutout ? 0 : h * 0.2, y1 = hasCutout ? h : h * 0.8;
  for (let y = Math.floor(y0); y < y1; y++) {
    for (let x = Math.floor(x0); x < x1; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 200) continue;
      const f = familyOf(d[i], d[i + 1], d[i + 2]);
      votes[f] = (votes[f] || 0) + 1;
      const a = sums[f] || (sums[f] = [0, 0, 0]);
      a[0] += d[i]; a[1] += d[i + 1]; a[2] += d[i + 2];
    }
  }
  let best = null;
  for (const f in votes) if (!best || votes[f] > votes[best]) best = f;
  if (!best) return { family: 'grey', hex: COLORS.grey.hex };
  const n = votes[best], a = sums[best];
  const hex = '#' + a.map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('');
  return { family: best, hex };
}
