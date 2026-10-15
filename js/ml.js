// On-device AI (free, no keys, no server). Models download once from the
// Hugging Face CDN and run in the browser with WebAssembly / WebGPU.
//   - CLIP        -> figures out what each piece of clothing is
//   - RMBG-1.4    -> cuts the garment out of the photo
import { SUBTYPES } from './catalog.js';

const TF_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
const memo = (fn) => { let p; return (...a) => p || (p = fn(...a).catch((e) => { p = null; throw e; })); };

const lib = memo(() => import(TF_URL));

export const loadClassifier = memo(async (onProgress) => {
  const { pipeline } = await lib();
  return pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', { progress_callback: onProgress });
});

export const loadRemover = memo(async (onProgress) => {
  const { pipeline } = await lib();
  return pipeline('background-removal', 'briaai/RMBG-1.4', { dtype: 'q8', progress_callback: onProgress });
});

const LABELS = SUBTYPES.map((s) => s.clip);

// canvas (on white) -> [{id, score}] best guesses first
export async function classify(canvas, onProgress) {
  const clf = await loadClassifier(onProgress);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.92));
  const url = URL.createObjectURL(blob);
  try {
    const out = await clf(url, LABELS, { hypothesis_template: 'a product photo of {} on a white background' });
    return out.slice(0, 4).map((o) => ({ id: SUBTYPES[LABELS.indexOf(o.label)].id, score: o.score }));
  } finally { URL.revokeObjectURL(url); }
}

// canvas -> canvas with transparent background
export async function aiCutout(canvas, onProgress) {
  const rem = await loadRemover(onProgress);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
  const url = URL.createObjectURL(blob);
  try {
    const res = await rem(url);
    const img = Array.isArray(res) ? res[0] : res;
    return img.toCanvas();
  } finally { URL.revokeObjectURL(url); }
}
