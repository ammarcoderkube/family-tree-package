const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read the standalone SVGs
const assetsDir = path.join(__dirname, '../assets');
const mapleSvg = fs.readFileSync(path.join(assetsDir, 'leaf_maple.svg'), 'utf8');
const birchSvg = fs.readFileSync(path.join(assetsDir, 'leaf_birch.svg'), 'utf8');
const lindenSvg = fs.readFileSync(path.join(assetsDir, 'leaf_linden.svg'), 'utf8');
const ginkgoSvg = fs.readFileSync(path.join(assetsDir, 'leaf_ginkgo.svg'), 'utf8');
const oakSvg = fs.readFileSync(path.join(assetsDir, 'leaf_oak.svg'), 'utf8');
const laurelSvg = fs.readFileSync(path.join(assetsDir, 'leaf_laurel.svg'), 'utf8');
const ovalSvg = fs.readFileSync(path.join(assetsDir, 'leaf_oval.svg'), 'utf8');

// 1. Create an HTML file for the full leaf catalog - ZERO BACKGROUND, LEAVES ONLY
const fullCatalogHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: transparent !important;
    background-color: transparent !important;
    width: 1400px;
    margin: 0;
    padding: 20px;
    overflow: hidden;
  }
  .leaves-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    gap: 30px;
    background: transparent !important;
  }
  .leaf-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
  .leaf-item svg {
    width: 155px;
    height: 175px;
    overflow: visible;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.35));
  }
  .leaf-label {
    margin-top: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #dfa25b;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  }
</style>
</head>
<body>
  <div class="leaves-row">
    <div class="leaf-item">
      ${mapleSvg}
      <div class="leaf-label">Japanese Maple</div>
    </div>
    <div class="leaf-item">
      ${birchSvg}
      <div class="leaf-label">Serrated Birch</div>
    </div>
    <div class="leaf-item">
      ${lindenSvg}
      <div class="leaf-label">Cordate Linden</div>
    </div>
    <div class="leaf-item">
      ${ginkgoSvg}
      <div class="leaf-label">Majestic Ginkgo</div>
    </div>
    <div class="leaf-item">
      ${oakSvg}
      <div class="leaf-label">Royal Oak</div>
    </div>
    <div class="leaf-item">
      ${laurelSvg}
      <div class="leaf-label">Classical Laurel</div>
    </div>
    <div class="leaf-item">
      ${ovalSvg}
      <div class="leaf-label">Imperial Oval</div>
    </div>
  </div>
</body>
</html>`;

const fullCatalogPath = path.join(__dirname, 'leaf_catalog_transparent.html');
fs.writeFileSync(fullCatalogPath, fullCatalogHtml, 'utf8');

// 2. Also an ultra-clean version: LEAF ONLY without ANY text or labels at all
const leafOnlyHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: transparent !important;
    background-color: transparent !important;
    width: 1300px;
    height: 240px;
    margin: 0;
    padding: 10px;
    overflow: hidden;
  }
  .leaves-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    gap: 20px;
    background: transparent !important;
  }
  .leaf-item {
    background: transparent !important;
    border: none !important;
  }
  .leaf-item svg {
    width: 155px;
    height: 195px;
    overflow: visible;
    filter: drop-shadow(0 6px 14px rgba(0,0,0,0.3));
  }
</style>
</head>
<body>
  <div class="leaves-row">
    <div class="leaf-item">${mapleSvg}</div>
    <div class="leaf-item">${birchSvg}</div>
    <div class="leaf-item">${lindenSvg}</div>
    <div class="leaf-item">${ginkgoSvg}</div>
    <div class="leaf-item">${oakSvg}</div>
    <div class="leaf-item">${laurelSvg}</div>
    <div class="leaf-item">${ovalSvg}</div>
  </div>
</body>
</html>`;

const leafOnlyPath = path.join(__dirname, 'leaf_only_raw.html');
fs.writeFileSync(leafOnlyPath, leafOnlyHtml, 'utf8');

// 3. Zoom / Macro detail version for the top 3 requested leaves: Maple, Birch, Linden - ZERO BACKGROUND
const topThreeHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: transparent !important;
    background-color: transparent !important;
    width: 1100px;
    margin: 0;
    padding: 20px;
    overflow: hidden;
  }
  .zoom-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    gap: 40px;
    background: transparent !important;
  }
  .zoom-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: transparent !important;
    border: none !important;
  }
  .zoom-item svg {
    width: 250px;
    height: 290px;
    overflow: visible;
    filter: drop-shadow(0 12px 24px rgba(0,0,0,0.4));
  }
  .zoom-label {
    margin-top: 18px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 19px;
    font-weight: 700;
    color: #dfa25b;
    letter-spacing: 0.6px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  }
</style>
</head>
<body>
  <div class="zoom-row">
    <div class="zoom-item">
      ${mapleSvg}
      <div class="zoom-label">🍁 7-Lobed Japanese Maple</div>
    </div>
    <div class="zoom-item">
      ${birchSvg}
      <div class="zoom-label">🍃 Serrated Birch / Elm</div>
    </div>
    <div class="zoom-item">
      ${lindenSvg}
      <div class="zoom-label">💚 Cordate Linden</div>
    </div>
  </div>
</body>
</html>`;

const topThreePath = path.join(__dirname, 'leaf_top3_transparent.html');
fs.writeFileSync(topThreePath, topThreeHtml, 'utf8');

// 4. Individual single leaf HTMLs for perfect individual leaf screenshots
const individualLeaves = [
    { name: 'leaf_maple_only', svg: mapleSvg },
    { name: 'leaf_birch_only', svg: birchSvg },
    { name: 'leaf_linden_only', svg: lindenSvg },
    { name: 'leaf_ginkgo_only', svg: ginkgoSvg }
];

individualLeaves.forEach(item => {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: transparent !important;
    background-color: transparent !important;
    width: 320px;
    height: 350px;
    margin: 0;
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  svg {
    width: 280px;
    height: 310px;
    overflow: visible;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.35));
  }
</style>
</head>
<body>
  ${item.svg}
</body>
</html>`;
    fs.writeFileSync(path.join(__dirname, `${item.name}.html`), html, 'utf8');
});

console.log('HTML files for transparent rendering created successfully.');
