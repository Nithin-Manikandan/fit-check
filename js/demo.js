// A starter closet drawn with simple shapes, so you can try the stylist
// before uploading your own clothes.
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt * (amt < 0 ? v : 255 - v))));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('');
};

const SHAPES = {
  tee: (c) => `<path d="M95 40 L60 60 L30 110 L62 128 L82 98 L82 262 L218 262 L218 98 L238 128 L270 110 L240 60 L205 40 Q150 80 95 40Z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="3"/><path d="M95 40 Q150 88 205 40" fill="none" stroke="${shade(c, -0.3)}" stroke-width="6"/>`,
  graphic: (c) => SHAPES.tee(c) + `<circle cx="150" cy="150" r="34" fill="none" stroke="${shade(c, c === '#1b1b1d' ? 0.8 : -0.7)}" stroke-width="7"/><path d="M130 150 L170 150 M150 130 L150 170" stroke="${shade(c, c === '#1b1b1d' ? 0.8 : -0.7)}" stroke-width="7"/>`,
  long: (c, o = {}) => `<path d="M95 40 L55 55 L22 218 L52 226 L82 125 L82 262 L218 262 L218 125 L248 226 L278 218 L245 55 L205 40 Q150 80 95 40Z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="3"/><path d="M95 40 Q150 88 205 40" fill="none" stroke="${shade(c, -0.3)}" stroke-width="6"/>${o.extra || ''}`,
  hoodie: (c) => `<path d="M100 44 Q150 -8 200 44 Q150 90 100 44Z" fill="${shade(c, -0.12)}" stroke="${shade(c, -0.3)}" stroke-width="3"/>` + SHAPES.long(c, { extra: `<path d="M100 200 L200 200 L212 250 L88 250Z" fill="${shade(c, -0.08)}" stroke="${shade(c, -0.3)}" stroke-width="3"/><path d="M135 70 L135 115 M165 70 L165 115" stroke="${shade(c, 0.5)}" stroke-width="3"/>` }),
  zip: (c, sleeve) => SHAPES.long(c, { extra: `<path d="M150 62 L150 262" stroke="${shade(c, -0.45)}" stroke-width="4"/><rect x="100" y="200" width="40" height="8" fill="${shade(c, -0.3)}"/><rect x="160" y="200" width="40" height="8" fill="${shade(c, -0.3)}"/>${sleeve ? `<path d="M95 40 L55 55 L22 218 L52 226 L82 125 L82 60Z" fill="${sleeve}"/><path d="M205 40 L245 55 L278 218 L248 226 L218 125 L218 60Z" fill="${sleeve}"/>` : ''}` }),
  puffer: (c) => SHAPES.zip(c).replace('</svg>', '') + [100, 140, 180, 220].map((y) => `<path d="M82 ${y} L218 ${y}" stroke="${shade(c, -0.3)}" stroke-width="3"/>`).join(''),
  pants: (c, wide) => `<path d="M${wide ? 78 : 88} 28 L${wide ? 222 : 212} 28 L${wide ? 240 : 226} 272 L${wide ? 160 : 162} 272 L150 108 L${wide ? 140 : 138} 272 L${wide ? 60 : 74} 272Z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="3"/><rect x="${wide ? 78 : 88}" y="28" width="${wide ? 144 : 124}" height="16" fill="${shade(c, -0.12)}"/><path d="M150 44 L150 108" stroke="${shade(c, -0.3)}" stroke-width="3"/>`,
  cargo: (c) => SHAPES.pants(c, true) + `<rect x="82" y="150" width="34" height="40" fill="${shade(c, -0.12)}" stroke="${shade(c, -0.3)}" stroke-width="3"/><rect x="184" y="150" width="34" height="40" fill="${shade(c, -0.12)}" stroke="${shade(c, -0.3)}" stroke-width="3"/>`,
  shorts: (c) => `<path d="M82 60 L218 60 L232 178 L160 178 L150 108 L140 178 L68 178Z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="3"/><rect x="82" y="60" width="136" height="16" fill="${shade(c, -0.12)}"/>`,
  sneaker: (c, o = {}) => `<path d="M28 196 L28 150 Q58 138 92 150 L122 108 Q172 132 222 152 Q276 162 280 196 Z" fill="${c}" stroke="${shade(c, -0.3)}" stroke-width="3"/><rect x="26" y="192" width="256" height="20" rx="8" fill="${o.sole || '#f4f4f2'}" stroke="${shade('#cccccc', -0.1)}" stroke-width="2"/><path d="M120 110 L140 140 M148 120 L166 148 M176 132 L192 154" stroke="${shade(c, 0.5)}" stroke-width="4"/>`,
  boot: (c) => `<path d="M80 40 L170 40 L175 140 Q250 150 272 180 L272 205 L60 205 L60 170 Z" fill="${c}" stroke="${shade(c, -0.3)}" stroke-width="3"/><rect x="56" y="198" width="222" height="18" rx="6" fill="${shade(c, -0.4)}"/><path d="M80 90 L170 90" stroke="${shade(c, -0.3)}" stroke-width="3"/>`,
  loafer: (c) => `<path d="M30 190 L30 140 Q80 120 140 150 Q250 150 275 185 L275 200 L30 200Z" fill="${c}" stroke="${shade(c, -0.3)}" stroke-width="3"/><rect x="28" y="196" width="250" height="14" rx="5" fill="${shade(c, -0.45)}"/>`,
  cap: (c) => `<path d="M60 175 Q58 78 150 78 Q242 78 240 175Z" fill="${c}" stroke="${shade(c, -0.3)}" stroke-width="3"/><path d="M60 175 Q150 150 290 192 Q150 208 60 175Z" fill="${shade(c, -0.15)}" stroke="${shade(c, -0.35)}" stroke-width="3"/><circle cx="150" cy="80" r="7" fill="${shade(c, -0.3)}"/>`,
  beanie: (c) => `<path d="M62 190 Q58 70 150 66 Q242 70 238 190Z" fill="${c}" stroke="${shade(c, -0.3)}" stroke-width="3"/><rect x="56" y="170" width="188" height="40" rx="10" fill="${shade(c, -0.12)}" stroke="${shade(c, -0.3)}" stroke-width="3"/><circle cx="150" cy="60" r="14" fill="${shade(c, -0.1)}"/>`,
  bag: (c) => `<path d="M100 70 Q100 30 150 30 Q200 30 200 70" fill="none" stroke="${shade(c, -0.3)}" stroke-width="10"/><rect x="70" y="60" width="160" height="200" rx="40" fill="${c}" stroke="${shade(c, -0.3)}" stroke-width="3"/><rect x="95" y="170" width="110" height="60" rx="16" fill="${shade(c, -0.12)}" stroke="${shade(c, -0.3)}" stroke-width="3"/>`,
  watch: (c) => `<rect x="125" y="20" width="50" height="260" rx="14" fill="${c}"/><circle cx="150" cy="150" r="62" fill="#e9e9e6" stroke="#2a2a2c" stroke-width="10"/><path d="M150 150 L150 112 M150 150 L176 160" stroke="#2a2a2c" stroke-width="6" stroke-linecap="round"/>`,
};

