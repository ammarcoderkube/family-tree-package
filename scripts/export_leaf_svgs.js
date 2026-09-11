const fs = require('fs');
const path = require('path');

// Extract leafD directly from family-tree-svg.js
const srcCode = fs.readFileSync(path.join(__dirname, '../src/family-tree-svg.js'), 'utf8');

// We can evaluate leafD function
const leafDFuncStr = srcCode.match(/function leafD\(ox, oy, w, h, style\) \{([\s\S]*?)\n    \}/)[0];
const evalLeafD = new Function(leafDFuncStr + '; return leafD;')();

const leaves = [
    {
        key: 'maple',
        name: 'Japanese Maple',
        w: 180,
        h: 180,
        viewBox: '-100 -105 200 210',
        colors: { stop1: '#c23625', stop2: '#8e1c12', stop3: '#5f0f09', stroke: '#dfa25b', vein: '#f3c782' },
        veins: (w, h, goldCol) => `
            <path d="M 0,${h * 0.23} L 0,${-h * 0.48}" fill="none" stroke="${goldCol}" stroke-width="2.2" stroke-linecap="round" />
            <path d="M 0,${h * 0.23} Q ${-w * 0.08},-2 ${-w * 0.30},${-h * 0.37}" fill="none" stroke="${goldCol}" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 0,${h * 0.23} Q ${w * 0.08},-2 ${w * 0.30},${-h * 0.37}" fill="none" stroke="${goldCol}" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 0,${h * 0.23} Q ${-w * 0.15},${h * 0.06} ${-w * 0.47},-2" fill="none" stroke="${goldCol}" stroke-width="1.6" stroke-linecap="round" />
            <path d="M 0,${h * 0.23} Q ${w * 0.15},${h * 0.06} ${w * 0.47},-2" fill="none" stroke="${goldCol}" stroke-width="1.6" stroke-linecap="round" />
            <path d="M 0,${h * 0.23} Q ${-w * 0.19},${h * 0.24} ${-w * 0.35},${h * 0.27}" fill="none" stroke="${goldCol}" stroke-width="1.4" stroke-linecap="round" />
            <path d="M 0,${h * 0.23} Q ${w * 0.19},${h * 0.24} ${w * 0.35},${h * 0.27}" fill="none" stroke="${goldCol}" stroke-width="1.4" stroke-linecap="round" />
        `
    },
    {
        key: 'birch',
        name: 'Serrated Birch',
        w: 150,
        h: 190,
        viewBox: '-85 -95 170 195',
        colors: { stop1: '#2d6a36', stop2: '#1b4a24', stop3: '#103318', stroke: '#d6a661', vein: '#eed08f' },
        veins: (w, h, goldCol) => `
            <path d="M 0,${h * 0.36} L 0,${-h * 0.40}" fill="none" stroke="${goldCol}" stroke-width="2.0" stroke-linecap="round" />
            <path d="M 0,${h * 0.24} Q ${-w * 0.12},${h * 0.22} ${-w * 0.20},${h * 0.23}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${h * 0.24} Q ${w * 0.12},${h * 0.22} ${w * 0.20},${h * 0.23}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${h * 0.13} Q ${-w * 0.15},${h * 0.10} ${-w * 0.27},${h * 0.10}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${h * 0.13} Q ${w * 0.15},${h * 0.10} ${w * 0.27},${h * 0.10}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,0 Q ${-w * 0.16},-2 ${-w * 0.29},0" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,0 Q ${w * 0.16},-2 ${w * 0.29},0" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${-h * 0.11} Q ${-w * 0.15},${-h * 0.15} ${-w * 0.27},${-h * 0.09}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${-h * 0.11} Q ${w * 0.15},${-h * 0.15} ${w * 0.27},${-h * 0.09}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
        `
    },
    {
        key: 'linden',
        name: 'Cordate Linden',
        w: 160,
        h: 190,
        viewBox: '-90 -95 180 195',
        colors: { stop1: '#2e6b3b', stop2: '#1d4826', stop3: '#113219', stroke: '#d6a661', vein: '#eed08f' },
        veins: (w, h, goldCol) => `
            <path d="M 0,${h * 0.27} L 0,${-h * 0.41}" fill="none" stroke="${goldCol}" stroke-width="2.0" stroke-linecap="round" />
            <path d="M 0,${h * 0.25} Q ${-w * 0.16},${h * 0.16} ${-w * 0.32},${h * 0.08}" fill="none" stroke="${goldCol}" stroke-width="1.4" stroke-linecap="round" />
            <path d="M 0,${h * 0.25} Q ${w * 0.16},${h * 0.16} ${w * 0.32},${h * 0.08}" fill="none" stroke="${goldCol}" stroke-width="1.4" stroke-linecap="round" />
            <path d="M 0,${h * 0.12} Q ${-w * 0.19},0 ${-w * 0.29},${-h * 0.14}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${h * 0.12} Q ${w * 0.19},0 ${w * 0.29},${-h * 0.14}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,-2 Q ${-w * 0.14},${-h * 0.15} ${-w * 0.20},${-h * 0.26}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,-2 Q ${w * 0.14},${-h * 0.15} ${w * 0.20},${-h * 0.26}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
        `
    },
    {
        key: 'ginkgo',
        name: 'Majestic Ginkgo',
        w: 170,
        h: 180,
        viewBox: '-98 -95 196 195',
        colors: { stop1: '#32723f', stop2: '#204f2a', stop3: '#13351a', stroke: '#dfa25b', vein: '#f2c884' },
        veins: (w, h, goldCol) => `
            <path d="M 0,${-h * 0.44} L 0,${h * 0.35}" fill="none" stroke="${goldCol}" stroke-width="2.0" stroke-linecap="round" />
            <path d="M 0,${-h * 0.38} Q ${-w * 0.18},${-h * 0.05} ${-w * 0.35},${h * 0.18}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${-h * 0.38} Q ${w * 0.18},${-h * 0.05} ${w * 0.35},${h * 0.18}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${-h * 0.38} Q ${-w * 0.10},${h * 0.05} ${-w * 0.20},${h * 0.38}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${-h * 0.38} Q ${w * 0.10},${h * 0.05} ${w * 0.20},${h * 0.38}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
        `
    },
    {
        key: 'oak',
        name: 'Royal Oak',
        w: 150,
        h: 190,
        viewBox: '-85 -95 170 195',
        colors: { stop1: '#2d6a36', stop2: '#1b4a24', stop3: '#103318', stroke: '#d6a661', vein: '#eed08f' },
        veins: (w, h, goldCol) => `
            <path d="M 0,${-h * 0.44} L 0,${h * 0.44}" fill="none" stroke="${goldCol}" stroke-width="2.0" stroke-linecap="round" />
            <path d="M 0,${-h * 0.22} Q ${w * 0.22},${-h * 0.28} ${w * 0.34},${-h * 0.20}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${-h * 0.22} Q ${-w * 0.22},${-h * 0.28} ${-w * 0.34},${-h * 0.20}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${h * 0.10} Q ${w * 0.22},${h * 0.04} ${w * 0.36},${h * 0.14}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${h * 0.10} Q ${-w * 0.22},${h * 0.04} ${-w * 0.36},${h * 0.14}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
        `
    },
    {
        key: 'laurel',
        name: 'Classical Laurel',
        w: 140,
        h: 190,
        viewBox: '-80 -105 160 210',
        colors: { stop1: '#2d6a36', stop2: '#1b4a24', stop3: '#103318', stroke: '#d6a661', vein: '#eed08f' },
        veins: (w, h, goldCol) => `
            <path d="M 0,${-h * 0.44} L 0,${h * 0.44}" fill="none" stroke="${goldCol}" stroke-width="2.0" stroke-linecap="round" />
            <path d="M 0,${-h * 0.18} Q ${w * 0.20},${-h * 0.26} ${w * 0.36},${-h * 0.22}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${-h * 0.18} Q ${-w * 0.20},${-h * 0.26} ${-w * 0.36},${-h * 0.22}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${h * 0.16} Q ${w * 0.20},${h * 0.08} ${w * 0.36},${h * 0.14}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
            <path d="M 0,${h * 0.16} Q ${-w * 0.20},${h * 0.08} ${-w * 0.36},${h * 0.14}" fill="none" stroke="${goldCol}" stroke-width="1.3" stroke-linecap="round" />
        `
    },
    {
        key: 'oval',
        name: 'Imperial Oval',
        w: 140,
        h: 190,
        viewBox: '-80 -105 160 210',
        colors: { stop1: '#2d6a36', stop2: '#1b4a24', stop3: '#103318', stroke: '#d6a661', vein: '#eed08f' },
        veins: (w, h, goldCol) => `
            <ellipse cx="0" cy="0" rx="${w * 0.38}" ry="${h * 0.40}" fill="none" stroke="${goldCol}" stroke-width="1.5" stroke-dasharray="5 3.5" />
        `
    }
];

