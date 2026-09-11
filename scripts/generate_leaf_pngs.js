const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.resolve(__dirname, '../assets');
if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Leaf path definitions (centered in 512x512 viewport, height ~380, width ~260)
const leaves = [
    {
        id: 'laurel',
        name: 'Classical Botanical Laurel',
        filename: 'leaf_laurel.png',
        svg: `
        <svg width="512" height="512" viewBox="-256 -256 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="3" dy="8" stdDeviation="10" flood-color="rgba(0,0,0,0.45)" />
                </filter>
                <linearGradient id="grad-laurel" x1="15%" y1="0%" x2="85%" y2="100%">
                    <stop offset="0%" stop-color="#34784a" />
                    <stop offset="45%" stop-color="#1e4f2e" />
                    <stop offset="100%" stop-color="#102d1a" />
                </linearGradient>
            </defs>
            <!-- Leaf Path -->
            <path d="M 0,-185
                     C 70,-125 125,-25 118,50
                     C 110,120 58,168 0,185
                     C -58,168 -110,120 -118,50
                     C -125,-25 -70,-125 0,-185 Z"
                  fill="url(#grad-laurel)"
                  stroke="#d6a661"
                  stroke-width="5"
                  filter="url(#ds)" />
            <!-- Embossed Gold Midrib Vein -->
            <path d="M 0,-165 Q 1,0 0,165" fill="none" stroke="#d6a661" stroke-width="3.5" stroke-linecap="round" opacity="0.85" />
            <!-- Lateral Veins -->
            <path d="M 0,-105 Q 32,-120 65,-128" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,-105 Q -32,-120 -65,-128" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,-45 Q 45,-60 88,-55" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,-45 Q -45,-60 -88,-55" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,25 Q 48,15 82,35" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,25 Q -48,15 -82,35" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,95 Q 32,95 55,120" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,95 Q -32,95 -55,120" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
        </svg>`
    },
    {
        id: 'oval',
        name: 'Imperial Oval Medallion',
        filename: 'leaf_oval.png',
        svg: `
        <svg width="512" height="512" viewBox="-256 -256 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="3" dy="8" stdDeviation="10" flood-color="rgba(0,0,0,0.45)" />
                </filter>
                <linearGradient id="grad-oval" x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stop-color="#327448" />
                    <stop offset="50%" stop-color="#1c4b2b" />
                    <stop offset="100%" stop-color="#0f2a18" />
                </linearGradient>
            </defs>
            <!-- Continuous Ellipse / Medallion -->
            <path d="M 0,-185
                     C 82,-185 130,-98 130,0
                     C 130,98 82,185 0,185
                     C -82,185 -130,98 -130,0
                     C -130,-98 -82,-185 0,-185 Z"
                  fill="url(#grad-oval)"
                  stroke="#d6a661"
                  stroke-width="5"
                  filter="url(#ds)" />
            <!-- Inner Heraldic Gold Double-Rim -->
            <path d="M 0,-162
                     C 68,-162 108,-85 108,0
                     C 108,85 68,162 0,162
                     C -68,162 -108,85 -108,0
                     C -108,-85 -68,-162 0,-162 Z"
                  fill="none"
                  stroke="#d6a661"
                  stroke-width="2"
                  stroke-dasharray="8 5"
                  opacity="0.8" />
            <!-- Inner Subtle Accent Line -->
            <ellipse cx="0" cy="0" rx="90" ry="138" fill="none" stroke="rgba(214,166,97,0.3)" stroke-width="1.2" />
        </svg>`
    },
    {
        id: 'oak',
        name: 'Royal Oak Foliage',
        filename: 'leaf_oak.png',
        svg: `
        <svg width="512" height="512" viewBox="-256 -256 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="3" dy="8" stdDeviation="10" flood-color="rgba(0,0,0,0.45)" />
                </filter>
                <linearGradient id="grad-oak" x1="15%" y1="0%" x2="85%" y2="100%">
                    <stop offset="0%" stop-color="#387a4c" />
                    <stop offset="50%" stop-color="#205230" />
                    <stop offset="100%" stop-color="#12301c" />
                </linearGradient>
            </defs>
            <!-- Royal Lobed Oak Leaf -->
            <path d="M 0,-185
                     C 48,-172 90,-148 80,-110
                     C 64,-92 110,-60 106,-18
                     C 76,14 102,62 90,108
                     C 58,142 40,172 0,185
                     C -40,172 -58,142 -90,108
                     C -102,62 -76,14 -106,-18
                     C -110,-60 -64,-92 -80,-110
                     C -90,-148 -48,-172 0,-185 Z"
                  fill="url(#grad-oak)"
                  stroke="#d6a661"
                  stroke-width="5"
                  filter="url(#ds)" />
            <!-- Embossed Gold Midrib Vein -->
            <path d="M 0,-165 Q 1,0 0,165" fill="none" stroke="#d6a661" stroke-width="3.5" stroke-linecap="round" opacity="0.85" />
            <!-- Branching Lobe Veins -->
            <path d="M 0,-115 Q 36,-125 64,-112" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,-115 Q -36,-125 -64,-112" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,-30 Q 45,-38 86,-22" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,-30 Q -45,-38 -86,-22" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,55 Q 42,65 72,100" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,55 Q -42,65 -72,100" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
        </svg>`
    }
];

leaves.forEach(leaf => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; width: 512px; height: 512px; }
  svg { width: 512px; height: 512px; display: block; }
</style>
</head>
<body>
${leaf.svg}
</body>
</html>`;

    const tmpHtml = `/tmp/leaf_${leaf.id}.html`;
    const targetPng = path.join(ASSETS_DIR, leaf.filename);
    fs.writeFileSync(tmpHtml, htmlContent, 'utf8');

    console.log(`Rendering ${leaf.filename}...`);
    execSync(`google-chrome --headless --disable-gpu --default-background-color=00000000 --screenshot="${targetPng}" --window-size=512,512 "file://${tmpHtml}"`, { stdio: 'inherit' });
    console.log(`Generated: ${targetPng}`);
});

console.log('All 3 leaf PNGs successfully generated!');
