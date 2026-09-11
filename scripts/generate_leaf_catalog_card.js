const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const brainDir = '/home/ammar/.gemini/antigravity-ide/brain/e2c0a748-6be4-439f-a099-d057de3ca8ec';
const assetsDir = path.resolve(__dirname, '../assets');
const rootAssetsDir = path.resolve(__dirname, '../../assets');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: #14110f;
      color: #f7ede2;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .header {
      text-align: center;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(212, 163, 115, 0.25);
      margin-bottom: 18px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #f6d365;
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #cfd8dc;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      max-width: 1350px;
      margin: 0 auto;
    }
    .card {
      background: #1c1815;
      border: 1px solid rgba(212, 163, 115, 0.25);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 6px 18px rgba(0,0,0,0.5);
    }
    .card.highlight {
      border: 1.5px solid rgba(246, 211, 101, 0.6);
      background: #201a16;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
      text-align: center;
    }
    .card-key {
      font-size: 11px;
      font-family: monospace;
      color: #84a98c;
      margin-bottom: 8px;
    }
    .svg-wrap {
      width: 170px;
      height: 170px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
      border-radius: 8px;
      border: 1px dashed rgba(255,255,255,0.1);
      margin-bottom: 10px;
    }
    .card-desc {
      font-size: 11.5px;
      color: #cfd8dc;
      text-align: center;
      line-height: 1.35;
    }
    .badge {
      display: inline-block;
      margin-top: 8px;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      background: rgba(46, 204, 113, 0.2);
      color: #2ecc71;
      border: 1px solid rgba(46, 204, 113, 0.4);
    }
  </style>
  <script src="../src/family-tree-svg.js"></script>
