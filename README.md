# Fit Check

Upload your clothes, get outfits that match what's trending, shown as a flat-lay.
Made for one person, runs on your phone, **free forever** (no accounts, no API keys, no server).

## How it works
- **Add clothes**: take or upload a photo of each piece (one item per photo).
  - An AI model on your phone cuts out the background (RMBG-1.4) and figures out *what it is* (CLIP). Color is detected from the pixels. You can fix anything it gets wrong.
  - The models download once (~130 MB), then are cached.
- **Fits**: the stylist scores every combo of your clothes against 9 current trends
  (Clean Fit, Streetwear, Skater, Quarter-Zip Prep, Gorpcore, Athleisure, Varsity, Dressed Up, Cozy Fall),
  checks colors, fit (baggy/regular/slim), how formal each piece is, and the weather, then shows the best, most varied ones.
  Filter by where you're going and the weather, or tap a piece and "Build fits with this".
- **Save / Share**: save fits you like, share the flat-lay image.
- Everything is stored on your phone (IndexedDB). Use Settings → Export now and then as a backup.

## Run it on your computer
```
node serve.mjs
```
Open the **Phone (same wifi)** address it prints on your phone. This works for trying it out, but the app only
installs/caches properly over HTTPS, so for daily use deploy it (free, 2 minutes):

## Put it on your phone for real (free)
Pick one:
1. **Netlify Drop** (easiest): go to https://app.netlify.com/drop, drag this whole folder in. You get an https link.
2. **Cloudflare Pages** or **GitHub Pages**: upload the folder as a static site. No build step.

Then on your phone:
- **iPhone**: open the link in Safari → Share → **Add to Home Screen**. (Do this! Safari can delete website data after a week of not using it, but not for Home Screen apps.)
- **Android**: open in Chrome → ⋮ → **Install app**.

## Change the trends
Open `js/stylist.js`. Each vibe in `VIBES` lists how much it likes each piece type (`aff`), good colors, and fit.
Edit the numbers or add your own vibe. New piece types go in `js/catalog.js`.

## Files
- `js/stylist.js` outfit engine · `js/catalog.js` piece types · `js/color.js` color detection
- `js/ml.js` + `js/pipeline.js` on-device AI · `js/layout.js` flat-lay drawing · `js/app.js` UI
