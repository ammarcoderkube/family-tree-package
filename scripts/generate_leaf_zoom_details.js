const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = path.resolve(__dirname, '../assets');
const rootAssetsDir = path.resolve(__dirname, '../../assets');
const brainDir = '/home/ammar/.gemini/antigravity-ide/brain/e2c0a748-6be4-439f-a099-d057de3ca8ec';

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 30px;
      width: 1400px;
      height: 720px;
      background: #14110f;
      color: #f7ede2;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .header {
      text-align: center;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(212, 163, 115, 0.25);
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      color: #f6d365;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 14px;
      color: #cfd8dc;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1300px;
      margin: 0 auto;
    }
    .card {
      background: #1c1815;
      border: 1.5px solid rgba(246, 211, 101, 0.6);
      border-radius: 16px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 10px 28px rgba(0,0,0,0.6);
    }
    .card-title {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
      text-align: center;
    }
    .card-code {
      font-size: 13px;
      font-family: monospace;
      color: #84a98c;
      margin-bottom: 14px;
      background: rgba(0,0,0,0.35);
      padding: 3px 12px;
      border-radius: 6px;
    }
    .svg-wrap {
      width: 260px;
      height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 75%);
      border-radius: 14px;
      border: 1px dashed rgba(212, 163, 115, 0.25);
      margin-bottom: 16px;
    }
    .card-desc {
      font-size: 13px;
      color: #cfd8dc;
      text-align: center;
      line-height: 1.5;
    }
    .feature-list {
      margin-top: 10px;
      padding: 0;
      list-style: none;
      font-size: 12px;
      color: #f3d082;
      text-align: left;
      width: 100%;
    }
    .feature-list li {
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  </style>
  <script src="../src/family-tree-svg.js"></script>
</head>
<body>
  <div class="header">
    <h1>🔍 Selected Botanical Leaf Vectors (Macro Zoom Detail)</h1>
    <p>High-magnification view showing sharp apex tips, fine saw-tooth serrations, and gold venation rays</p>
  </div>

  <div class="grid">
    <!-- 1. Japanese Maple -->
    <div class="card">
      <div class="card-title">🍁 Japanese Maple</div>
      <div class="card-code">leafStyle: 'maple'</div>
      <div class="svg-wrap" id="zoom-maple"></div>
      <ul class="feature-list">
        <li>✦ 7 radiating needle-sharp slender lobes</li>
        <li>✦ Deep curved sinuses with concave relief</li>
        <li>✦ 7-ray palmate gold venation diverging from petiole</li>
      </ul>
    </div>

    <!-- 2. Serrated Birch -->
    <div class="card">
      <div class="card-title">🍃 Serrated Birch / Elm</div>
      <div class="card-code">leafStyle: 'birch'</div>
      <div class="svg-wrap" id="zoom-birch"></div>
      <ul class="feature-list">
        <li>✦ Natural fine saw-tooth perimeter notches</li>
        <li>✦ Tapered acute apex pointing upwards</li>
        <li>✦ Alternating herringbone pinnate gold veins</li>
      </ul>
    </div>

    <!-- 3. Cordate Linden -->
    <div class="card">
      <div class="card-title">💚 Cordate Linden</div>
      <div class="card-code">leafStyle: 'linden'</div>
      <div class="svg-wrap" id="zoom-linden"></div>
      <ul class="feature-list">
        <li>✦ Deep heart-cleft basal notch seating onto collar</li>
        <li>✦ Symmetrical convex flanks with acute drip-tip</li>
        <li>✦ Radiating palmate-pinnate gold venation</li>
      </ul>
    </div>
  </div>

  <script>
    const items = [
      { id: 'maple', w: 200, h: 220 },
      { id: 'birch', w: 190, h: 230 },
      { id: 'linden', w: 190, h: 230 }
    ];

    items.forEach(it => {
      const wrap = document.getElementById('zoom-' + it.id);
      if (!wrap) return;

      const d = FamilyTreeSVG.leafD(0, 0, it.w, it.h, it.id);
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '250');
      svg.setAttribute('height', '250');
      svg.setAttribute('viewBox', '-125 -125 250 250');

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = \`
        <linearGradient id="g-zoom-\` + it.id + \`" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stop-color="#2d5e38"/>
          <stop offset="50%" stop-color="#1b3d24"/>
          <stop offset="100%" stop-color="#102616"/>
        </linearGradient>
        <filter id="ds-zoom-\` + it.id + \`">
          <feDropShadow dx="3" dy="6" stdDeviation="6" flood-color="rgba(0,0,0,0.55)"/>
        </filter>
      \`;
      svg.appendChild(defs);

      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      p.setAttribute('fill', 'url(#g-zoom-' + it.id + ')');
      p.setAttribute('stroke', '#d6a661');
      p.setAttribute('stroke-width', '3');
      p.setAttribute('filter', 'url(#ds-zoom-' + it.id + ')');
      svg.appendChild(p);

      const gold = '#d6a661';
      const vg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      vg.setAttribute('opacity', '0.75');
      svg.appendChild(vg);

      if (it.id === 'maple') {
        const w = it.w, h = it.h;
        vg.innerHTML = '<path d="M 0,' + (h*0.23) + ' L 0,' + (-h*0.48) + '" fill="none" stroke="' + gold + '" stroke-width="2.0" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (-w*0.08) + ',-2 ' + (-w*0.30) + ',' + (-h*0.37) + '" fill="none" stroke="' + gold + '" stroke-width="1.5" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (w*0.08) + ',-2 ' + (w*0.30) + ',' + (-h*0.37) + '" fill="none" stroke="' + gold + '" stroke-width="1.5" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (-w*0.15) + ',' + (h*0.06) + ' ' + (-w*0.47) + ',-2" fill="none" stroke="' + gold + '" stroke-width="1.3" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (w*0.15) + ',' + (h*0.06) + ' ' + (w*0.47) + ',-2" fill="none" stroke="' + gold + '" stroke-width="1.3" stroke-linecap="round"/>';
      } else if (it.id === 'birch') {
        const w = it.w, h = it.h;
        vg.innerHTML = '<path d="M 0,' + (h*0.36) + ' L 0,' + (-h*0.40) + '" fill="none" stroke="' + gold + '" stroke-width="1.8" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.13) + ' Q ' + (-w*0.15) + ',' + (h*0.10) + ' ' + (-w*0.27) + ',' + (h*0.10) + '" fill="none" stroke="' + gold + '" stroke-width="1.3" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.13) + ' Q ' + (w*0.15) + ',' + (h*0.10) + ' ' + (w*0.27) + ',' + (h*0.10) + '" fill="none" stroke="' + gold + '" stroke-width="1.3" stroke-linecap="round"/>';
      } else if (it.id === 'linden') {
        const w = it.w, h = it.h;
        vg.innerHTML = '<path d="M 0,' + (h*0.27) + ' L 0,' + (-h*0.41) + '" fill="none" stroke="' + gold + '" stroke-width="1.8" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.25) + ' Q ' + (-w*0.16) + ',' + (h*0.16) + ' ' + (-w*0.32) + ',' + (h*0.08) + '" fill="none" stroke="' + gold + '" stroke-width="1.3" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.25) + ' Q ' + (w*0.16) + ',' + (h*0.16) + ' ' + (w*0.32) + ',' + (h*0.08) + '" fill="none" stroke="' + gold + '" stroke-width="1.3" stroke-linecap="round"/>';
      }

      wrap.appendChild(svg);
    });
  </script>
</body>
</html>`;

const tmpHtml = path.resolve(__dirname, 'tmp_leaf_zoom_details.html');
fs.writeFileSync(tmpHtml, html, 'utf8');

const destAsset = path.join(assetsDir, 'leaf_zoom_details.png');
const destRoot = path.join(rootAssetsDir, 'leaf_zoom_details.png');
const destBrain = path.join(brainDir, 'leaf_zoom_details.png');

console.log('Rendering leaf_zoom_details.png...');
execSync(`/usr/bin/google-chrome --headless --disable-gpu --virtual-time-budget=2000 --window-size=1400,720 --screenshot="${destAsset}" "file://${tmpHtml}"`);

fs.copyFileSync(destAsset, destRoot);
fs.copyFileSync(destAsset, destBrain);
console.log('Generated: ' + destAsset);