</head>
<body>
  <div class="header">
    <h1>🌿 Complete Botanical Leaf Shape Catalog (Macro Zoom)</h1>
    <p>Pure Vector SVG venation paths and 512x512 textured PNG assets with gold accents</p>
  </div>

  <div class="grid">
    <!-- 1. Japanese Maple -->
    <div class="card highlight">
      <div class="card-title">🍁 Japanese Maple</div>
      <div class="card-key">leafStyle: 'maple'</div>
      <div class="svg-wrap" id="leaf-maple"></div>
      <div class="card-desc">7 radiating needle-sharp slender lobes, curved sinuses, and palmate gold venation rays.</div>
      <span class="badge">NEW BOTANICAL SELECTION</span>
    </div>

    <!-- 2. Serrated Birch -->
    <div class="card highlight">
      <div class="card-title">🍃 Serrated Birch / Elm</div>
      <div class="card-key">leafStyle: 'birch'</div>
      <div class="svg-wrap" id="leaf-birch"></div>
      <div class="card-desc">Authentic saw-tooth serrated margin with acute apex and herringbone pinnate veins.</div>
      <span class="badge">NEW BOTANICAL SELECTION</span>
    </div>

    <!-- 3. Cordate Linden -->
    <div class="card highlight">
      <div class="card-title">💚 Cordate Linden</div>
      <div class="card-key">leafStyle: 'linden'</div>
      <div class="svg-wrap" id="leaf-linden"></div>
      <div class="card-desc">Iconic heart-cleft notched base firmly seated on branch collars with acute drip-tip.</div>
      <span class="badge">NEW BOTANICAL SELECTION</span>
    </div>

    <!-- 4. Majestic Ginkgo -->
    <div class="card highlight">
      <div class="card-title">🪭 Majestic Ginkgo</div>
      <div class="card-key">leafStyle: 'ginkgo'</div>
      <div class="svg-wrap" id="leaf-ginkgo"></div>
      <div class="card-desc">Flared fan foliage with sharp apex point staying on upper side, seated firmly on collar.</div>
      <span class="badge">POINT STAYS UPSIDE</span>
    </div>

    <!-- 5. Classical Laurel -->
    <div class="card">
      <div class="card-title">🍃 Classical Laurel</div>
      <div class="card-key">leafStyle: 'laurel'</div>
      <div class="svg-wrap" id="leaf-laurel"></div>
      <div class="card-desc">Pointed symmetric botanical elliptic leaf with tapered tips and gold midrib vein.</div>
    </div>

    <!-- 6. Imperial Oval -->
    <div class="card">
      <div class="card-title">🟢 Imperial Oval</div>
      <div class="card-key">leafStyle: 'oval'</div>
      <div class="svg-wrap" id="leaf-oval"></div>
      <div class="card-desc">Continuous rounded heraldic badge / medallion with spacious text area and gold rim.</div>
    </div>

    <!-- 7. Royal Oak -->
    <div class="card">
      <div class="card-title">🌳 Royal Oak</div>
      <div class="card-key">leafStyle: 'oak'</div>
      <div class="svg-wrap" id="leaf-oak"></div>
      <div class="card-desc">Classical lobed foliage with undulating rounded lobes and apical crown lobe.</div>
    </div>

    <!-- 8. PNG Texture Mode Badge -->
    <div class="card" style="justify-content: center; text-align: center; border-style: dashed; background: rgba(30, 24, 20, 0.6);">
      <div style="font-size: 36px; margin-bottom: 10px;">🖼️</div>
      <div class="card-title" style="color: #f6d365;">Dual Render Engine</div>
      <div class="card-key">leafRenderMode: 'svg' | 'png'</div>
      <div class="card-desc" style="margin-top: 6px;">Switch seamlessly between pure scalable vector SVG and textured 512x512 PNG image assets.</div>
    </div>
  </div>

  <script>
    const leaves = ['maple', 'birch', 'linden', 'ginkgo', 'laurel', 'oval', 'oak'];
    const w = 120, h = 145;

    leaves.forEach(id => {
      const wrap = document.getElementById('leaf-' + id);
      if (!wrap) return;

      const d = FamilyTreeSVG.prototype.leafD(0, 0, w, h, id);
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '165');
      svg.setAttribute('height', '165');
      svg.setAttribute('viewBox', '-85 -85 170 170');

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = \`
        <linearGradient id="grad-\` + id + \`" x1="25%" y1="0%" x2="75%" y2="100%">
          <stop offset="0%" stop-color="#2e5e3a"/>
          <stop offset="50%" stop-color="#1d3d25"/>
          <stop offset="100%" stop-color="#112517"/>
        </linearGradient>
        <filter id="ds-\` + id + \`">
          <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.45)"/>
        </filter>
      \`;
      svg.appendChild(defs);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'url(#grad-' + id + ')');
      path.setAttribute('stroke', '#d6a661');
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('filter', 'url(#ds-' + id + ')');
      svg.appendChild(path);

      // Veins per leaf shape
      const goldCol = '#d6a661';
      const vg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      vg.setAttribute('opacity', '0.7');
      svg.appendChild(vg);

      if (id === 'laurel') {
        vg.innerHTML = '<path d="M 0,' + (-h*0.44) + ' L 0,' + (h*0.44) + '" fill="none" stroke="' + goldCol + '" stroke-width="1.3" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.18) + ' Q ' + (w*0.20) + ',' + (-h*0.26) + ' ' + (w*0.36) + ',' + (-h*0.22) + '" fill="none" stroke="' + goldCol + '" stroke-width="0.9" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.18) + ' Q ' + (-w*0.20) + ',' + (-h*0.26) + ' ' + (-w*0.36) + ',' + (-h*0.22) + '" fill="none" stroke="' + goldCol + '" stroke-width="0.9" stroke-linecap="round"/>';
      } else if (id === 'oval') {
        vg.innerHTML = '<ellipse cx="0" cy="0" rx="' + (w*0.38) + '" ry="' + (h*0.40) + '" fill="none" stroke="' + goldCol + '" stroke-width="1.1" stroke-dasharray="4 3"/>';
      } else if (id === 'oak') {
        vg.innerHTML = '<path d="M 0,' + (-h*0.44) + ' L 0,' + (h*0.44) + '" fill="none" stroke="' + goldCol + '" stroke-width="1.3" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.22) + ' Q ' + (w*0.22) + ',' + (-h*0.28) + ' ' + (w*0.34) + ',' + (-h*0.20) + '" fill="none" stroke="' + goldCol + '" stroke-width="0.9" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.22) + ' Q ' + (-w*0.22) + ',' + (-h*0.28) + ' ' + (-w*0.34) + ',' + (-h*0.20) + '" fill="none" stroke="' + goldCol + '" stroke-width="0.9" stroke-linecap="round"/>';
      } else if (id === 'ginkgo') {
        vg.innerHTML = '<path d="M 0,' + (-h*0.44) + ' L 0,' + (h*0.35) + '" fill="none" stroke="' + goldCol + '" stroke-width="1.3" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.38) + ' Q ' + (-w*0.18) + ',' + (-h*0.05) + ' ' + (-w*0.35) + ',' + (h*0.18) + '" fill="none" stroke="' + goldCol + '" stroke-width="0.9" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.38) + ' Q ' + (w*0.18) + ',' + (-h*0.05) + ' ' + (w*0.35) + ',' + (h*0.18) + '" fill="none" stroke="' + goldCol + '" stroke-width="0.9" stroke-linecap="round"/>';
      } else if (id === 'maple') {
        vg.innerHTML = '<path d="M 0,' + (h*0.23) + ' L 0,' + (-h*0.48) + '" fill="none" stroke="' + goldCol + '" stroke-width="1.5" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (-w*0.08) + ',-2 ' + (-w*0.30) + ',' + (-h*0.37) + '" fill="none" stroke="' + goldCol + '" stroke-width="1.2" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (w*0.08) + ',-2 ' + (w*0.30) + ',' + (-h*0.37) + '" fill="none" stroke="' + goldCol + '" stroke-width="1.2" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (-w*0.15) + ',' + (h*0.06) + ' ' + (-w*0.47) + ',-2" fill="none" stroke="' + goldCol + '" stroke-width="1.1" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (w*0.15) + ',' + (h*0.06) + ' ' + (w*0.47) + ',-2" fill="none" stroke="' + goldCol + '" stroke-width="1.1" stroke-linecap="round"/>';
      } else if (id === 'birch') {
        vg.innerHTML = '<path d="M 0,' + (h*0.36) + ' L 0,' + (-h*0.40) + '" fill="none" stroke="' + goldCol + '" stroke-width="1.4" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.13) + ' Q ' + (-w*0.15) + ',' + (h*0.10) + ' ' + (-w*0.27) + ',' + (h*0.10) + '" fill="none" stroke="' + goldCol + '" stroke-width="0.9" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.13) + ' Q ' + (w*0.15) + ',' + (h*0.10) + ' ' + (w*0.27) + ',' + (h*0.10) + '" fill="none" stroke="' + goldCol + '" stroke-width="0.9" stroke-linecap="round"/>';
      } else if (id === 'linden') {
        vg.innerHTML = '<path d="M 0,' + (h*0.27) + ' L 0,' + (-h*0.41) + '" fill="none" stroke="' + goldCol + '" stroke-width="1.4" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.25) + ' Q ' + (-w*0.16) + ',' + (h*0.16) + ' ' + (-w*0.32) + ',' + (h*0.08) + '" fill="none" stroke="' + goldCol + '" stroke-width="1.0" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.25) + ' Q ' + (w*0.16) + ',' + (h*0.16) + ' ' + (w*0.32) + ',' + (h*0.08) + '" fill="none" stroke="' + goldCol + '" stroke-width="1.0" stroke-linecap="round"/>';
      }

      // Text label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '0');
      text.setAttribute('y', '0');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-family', 'Georgia, serif');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-size', '12');
      text.textContent = 'Ahmed Khan';
      svg.appendChild(text);

      wrap.appendChild(svg);
    });
  </script>
</body>
</html>`;

const tmpHtml = path.resolve(__dirname, 'tmp_leaf_catalog.html');
fs.writeFileSync(tmpHtml, html, 'utf8');

const destAsset = path.join(assetsDir, 'showcase_leaf_zoom_catalog.png');
const destRootAsset = path.join(rootAssetsDir, 'showcase_leaf_zoom_catalog.png');
const destBrain = path.join(brainDir, 'showcase_leaf_zoom_catalog.png');

console.log('Rendering showcase_leaf_zoom_catalog.png...');
execSync(`/usr/bin/google-chrome --headless --disable-gpu --virtual-time-budget=2000 --window-size=1400,820 --screenshot="${destAsset}" "file://${tmpHtml}"`);

fs.copyFileSync(destAsset, destRootAsset);
fs.copyFileSync(destAsset, destBrain);
console.log('Generated: ' + destAsset);
