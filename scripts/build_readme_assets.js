const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sampleData = {
  full_name: 'Ahmed Khan',
  partners: [{ full_name: 'Fatima Ahmed' }],
  children: [
    {
      full_name: 'Yusuf Ahmed',
      partners: [{ full_name: 'Ayesha Yusuf' }],
      children: [
        {
          full_name: 'Hamza Yusuf',
          partners: [{ full_name: 'Sana Hamza' }],
          children: [
            {
              full_name: 'Ali Hamza',
              partners: [{ full_name: 'Zoya Ali' }],
              children: [
                { full_name: 'Rayyan Ali', children: [{ full_name: 'Ibrahim' }, { full_name: 'Mariam' }] },
                { full_name: 'Hiba Ali' }
              ]
            },
            { full_name: 'Amina Hamza' },
            { full_name: 'Bilal Hamza' }
          ]
        },
        {
          full_name: 'Usman Yusuf',
          partners: [{ full_name: 'Iqra Usman' }],
          children: [
            { full_name: 'Danish Usman' },
            { full_name: 'Areeba Usman' },
            { full_name: 'Huzaifa Usman' }
          ]
        },
        {
          full_name: 'Mariam Yusuf',
          partners: [{ full_name: 'Salman Mariam' }],
          children: [
            { full_name: 'Zainab Salman' },
            { full_name: 'Farhan Salman' }
          ]
        }
      ]
    },
    {
      full_name: 'Imran Ahmed',
      partners: [{ full_name: 'Nadia Imran' }],
      children: [
        {
          full_name: 'Faizan Imran',
          partners: [{ full_name: 'Saba Faizan' }],
          children: [
            { full_name: 'Taha Faizan' },
            { full_name: 'Aqsa Faizan' }
          ]
        }
      ]
    },
    {
      full_name: 'Suleman Ahmed',
      partners: [{ full_name: 'Zahra Suleman' }],
      children: [
        { full_name: 'Adnan Suleman' },
        { full_name: 'Farhan Suleman' }
      ]
    }
  ]
};

const assetsDir = path.resolve(__dirname, '../assets');
const rootAssetsDir = path.resolve(__dirname, '../../assets');
const brainDir = '/home/ammar/.gemini/antigravity-ide/brain/e2c0a748-6be4-439f-a099-d057de3ca8ec';

// ═══════════════════════════════════════════════════════════════
// 1. WHOLE TREE BRANCH SHOWCASES (NO SMOOTH BRANCHES!)
// ═══════════════════════════════════════════════════════════════

const branchConfigs = [
  {
    filename: 'tree_woodcut_sap.png',
    title: '🪵 Woodcut Sap Branches (Whole Tree Architecture)',
    subtitle: 'Organic layered boughs with heartwood core and living gold sap lines (.woodcut-sap-line)',
    branchStyle: 'woodcut',
    leafStyle: 'birch',
    trunkStyle: 'calligraphic',
    branchBadge: '🪵 branchStyle: \'woodcut\'',
    leafBadge: '🍃 leafStyle: \'birch\'',
    trunkBadge: '🌳 trunkStyle: \'calligraphic\''
  },
  {
    filename: 'tree_gnarled_rustic.png',
    title: '🌲 Gnarled Rustic Branches (Whole Tree Architecture)',
    subtitle: 'Organic winding boughs with high sweep amplitude, rustic bark ridges, and knot deflections',
    branchStyle: 'gnarled',
    leafStyle: 'oak',
    trunkStyle: 'gnarled_veteran',
    branchBadge: '🌲 branchStyle: \'gnarled\'',
    leafBadge: '🌳 leafStyle: \'oak\'',
    trunkBadge: '🪵 trunkStyle: \'gnarled_veteran\''
  },
  {
    filename: 'tree_willow_tendril.png',
    title: '🌿 Flowing Willow Tendril Branches (Whole Tree Architecture)',
    subtitle: 'Gracefully weeping S-curve boughs, soft drooping droop offsets, and braided double bark line',
    branchStyle: 'willow_tendril',
    leafStyle: 'linden',
    trunkStyle: 'banyan_cathedral',
    branchBadge: '🌿 branchStyle: \'willow_tendril\'',
    leafBadge: '💚 leafStyle: \'linden\'',
    trunkBadge: '🏛️ trunkStyle: \'banyan_cathedral\''
  },
  {
    filename: 'tree_zen_bonsai.png',
    title: '🎋 Faceted Zen Bonsai Branches (Whole Tree Architecture)',
    subtitle: 'Sculpted angular mitered facet boughs with chamfered corner nodes and Japanese Maple foliage',
    branchStyle: 'zen_bonsai',
    leafStyle: 'maple',
    trunkStyle: 'dragon_bonsai',
    branchBadge: '🎋 branchStyle: \'zen_bonsai\'',
    leafBadge: '🍁 leafStyle: \'maple\'',
    trunkBadge: '🐉 trunkStyle: \'dragon_bonsai\''
  }
];

