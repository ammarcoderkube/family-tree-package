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
    },
    {
        id: 'ginkgo',
        name: 'Majestic Ginkgo Fan',
        filename: 'leaf_ginkgo.png',
        svg: `
        <svg width="512" height="512" viewBox="-256 -256 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="3" dy="8" stdDeviation="10" flood-color="rgba(0,0,0,0.45)" />
                </filter>
                <linearGradient id="grad-ginkgo" x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stop-color="#3b7f50" />
                    <stop offset="50%" stop-color="#235834" />
                    <stop offset="100%" stop-color="#12351f" />
                </linearGradient>
            </defs>
            <!-- Ginkgo Fan Contour with Point Staying Upside -->
            <path d="M 0,-175
                     C -35,-115 -115,-50 -150,20
                     C -175,78 -115,155 -22,165
                     C -8,150 8,150 22,165
                     C 115,155 175,78 150,20
                     C 115,-50 35,-115 0,-175 Z"
                  fill="url(#grad-ginkgo)"
                  stroke="#d6a661"
                  stroke-width="5"
                  filter="url(#ds)" />
            <!-- Central Mid-rib -->
            <path d="M 0,-150 L 0,140" fill="none" stroke="#d6a661" stroke-width="2.5" stroke-linecap="round" opacity="0.8" />
            <!-- Radial Fan Veins -->
            <path d="M 0,-140 Q -45,-10 -115,70" fill="none" stroke="#d6a661" stroke-width="1.8" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,-140 Q 45,-10 115,70" fill="none" stroke="#d6a661" stroke-width="1.8" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,-140 Q -25,10 -65,125" fill="none" stroke="#d6a661" stroke-width="1.8" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,-140 Q 25,10 65,125" fill="none" stroke="#d6a661" stroke-width="1.8" stroke-linecap="round" opacity="0.65" />
        </svg>`
    },
    {
        id: 'maple',
        name: 'Authentic Japanese Maple (7-Lobed)',
        filename: 'leaf_maple.png',
        svg: `
        <svg width="512" height="512" viewBox="-256 -256 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="3" dy="8" stdDeviation="10" flood-color="rgba(0,0,0,0.45)" />
                </filter>
                <linearGradient id="grad-maple" x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stop-color="#3d8253" />
                    <stop offset="50%" stop-color="#245a36" />
                    <stop offset="100%" stop-color="#143620" />
                </linearGradient>
            </defs>
            <!-- 7-Lobed Star Japanese Maple Leaf -->
            <path d="M 0,110
                     C -26,105 -48,110 -77,125
                     Q -122,140 -168,135
                     L -142,98 Q -112,85 -80,72
                     L -123,58 L -165,40 Q -205,18 -218,-14
                     L -188,-28 L -148,-22 Q -108,-31 -85,-49
                     L -120,-80 L -148,-116 Q -138,-152 -142,-174
                     L -107,-138 L -90,-116 Q -62,-89 -40,-85
                     L -58,-142 L -36,-178 Q -18,-201 0,-224
                     Q 18,-201 36,-178 L 58,-142
                     Q 40,-85 62,-89 L 90,-116 L 107,-138
                     Q 142,-174 138,-152 L 148,-116 L 120,-80
                     Q 85,-49 108,-22 L 148,-22 L 188,-28
                     Q 218,-14 205,18 L 165,40 L 123,58
                     Q 80,72 112,85 L 142,98
                     Q 168,135 122,140
                     C 77,125 48,110 26,105
                     C 14,103 5,106 0,110 Z"
                  fill="url(#grad-maple)"
                  stroke="#d6a661"
                  stroke-width="5"
                  filter="url(#ds)" />
            <!-- Embossed Gold Radiating Veins -->
            <path d="M 0,105 L 0,-216" fill="none" stroke="#d6a661" stroke-width="3.5" stroke-linecap="round" opacity="0.85" />
            <path d="M 0,105 Q -36,-12 -134,-165" fill="none" stroke="#d6a661" stroke-width="2.6" stroke-linecap="round" opacity="0.75" />
            <path d="M 0,105 Q 36,-12 134,-165" fill="none" stroke="#d6a661" stroke-width="2.6" stroke-linecap="round" opacity="0.75" />
            <path d="M 0,105 Q -65,26 -208,-9" fill="none" stroke="#d6a661" stroke-width="2.4" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,105 Q 65,26 208,-9" fill="none" stroke="#d6a661" stroke-width="2.4" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,105 Q -85,108 -156,122" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,105 Q 85,108 156,122" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
        </svg>`
    },
    {
        id: 'birch',
        name: 'Serrated Elm / Birch Foliage',
        filename: 'leaf_birch.png',
        svg: `
        <svg width="512" height="512" viewBox="-256 -256 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="3" dy="8" stdDeviation="10" flood-color="rgba(0,0,0,0.45)" />
                </filter>
                <linearGradient id="grad-birch" x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stop-color="#387a4c" />
                    <stop offset="50%" stop-color="#245a36" />
                    <stop offset="100%" stop-color="#143620" />
                </linearGradient>
            </defs>
            <!-- Serrated Birch Ovate Path -->
            <path d="M 0,172
                     C -18,165 -40,154 -63,136
                     L -77,127 L -70,116 L -97,102 L -86,93 L -115,75 L -102,66 L -129,43 L -115,34
                     L -138,9 L -124,0 L -140,-29 L -124,-36 L -131,-63 L -115,-68 L -115,-95 L -99,-99
                     L -92,-122 L -74,-124 L -65,-144 L -47,-144 L -34,-164 L -16,-164 L 0,-191
                     L 16,-164 L 34,-164 L 47,-144 L 65,-144 L 74,-124 L 92,-122 L 99,-99 L 115,-95
                     L 115,-68 L 131,-63 L 124,-36 L 140,-29 L 124,0 L 138,9 L 115,34 L 129,43
                     L 102,66 L 115,75 L 86,93 L 97,102 L 70,116 L 77,127 L 63,136
                     C 40,154 18,165 0,172 Z"
                  fill="url(#grad-birch)"
                  stroke="#d6a661"
                  stroke-width="5"
                  filter="url(#ds)" />
            <!-- Central Midrib & Pinnate Herringbone Veins -->
            <path d="M 0,163 L 0,-180" fill="none" stroke="#d6a661" stroke-width="3.5" stroke-linecap="round" opacity="0.85" />
            <path d="M 0,108 Q -54,99 -90,104" fill="none" stroke="#d6a661" stroke-width="2.4" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,108 Q 54,99 90,104" fill="none" stroke="#d6a661" stroke-width="2.4" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,58 Q -68,45 -122,45" fill="none" stroke="#d6a661" stroke-width="2.4" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,58 Q 68,45 122,45" fill="none" stroke="#d6a661" stroke-width="2.4" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,5 Q -72,-13 -130,0" fill="none" stroke="#d6a661" stroke-width="2.4" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,5 Q 72,-13 130,0" fill="none" stroke="#d6a661" stroke-width="2.4" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,-50 Q -68,-68 -122,-41" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,-50 Q 68,-68 122,-41" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,-99 Q -56,-112 -95,-108" fill="none" stroke="#d6a661" stroke-width="2.0" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,-99 Q 56,-112 95,-108" fill="none" stroke="#d6a661" stroke-width="2.0" stroke-linecap="round" opacity="0.65" />
        </svg>`
    },
    {
        id: 'linden',
        name: 'Cordate Linden Foliage',
        filename: 'leaf_linden.png',
        svg: `
        <svg width="512" height="512" viewBox="-256 -256 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="3" dy="8" stdDeviation="10" flood-color="rgba(0,0,0,0.45)" />
                </filter>
                <linearGradient id="grad-linden" x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stop-color="#3d8253" />
                    <stop offset="50%" stop-color="#245a36" />
                    <stop offset="100%" stop-color="#143620" />
                </linearGradient>
            </defs>
            <!-- Cordate Heart-Cleft Silhouette -->
            <path d="M 0,124
                     C -22,146 -56,171 -99,162
                     C -140,153 -171,112 -176,68
                     C -180,11 -146,-56 -101,-112
                     C -68,-153 -34,-176 0,-194
                     C 34,-176 68,-153 101,-112
                     C 146,-56 180,11 176,68
                     C 171,112 140,153 99,162
                     C 56,171 22,146 0,124 Z"
                  fill="url(#grad-linden)"
                  stroke="#d6a661"
                  stroke-width="5"
                  filter="url(#ds)" />
            <!-- Radiant Palmate-Pinnate Veins -->
            <path d="M 0,124 L 0,-185" fill="none" stroke="#d6a661" stroke-width="3.5" stroke-linecap="round" opacity="0.85" />
            <path d="M 0,112 Q -72,72 -146,36" fill="none" stroke="#d6a661" stroke-width="2.6" stroke-linecap="round" opacity="0.75" />
            <path d="M 0,112 Q 72,72 146,36" fill="none" stroke="#d6a661" stroke-width="2.6" stroke-linecap="round" opacity="0.75" />
            <path d="M 0,56 Q -85,0 -130,-63" fill="none" stroke="#d6a661" stroke-width="2.4" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,56 Q 85,0 130,-63" fill="none" stroke="#d6a661" stroke-width="2.4" stroke-linecap="round" opacity="0.7" />
            <path d="M 0,-11 Q -63,-68 -90,-117" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
            <path d="M 0,-11 Q 63,-68 90,-117" fill="none" stroke="#d6a661" stroke-width="2.2" stroke-linecap="round" opacity="0.65" />
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
    const rootAssetsDir = path.resolve(__dirname, '../../assets');
    if (fs.existsSync(rootAssetsDir)) {
        fs.copyFileSync(targetPng, path.join(rootAssetsDir, leaf.filename));
    }
});

console.log('All 5 leaf PNGs successfully generated!');
