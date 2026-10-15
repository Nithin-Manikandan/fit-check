// Draws an outfit as a flat-lay on a canvas (like a Pinterest/Lyst board).
const imgCache = new Map();
export function loadImage(url) {
  if (!imgCache.has(url)) {
    imgCache.set(url, new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    }));
  }
  return imgCache.get(url);
}

// Slots are fractions of the canvas: [x, y, w, h]
const WITH_OUTER = {
  outer: [0.04, 0.04, 0.54, 0.44],
  top: [0.56, 0.05, 0.4, 0.33],
  bottom: [0.44, 0.38, 0.5, 0.46],
  shoes: [0.06, 0.76, 0.52, 0.2],
  acc: [[0.04, 0.5, 0.34, 0.24], [0.62, 0.84, 0.18, 0.13], [0.8, 0.84, 0.17, 0.13]],
};
const NO_OUTER = {
  top: [0.06, 0.05, 0.56, 0.42],
  bottom: [0.4, 0.34, 0.54, 0.5],
  shoes: [0.06, 0.74, 0.5, 0.22],
  acc: [[0.04, 0.5, 0.32, 0.22], [0.66, 0.05, 0.28, 0.2], [0.62, 0.85, 0.3, 0.12]],
};

function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

function drawContain(ctx, img, box, W, H, item, rot = 0) {
  const [bx, by, bw, bh] = box;
  const x = bx * W, y = by * H, w = bw * W, h = bh * H;
  const s = Math.min(w / img.width, h / img.height);
  const dw = img.width * s, dh = img.height * s;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.shadowColor = 'rgba(70,50,25,0.28)';
  ctx.shadowBlur = W * 0.022;
  ctx.shadowOffsetY = W * 0.012;
  if (item.hasCut === false) {
    // un-cut photo: rounded card
    const r = Math.min(dw, dh) * 0.08;
    ctx.beginPath();
    ctx.roundRect(-dw / 2, -dh / 2, dw, dh, r);
    ctx.clip();
  }
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

export async function renderOutfit(canvas, outfit, urlFor, W = 900, H = 1125) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(W * 0.35, H * 0.25, W * 0.1, W * 0.5, H * 0.5, W * 0.95);
  g.addColorStop(0, '#f4ede0');
  g.addColorStop(1, '#e6dccb');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const T = outfit.outer ? WITH_OUTER : NO_OUTER;
  const jobs = [];
  const add = (item, box, z) => { if (item && box) jobs.push({ item, box, z }); };
  add(outfit.bottom, T.bottom, 1);
  add(outfit.top, T.top, 2);
  add(outfit.outer, T.outer, 3);
  add(outfit.shoes, T.shoes, 4);
  (outfit.acc || []).forEach((a, i) => add(a, T.acc[i], 5));
  jobs.sort((a, b) => a.z - b.z);

  const imgs = await Promise.all(jobs.map((j) => loadImage(urlFor(j.item, 'full'))));
  jobs.forEach((j, i) => {
    const r = ((hash(j.item.id) % 1000) / 1000 - 0.5) * 0.07; // tiny natural tilt
    drawContain(ctx, imgs[i], j.box, W, H, j.item, j.item.cat === 'bottom' ? r * 0.4 : r);
  });
}
