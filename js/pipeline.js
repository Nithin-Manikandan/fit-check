// photo -> { cutout canvas, what it is, what colour it is }
import { fileToCanvas, trim, onWhite, fastCutout, coverage, scaleCanvas } from './images.js';
import { classify, aiCutout } from './ml.js';
import { dominantColor } from './color.js';

export async function processPhoto(file, mode, onStage, onProgress) {
  const src = await fileToCanvas(file, 1024);
  let cut = null;

  if (mode === 'ai') {
    try {
      onStage('Cutting out the background…');
      const c = await aiCutout(src, onProgress);
      const cov = coverage(c);
      if (cov > 0.03 && cov < 0.97) cut = c;
    } catch (e) { console.warn('AI cut-out failed, using fast mode', e); }
  }
  if (!cut && mode !== 'off') {
    onStage('Cutting out the background…');
    cut = fastCutout(src);
  }

  const base = scaleCanvas(cut ? trim(cut) : src, 900);
  const color = dominantColor(base, !!cut);

  let guess = null;
  try {
    onStage('Figuring out what it is…');
    guess = await classify(onWhite(base), onProgress);
  } catch (e) { console.warn('Classifier failed', e); }

  return { canvas: base, hasCut: !!cut, color, guess };
}
