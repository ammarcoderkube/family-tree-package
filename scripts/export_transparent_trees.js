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

const trees = [
  {
    key: 'tree_woodcut_sap',
    branchStyle: 'woodcut',
    leafStyle: 'birch',
    trunkStyle: 'calligraphic',
    leafColor: '#1a4823'
  },
  {
    key: 'tree_gnarled_rustic',
    branchStyle: 'gnarled',
    leafStyle: 'oak',
    trunkStyle: 'gnarled_veteran',
    leafColor: '#17361a'
  },
  {
    key: 'tree_willow_tendril',
    branchStyle: 'willow_tendril',
    leafStyle: 'linden',
    trunkStyle: 'banyan_cathedral',
    leafColor: '#1f4e28'
  },
  {
    key: 'tree_zen_bonsai',
    branchStyle: 'zen_bonsai',
    leafStyle: 'maple',
    trunkStyle: 'dragon_bonsai',
    leafColor: '#7a1a12' // Japanese Crimson Maple
  }
];

const scriptsDir = __dirname;
const assetsDir = path.resolve(__dirname, '../assets');
const rootAssetsDir = path.resolve(__dirname, '../../assets');
const brainDir = '/home/ammar/.gemini/antigravity-ide/brain/e2c0a748-6be4-439f-a099-d057de3ca8ec';

[assetsDir, rootAssetsDir, brainDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

trees.forEach(t => {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: transparent !important;
      background-color: transparent !important;
      width: 1400px;
      height: 950px;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }
    .fts-root, .fts-stage {
      background: transparent !important;
      background-color: transparent !important;
    }
    #stage {
      width: 1400px;
      height: 950px;
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
    const data = ${JSON.stringify(sampleData)};
    const tree = FamilyTreeSVG.create('#stage', data, {
      branchStyle: '${t.branchStyle}',
      leafStyle: '${t.leafStyle}',
      trunkStyle: '${t.trunkStyle}',
      leafColor: '${t.leafColor}',
      leafRenderMode: 'svg'
    });

    // Make sure it centers immediately
    tree.fitView(false);
    // Remove collapse buttons for pure architectural presentation
    document.querySelectorAll('.collapse-btn').forEach(el => el.remove());
  </script>
</body>
</html>`;

  const htmlPath = path.join(scriptsDir, `${t.key}.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  // 1. Generate transparent PNG with Google Chrome (zero background)
  const pngDest = path.join(assetsDir, `${t.key}.png`);
  console.log(`Generating transparent PNG for ${t.key}...`);
  execSync(`google-chrome --headless --disable-gpu --default-background-color=00000000 --window-size=1400,950 --screenshot="${pngDest}" "${htmlPath}"`);

  // 2. Dump DOM to extract the pure standalone SVG
  console.log(`Extracting standalone SVG for ${t.key}...`);
  const domOut = execSync(`google-chrome --headless --disable-gpu --dump-dom "${htmlPath}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  
  const svgMatch = domOut.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    let svgStr = svgMatch[0];
    // Ensure xmlns is present
    if (!svgStr.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    // Remove any background style if present
    svgStr = svgStr.replace(/background:[^;"]*;?/gi, '');
    
    const svgDest = path.join(assetsDir, `${t.key}.svg`);
    fs.writeFileSync(svgDest, svgStr, 'utf8');
    console.log(`Saved pure standalone SVG: ${t.key}.svg`);

    // Copy to root assets and brain
    fs.copyFileSync(svgDest, path.join(rootAssetsDir, `${t.key}.svg`));
    fs.copyFileSync(svgDest, path.join(brainDir, `${t.key}.svg`));
  } else {
    console.error(`Could not match SVG for ${t.key}`);
  }

  // Copy PNG to root assets and brain
  fs.copyFileSync(pngDest, path.join(rootAssetsDir, `${t.key}.png`));
  fs.copyFileSync(pngDest, path.join(brainDir, `${t.key}.png`));
});

console.log('All 4 whole-tree branch styles exported as pure SVGs and transparent PNGs without background!');
