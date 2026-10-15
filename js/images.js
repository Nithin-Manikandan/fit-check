// Canvas helpers: load a phone photo, shrink it, cut out the background, trim.

export async function fileToCanvas(file, max = 1024) {
  let bmp;
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch { bmp = await createImageBitmap(file); }
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(bmp.width * s));
  c.height = Math.max(1, Math.round(bmp.height * s));
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  return c;
}

export function scaleCanvas(src, max) {
  const s = Math.min(1, max / Math.max(src.width, src.height));
  if (s === 1) return src;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(src.width * s));
  c.height = Math.max(1, Math.round(src.height * s));
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

export const toBlob = (canvas, type = 'image/png', q) =>
  new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), type, q));

export function onWhite(src, size = 336) {
  const s = scaleCanvas(src, size);
  const c = document.createElement('canvas');
  c.width = s.width; c.height = s.height;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(s, 0, 0);
  return c;
}

// Crop transparent margins off a cut-out.
export function trim(src, pad = 0.03) {
  const w = src.width, h = src.height;
  const d = src.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 20) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return src;
  const p = Math.round(Math.max(x1 - x0, y1 - y0) * pad);
  x0 = Math.max(0, x0 - p); y0 = Math.max(0, y0 - p);
  x1 = Math.min(w - 1, x1 + p); y1 = Math.min(h - 1, y1 + p);
  const c = document.createElement('canvas');
  c.width = x1 - x0 + 1; c.height = y1 - y0 + 1;
  c.getContext('2d').drawImage(src, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
  return c;
}

export function coverage(canvas) {
  const w = canvas.width, h = canvas.height;
  const d = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 128) n++;
  return n / (w * h);
}

// "Fast" cut-out: flood fill from the edges, good for a plain wall/bed/floor.
export function fastCutout(src) {
  const w = src.width, h = src.height;
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const ctx = out.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const rs = [], gs = [], bs = [];
  const sample = (x, y) => { const i = (y * w + x) * 4; rs.push(d[i]); gs.push(d[i + 1]); bs.push(d[i + 2]); };
  for (let x = 0; x < w; x += 2) { sample(x, 0); sample(x, h - 1); }
  for (let y = 0; y < h; y += 2) { sample(0, y); sample(w - 1, y); }
  const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
  const br = med(rs), bg = med(gs), bb = med(bs);
  const TOL2 = 56 * 56;
  const isBg = (i) => {
    const dr = d[i] - br, dg = d[i + 1] - bg, db = d[i + 2] - bb;
    return dr * dr + dg * dg + db * db < TOL2;
  };
  const seen = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let sp = 0, removed = 0;
  const tryPush = (p) => {
    if (seen[p]) return;
    if (!isBg(p * 4)) return;
    seen[p] = 1; stack[sp++] = p;
  };
  for (let x = 0; x < w; x++) { tryPush(x); tryPush((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { tryPush(y * w); tryPush(y * w + w - 1); }
  while (sp) {
    const p = stack[--sp];
    d[p * 4 + 3] = 0; removed++;
    const x = p % w;
    if (x > 0) tryPush(p - 1);
    if (x < w - 1) tryPush(p + 1);
    if (p >= w) tryPush(p - w);
    if (p < w * (h - 1)) tryPush(p + w);
  }
  const frac = removed / (w * h);
  if (frac < 0.04 || frac > 0.93) return null;
  ctx.putImageData(img, 0, 0);
  return out;
}