function buildTreeHtml(c) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      width: 1400px;
      height: 950px;
      background: #12100e;
      color: #f7ede2;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      overflow: hidden;
    }
    #header {
      position: absolute;
      top: 22px;
      left: 28px;
      z-index: 10;
      background: rgba(26, 22, 19, 0.88);
      border: 1px solid rgba(212, 163, 115, 0.35);
      padding: 14px 22px;
      border-radius: 12px;
      backdrop-filter: blur(8px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    #header h2 {
      margin: 0;
      font-size: 20px;
      color: #f6d365;
      letter-spacing: 0.5px;
    }
    #header p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #cfd8dc;
    }
    #badges {
      position: absolute;
      top: 24px;
      right: 28px;
      z-index: 10;
      display: flex;
      gap: 10px;
    }
    .badge {
      background: rgba(45, 30, 20, 0.9);
      border: 1px solid rgba(212, 163, 115, 0.4);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: #f3d082;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    #stage {
      width: 1400px;
      height: 950px;
      position: absolute;
      top: 0;
      left: 0;
      background: radial-gradient(circle at 50% 60%, #25201b 0%, #12100e 100%);
    }
  </style>
  <script src="../src/family-tree-svg.js"></script>
</head>
<body>
  <div id="header">
    <h2>${c.title}</h2>
    <p>${c.subtitle}</p>
  </div>
  <div id="badges">
    <div class="badge">${c.branchBadge}</div>
    <div class="badge">${c.leafBadge}</div>
    <div class="badge">${c.trunkBadge}</div>
  </div>
  <div id="stage"></div>

  <script>
    const data = ${JSON.stringify(sampleData)};
    const tree = FamilyTreeSVG.create('#stage', data, {
      branchStyle: '${c.branchStyle}',
      leafStyle: '${c.leafStyle}',
      trunkStyle: '${c.trunkStyle}'
    });
  </script>
</body>
</html>`;
}

console.log('Generating Whole Tree Branch Showcases...');
for (const c of branchConfigs) {
  const tmpHtml = path.resolve(__dirname, 'tmp_' + c.filename.replace('.png', '.html'));
  fs.writeFileSync(tmpHtml, buildTreeHtml(c), 'utf8');

  const destAsset = path.join(assetsDir, c.filename);
  const destRootAsset = path.join(rootAssetsDir, c.filename);
  const destBrain = path.join(brainDir, c.filename);

  console.log('Rendering ' + c.filename + '...');
  execSync(`/usr/bin/google-chrome --headless --disable-gpu --virtual-time-budget=2000 --window-size=1400,950 --screenshot="${destAsset}" "file://${tmpHtml}"`);

  fs.copyFileSync(destAsset, destRootAsset);
  fs.copyFileSync(destAsset, destBrain);
  console.log('Generated: ' + destAsset);
}

// ═══════════════════════════════════════════════════════════════
// 2. JUST LEAF SVG SHOWCASE (STANDALONE LEAF VECTORS ONLY!)
// ═══════════════════════════════════════════════════════════════

const leafShowcaseHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 30px;
      width: 1400px;
      height: 860px;
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
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 14px;
      color: #cfd8dc;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      max-width: 1340px;
      margin: 0 auto;
    }
    .leaf-card {
      background: #1c1815;
      border: 1px solid rgba(212, 163, 115, 0.25);
      border-radius: 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 6px 20px rgba(0,0,0,0.5);
    }
    .leaf-card.primary {
      border: 1.5px solid rgba(246, 211, 101, 0.65);
      background: #221b16;
    }
    .leaf-title {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
      text-align: center;
    }
    .leaf-code {
      font-size: 11.5px;
      font-family: monospace;
      color: #84a98c;
      margin-bottom: 10px;
      background: rgba(0,0,0,0.3);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .svg-container {
      width: 180px;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 72%);
      border-radius: 12px;
      border: 1px dashed rgba(212, 163, 115, 0.2);
      margin-bottom: 12px;
    }
    .leaf-desc {
      font-size: 12px;
      color: #cfd8dc;
      text-align: center;
      line-height: 1.4;
      flex: 1;
    }
    .tag {
      margin-top: 8px;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 10.5px;
      font-weight: 700;
      background: rgba(46, 204, 113, 0.2);
      color: #2ecc71;
      border: 1px solid rgba(46, 204, 113, 0.4);
    }
    .tag-amber {
      background: rgba(246, 211, 101, 0.2);
      color: #f6d365;
      border: 1px solid rgba(246, 211, 101, 0.4);
    }
  </style>
  <script src="../src/family-tree-svg.js"></script>
</head>
<body>
  <div class="header">
    <h1>🍃 Botanical Leaf Shapes (Pure Vector SVG Anatomy)</h1>
    <p>Custom botanical foliage vectors with metallic gold venation rays & double accent borders</p>
  </div>

  <div class="grid">
    <!-- 1. Japanese Maple -->
    <div class="leaf-card primary">
      <div class="leaf-title">🍁 Japanese Maple</div>
      <div class="leaf-code">leafStyle: 'maple'</div>
      <div class="svg-container" id="svg-maple"></div>
      <div class="leaf-desc">7 radiating needle-sharp slender lobes, deep curved sinuses, and 7-ray palmate gold venation.</div>
      <span class="tag">USER SELECTION #1</span>
    </div>

    <!-- 2. Serrated Birch -->
    <div class="leaf-card primary">
      <div class="leaf-title">🍃 Serrated Birch / Elm</div>
      <div class="leaf-code">leafStyle: 'birch'</div>
      <div class="svg-container" id="svg-birch"></div>
      <div class="leaf-desc">Natural saw-tooth serrated perimeter, acute apex, and alternating herringbone pinnate veins.</div>
      <span class="tag">USER SELECTION #2</span>
    </div>

    <!-- 3. Cordate Linden -->
    <div class="leaf-card primary">
      <div class="leaf-title">💚 Cordate Linden</div>
      <div class="leaf-code">leafStyle: 'linden'</div>
      <div class="svg-container" id="svg-linden"></div>
      <div class="leaf-desc">Iconic heart-cleft notched base firmly seated on branch collars with acute drip-tip.</div>
      <span class="tag">USER SELECTION #3</span>
    </div>

    <!-- 4. Majestic Ginkgo -->
    <div class="leaf-card primary">
      <div class="leaf-title">🪭 Majestic Ginkgo</div>
      <div class="leaf-code">leafStyle: 'ginkgo'</div>
      <div class="svg-container" id="svg-ginkgo"></div>
      <div class="leaf-desc">Flared fan foliage with sharp apex point staying on upper side (pointing upwards!).</div>
      <span class="tag tag-amber">POINT STAYS UPSIDE</span>
    </div>

    <!-- 5. Classical Laurel -->
    <div class="leaf-card">
      <div class="leaf-title">🍃 Classical Laurel</div>
      <div class="leaf-code">leafStyle: 'laurel'</div>
      <div class="svg-container" id="svg-laurel"></div>
      <div class="leaf-desc">Pointed symmetric botanical elliptic leaf with tapered tips and gold midrib vein (0% heart shape).</div>
      <span class="tag tag-amber">CLASSIC BOTANICAL</span>
    </div>

    <!-- 6. Imperial Oval -->
    <div class="leaf-card">
      <div class="leaf-title">🟢 Imperial Oval</div>
      <div class="leaf-code">leafStyle: 'oval'</div>
      <div class="svg-container" id="svg-oval"></div>
      <div class="leaf-desc">Continuous rounded heraldic badge / medallion with spacious text area and gold rim.</div>
      <span class="tag tag-amber">HERALDIC MEDALLION</span>
    </div>

    <!-- 7. Royal Oak -->
    <div class="leaf-card">
      <div class="leaf-title">🌳 Royal Oak</div>
      <div class="leaf-code">leafStyle: 'oak'</div>
      <div class="svg-container" id="svg-oak"></div>
      <div class="leaf-desc">Classical lobed crown foliage with undulating rounded lobes and apical crown lobe.</div>
      <span class="tag tag-amber">CROWN FOLIAGE</span>
    </div>

    <!-- 8. PNG & SVG Dual Mode -->
    <div class="leaf-card" style="justify-content: center; text-align: center; border-style: dashed; background: rgba(30, 24, 20, 0.7);">
      <div style="font-size: 40px; margin-bottom: 8px;">🖼️</div>
      <div class="leaf-title" style="color: #f6d365;">Dual Engine Rendering</div>
      <div class="leaf-code">leafRenderMode: 'svg' | 'png'</div>
      <div class="leaf-desc" style="margin-top: 6px;">Available as pure scalable vector SVG paths or 512x512 transparent PNG image textures.</div>
    </div>
  </div>

  <script>
    const leafKeys = ['maple', 'birch', 'linden', 'ginkgo', 'laurel', 'oval', 'oak'];
    const w = 135, h = 160;

    leafKeys.forEach(k => {
      const container = document.getElementById('svg-' + k);
      if (!container) return;

      const d = FamilyTreeSVG.prototype.leafD(0, 0, w, h, k);
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '175');
      svg.setAttribute('height', '175');
      svg.setAttribute('viewBox', '-90 -90 180 180');

      // Gradient & Shadow
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = \`
        <linearGradient id="g-\` + k + \`" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stop-color="#2a5734"/>
          <stop offset="50%" stop-color="#193a21"/>
          <stop offset="100%" stop-color="#0f2515"/>
        </linearGradient>
        <filter id="ds-\` + k + \`">
          <feDropShadow dx="2" dy="5" stdDeviation="5" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      \`;
      svg.appendChild(defs);

      // Path
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      p.setAttribute('fill', 'url(#g-' + k + ')');
      p.setAttribute('stroke', '#d6a661');
      p.setAttribute('stroke-width', '2.5');
      p.setAttribute('filter', 'url(#ds-' + k + ')');
      svg.appendChild(p);

      // Gold Veins
      const vg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      vg.setAttribute('opacity', '0.72');
      svg.appendChild(vg);
      const gold = '#d6a661';

      if (k === 'laurel') {
        vg.innerHTML = '<path d="M 0,' + (-h*0.44) + ' L 0,' + (h*0.44) + '" fill="none" stroke="' + gold + '" stroke-width="1.4" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.18) + ' Q ' + (w*0.20) + ',' + (-h*0.26) + ' ' + (w*0.36) + ',' + (-h*0.22) + '" fill="none" stroke="' + gold + '" stroke-width="1.0" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.18) + ' Q ' + (-w*0.20) + ',' + (-h*0.26) + ' ' + (-w*0.36) + ',' + (-h*0.22) + '" fill="none" stroke="' + gold + '" stroke-width="1.0" stroke-linecap="round"/>';
      } else if (k === 'oval') {
        vg.innerHTML = '<ellipse cx="0" cy="0" rx="' + (w*0.38) + '" ry="' + (h*0.40) + '" fill="none" stroke="' + gold + '" stroke-width="1.2" stroke-dasharray="4 3"/>';
      } else if (k === 'oak') {
        vg.innerHTML = '<path d="M 0,' + (-h*0.44) + ' L 0,' + (h*0.44) + '" fill="none" stroke="' + gold + '" stroke-width="1.4" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.22) + ' Q ' + (w*0.22) + ',' + (-h*0.28) + ' ' + (w*0.34) + ',' + (-h*0.20) + '" fill="none" stroke="' + gold + '" stroke-width="1.0" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.22) + ' Q ' + (-w*0.22) + ',' + (-h*0.28) + ' ' + (-w*0.34) + ',' + (-h*0.20) + '" fill="none" stroke="' + gold + '" stroke-width="1.0" stroke-linecap="round"/>';
      } else if (k === 'ginkgo') {
        vg.innerHTML = '<path d="M 0,' + (-h*0.44) + ' L 0,' + (h*0.35) + '" fill="none" stroke="' + gold + '" stroke-width="1.4" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.38) + ' Q ' + (-w*0.18) + ',' + (-h*0.05) + ' ' + (-w*0.35) + ',' + (h*0.18) + '" fill="none" stroke="' + gold + '" stroke-width="1.0" stroke-linecap="round"/>' +
          '<path d="M 0,' + (-h*0.38) + ' Q ' + (w*0.18) + ',' + (-h*0.05) + ' ' + (w*0.35) + ',' + (h*0.18) + '" fill="none" stroke="' + gold + '" stroke-width="1.0" stroke-linecap="round"/>';
      } else if (k === 'maple') {
        vg.innerHTML = '<path d="M 0,' + (h*0.23) + ' L 0,' + (-h*0.48) + '" fill="none" stroke="' + gold + '" stroke-width="1.6" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (-w*0.08) + ',-2 ' + (-w*0.30) + ',' + (-h*0.37) + '" fill="none" stroke="' + gold + '" stroke-width="1.2" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (w*0.08) + ',-2 ' + (w*0.30) + ',' + (-h*0.37) + '" fill="none" stroke="' + gold + '" stroke-width="1.2" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (-w*0.15) + ',' + (h*0.06) + ' ' + (-w*0.47) + ',-2" fill="none" stroke="' + gold + '" stroke-width="1.1" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.23) + ' Q ' + (w*0.15) + ',' + (h*0.06) + ' ' + (w*0.47) + ',-2" fill="none" stroke="' + gold + '" stroke-width="1.1" stroke-linecap="round"/>';
      } else if (k === 'birch') {
        vg.innerHTML = '<path d="M 0,' + (h*0.36) + ' L 0,' + (-h*0.40) + '" fill="none" stroke="' + gold + '" stroke-width="1.4" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.13) + ' Q ' + (-w*0.15) + ',' + (h*0.10) + ' ' + (-w*0.27) + ',' + (h*0.10) + '" fill="none" stroke="' + gold + '" stroke-width="1.0" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.13) + ' Q ' + (w*0.15) + ',' + (h*0.10) + ' ' + (w*0.27) + ',' + (h*0.10) + '" fill="none" stroke="' + gold + '" stroke-width="1.0" stroke-linecap="round"/>';
      } else if (k === 'linden') {
        vg.innerHTML = '<path d="M 0,' + (h*0.27) + ' L 0,' + (-h*0.41) + '" fill="none" stroke="' + gold + '" stroke-width="1.4" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.25) + ' Q ' + (-w*0.16) + ',' + (h*0.16) + ' ' + (-w*0.32) + ',' + (h*0.08) + '" fill="none" stroke="' + gold + '" stroke-width="1.0" stroke-linecap="round"/>' +
          '<path d="M 0,' + (h*0.25) + ' Q ' + (w*0.16) + ',' + (h*0.16) + ' ' + (w*0.32) + ',' + (h*0.08) + '" fill="none" stroke="' + gold + '" stroke-width="1.0" stroke-linecap="round"/>';
      }

      container.appendChild(svg);
    });
  </script>
</body>
</html>`;

console.log('Generating Leaf SVG Showcase...');
const tmpLeafHtml = path.resolve(__dirname, 'tmp_leaf_svg_showcase.html');
fs.writeFileSync(tmpLeafHtml, leafShowcaseHtml, 'utf8');

const leafDestAsset = path.join(assetsDir, 'leaf_svg_showcase.png');
const leafDestRoot = path.join(rootAssetsDir, 'leaf_svg_showcase.png');
const leafDestBrain = path.join(brainDir, 'leaf_svg_showcase.png');

execSync(`/usr/bin/google-chrome --headless --disable-gpu --virtual-time-budget=2000 --window-size=1400,860 --screenshot="${leafDestAsset}" "file://${tmpLeafHtml}"`);

fs.copyFileSync(leafDestAsset, leafDestRoot);
fs.copyFileSync(leafDestAsset, leafDestBrain);
console.log('Generated: ' + leafDestAsset);

console.log('ALL README ASSETS COMPLETED!');