// [shape, colour hex, cat, subtype, family, extra]
const H = { black: '#1b1b1d', white: '#f4f4f2', grey: '#9a9da3', navy: '#1f2c4d', denim: '#4f6e94', olive: '#6b6d3a', tan: '#b29467', brown: '#6b4a32', cream: '#efe6d2', beige: '#d3bf9f', sky: '#a9c6e6', red: '#c8302f', burgundy: '#6d1f2c', charcoal: '#44464a' };
export const DEMO = [
  ['tee', H.white, 'top', 'tee', 'white'],
  ['graphic', H.black, 'top', 'graphic-tee', 'black', { loud: true }],
  ['hoodie', H.grey, 'top', 'hoodie', 'grey', { fit: 'baggy' }],
  ['hoodie', H.olive, 'top', 'hoodie', 'olive'],
  ['long', H.navy, 'top', 'quarter-zip', 'navy'],
  ['long', H.sky, 'top', 'button-up', 'sky'],
  ['tee', H.cream, 'top', 'tee', 'cream'],
  ['pants', H.denim, 'bottom', 'jeans', 'denim', { fit: 'baggy', wide: true }],
  ['pants', H.black, 'bottom', 'jeans', 'black'],
  ['cargo', H.olive, 'bottom', 'cargo', 'olive', { fit: 'baggy' }],
  ['pants', H.beige, 'bottom', 'chinos', 'beige'],
  ['pants', H.grey, 'bottom', 'sweatpants', 'grey'],
  ['shorts', H.tan, 'bottom', 'shorts', 'tan'],
  ['zip', H.black, 'outer', 'bomber', 'black'],
  ['puffer', H.black, 'outer', 'puffer', 'black'],
  ['zip', H.navy, 'outer', 'varsity', 'navy', { sleeve: H.cream }],
  ['zip', H.brown, 'outer', 'work-jacket', 'brown'],
  ['sneaker', H.white, 'shoes', 'sneakers', 'white'],
  ['sneaker', H.black, 'shoes', 'skate', 'black', { sole: '#d9c9a3' }],
  ['boot', H.brown, 'shoes', 'boots', 'brown'],
  ['loafer', H.black, 'shoes', 'loafers', 'black'],
  ['cap', H.black, 'acc', 'cap', 'black'],
  ['beanie', H.charcoal, 'acc', 'beanie', 'charcoal'],
  ['bag', H.black, 'acc', 'bag', 'black'],
  ['watch', H.brown, 'acc', 'watch', 'brown'],
];

export function drawDemoCanvas(shape, hex, extra = {}) {
  const fn = SHAPES[shape];
  const inner = shape === 'zip' ? SHAPES.zip(hex, extra.sleeve) : fn(hex, shape === 'pants' ? !!extra.wide : extra);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 300 300">${inner}</svg>`;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 600; c.height = 600;
      c.getContext('2d').drawImage(img, 0, 0, 600, 600);
      resolve(c);
    };
    img.onerror = reject;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
