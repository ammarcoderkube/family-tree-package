const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const familyData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../khan_family_50.json'), 'utf8'));

// Copy khan_family_50.json to demo and assets directory for convenient user access
const demoDataDir = path.resolve(__dirname, '../demo');
fs.writeFileSync(path.join(demoDataDir, 'family_50_members.json'), JSON.stringify(familyData, null, 2), 'utf8');

const treeConfigs = [
  {
    key: 'tree_woodcut_sap',
    branchStyle: 'woodcut',
    leafStyle: 'birch',
    trunkStyle: 'calligraphic',
    leafColor: '#1a4823', // Rich birch forest emerald
    title: '🪵 Woodcut Sap Organic',
    pairing: '🍃 Serrated Birch'
  },
  {
    key: 'tree_gnarled_rustic',
    branchStyle: 'gnarled',
    leafStyle: 'oak',
    trunkStyle: 'gnarled_veteran',
    leafColor: '#17361a', // Deep royal oak green
    title: '🌲 Gnarled Rustic',
    pairing: '🌳 Royal Oak'
  },
  {
    key: 'tree_willow_tendril',
    branchStyle: 'willow_tendril',
    leafStyle: 'linden',
    trunkStyle: 'banyan_cathedral',
    leafColor: '#1f4e28', // Cordate linden foliage
    title: '🌿 Flowing Willow Tendril',
    pairing: '💚 Cordate Linden'
  },
  {
    key: 'tree_zen_bonsai',
    branchStyle: 'zen_bonsai',
    leafStyle: 'maple',
    trunkStyle: 'dragon_bonsai',
    leafColor: '#7a1a12', // Japanese Crimson Maple
    title: '🎋 Faceted Zen Bonsai',
    pairing: '🍁 Japanese Maple'
  }
];

const scriptsDir = __dirname;
const assetsDir = path.resolve(__dirname, '../assets');
const rootAssetsDir = path.resolve(__dirname, '../../assets');
const brainDir = '/home/ammar/.gemini/antigravity-ide/brain/e2c0a748-6be4-439f-a099-d057de3ca8ec';

[assetsDir, rootAssetsDir, brainDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

treeConfigs.forEach(t => {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, .fts-root, .fts-stage {
      background: transparent !important;
      background-color: transparent !important;
      width: 2200px;
      height: 1800px;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }
    #stage {
      width: 2200px;
      height: 1800px;
      position: absolute;
      top: 0;
      left: 0;
      background: transparent !important;
    }
  </style>
  <script src="../src/family-tree-svg.js"></script>
</head>
<body>
  <div id="stage"></div>

  <script>
    const data = ${JSON.stringify(familyData)};
    const tree = FamilyTreeSVG.create('#stage', data, {
      branchStyle: '${t.branchStyle}',
      leafStyle: '${t.leafStyle}',
      trunkStyle: '${t.trunkStyle}',
      leafColor: '${t.leafColor}',
      leafRenderMode: 'svg'
    });

    // Make sure it centers properly
    tree.fitView(false);

    // Remove collapse buttons for pure architectural vector presentation
    document.querySelectorAll('.collapse-btn').forEach(el => el.remove());

    // Export standalone SVG string without background to window.__svgString
    try {
      const clone = tree._els.svg.cloneNode(true);
      clone.removeAttribute('style');
      clone.removeAttribute('class');
      clone.querySelectorAll('.collapse-btn').forEach(el => el.remove());
      const vpClone = clone.querySelector('#vp') || clone.querySelector('g');
      if (vpClone) vpClone.removeAttribute('transform');
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      // Tightly bound viewBox around the tree
      document.body.appendChild(clone);
      let bbox = { x: 0, y: 0, width: tree._SVG_W, height: tree._SVG_H };
      try {
        if (vpClone && typeof vpClone.getBBox === 'function') {
          const b = vpClone.getBBox();
          if (b && b.width > 20 && b.height > 20) bbox = b;
        }
      } catch(e) {}
      document.body.removeChild(clone);

      const padding = 60;
      const vx = Math.round(bbox.x - padding);
      const vy = Math.round(bbox.y - padding);
      const vw = Math.round(bbox.width + padding * 2);
      const vh = Math.round(bbox.height + padding * 2);

      clone.setAttribute('viewBox', vx + ' ' + vy + ' ' + vw + ' ' + vh);
      clone.setAttribute('width', vw);
      clone.setAttribute('height', vh);

      // Ensure NO background rect exists
      const rects = clone.querySelectorAll('rect');
      rects.forEach(r => {
        if (r.getAttribute('width') == vw || r.getAttribute('fill') == '#ffffff') r.remove();
      });

      const s = new XMLSerializer();
      window.__svgString = s.serializeToString(clone);
    } catch(e) {
      console.error(e);
    }
  </script>
</body>
</html>`;

  const htmlPath = path.join(scriptsDir, `${t.key}.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  // 1. Take 100% transparent PNG screenshot
  const pngDest = path.join(assetsDir, `${t.key}.png`);
  console.log(`Generating transparent PNG for ${t.key} (50-person family)...`);
  execSync(`google-chrome --headless --disable-gpu --default-background-color=00000000 --window-size=2200,1800 --screenshot="${pngDest}" "${htmlPath}"`);

  // 2. Dump DOM to extract the standalone pure SVG
  console.log(`Extracting pure standalone SVG for ${t.key}...`);
  const domOut = execSync(`google-chrome --headless --disable-gpu --dump-dom "${htmlPath}"`, { encoding: 'utf8', maxBuffer: 15 * 1024 * 1024 });

  const svgMatch = domOut.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    let svgStr = svgMatch[0];
    if (!svgStr.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    // Remove any background styles or white fill rectangles
    svgStr = svgStr.replace(/background:[^;"]*;?/gi, '');
    
    const svgDest = path.join(assetsDir, `${t.key}.svg`);
    fs.writeFileSync(svgDest, svgStr, 'utf8');
    console.log(`Saved pure standalone SVG: ${t.key}.svg`);

    // Copy to root assets and brain
    fs.copyFileSync(svgDest, path.join(rootAssetsDir, `${t.key}.svg`));
    fs.copyFileSync(svgDest, path.join(brainDir, `${t.key}.svg`));
  }

  // Copy PNG to root assets and brain
  fs.copyFileSync(pngDest, path.join(rootAssetsDir, `${t.key}.png`));
  fs.copyFileSync(pngDest, path.join(brainDir, `${t.key}.png`));
});

console.log('Successfully built and exported all 4 branch styles for 50-person family with ZERO background!');