function generatePureLeafSVG(leaf) {
    const d = evalLeafD(0, 0, leaf.w, leaf.h, leaf.key);
    const gid = `leaf_grad_${leaf.key}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${leaf.viewBox}">
  <defs>
    <linearGradient id="${gid}" x1="25%" y1="0%" x2="78%" y2="100%">
      <stop offset="0%" stop-color="${leaf.colors.stop1}" />
      <stop offset="50%" stop-color="${leaf.colors.stop2}" />
      <stop offset="100%" stop-color="${leaf.colors.stop3}" />
    </linearGradient>
    <filter id="leaf_shadow_${leaf.key}" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.25" />
    </filter>
  </defs>
  <path d="${d}" fill="url(#${gid})" stroke="${leaf.colors.stroke}" stroke-width="2.5" filter="url(#leaf_shadow_${leaf.key})" />
  <g opacity="0.8">
    ${leaf.veins(leaf.w, leaf.h, leaf.colors.vein)}
  </g>
</svg>`;
}

const targetDirs = [
    path.join(__dirname, '../assets'),
    path.join(__dirname, '../../assets'),
    '/home/ammar/.gemini/antigravity-ide/brain/e2c0a748-6be4-439f-a099-d057de3ca8ec'
];

targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

leaves.forEach(leaf => {
    const svgContent = generatePureLeafSVG(leaf);
    targetDirs.forEach(dir => {
        fs.writeFileSync(path.join(dir, `leaf_${leaf.key}.svg`), svgContent, 'utf8');
    });
    console.log(`Exported leaf_${leaf.key}.svg`);
});

// Also create aliases
targetDirs.forEach(dir => {
    fs.copyFileSync(path.join(dir, 'leaf_maple.svg'), path.join(dir, 'leaf_japanese_maple.svg'));
    fs.copyFileSync(path.join(dir, 'leaf_birch.svg'), path.join(dir, 'leaf_serrated_birch.svg'));
    fs.copyFileSync(path.join(dir, 'leaf_linden.svg'), path.join(dir, 'leaf_cordate_linden.svg'));
});

console.log('All individual pure leaf SVGs generated without background!');
