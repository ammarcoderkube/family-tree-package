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
    leafColor: '#7a1a12' // Crimson maple foliage
  }
];

const scriptsDir = __dirname;

trees.forEach(t => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, .fts-root, .fts-stage {
      background: transparent !important;
      background-color: transparent !important;
      width: 1400px;
      height: 950px;
      overflow: hidden;
      margin: 0;
      padding: 0;
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

    // Ensure perfect centering and transparency
    setTimeout(() => {
      tree.fitView(false);
      // Remove collapse buttons for clean architecture vector presentation
      document.querySelectorAll('.collapse-btn').forEach(el => el.remove());
      window.isReady = true;
    }, 150);
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(scriptsDir, `${t.key}.html`), html, 'utf8');
});

console.log('Generated tree HTML files with ZERO background.');
