/**
 * FamilyTreeSVG — Pure organic SVG family tree from JSON data
 * 
 * Usage:
 *   FamilyTreeSVG.create('#container', familyData, {
 *     leafColor: '#17361a',
 *     branchColor: '#3a1f13',
 *     trunkColor: '#2d1607',
 *     branchStyle: 'woodcut',   // 'woodcut' | 'gnarled' | 'classic' | 'willow_tendril' | 'zen_bonsai'
 *     trunkStyle: 'calligraphic', // 'calligraphic' | 'gnarled_veteran' | 'banyan_cathedral' | 'dragon_bonsai'
 *     leafStyle: 'laurel',      // 'laurel' | 'oval' | 'oak' | 'ginkgo' | 'maple'
 *     leafRenderMode: 'svg'     // 'svg' | 'png'
 *   });
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FamilyTreeSVG = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // ═══════════════════════════════════════════════
    //  CSS (pan/zoom cursor & living woodcut glow)
    // ═══════════════════════════════════════════════
    var CSS_INJECTED = false;
    function injectCSS() {
        if (CSS_INJECTED) return;
        var style = document.createElement('style');
        style.textContent = `
.fts-root {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #ffffff;
    user-select: none;
}
.fts-root * { margin: 0; padding: 0; box-sizing: border-box; }
.fts-stage {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    cursor: grab;
}
.fts-stage.dragging { cursor: grabbing; }
.woodcut-sap-line {
    opacity: 0.75;
}
.collapse-btn {
    transition: transform 0.15s ease-out;
}
.collapse-btn:hover {
    transform: scale(1.2);
}
`;
        document.head.appendChild(style);
        CSS_INJECTED = true;
    }

    // ═══════════════════════════════════════════════
    //  COLOR HELPERS
    // ═══════════════════════════════════════════════
    function h2r(hex) {
        var h = hex.replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }
    function mix(a, b, t) {
        var ca = h2r(a), cb = h2r(b);
        var r = Math.round(ca[0] * (1 - t) + cb[0] * t);
        var g = Math.round(ca[1] * (1 - t) + cb[1] * t);
        var bl = Math.round(ca[2] * (1 - t) + cb[2] * t);
        return '#' + (r < 16 ? '0' : '') + r.toString(16) + (g < 16 ? '0' : '') + g.toString(16) + (bl < 16 ? '0' : '') + bl.toString(16);
    }
    function lighter(c, t) { return mix(c, '#ffffff', t); }
    function darker(c, t) { return mix(c, '#000000', t); }
    function getContrastYIQ(hexcolor) {
        var c = hexcolor.replace('#', '');
        if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
        var r = parseInt(c.substr(0, 2), 16);
        var g = parseInt(c.substr(2, 2), 16);
        var b = parseInt(c.substr(4, 2), 16);
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#3a1f13' : '#fffdf5';
    }

    // ═══════════════════════════════════════════════
    //  DOM / SVG HELPERS
    // ═══════════════════════════════════════════════
    function mkSVG(tag, attrs, parent) {
        var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    }
    function rng(id, salt) {
        var s = id + '~' + salt, h = 0;
        for (var i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
        return ((Math.sin(h + 1) * 43758.5453123) % 1 + 1) % 1;
    }

    // ═══════════════════════════════════════════════
    //  LEAF SHAPES (3 Distinct Botanical Shapes)
    // ═══════════════════════════════════════════════
    function leafD(ox, oy, w, h, style) {
        var s = style || 'laurel';
        var hw = w / 2, hh = h / 2;

        if (s === 'laurel' || s === 'botanical') {
            // Classical Botanical Laurel (Symmetric pointed elliptic, tapered tips)
            return 'M ' + ox + ',' + (oy - hh) +
                ' C ' + (ox + hw * 0.72) + ',' + (oy - hh * 0.65) + ' ' + (ox + hw * 0.98) + ',' + (oy - hh * 0.10) + ' ' + (ox + hw * 0.95) + ',' + (oy + hh * 0.30) +
                ' C ' + (ox + hw * 0.90) + ',' + (oy + hh * 0.68) + ' ' + (ox + hw * 0.45) + ',' + (oy + hh * 0.92) + ' ' + ox + ',' + (oy + hh) +
                ' C ' + (ox - hw * 0.45) + ',' + (oy + hh * 0.92) + ' ' + (ox - hw * 0.90) + ',' + (oy + hh * 0.68) + ' ' + (ox - hw * 0.95) + ',' + (oy + hh * 0.30) +
                ' C ' + (ox - hw * 0.98) + ',' + (oy - hh * 0.10) + ' ' + (ox - hw * 0.72) + ',' + (oy - hh * 0.65) + ' ' + ox + ',' + (oy - hh) + ' Z';
        }

        if (s === 'oval' || s === 'medallion' || s === 'rounded') {
            // Imperial Rounded Oval Medallion (Smooth continuous ellipse, zero points)
            return 'M ' + ox + ',' + (oy - hh) +
                ' C ' + (ox + hw * 0.55) + ',' + (oy - hh) + ' ' + (ox + hw) + ',' + (oy - hh * 0.55) + ' ' + (ox + hw) + ',' + oy +
                ' C ' + (ox + hw) + ',' + (oy + hh * 0.55) + ' ' + (ox + hw * 0.55) + ',' + (oy + hh) + ' ' + ox + ',' + (oy + hh) +
                ' C ' + (ox - hw * 0.55) + ',' + (oy + hh) + ' ' + (ox - hw) + ',' + (oy + hh * 0.55) + ' ' + (ox - hw) + ',' + oy +
                ' C ' + (ox - hw) + ',' + (oy - hh * 0.55) + ' ' + (ox - hw * 0.55) + ',' + (oy - hh) + ' ' + ox + ',' + (oy - hh) + ' Z';
        }

        if (s === 'oak' || s === 'lobed') {
            // Royal Oak Foliage (Rounded botanical lobes, single apical crown lobe)
            return 'M ' + ox + ',' + (oy - hh) +
                ' C ' + (ox + hw * 0.42) + ',' + (oy - hh * 0.92) + ' ' + (ox + hw * 0.78) + ',' + (oy - hh * 0.78) + ' ' + (ox + hw * 0.70) + ',' + (oy - hh * 0.58) +
                ' C ' + (ox + hw * 0.55) + ',' + (oy - hh * 0.48) + ' ' + (ox + hw * 0.95) + ',' + (oy - hh * 0.32) + ' ' + (ox + hw * 0.92) + ',' + (oy - hh * 0.10) +
                ' C ' + (ox + hw * 0.65) + ',' + (oy + hh * 0.08) + ' ' + (ox + hw * 0.88) + ',' + (oy + hh * 0.32) + ' ' + (ox + hw * 0.78) + ',' + (oy + hh * 0.58) +
                ' C ' + (ox + hw * 0.50) + ',' + (oy + hh * 0.75) + ' ' + (ox + hw * 0.35) + ',' + (oy + hh * 0.92) + ' ' + ox + ',' + (oy + hh) +
                ' C ' + (ox - hw * 0.35) + ',' + (oy + hh * 0.92) + ' ' + (ox - hw * 0.50) + ',' + (oy + hh * 0.75) + ' ' + (ox - hw * 0.78) + ',' + (oy + hh * 0.58) +
                ' C ' + (ox - hw * 0.88) + ',' + (oy + hh * 0.32) + ' ' + (ox - hw * 0.65) + ',' + (oy + hh * 0.08) + ' ' + (ox - hw * 0.92) + ',' + (oy - hh * 0.10) +
                ' C ' + (ox - hw * 0.95) + ',' + (oy - hh * 0.32) + ' ' + (ox - hw * 0.55) + ',' + (oy - hh * 0.48) + ' ' + (ox - hw * 0.70) + ',' + (oy - hh * 0.58) +
                ' C ' + (ox - hw * 0.78) + ',' + (oy - hh * 0.78) + ' ' + (ox - hw * 0.42) + ',' + (oy - hh * 0.92) + ' ' + ox + ',' + (oy - hh) + ' Z';
        }

        if (s === 'ginkgo' || s === 'fan') {
            // Majestic Ginkgo Leaf with Point Staying Upside (Pointed apex at top, broad fan collar at bottom)
            return 'M ' + ox + ',' + (oy - hh * 0.95) +
                ' C ' + (ox - hw * 0.20) + ',' + (oy - hh * 0.60) + ' ' + (ox - hw * 0.70) + ',' + (oy - hh * 0.25) + ' ' + (ox - hw * 0.95) + ',' + (oy + hh * 0.15) +
                ' C ' + (ox - hw * 1.05) + ',' + (oy + hh * 0.55) + ' ' + (ox - hw * 0.65) + ',' + (oy + hh * 0.90) + ' ' + (ox - hw * 0.12) + ',' + (oy + hh * 0.92) +
                ' C ' + (ox - hw * 0.05) + ',' + (oy + hh * 0.82) + ' ' + (ox + hw * 0.05) + ',' + (oy + hh * 0.82) + ' ' + (ox + hw * 0.12) + ',' + (oy + hh * 0.92) +
                ' C ' + (ox + hw * 0.65) + ',' + (oy + hh * 0.90) + ' ' + (ox + hw * 1.05) + ',' + (oy + hh * 0.55) + ' ' + (ox + hw * 0.95) + ',' + (oy + hh * 0.15) +
                ' C ' + (ox + hw * 0.70) + ',' + (oy - hh * 0.25) + ' ' + (ox + hw * 0.20) + ',' + (oy - hh * 0.60) + ' ' + ox + ',' + (oy - hh * 0.95) + ' Z';
        }

        if (s === 'maple' || s === 'japanese_maple' || s === 'palmate') {
            // Authentic 7-Lobed Japanese Maple Leaf (Acer palmatum)
            return 'M ' + ox + ',' + (oy + hh * 0.48) +
                ' C ' + (ox - hw * 0.12) + ',' + (oy + hh * 0.46) + ' ' + (ox - hw * 0.22) + ',' + (oy + hh * 0.48) + ' ' + (ox - hw * 0.35) + ',' + (oy + hh * 0.55) +
                ' Q ' + (ox - hw * 0.55) + ',' + (oy + hh * 0.62) + ' ' + (ox - hw * 0.75) + ',' + (oy + hh * 0.60) +
                ' L ' + (ox - hw * 0.64) + ',' + (oy + hh * 0.44) +
                ' Q ' + (ox - hw * 0.50) + ',' + (oy + hh * 0.38) + ' ' + (ox - hw * 0.36) + ',' + (oy + hh * 0.32) +
                ' L ' + (ox - hw * 0.55) + ',' + (oy + hh * 0.26) + ' L ' + (ox - hw * 0.74) + ',' + (oy + hh * 0.18) +
                ' Q ' + (ox - hw * 0.92) + ',' + (oy + hh * 0.08) + ' ' + (ox - hw * 0.98) + ',' + (oy - hh * 0.06) +
                ' L ' + (ox - hw * 0.84) + ',' + (oy - hh * 0.12) + ' L ' + (ox - hw * 0.66) + ',' + (oy - hh * 0.10) +
                ' Q ' + (ox - hw * 0.48) + ',' + (oy - hh * 0.14) + ' ' + (ox - hw * 0.38) + ',' + (oy - hh * 0.22) +
                ' L ' + (ox - hw * 0.54) + ',' + (oy - hh * 0.36) + ' L ' + (ox - hw * 0.66) + ',' + (oy - hh * 0.52) +
                ' Q ' + (ox - hw * 0.62) + ',' + (oy - hh * 0.68) + ' ' + (ox - hw * 0.64) + ',' + (oy - hh * 0.78) +
                ' L ' + (ox - hw * 0.48) + ',' + (oy - hh * 0.62) + ' L ' + (ox - hw * 0.40) + ',' + (oy - hh * 0.52) +
                ' Q ' + (ox - hw * 0.28) + ',' + (oy - hh * 0.40) + ' ' + (ox - hw * 0.18) + ',' + (oy - hh * 0.38) +
                ' L ' + (ox - hw * 0.26) + ',' + (oy - hh * 0.64) + ' L ' + (ox - hw * 0.16) + ',' + (oy - hh * 0.80) +
                ' Q ' + (ox - hw * 0.08) + ',' + (oy - hh * 0.90) + ' ' + ox + ',' + (oy - hh) +
                ' Q ' + (ox + hw * 0.08) + ',' + (oy - hh * 0.90) + ' ' + (ox + hw * 0.16) + ',' + (oy - hh * 0.80) + ' L ' + (ox + hw * 0.26) + ',' + (oy - hh * 0.64) +
                ' Q ' + (ox + hw * 0.18) + ',' + (oy - hh * 0.38) + ' ' + (ox + hw * 0.28) + ',' + (oy - hh * 0.40) + ' L ' + (ox + hw * 0.40) + ',' + (oy - hh * 0.52) + ' L ' + (ox + hw * 0.48) + ',' + (oy - hh * 0.62) +
                ' Q ' + (ox + hw * 0.64) + ',' + (oy - hh * 0.78) + ' ' + (ox + hw * 0.62) + ',' + (oy - hh * 0.68) + ' L ' + (ox + hw * 0.66) + ',' + (oy - hh * 0.52) + ' L ' + (ox + hw * 0.54) + ',' + (oy - hh * 0.36) +
                ' Q ' + (ox + hw * 0.38) + ',' + (oy - hh * 0.22) + ' ' + (ox + hw * 0.48) + ',' + (oy - hh * 0.14) + ' L ' + (ox + hw * 0.66) + ',' + (oy - hh * 0.10) + ' L ' + (ox + hw * 0.84) + ',' + (oy - hh * 0.12) +
                ' Q ' + (ox + hw * 0.98) + ',' + (oy - hh * 0.06) + ' ' + (ox + hw * 0.92) + ',' + (oy + hh * 0.08) + ' L ' + (ox + hw * 0.74) + ',' + (oy + hh * 0.18) + ' L ' + (ox + hw * 0.55) + ',' + (oy + hh * 0.26) +
                ' Q ' + (ox + hw * 0.36) + ',' + (oy + hh * 0.32) + ' ' + (ox + hw * 0.50) + ',' + (oy + hh * 0.38) + ' L ' + (ox + hw * 0.64) + ',' + (oy + hh * 0.44) +
                ' Q ' + (ox + hw * 0.75) + ',' + (oy + hh * 0.60) + ' ' + (ox + hw * 0.55) + ',' + (oy + hh * 0.62) +
                ' C ' + (ox + hw * 0.35) + ',' + (oy + hh * 0.55) + ' ' + (ox + hw * 0.22) + ',' + (oy + hh * 0.48) + ' ' + (ox + hw * 0.12) + ',' + (oy + hh * 0.46) +
                ' C ' + (ox + hw * 0.06) + ',' + (oy + hh * 0.46) + ' ' + (ox + hw * 0.02) + ',' + (oy + hh * 0.47) + ' ' + ox + ',' + (oy + hh * 0.48) + ' Z';
        }

        if (s === 'birch' || s === 'serrated_birch' || s === 'elm') {
            // Serrated Elm / Birch Foliage (Betula serrata - Sawtooth Ovate)
            return 'M ' + ox + ',' + (oy + hh * 0.76) +
                ' C ' + (ox - hw * 0.08) + ',' + (oy + hh * 0.73) + ' ' + (ox - hw * 0.18) + ',' + (oy + hh * 0.68) + ' ' + (ox - hw * 0.28) + ',' + (oy + hh * 0.60) +
                ' L ' + (ox - hw * 0.34) + ',' + (oy + hh * 0.56) + ' L ' + (ox - hw * 0.31) + ',' + (oy + hh * 0.51) + ' L ' + (ox - hw * 0.43) + ',' + (oy + hh * 0.45) + ' L ' + (ox - hw * 0.38) + ',' + (oy + hh * 0.41) +
                ' L ' + (ox - hw * 0.51) + ',' + (oy + hh * 0.33) + ' L ' + (ox - hw * 0.45) + ',' + (oy + hh * 0.29) + ' L ' + (ox - hw * 0.57) + ',' + (oy + hh * 0.19) + ' L ' + (ox - hw * 0.51) + ',' + (oy + hh * 0.15) +
                ' L ' + (ox - hw * 0.61) + ',' + (oy + hh * 0.04) + ' L ' + (ox - hw * 0.55) + ',' + oy + ' L ' + (ox - hw * 0.62) + ',' + (oy - hh * 0.13) + ' L ' + (ox - hw * 0.55) + ',' + (oy - hh * 0.16) +
                ' L ' + (ox - hw * 0.58) + ',' + (oy - hh * 0.28) + ' L ' + (ox - hw * 0.51) + ',' + (oy - hh * 0.30) + ' L ' + (ox - hw * 0.51) + ',' + (oy - hh * 0.42) + ' L ' + (ox - hw * 0.44) + ',' + (oy - hh * 0.44) +
                ' L ' + (ox - hw * 0.41) + ',' + (oy - hh * 0.54) + ' L ' + (ox - hw * 0.33) + ',' + (oy - hh * 0.55) + ' L ' + (ox - hw * 0.29) + ',' + (oy - hh * 0.64) + ' L ' + (ox - hw * 0.21) + ',' + (oy - hh * 0.64) +
                ' L ' + (ox - hw * 0.15) + ',' + (oy - hh * 0.73) + ' L ' + (ox - hw * 0.07) + ',' + (oy - hh * 0.73) + ' L ' + ox + ',' + (oy - hh * 0.85) +
                ' L ' + (ox + hw * 0.07) + ',' + (oy - hh * 0.73) + ' L ' + (ox + hw * 0.15) + ',' + (oy - hh * 0.73) + ' L ' + (ox + hw * 0.21) + ',' + (oy - hh * 0.64) + ' L ' + (ox + hw * 0.29) + ',' + (oy - hh * 0.64) +
                ' L ' + (ox + hw * 0.33) + ',' + (oy - hh * 0.55) + ' L ' + (ox + hw * 0.41) + ',' + (oy - hh * 0.54) + ' L ' + (ox + hw * 0.44) + ',' + (oy - hh * 0.44) + ' L ' + (ox + hw * 0.51) + ',' + (oy - hh * 0.42) +
                ' L ' + (ox + hw * 0.51) + ',' + (oy - hh * 0.30) + ' L ' + (ox + hw * 0.58) + ',' + (oy - hh * 0.28) + ' L ' + (ox + hw * 0.55) + ',' + (oy - hh * 0.16) + ' L ' + (ox + hw * 0.62) + ',' + (oy - hh * 0.13) +
                ' L ' + (ox + hw * 0.55) + ',' + oy + ' L ' + (ox + hw * 0.61) + ',' + (oy + hh * 0.04) + ' L ' + (ox + hw * 0.51) + ',' + (oy + hh * 0.15) + ' L ' + (ox + hw * 0.57) + ',' + (oy + hh * 0.19) +
                ' L ' + (ox + hw * 0.45) + ',' + (oy + hh * 0.29) + ' L ' + (ox + hw * 0.51) + ',' + (oy + hh * 0.33) + ' L ' + (ox + hw * 0.38) + ',' + (oy + hh * 0.41) + ' L ' + (ox + hw * 0.43) + ',' + (oy + hh * 0.45) +
                ' L ' + (ox + hw * 0.31) + ',' + (oy + hh * 0.51) + ' L ' + (ox + hw * 0.34) + ',' + (oy + hh * 0.56) + ' L ' + (ox + hw * 0.28) + ',' + (oy + hh * 0.60) +
                ' C ' + (ox + hw * 0.18) + ',' + (oy + hh * 0.68) + ' ' + (ox + hw * 0.08) + ',' + (oy + hh * 0.73) + ' ' + ox + ',' + (oy + hh * 0.76) + ' Z';
        }

        if (s === 'linden' || s === 'cordate' || s === 'cordate_linden') {
            // Cordate Linden / Catalpa (Tilia cordata - Deep Heart-cleft Base & Acute Tip)
            return 'M ' + ox + ',' + (oy + hh * 0.55) +
                ' C ' + (ox - hw * 0.10) + ',' + (oy + hh * 0.65) + ' ' + (ox - hw * 0.25) + ',' + (oy + hh * 0.76) + ' ' + (ox - hw * 0.44) + ',' + (oy + hh * 0.72) +
                ' C ' + (ox - hw * 0.62) + ',' + (oy + hh * 0.68) + ' ' + (ox - hw * 0.76) + ',' + (oy + hh * 0.50) + ' ' + (ox - hw * 0.78) + ',' + (oy + hh * 0.30) +
                ' C ' + (ox - hw * 0.80) + ',' + (oy + hh * 0.05) + ' ' + (ox - hw * 0.65) + ',' + (oy - hh * 0.25) + ' ' + (ox - hw * 0.45) + ',' + (oy - hh * 0.50) +
                ' C ' + (ox - hw * 0.30) + ',' + (oy - hh * 0.68) + ' ' + (ox - hw * 0.15) + ',' + (oy - hh * 0.78) + ' ' + ox + ',' + (oy - hh * 0.86) +
                ' C ' + (ox + hw * 0.15) + ',' + (oy - hh * 0.78) + ' ' + (ox + hw * 0.30) + ',' + (oy - hh * 0.68) + ' ' + (ox + hw * 0.45) + ',' + (oy - hh * 0.50) +
                ' C ' + (ox + hw * 0.65) + ',' + (oy - hh * 0.25) + ' ' + (ox + hw * 0.80) + ',' + (oy + hh * 0.05) + ' ' + (ox + hw * 0.78) + ',' + (oy + hh * 0.30) +
                ' C ' + (ox + hw * 0.76) + ',' + (oy + hh * 0.50) + ' ' + (ox + hw * 0.62) + ',' + (oy + hh * 0.68) + ' ' + (ox + hw * 0.44) + ',' + (oy + hh * 0.72) +
                ' C ' + (ox + hw * 0.25) + ',' + (oy + hh * 0.76) + ' ' + (ox + hw * 0.10) + ',' + (oy + hh * 0.65) + ' ' + ox + ',' + (oy + hh * 0.55) + ' Z';
        }

        // Fallback laurel
        return 'M ' + ox + ',' + (oy - hh) +
            ' C ' + (ox + hw * 0.72) + ',' + (oy - hh * 0.65) + ' ' + (ox + hw * 0.98) + ',' + (oy - hh * 0.10) + ' ' + (ox + hw * 0.95) + ',' + (oy + hh * 0.30) +
            ' C ' + (ox + hw * 0.90) + ',' + (oy + hh * 0.68) + ' ' + (ox + hw * 0.45) + ',' + (oy + hh * 0.92) + ' ' + ox + ',' + (oy + hh) +
            ' C ' + (ox - hw * 0.45) + ',' + (oy + hh * 0.92) + ' ' + (ox - hw * 0.90) + ',' + (oy + hh * 0.68) + ' ' + (ox - hw * 0.95) + ',' + (oy + hh * 0.30) +
            ' C ' + (ox - hw * 0.98) + ',' + (oy - hh * 0.10) + ' ' + (ox - hw * 0.72) + ',' + (oy - hh * 0.65) + ' ' + ox + ',' + (oy - hh) + ' Z';
    }

    // ═══════════════════════════════════════════════
    //  MAIN CLASS
    // ═══════════════════════════════════════════════
    function FamilyTreeSVG(containerEl, data, options) {
        if (typeof containerEl === 'string') containerEl = document.querySelector(containerEl);
        if (!containerEl) throw new Error('FamilyTreeSVG: container element not found');
        injectCSS();

        var opts = options || {};
        this._container = containerEl;
        this._leafColor = opts.leafColor || '#17361a';
        this._branchColor = opts.branchColor || '#3a1f13';
        this._trunkColor = opts.trunkColor || '#2d1607';

        // Style Variations
        this._branchStyle = opts.branchStyle || 'woodcut'; // 'woodcut' | 'gnarled' | 'classic' | 'willow_tendril' | 'zen_bonsai'
        this._trunkStyle = opts.trunkStyle || 'calligraphic'; // 'calligraphic' | 'gnarled_veteran' | 'banyan_cathedral' | 'dragon_bonsai'
        this._leafStyle = opts.leafStyle || 'laurel'; // 'laurel' | 'oval' | 'oak' | 'ginkgo' | 'maple' | 'birch' | 'linden'
        this._leafRenderMode = opts.leafRenderMode || 'svg'; // 'svg' | 'png'
        this._leafPngUrls = Object.assign({
            laurel: 'assets/leaf_laurel.png',
            oval: 'assets/leaf_oval.png',
            oak: 'assets/leaf_oak.png',
            ginkgo: 'assets/leaf_ginkgo.png',
            maple: 'assets/leaf_maple.png',
            japanese_maple: 'assets/leaf_maple.png',
            birch: 'assets/leaf_birch.png',
            serrated_birch: 'assets/leaf_birch.png',
            linden: 'assets/leaf_linden.png',
            cordate_linden: 'assets/leaf_linden.png'
        }, opts.leafPngUrls || {});

        this._LC = [];
        this._BC = [];
        this._BW = [38, 26, 17, 10.5, 6.5, 4.0];
        this._TRUNK_H = 480;
        this._BR_LEN = [0, 280, 210, 165, 130, 100];
        this._SPREAD = [0, 220, 170, 135, 108, 85];
        this._LW = 78;
        this._LH = 96;
        this._nodeMap = {};
        this._collapsed = {};
        this._panX = 0;
        this._panY = 0;
        this._zoom = 1;
        this._SVG_W = 0;
        this._SVG_H = 0;
        this._ROOT = null;
        this._isDragging = false;
        this._lastMX = 0;
        this._lastMY = 0;
        this._uid = 't' + Math.random().toString(36).substr(2, 7);

        this._buildDOM();
        this._bindEvents();

        if (typeof ResizeObserver !== 'undefined') {
            var selfRo = this;
            this._ro = new ResizeObserver(function () {
                if (selfRo._els && selfRo._els.stage && selfRo._els.stage.clientWidth > 0) {
                    selfRo.fitView(false);
                }
            });
            this._ro.observe(this._container);
        }

        if (data) {
            var d = Array.isArray(data) ? data[0] : data;
            this._preprocess(d, new Set());
            this._ROOT = d;
            this._collapsed = {};
            this._autoCollapse(d);
            this.render();
            var self = this;
            self.fitView(false);
            setTimeout(function () { self.fitView(false); }, 60);
            setTimeout(function () { self.fitView(false); }, 200);
        }
    }

    // ═══════════════════════════════════════════════
    //  DOM — stage + SVG viewport
    // ═══════════════════════════════════════════════
    FamilyTreeSVG.prototype._buildDOM = function () {
        var c = this._container;
        c.innerHTML = '';
        c.classList.add('fts-root');

        var stage = document.createElement('div');
        stage.className = 'fts-stage';

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.cssText = 'position:absolute;top:0;left:0;overflow:visible;';
        var defs = mkSVG('defs', {}, svg);
        var filter = mkSVG('filter', { id: 'fts-ds-' + this._uid, x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs);
        mkSVG('feDropShadow', { dx: '2', dy: '4', stdDeviation: '6', 'flood-color': 'rgba(0,0,0,0.35)' }, filter);
        var vp = mkSVG('g', {}, svg);
        var gBg = mkSVG('g', {}, vp);
        mkSVG('g', {}, vp); // roots placeholder
        var gTrunk = mkSVG('g', {}, vp);
        var gBr = mkSVG('g', {}, vp);
        var gDeco = mkSVG('g', {}, vp);
        var gLv = mkSVG('g', {}, vp);
        stage.appendChild(svg);
        c.appendChild(stage);

        this._els = {
            stage: stage,
            svg: svg,
            vp: vp,
            gBg: gBg,
            gTrunk: gTrunk,
            gBr: gBr,
            gDeco: gDeco,
            gLv: gLv
        };
    };

    // ═══════════════════════════════════════════════
    //  EVENTS — pan & zoom
    // ═══════════════════════════════════════════════
    FamilyTreeSVG.prototype._bindEvents = function () {
        var self = this;
        var stage = this._els.stage;

        // Mouse pan
        stage.onmousedown = function (ev) {
            self._isDragging = true; self._lastMX = ev.clientX; self._lastMY = ev.clientY;
            stage.classList.add('dragging');
        };
        this._onMouseMove = function (ev) {
            if (!self._isDragging) return;
            self._panX += ev.clientX - self._lastMX;
            self._panY += ev.clientY - self._lastMY;
            self._lastMX = ev.clientX; self._lastMY = ev.clientY;
            self._applyTransform(false);
        };
        this._onMouseUp = function () {
            self._isDragging = false; stage.classList.remove('dragging');
        };
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);

        // Touch pan
        stage.addEventListener('touchstart', function (ev) {
            if (ev.touches.length === 1) {
                self._isDragging = true;
                self._lastMX = ev.touches[0].clientX;
                self._lastMY = ev.touches[0].clientY;
                stage.classList.add('dragging');
            }
        }, { passive: true });
        this._onTouchMove = function (ev) {
            if (!self._isDragging || ev.touches.length !== 1) return;
            self._panX += ev.touches[0].clientX - self._lastMX;
            self._panY += ev.touches[0].clientY - self._lastMY;
            self._lastMX = ev.touches[0].clientX;
            self._lastMY = ev.touches[0].clientY;
            self._applyTransform(false);
        };
        this._onTouchEnd = function () {
            self._isDragging = false; stage.classList.remove('dragging');
        };
        window.addEventListener('touchmove', this._onTouchMove, { passive: true });
        window.addEventListener('touchend', this._onTouchEnd);

        // Wheel zoom
        stage.onwheel = function (ev) {
            ev.preventDefault();
            var r = stage.getBoundingClientRect();
            var mx = ev.clientX - r.left, my = ev.clientY - r.top;
            var f = ev.deltaY < 0 ? 1.12 : 0.89;
            var nz = Math.min(5, Math.max(0.05, self._zoom * f));
            self._panX = mx - (mx - self._panX) * (nz / self._zoom);
            self._panY = my - (my - self._panY) * (nz / self._zoom);
            self._zoom = nz;
            self._applyTransform(false);
        };
    };

    FamilyTreeSVG.prototype._applyTransform = function (smooth) {
        var vp = this._els.vp;
        vp.style.transition = smooth ? 'transform .32s' : 'none';
        vp.setAttribute('transform', 'translate(' + this._panX + ',' + this._panY + ') scale(' + this._zoom + ')');
    };

    // ═══════════════════════════════════════════════
    //  DATA PROCESSING
    // ═══════════════════════════════════════════════
    FamilyTreeSVG.prototype._preprocess = function (node, visited) {
        if (!node.id) node.id = 'n_' + Math.random().toString(36).substr(2, 7);
        var key = node.full_name || node.name;
        if (!key) key = node.id;
        if (visited.has(key)) return;
        visited.add(key);
        if (!node.name && node.full_name) node.name = node.full_name;
        if (!node.children) node.children = [];
        if (node.partners && Array.isArray(node.partners)) {
            var self = this;
            node.partners.forEach(function (p) {
                if (!node.children.find(function (c) { return (c.full_name || c.name) === (p.full_name || p.name); })) {
                    var pNode = JSON.parse(JSON.stringify(p));
                    pNode._isPartner = true;
                    node.children.unshift(pNode);
                }
            });
        }
        var self2 = this;
        node.children.forEach(function (c) { self2._preprocess(c, visited); });
    };

    FamilyTreeSVG.prototype._countMembers = function (node) {
        var count = 1;
        if (node.partners && Array.isArray(node.partners)) count += node.partners.length;
        if (node.children && Array.isArray(node.children)) {
            var self = this;
            node.children.forEach(function (c) { count += self._countMembers(c); });
        }
        return count;
    };

    FamilyTreeSVG.prototype._countGenerations = function (node) {
        function getMaxDepth(n, depth) {
            var max = depth;
            var kids = n.children || [];
            kids.forEach(function (c) {
                var nextDepth = depth + (c._isPartner ? 0 : 1);
                var d = getMaxDepth(c, nextDepth);
                if (d > max) max = d;
            });
            return max;
        }
        return getMaxDepth(node, 1);
    };

    FamilyTreeSVG.prototype._autoCollapse = function (root) {
        this._collapsed = {};
        var count = this._countMembers(root);
        if (count > 500) {
            var self = this;
            (function tc(node, depth) {
                if (depth >= 2 && node.children && node.children.length > 0) self._collapsed[node.id] = true;
                if (node.children) node.children.forEach(function (c) { tc(c, depth + (c._isPartner ? 0 : 1)); });
            })(root, 0);
        }
    };

    // ═══════════════════════════════════════════════
    //  LAYOUT
    // ═══════════════════════════════════════════════
    FamilyTreeSVG.prototype._pass1 = function (node, gen) {
        node._gen = gen;
        this._nodeMap[node.id] = node;
        var kids = this._collapsed[node.id] ? [] : (node.children || []);
        if (!kids.length) { node._sw = 1; return; }
        var self = this;
        kids.forEach(function (k) { self._pass1(k, gen + 1); });
        var s = 0; kids.forEach(function (k) { s += k._sw; });
        node._sw = s;
    };

    FamilyTreeSVG.prototype._pass2 = function (node, startX, startY, endX, endY, angle, depth) {
        node._sx = startX; node._sy = startY; node._x = endX; node._y = endY;
        node._angle = angle; node._depth = depth;
        var kids = this._collapsed[node.id] ? [] : (node.children || []);
        if (!kids.length) return;
        var depth2 = Math.min(depth + 1, this._SPREAD.length - 1);
        var branchLen = this._BR_LEN[depth2] || 70;
        var totalSW = 0; kids.forEach(function (k) { totalSW += k._sw; });
        var totalSpread = this._SPREAD[depth2];

        var minSp = [0, 140, 100, 82, 65, 52];
        if (kids.length > 0) {
            totalSpread = Math.max(totalSpread, minSp[depth2] || 52);
        }
        if (kids.length < 3) {
            totalSpread = totalSpread * 1.35;
        }

        totalSpread = Math.min(240, totalSpread * Math.max(1, Math.pow(totalSW, 0.28) * 0.72));

        if (depth === 0) {
            totalSpread = Math.min(200, totalSpread);
        }

        var centerAngle = depth === 0 ? angle : angle * 0.62;
        var startAngle = centerAngle - totalSpread / 2;
        var offset = 0;
        var self = this;
        var ROOT = this._ROOT;
        kids.forEach(function (k) {
            var frac = k._sw / totalSW;
            var kidAngle = startAngle + (offset + frac * 0.5) * totalSpread;
            offset += frac;
            if (k._isPartner) kidAngle = angle - 22;
            else kidAngle += (rng(k.id, 'j') - .5) * 8;

            if (!k._isPartner) {
                kidAngle = Math.max(-82, Math.min(82, kidAngle));
            }

            var swMultiplier = Math.max(1, Math.pow(k._sw, 0.28) * 0.72);
            var lenVar = branchLen * (k._isPartner ? 0.32 : (0.88 + rng(k.id, 'l') * 0.26)) * swMultiplier;
            var rad = (kidAngle - 90) * Math.PI / 180;
            var kex = endX + Math.cos(rad) * lenVar;
            var key = endY + Math.sin(rad) * lenVar;

            var limitY = (ROOT && ROOT._y !== undefined ? ROOT._y : endY) + 20;
            if (key > limitY) key = limitY;

            self._pass2(k, endX, endY, kex, key, kidAngle, depth + 1);
        });
    };

    FamilyTreeSVG.prototype._resolveOverlaps = function () {
        var nodes = Object.values(this._nodeMap);
        var iterations = 80;

        var N = nodes.length;
        var R = Math.max(520, Math.min(1200, Math.sqrt(N) * 135));
        var rx = R * 1.6;
        var ry = R * 0.85;
        var canopyCenterX = this._ROOT._x;
        var canopyCenterY = this._ROOT._y - ry * 0.52;
        var LW = this._LW, ROOT = this._ROOT;

        for (var i = 0; i < iterations; i++) {
            var moved = false;
            for (var j = 0; j < nodes.length; j++) {
                for (var k = j + 1; k < nodes.length; k++) {
                    var n1 = nodes[j], n2 = nodes[k];
                    var dx = n1._x - n2._x;
                    var dy = n1._y - n2._y;
                    var d2 = dx * dx + dy * dy;

                    var sc1 = n1._gen === 0 ? 1.5 : n1._gen === 1 ? 1.18 : n1._gen === 2 ? 1.02 : 0.90;
                    var sc2 = n2._gen === 0 ? 1.5 : n2._gen === 1 ? 1.18 : n2._gen === 2 ? 1.02 : 0.90;
                    if (n1._isPartner) sc1 *= 0.85;
                    if (n2._isPartner) sc2 *= 0.85;

                    var r1 = LW * sc1 * 0.65;
                    var r2 = LW * sc2 * 0.65;

                    var isSibling = (n1._sx === n2._sx && n1._sy === n2._sy);
                    var padding = isSibling ? 65 : 35;
                    var minDist = r1 + r2 + padding;

                    if (n1.children && n1.children.some(function (c) { return c.id === n2.id && n2._isPartner; })) minDist = (r1 + r2) * 0.7;
                    if (n2.children && n2.children.some(function (c) { return c.id === n1.id && n1._isPartner; })) minDist = (r1 + r2) * 0.7;

                    if (d2 < minDist * minDist) {
                        var dist = Math.sqrt(d2) || 0.1;
                        var force = (minDist - dist) / dist * 0.35;
                        var ox = dx * force;
                        var oy = dy * force;

                        var m1 = n1._gen === 0 ? 0.01 : 1;
                        var m2 = n2._gen === 0 ? 0.01 : 1;

                        n1._x += ox * m1;
                        n1._y += oy * m1;
                        n2._x -= ox * m2;
                        n2._y -= oy * m2;
                        moved = true;
                    }
                }
            }

            nodes.forEach(function (n) {
                if (n.id !== ROOT.id) {
                    var dx = n._x - canopyCenterX;
                    var dy = n._y - canopyCenterY;
                    var ellipseDist = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
                    if (ellipseDist > 1.0) {
                        var scale = 1.0 / Math.sqrt(ellipseDist);
                        n._x = canopyCenterX + dx * scale;
                        n._y = canopyCenterY + dy * scale;
                        moved = true;
                    }
                }
            });

            nodes.forEach(function (n) {
                if (n.id !== ROOT.id) {
                    var limitY = ROOT._y + 20;
                    if (n._y > limitY) {
                        n._y = limitY;
                        moved = true;
                    }
                }
            });
            if (!moved) break;
        }
    };

    // ═══════════════════════════════════════════════
    //  DRAWING
    // ═══════════════════════════════════════════════
    FamilyTreeSVG.prototype._updateColors = function () {
        this._LC = [];
        for (var i = 0; i < 6; i++) {
            var c = lighter(this._leafColor, i * 0.09);
            var tc = getContrastYIQ(c);
            var bc = tc === '#3a1f13' ? darker(this._leafColor, 0.2) : '#d6a661';
            this._LC.push({ f: c, s: bc, t: tc });
        }
        this._BC = [];
        for (var i = 0; i < 6; i++) this._BC.push(lighter(this._branchColor, i * 0.09));
    };

    FamilyTreeSVG.prototype._drawBg = function (rx, groundY) {
        this._els.gBg.innerHTML = '';
        var groundRx = Math.max(200, Math.min(550, 150 + this._countMembers(this._ROOT) * 4));
        mkSVG('ellipse', { cx: rx, cy: groundY + 14, rx: groundRx, ry: 65, fill: '#d6a661', opacity: '0.4' }, this._els.gBg);
    };

    // ═══════════════════════════════════════════════
    //  TRUNK DRAWING (3 Styles: earth_roots, gnarly, swirling_olive)
    // ═══════════════════════════════════════════════
    FamilyTreeSVG.prototype._drawTrunk = function (rx, groundY, topY) {
        var gTrunk = this._els.gTrunk;
        gTrunk.innerHTML = '';
        var mc = this._countMembers(this._ROOT);
        var ts = Math.max(0.45, Math.min(1.0, mc / 60));
        var bw = Math.round(42 + 48 * ts); // 42-90 base width
        var tw = Math.round(16 + 18 * ts); // 16-34 top width
        var h = groundY - topY;
        var style = this._trunkStyle || 'calligraphic';
        if (style === 'earth_roots') style = 'calligraphic';
        if (style === 'gnarly') style = 'gnarled_veteran';
        if (['calligraphic', 'gnarled_veteran', 'banyan_cathedral', 'dragon_bonsai'].indexOf(style) === -1) style = 'calligraphic';

        var tc = this._trunkColor;
        var outlineCol = getContrastYIQ(tc) === '#3a1f13' ? 'rgba(0,0,0,0.15)' : 'rgba(214,166,97,0.5)';
        var darkBorder = darker(tc, 0.22);
        var steps = 40;

        if (style === 'calligraphic') {
            // ═══════════════════════════════════════════════
            // 1. ELEGANT S-CURVE (Original Classic Trunk)
            // ═══════════════════════════════════════════════
            var leanX = 18;
            var ptsL = [], ptsR = [];

            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var curveOffset = Math.sin(t * Math.PI) * leanX * 0.4 + Math.sin(t * 2 * Math.PI) * 15;
                var currW = tw + (bw - tw) * Math.pow(1 - t, 2.2);
                var smoothWiggle = Math.sin(t * 8 * Math.PI) * 1.5;

                ptsL.push({ x: rx - currW + curveOffset + smoothWiggle, y: groundY - t * h });
                ptsR.push({ x: rx + currW + curveOffset + smoothWiggle, y: groundY - t * h });
            }

            var dL = 'M' + ptsL[0].x.toFixed(1) + ',' + ptsL[0].y.toFixed(1);
            ptsL.forEach(function (p, idx) { if (idx > 0) dL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dR = ' L' + ptsR[ptsR.length - 1].x.toFixed(1) + ',' + ptsR[ptsR.length - 1].y.toFixed(1);
            for (var idx = ptsR.length - 2; idx >= 0; idx--) dR += ' L' + ptsR[idx].x.toFixed(1) + ',' + ptsR[idx].y.toFixed(1);
            var d = dL + dR + ' Z';

            // Base dark bark fill adapting dynamically to trunkColor
            mkSVG('path', { d: d, fill: tc, stroke: 'none' }, gTrunk);

            // Mid-tone core fill
            var midPtsL = [], midPtsR = [];
            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var currW = tw + (bw - tw) * Math.pow(1 - t, 2.2);
                var curveOffset = Math.sin(t * Math.PI) * leanX * 0.4 + Math.sin(t * 2 * Math.PI) * 15;
                var smoothWiggle = Math.sin(t * 8 * Math.PI) * 1.5;

                midPtsL.push({ x: rx - currW * 0.72 + curveOffset + smoothWiggle, y: groundY - t * h });
                midPtsR.push({ x: rx + currW * 0.78 + curveOffset + smoothWiggle, y: groundY - t * h });
            }
            var dMidL = 'M' + midPtsL[0].x.toFixed(1) + ',' + midPtsL[0].y.toFixed(1);
            midPtsL.forEach(function (p, idx) { if (idx > 0) dMidL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dMidR = ' L' + midPtsR[midPtsR.length - 1].x.toFixed(1) + ',' + midPtsR[midPtsR.length - 1].y.toFixed(1);
            for (var idx = midPtsR.length - 2; idx >= 0; idx--) dMidR += ' L' + midPtsR[idx].x.toFixed(1) + ',' + midPtsR[idx].y.toFixed(1);
            mkSVG('path', { d: dMidL + dMidR + ' Z', fill: lighter(tc, 0.12), stroke: 'none' }, gTrunk);

            // Highlight/texture layer
            var hiPtsL = [], hiPtsR = [];
            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var currW = tw + (bw - tw) * Math.pow(1 - t, 2.2);
                var curveOffset = Math.sin(t * Math.PI) * leanX * 0.4 + Math.sin(t * 2 * Math.PI) * 15;
                var smoothWiggle = Math.sin(t * 8 * Math.PI) * 1.5;

                hiPtsL.push({ x: rx - currW * 0.25 + curveOffset + smoothWiggle, y: groundY - t * h });
                hiPtsR.push({ x: rx + currW * 0.45 + curveOffset + smoothWiggle, y: groundY - t * h });
            }
            var dHiL = 'M' + hiPtsL[0].x.toFixed(1) + ',' + hiPtsL[0].y.toFixed(1);
            hiPtsL.forEach(function (p, idx) { if (idx > 0) dHiL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dHiR = ' L' + hiPtsR[hiPtsR.length - 1].x.toFixed(1) + ',' + hiPtsR[hiPtsR.length - 1].y.toFixed(1);
            for (var idx = hiPtsR.length - 2; idx >= 0; idx--) dHiR += ' L' + hiPtsR[idx].x.toFixed(1) + ',' + hiPtsR[idx].y.toFixed(1);
            mkSVG('path', { d: dHiL + dHiR + ' Z', fill: lighter(tc, 0.28), stroke: 'none', opacity: '0.65' }, gTrunk);

            // Subtle natural wood knots
            var knot1Y = groundY - h * 0.38;
            var knot1X = rx + (Math.sin(0.38 * Math.PI) * leanX * 0.4 + Math.sin(0.38 * 2 * Math.PI) * 15) + 3;
            mkSVG('ellipse', { cx: knot1X, cy: knot1Y, rx: 5.5, ry: 4, fill: darker(tc, 0.35), opacity: '0.8' }, gTrunk);
            mkSVG('ellipse', { cx: knot1X + 0.5, cy: knot1Y - 0.5, rx: 3, ry: 2, fill: darker(tc, 0.55) }, gTrunk);

            var knot2Y = groundY - h * 0.68;
            var knot2X = rx + (Math.sin(0.68 * Math.PI) * leanX * 0.4 + Math.sin(0.68 * 2 * Math.PI) * 15) - 2;
            mkSVG('ellipse', { cx: knot2X, cy: knot2Y, rx: 4.5, ry: 3.5, fill: darker(tc, 0.35), opacity: '0.75' }, gTrunk);

            // Main gold highlight outline or dark shade based on trunk contrast
            mkSVG('path', { d: dR.replace(' L', 'M'), fill: 'none', stroke: outlineCol, 'stroke-width': '4.5', 'stroke-linecap': 'round' }, gTrunk);
            // Crisp outer contour outline
            mkSVG('path', { d: d, fill: 'none', stroke: darkBorder, 'stroke-width': '3.5' }, gTrunk);

        } else if (style === 'gnarled_veteran') {
            // ═══════════════════════════════════════════════
            // 2. GNARLED KNOTTED VETERAN (Dramatic Lean + Carved Burl Eye)
            // ═══════════════════════════════════════════════
            var gBW = bw * 1.18;
            var gTW = tw * 1.05;
            var ptsL = [], ptsR = [];
            var knotT = 0.52;
            var knotY = groundY - knotT * h;
            var knotX = rx;

            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var currW = gTW + (gBW - gTW) * Math.pow(1 - t, 1.6);
                var sweep = (Math.sin(t * Math.PI) * 38 - Math.sin(t * 2.0 * Math.PI) * 18) * (1 - Math.pow(t, 2.8));
                if (Math.abs(t - knotT) < 0.05) knotX = rx + sweep + currW * 0.15;

                var knobL = Math.sin(t * 10.0 + 1.2) * 3.5;
                var knobR = Math.cos(t * 8.5 + 0.6) * 4.0;
                if (t < 0.38) {
                    knobL += gBW * 0.75 * Math.pow((0.38 - t) / 0.38, 1.4);
                }

                ptsL.push({ x: rx - currW + sweep - knobL, y: groundY - t * h });
                ptsR.push({ x: rx + currW + sweep + knobR, y: groundY - t * h });
            }

            var dL = 'M' + ptsL[0].x.toFixed(1) + ',' + ptsL[0].y.toFixed(1);
            ptsL.forEach(function (p, idx) { if (idx > 0) dL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dR = ' L' + ptsR[ptsR.length - 1].x.toFixed(1) + ',' + ptsR[ptsR.length - 1].y.toFixed(1);
            for (var idx = ptsR.length - 2; idx >= 0; idx--) dR += ' L' + ptsR[idx].x.toFixed(1) + ',' + ptsR[idx].y.toFixed(1);

            var pL0 = ptsL[0], pR0 = ptsR[0];
            var span = pR0.x - pL0.x;
            var dRoots = ' Q ' + (pR0.x - span * 0.22).toFixed(1) + ' ' + (groundY - 24) + ', ' + (pL0.x + span * 0.48).toFixed(1) + ' ' + (groundY - 10) +
                        ' Q ' + (pL0.x + span * 0.28).toFixed(1) + ' ' + (groundY - 30) + ', ' + pL0.x.toFixed(1) + ' ' + groundY + ' Z';
            var d = dL + dR + dRoots;

            mkSVG('path', { d: d, fill: tc, stroke: 'none' }, gTrunk);

            // Mid-tone core
            var midPtsL = [], midPtsR = [];
            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var currW = gTW + (gBW - gTW) * Math.pow(1 - t, 1.6);
                var sweep = (Math.sin(t * Math.PI) * 38 - Math.sin(t * 2.0 * Math.PI) * 18) * (1 - Math.pow(t, 2.8));
                midPtsL.push({ x: rx - currW * 0.68 + sweep, y: groundY - t * h });
                midPtsR.push({ x: rx + currW * 0.76 + sweep, y: groundY - t * h });
            }
            var dMidL = 'M' + midPtsL[0].x.toFixed(1) + ',' + midPtsL[0].y.toFixed(1);
            midPtsL.forEach(function (p, idx) { if (idx > 0) dMidL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dMidR = ' L' + midPtsR[midPtsR.length - 1].x.toFixed(1) + ',' + midPtsR[midPtsR.length - 1].y.toFixed(1);
            for (var idx = midPtsR.length - 2; idx >= 0; idx--) dMidR += ' L' + midPtsR[idx].x.toFixed(1) + ',' + midPtsR[idx].y.toFixed(1);
            mkSVG('path', { d: dMidL + dMidR + ' Z', fill: lighter(tc, 0.12), stroke: 'none' }, gTrunk);

            // Highlight layer
            var hiPtsL = [], hiPtsR = [];
            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var currW = gTW + (gBW - gTW) * Math.pow(1 - t, 1.6);
                var sweep = (Math.sin(t * Math.PI) * 38 - Math.sin(t * 2.0 * Math.PI) * 18) * (1 - Math.pow(t, 2.8));
                hiPtsL.push({ x: rx - currW * 0.22 + sweep, y: groundY - t * h });
                hiPtsR.push({ x: rx + currW * 0.44 + sweep, y: groundY - t * h });
            }
            var dHiL = 'M' + hiPtsL[0].x.toFixed(1) + ',' + hiPtsL[0].y.toFixed(1);
            hiPtsL.forEach(function (p, idx) { if (idx > 0) dHiL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dHiR = ' L' + hiPtsR[hiPtsR.length - 1].x.toFixed(1) + ',' + hiPtsR[hiPtsR.length - 1].y.toFixed(1);
            for (var idx = hiPtsR.length - 2; idx >= 0; idx--) dHiR += ' L' + hiPtsR[idx].x.toFixed(1) + ',' + hiPtsR[idx].y.toFixed(1);
            mkSVG('path', { d: dHiL + dHiR + ' Z', fill: lighter(tc, 0.28), stroke: 'none', opacity: '0.65' }, gTrunk);

            // Carved knot burl
            mkSVG('ellipse', { cx: knotX, cy: knotY, rx: 11, ry: 8, fill: darker(tc, 0.45), stroke: darkBorder, 'stroke-width': '1.8' }, gTrunk);
            mkSVG('ellipse', { cx: knotX + 1, cy: knotY - 0.8, rx: 6, ry: 4, fill: darker(tc, 0.65), stroke: lighter(tc, 0.22), 'stroke-width': '1', opacity: '0.85' }, gTrunk);

            mkSVG('path', { d: dR.replace(' L', 'M'), fill: 'none', stroke: outlineCol, 'stroke-width': '4.5', 'stroke-linecap': 'round' }, gTrunk);
            mkSVG('path', { d: d, fill: 'none', stroke: darkBorder, 'stroke-width': '3.5' }, gTrunk);

        } else if (style === 'banyan_cathedral') {
            // ═══════════════════════════════════════════════
            // 3. CATHEDRAL BANYAN (Multi-Columnar Pillars & Arched Hollow)
            // ═══════════════════════════════════════════════
            var bBW = bw * 1.35;
            var bTW = tw * 1.25;
            var ptsL = [], ptsR = [];

            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var currW = bTW + (bBW - bTW) * Math.pow(1 - t, 1.9);
                if (t < 0.45) currW += bBW * 0.55 * Math.pow((0.45 - t) / 0.45, 1.5);
                var sweep = Math.sin(t * Math.PI) * 12 * (1 - t);
                var fluteL = Math.sin(t * 8.0) * 2.5;
                var fluteR = Math.cos(t * 8.0) * 2.5;

                ptsL.push({ x: rx - currW + sweep + fluteL, y: groundY - t * h });
                ptsR.push({ x: rx + currW + sweep + fluteR, y: groundY - t * h });
            }

            var dL = 'M' + ptsL[0].x.toFixed(1) + ',' + ptsL[0].y.toFixed(1);
            ptsL.forEach(function (p, idx) { if (idx > 0) dL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dR = ' L' + ptsR[ptsR.length - 1].x.toFixed(1) + ',' + ptsR[ptsR.length - 1].y.toFixed(1);
            for (var idx = ptsR.length - 2; idx >= 0; idx--) dR += ' L' + ptsR[idx].x.toFixed(1) + ',' + ptsR[idx].y.toFixed(1);

            // 3 Arched Cathedral Root Portals
            var pL0 = ptsL[0], pR0 = ptsR[0];
            var span = pR0.x - pL0.x;
            var a1 = pR0.x - span * 0.28;
            var a2 = pR0.x - span * 0.72;
            var dRoots = ' Q ' + (pR0.x - span * 0.12).toFixed(1) + ' ' + (groundY - 26) + ', ' + a1.toFixed(1) + ' ' + groundY +
                        ' Q ' + (rx).toFixed(1) + ' ' + (groundY - 42) + ', ' + a2.toFixed(1) + ' ' + groundY +
                        ' Q ' + (pL0.x + span * 0.12).toFixed(1) + ' ' + (groundY - 26) + ', ' + pL0.x.toFixed(1) + ' ' + groundY + ' Z';
            var d = dL + dR + dRoots;

            mkSVG('path', { d: d, fill: tc, stroke: 'none' }, gTrunk);

            // Mid-tone vertical fluting columns
            var midPtsL = [], midPtsR = [];
            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var currW = bTW + (bBW - bTW) * Math.pow(1 - t, 1.9);
                if (t < 0.45) currW += bBW * 0.40 * Math.pow((0.45 - t) / 0.45, 1.5);
                var sweep = Math.sin(t * Math.PI) * 12 * (1 - t);
                midPtsL.push({ x: rx - currW * 0.68 + sweep, y: groundY - t * h });
                midPtsR.push({ x: rx + currW * 0.75 + sweep, y: groundY - t * h });
            }
            var dMidL = 'M' + midPtsL[0].x.toFixed(1) + ',' + midPtsL[0].y.toFixed(1);
            midPtsL.forEach(function (p, idx) { if (idx > 0) dMidL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dMidR = ' L' + midPtsR[midPtsR.length - 1].x.toFixed(1) + ',' + midPtsR[midPtsR.length - 1].y.toFixed(1);
            for (var idx = midPtsR.length - 2; idx >= 0; idx--) dMidR += ' L' + midPtsR[idx].x.toFixed(1) + ',' + midPtsR[idx].y.toFixed(1);
            mkSVG('path', { d: dMidL + dMidR + ' Z', fill: lighter(tc, 0.12), stroke: 'none' }, gTrunk);

            // Highlight crest ribbons
            var hiPtsL = [], hiPtsR = [];
            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var currW = bTW + (bBW - bTW) * Math.pow(1 - t, 1.9);
                var sweep = Math.sin(t * Math.PI) * 12 * (1 - t);
                hiPtsL.push({ x: rx - currW * 0.20 + sweep, y: groundY - t * h });
                hiPtsR.push({ x: rx + currW * 0.42 + sweep, y: groundY - t * h });
            }
            var dHiL = 'M' + hiPtsL[0].x.toFixed(1) + ',' + hiPtsL[0].y.toFixed(1);
            hiPtsL.forEach(function (p, idx) { if (idx > 0) dHiL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dHiR = ' L' + hiPtsR[hiPtsR.length - 1].x.toFixed(1) + ',' + hiPtsR[hiPtsR.length - 1].y.toFixed(1);
            for (var idx = hiPtsR.length - 2; idx >= 0; idx--) dHiR += ' L' + hiPtsR[idx].x.toFixed(1) + ',' + hiPtsR[idx].y.toFixed(1);
            mkSVG('path', { d: dHiL + dHiR + ' Z', fill: lighter(tc, 0.28), stroke: 'none', opacity: '0.65' }, gTrunk);

            // Cathedral Natural Hollow Window
            var hollowY = groundY - h * 0.35;
            mkSVG('ellipse', { cx: rx + 3, cy: hollowY, rx: 8, ry: 15, fill: darker(tc, 0.55), stroke: darkBorder, 'stroke-width': '2' }, gTrunk);
            mkSVG('ellipse', { cx: rx + 4, cy: hollowY + 2, rx: 4, ry: 9, fill: darker(tc, 0.75), stroke: lighter(tc, 0.15), 'stroke-width': '1', opacity: '0.9' }, gTrunk);

            mkSVG('path', { d: dR.replace(' L', 'M'), fill: 'none', stroke: outlineCol, 'stroke-width': '4.5', 'stroke-linecap': 'round' }, gTrunk);
            mkSVG('path', { d: d, fill: 'none', stroke: darkBorder, 'stroke-width': '3.5' }, gTrunk);

        } else if (style === 'dragon_bonsai') {
            // ═══════════════════════════════════════════════
            // 4. DRAGON COILED BONSAI (Muscular Low Curve & Claw Anchor)
            // ═══════════════════════════════════════════════
            var dBW = bw * 1.25;
            var dTW = tw * 1.10;
            var ptsL = [], ptsR = [];

            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var currW = dTW + (dBW - dTW) * Math.pow(1 - t, 1.7);
                var sweep = (Math.sin(t * 1.3 * Math.PI) * 44 - Math.sin(t * 2.8 * Math.PI) * 16) * (1 - Math.pow(t, 2.5));
                var muscle = Math.sin(t * 7.0) * 3.2;

                var clawL = (t < 0.32) ? dBW * 0.90 * Math.pow((0.32 - t) / 0.32, 1.4) : 0;
                ptsL.push({ x: rx - currW + sweep - clawL + muscle, y: groundY - t * h });
                ptsR.push({ x: rx + currW + sweep + muscle, y: groundY - t * h });
            }

            var dL = 'M' + ptsL[0].x.toFixed(1) + ',' + ptsL[0].y.toFixed(1);
            ptsL.forEach(function (p, idx) { if (idx > 0) dL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dR = ' L' + ptsR[ptsR.length - 1].x.toFixed(1) + ',' + ptsR[ptsR.length - 1].y.toFixed(1);
            for (var idx = ptsR.length - 2; idx >= 0; idx--) dR += ' L' + ptsR[idx].x.toFixed(1) + ',' + ptsR[idx].y.toFixed(1);

            // Claw Root Grip Base
            var pL0 = ptsL[0], pR0 = ptsR[0];
            var span = pR0.x - pL0.x;
            var dRoots = ' Q ' + (pR0.x - span * 0.25).toFixed(1) + ' ' + (groundY - 22) + ', ' + (pL0.x + span * 0.52).toFixed(1) + ' ' + (groundY - 8) +
                        ' Q ' + (pL0.x + span * 0.24).toFixed(1) + ' ' + (groundY - 34) + ', ' + pL0.x.toFixed(1) + ' ' + groundY + ' Z';
            var d = dL + dR + dRoots;

            mkSVG('path', { d: d, fill: tc, stroke: 'none' }, gTrunk);

            // Mid-tone muscular core
            var midPtsL = [], midPtsR = [];
            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var currW = dTW + (dBW - dTW) * Math.pow(1 - t, 1.7);
                var sweep = (Math.sin(t * 1.3 * Math.PI) * 44 - Math.sin(t * 2.8 * Math.PI) * 16) * (1 - Math.pow(t, 2.5));
                midPtsL.push({ x: rx - currW * 0.65 + sweep, y: groundY - t * h });
                midPtsR.push({ x: rx + currW * 0.78 + sweep, y: groundY - t * h });
            }
            var dMidL = 'M' + midPtsL[0].x.toFixed(1) + ',' + midPtsL[0].y.toFixed(1);
            midPtsL.forEach(function (p, idx) { if (idx > 0) dMidL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dMidR = ' L' + midPtsR[midPtsR.length - 1].x.toFixed(1) + ',' + midPtsR[midPtsR.length - 1].y.toFixed(1);
            for (var idx = midPtsR.length - 2; idx >= 0; idx--) dMidR += ' L' + midPtsR[idx].x.toFixed(1) + ',' + midPtsR[idx].y.toFixed(1);
            mkSVG('path', { d: dMidL + dMidR + ' Z', fill: lighter(tc, 0.12), stroke: 'none' }, gTrunk);

            // Highlight sheen
            var hiPtsL = [], hiPtsR = [];
            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var currW = dTW + (dBW - dTW) * Math.pow(1 - t, 1.7);
                var sweep = (Math.sin(t * 1.3 * Math.PI) * 44 - Math.sin(t * 2.8 * Math.PI) * 16) * (1 - Math.pow(t, 2.5));
                hiPtsL.push({ x: rx - currW * 0.22 + sweep, y: groundY - t * h });
                hiPtsR.push({ x: rx + currW * 0.46 + sweep, y: groundY - t * h });
            }
            var dHiL = 'M' + hiPtsL[0].x.toFixed(1) + ',' + hiPtsL[0].y.toFixed(1);
            hiPtsL.forEach(function (p, idx) { if (idx > 0) dHiL += ' L' + p.x.toFixed(1) + ',' + p.y.toFixed(1); });
            var dHiR = ' L' + hiPtsR[hiPtsR.length - 1].x.toFixed(1) + ',' + hiPtsR[hiPtsR.length - 1].y.toFixed(1);
            for (var idx = hiPtsR.length - 2; idx >= 0; idx--) dHiR += ' L' + hiPtsR[idx].x.toFixed(1) + ',' + hiPtsR[idx].y.toFixed(1);
            mkSVG('path', { d: dHiL + dHiR + ' Z', fill: lighter(tc, 0.28), stroke: 'none', opacity: '0.65' }, gTrunk);

            // Bark scales / burls along dragon spine
            var bX1 = rx + (Math.sin(0.42 * 1.3 * Math.PI) * 44 - Math.sin(0.42 * 2.8 * Math.PI) * 16) * (1 - Math.pow(0.42, 2.5));
            var bY1 = groundY - h * 0.42;
            mkSVG('ellipse', { cx: bX1 + 5, cy: bY1, rx: 7, ry: 4.5, fill: darker(tc, 0.4), stroke: darkBorder, 'stroke-width': '1.5' }, gTrunk);

            var bX2 = rx + (Math.sin(0.65 * 1.3 * Math.PI) * 44 - Math.sin(0.65 * 2.8 * Math.PI) * 16) * (1 - Math.pow(0.65, 2.5));
            var bY2 = groundY - h * 0.65;
            mkSVG('ellipse', { cx: bX2 - 4, cy: bY2, rx: 6, ry: 4, fill: darker(tc, 0.4), stroke: darkBorder, 'stroke-width': '1.5' }, gTrunk);

            mkSVG('path', { d: dR.replace(' L', 'M'), fill: 'none', stroke: outlineCol, 'stroke-width': '4.5', 'stroke-linecap': 'round' }, gTrunk);
            mkSVG('path', { d: d, fill: 'none', stroke: darkBorder, 'stroke-width': '3.5' }, gTrunk);
        }
    };

    // ═══════════════════════════════════════════════
    //  BRANCH SEGMENT DRAWING (5 Distinct Styles)
    // ═══════════════════════════════════════════════
    FamilyTreeSVG.prototype._drawSeg = function (x1, y1, x2, y2, depth, nid, isP) {
        var g = Math.min(depth, this._BC.length - 1);
        var bw = Math.max(3, this._BW[g]);
        var dx = x2 - x1, dy = y2 - y1;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var px = -dy / len, py = dx / len;
        var style = this._branchStyle || 'woodcut';
        var ROOT = this._ROOT;
        var gBr = this._els.gBr;

        var sweepFactor = isP ? 0.04 : (0.15 + rng(nid, 'sw') * 0.10);
        var sweep = len * sweepFactor;
        var biasSide = dx < 0 ? 1 : -1;
        var side = biasSide * (0.45 + rng(nid, 'sd') * 0.55);

        // 1. CLASSIC / SMOOTH CALLIGRAPHIC
        if (style === 'classic') {
            var dClassic = 'M ' + x1 + ',' + y1 + ' Q ' + (x1 + dx * 0.5 + px * sweep * side) + ',' + (y1 + dy * 0.5 + py * sweep * side) + ' ' + x2 + ',' + y2;
            mkSVG('path', {
                d: dClassic, fill: 'none',
                stroke: isP ? 'rgba(214,166,97,0.5)' : this._BC[g],
                'stroke-width': isP ? bw * 0.6 : bw,
                'stroke-linecap': 'round'
            }, gBr);
            return;
        }

        // 2. FLOWING WILLOW TENDRIL (Gentle undulating S-curve with soft braided bark)
        if (style === 'willow_tendril') {
            var steps = 10;
            var dWillow = 'M' + x1 + ',' + y1;
            for (var i = 1; i <= steps; i++) {
                var t = i / steps;
                var lx = x1 + dx * t;
                var ly = y1 + dy * t;
                var wave = (Math.sin(t * Math.PI) * 0.75 + Math.sin(t * 2 * Math.PI) * 0.35) * sweep * side;
                var cx = lx + px * wave;
                var cy = ly + py * wave;
                if (cy > ROOT._y + 30) cy = ROOT._y + 30;
                dWillow += ' L' + cx.toFixed(1) + ',' + cy.toFixed(1);
            }
            var baseCol = isP ? 'rgba(214,166,97,0.5)' : this._BC[g];
            var sw = isP ? bw * 0.6 : bw;
            mkSVG('path', { d: dWillow, fill: 'none', stroke: darker(baseCol, 0.25), 'stroke-width': sw + 2.0, 'stroke-linecap': 'round' }, gBr);
            mkSVG('path', { d: dWillow, fill: 'none', stroke: baseCol, 'stroke-width': sw, 'stroke-linecap': 'round' }, gBr);
            mkSVG('path', { d: dWillow, fill: 'none', stroke: lighter(baseCol, 0.22), 'stroke-width': sw * 0.35, 'stroke-linecap': 'round', opacity: '0.8' }, gBr);
            mkSVG('circle', { cx: x1, cy: y1, r: Math.max(3, sw * 0.45), fill: baseCol }, gBr);
            return;
        }

        // 3. FACETED ZEN BONSAI (Crisp sculpted angular bough deflections)
        if (style === 'zen_bonsai') {
            var kneeT = 0.42;
            var kneeX = x1 + dx * kneeT + px * sweep * side * 1.5;
            var kneeY = y1 + dy * kneeT + py * sweep * side * 1.5;
            if (kneeY > ROOT._y + 30) kneeY = ROOT._y + 30;

            var elbowT = 0.75;
            var elbowX = x1 + dx * elbowT - px * sweep * side * 0.4;
            var elbowY = y1 + dy * elbowT - py * sweep * side * 0.4;
            if (elbowY > ROOT._y + 30) elbowY = ROOT._y + 30;

            var dZen = 'M ' + x1 + ',' + y1 + ' L ' + kneeX.toFixed(1) + ',' + kneeY.toFixed(1) + ' L ' + elbowX.toFixed(1) + ',' + elbowY.toFixed(1) + ' L ' + x2 + ',' + y2;
            var baseCol = isP ? 'rgba(214,166,97,0.5)' : this._BC[g];
            var sw = isP ? bw * 0.6 : bw;
            mkSVG('path', { d: dZen, fill: 'none', stroke: darker(baseCol, 0.35), 'stroke-width': sw + 3.0, 'stroke-linecap': 'square', 'stroke-linejoin': 'miter' }, gBr);
            mkSVG('path', { d: dZen, fill: 'none', stroke: baseCol, 'stroke-width': sw, 'stroke-linecap': 'square', 'stroke-linejoin': 'miter' }, gBr);
            mkSVG('path', { d: dZen, fill: 'none', stroke: lighter(baseCol, 0.25), 'stroke-width': sw * 0.38, 'stroke-linecap': 'round', opacity: '0.85' }, gBr);
            mkSVG('circle', { cx: kneeX, cy: kneeY, r: Math.max(2.5, sw * 0.35), fill: darker(baseCol, 0.4) }, gBr);
            mkSVG('circle', { cx: x1, cy: y1, r: Math.max(3, sw * 0.48), fill: baseCol }, gBr);
            return;
        }

        // 2. GNARLED RUSTIC (Knotty Angular Deflection)
        // 3. WOODCUT ORGANIC (Default layered bough with gold sap lines)
        var steps = 8;
        var d = 'M' + x1 + ',' + y1;
        var gnarledMultiplier = (style === 'gnarled') ? 1.6 : 1.0;

        for (var i = 1; i <= steps; i++) {
            var t = i / steps;
            var lx = x1 + dx * t;
            var ly = y1 + dy * t;
            var bow = Math.sin(t * Math.PI) * sweep * side * gnarledMultiplier;
            var wiggle = (rng(nid, 'wg_' + i) - 0.5) * (len * (style === 'gnarled' ? 0.09 : 0.05));
            var disp = bow + wiggle;
            var cx = lx + px * disp;
            var cy = ly + py * disp;
            if (cy > ROOT._y + 30) cy = ROOT._y + 30;
            d += ' L' + cx.toFixed(1) + ',' + cy.toFixed(1);
        }

        // Primary Scaffold Boughs (depth === 0)
        if (depth === 0) {
            var boughW = Math.round(bw * 1.15);
            var trunkBark = this._trunkColor;
            mkSVG('path', { d: d, fill: 'none', stroke: darker(trunkBark, 0.3), 'stroke-width': boughW + 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gBr);
            mkSVG('path', { d: d, fill: 'none', stroke: trunkBark, 'stroke-width': boughW, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gBr);
            mkSVG('path', { d: d, fill: 'none', stroke: lighter(trunkBark, 0.18), 'stroke-width': boughW * 0.48, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: '0.85' }, gBr);
            mkSVG('path', { d: d, fill: 'none', stroke: '#d6a661', 'stroke-width': '1.6', class: 'woodcut-sap-line', opacity: '0.85', 'stroke-linecap': 'round' }, gBr);
            mkSVG('circle', { cx: x1, cy: y1, r: boughW * 0.52, fill: trunkBark }, gBr);
            return;
        }

        // Secondary & Lateral Limbs (depth > 0)
        var baseCol = isP ? 'rgba(214,166,97,0.5)' : this._BC[g];
        var sw = isP ? bw * 0.6 : bw;
        mkSVG('path', { d: d, fill: 'none', stroke: darker(baseCol, 0.25), 'stroke-width': sw + 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gBr);
        mkSVG('path', { d: d, fill: 'none', stroke: baseCol, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gBr);
        if (!isP && sw >= 8) {
            mkSVG('path', { d: d, fill: 'none', stroke: lighter(baseCol, 0.16), 'stroke-width': sw * 0.42, 'stroke-linecap': 'round', opacity: '0.75' }, gBr);
        }
        if (!isP && (depth === 1 || depth === 2)) {
            mkSVG('path', { d: d, fill: 'none', stroke: '#d6a661', 'stroke-width': '1.1', class: 'woodcut-sap-line', opacity: '0.6' }, gBr);
        }
    };

    FamilyTreeSVG.prototype._drawAllBranches = function (node) {
        var self = this;
        var kids = this._collapsed[node.id] ? [] : (node.children || []);
        kids.forEach(function (c) {
            self._drawSeg(node._x, node._y, c._x, c._y, c._depth, c.id, c._isPartner);
            self._drawAllBranches(c);
        });
    };

    FamilyTreeSVG.prototype._splitName = function (n) {
        if (n.length <= 11) return [n];
        var w = n.split(' ');
        return w.length === 1 ? [n.substr(0, 9) + '…'] : [w.slice(0, Math.ceil(w.length / 2)).join(' '), w.slice(Math.ceil(w.length / 2)).join(' ')];
    };

    // ═══════════════════════════════════════════════
    //  LEAF DRAWING (SVG Path & PNG Modes)
    // ═══════════════════════════════════════════════
    FamilyTreeSVG.prototype._drawLeaf = function (node) {
        var self = this;
        var gi = Math.min(node._gen, this._LC.length - 1), col = this._LC[gi];
        if (node._isPartner) {
            var spBg = darker(this._leafColor, 0.15);
            var spTxt = getContrastYIQ(spBg);
            col = { f: spBg, s: spTxt === '#3a1f13' ? darker(this._leafColor, 0.35) : '#d6a661', t: spTxt };
        }
        var sc = node._gen === 0 ? 1.5 : node._gen === 1 ? 1.18 : node._gen === 2 ? 1.02 : 0.90;
        if (node._isPartner) sc *= 0.85;
        var w = this._LW * sc, h = this._LH * sc, cx = node._x, cy = node._y, ang = node._angle || 0;
        var g = mkSVG('g', { 'data-id': node.id, cursor: 'pointer' }, this._els.gLv);
        var gid = 'lg_' + node.id;
        var defs = this._els.svg.querySelector('defs');

        // PNG IMAGE RENDER MODE
        if (this._leafRenderMode === 'png') {
            var pngUrl = (this._leafPngUrls && this._leafPngUrls[this._leafStyle]) || ('assets/leaf_' + this._leafStyle + '.png');
            mkSVG('image', {
                href: pngUrl,
                x: -w * 0.56,
                y: -h * 0.56,
                width: w * 1.12,
                height: h * 1.12,
                preserveAspectRatio: 'xMidYMid meet',
                transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')',
                filter: 'url(#fts-ds-' + this._uid + ')'
            }, g);
        } else {
            // PURE VECTOR SVG MODE
            if (!defs.querySelector('#' + gid)) {
                var lg = mkSVG('linearGradient', { id: gid, x1: '25%', y1: '0%', x2: '78%', y2: '100%' }, defs);
                mkSVG('stop', { offset: '0%', 'stop-color': lighter(col.f, 0.2) }, lg);
                mkSVG('stop', { offset: '50%', 'stop-color': col.f }, lg);
                mkSVG('stop', { offset: '100%', 'stop-color': darker(col.f, 0.1) }, lg);
            }
            mkSVG('path', { d: leafD(0, 0, w, h, this._leafStyle), fill: 'rgba(0,0,0,0.25)', filter: 'url(#fts-ds-' + this._uid + ')', transform: 'translate(' + (cx + 3) + ',' + (cy + 5) + ') rotate(' + ang + ')' }, g);
            mkSVG('path', { d: leafD(0, 0, w, h, this._leafStyle), fill: 'url(#' + gid + ')', stroke: col.s, 'stroke-width': node._isPartner ? '1.5' : '2.5', transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')' }, g);

            // Botanical Gold Veins / Inner Rim Details
            var goldCol = col.s || '#d6a661';
            if (this._leafStyle === 'laurel') {
                var vg = mkSVG('g', { transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')', 'pointer-events': 'none', opacity: '0.65' }, g);
                mkSVG('path', { d: 'M 0,' + (-h * 0.44) + ' L 0,' + (h * 0.44), fill: 'none', stroke: goldCol, 'stroke-width': '1.3', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (-h * 0.18) + ' Q ' + (w * 0.20) + ',' + (-h * 0.26) + ' ' + (w * 0.36) + ',' + (-h * 0.22), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (-h * 0.18) + ' Q ' + (-w * 0.20) + ',' + (-h * 0.26) + ' ' + (-w * 0.36) + ',' + (-h * 0.22), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.16) + ' Q ' + (w * 0.20) + ',' + (h * 0.08) + ' ' + (w * 0.36) + ',' + (h * 0.14), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.16) + ' Q ' + (-w * 0.20) + ',' + (h * 0.08) + ' ' + (-w * 0.36) + ',' + (h * 0.14), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
            } else if (this._leafStyle === 'oval') {
                var vg = mkSVG('g', { transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')', 'pointer-events': 'none', opacity: '0.6' }, g);
                mkSVG('ellipse', { cx: 0, cy: 0, rx: w * 0.38, ry: h * 0.40, fill: 'none', stroke: goldCol, 'stroke-width': '1.1', 'stroke-dasharray': '4 3' }, vg);
            } else if (this._leafStyle === 'oak') {
                var vg = mkSVG('g', { transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')', 'pointer-events': 'none', opacity: '0.65' }, g);
                mkSVG('path', { d: 'M 0,' + (-h * 0.44) + ' L 0,' + (h * 0.44), fill: 'none', stroke: goldCol, 'stroke-width': '1.3', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (-h * 0.22) + ' Q ' + (w * 0.22) + ',' + (-h * 0.28) + ' ' + (w * 0.34) + ',' + (-h * 0.20), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (-h * 0.22) + ' Q ' + (-w * 0.22) + ',' + (-h * 0.28) + ' ' + (-w * 0.34) + ',' + (-h * 0.20), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.10) + ' Q ' + (w * 0.22) + ',' + (h * 0.04) + ' ' + (w * 0.36) + ',' + (h * 0.14), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.10) + ' Q ' + (-w * 0.22) + ',' + (h * 0.04) + ' ' + (-w * 0.36) + ',' + (h * 0.14), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
            } else if (this._leafStyle === 'ginkgo') {
                var vg = mkSVG('g', { transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')', 'pointer-events': 'none', opacity: '0.65' }, g);
                mkSVG('path', { d: 'M 0,' + (-h * 0.44) + ' L 0,' + (h * 0.35), fill: 'none', stroke: goldCol, 'stroke-width': '1.3', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (-h * 0.38) + ' Q ' + (-w * 0.18) + ',' + (-h * 0.05) + ' ' + (-w * 0.35) + ',' + (h * 0.18), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (-h * 0.38) + ' Q ' + (w * 0.18) + ',' + (-h * 0.05) + ' ' + (w * 0.35) + ',' + (h * 0.18), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (-h * 0.38) + ' Q ' + (-w * 0.10) + ',' + (h * 0.05) + ' ' + (-w * 0.20) + ',' + (h * 0.38), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (-h * 0.38) + ' Q ' + (w * 0.10) + ',' + (h * 0.05) + ' ' + (w * 0.20) + ',' + (h * 0.38), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
            } else if (this._leafStyle === 'maple' || this._leafStyle === 'japanese_maple') {
                var vg = mkSVG('g', { transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')', 'pointer-events': 'none', opacity: '0.65' }, g);
                mkSVG('path', { d: 'M 0,' + (h * 0.23) + ' L 0,' + (-h * 0.48), fill: 'none', stroke: goldCol, 'stroke-width': '1.5', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.23) + ' Q ' + (-w * 0.08) + ',-2 ' + (-w * 0.30) + ',' + (-h * 0.37), fill: 'none', stroke: goldCol, 'stroke-width': '1.2', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.23) + ' Q ' + (w * 0.08) + ',-2 ' + (w * 0.30) + ',' + (-h * 0.37), fill: 'none', stroke: goldCol, 'stroke-width': '1.2', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.23) + ' Q ' + (-w * 0.15) + ',' + (h * 0.06) + ' ' + (-w * 0.47) + ',-2', fill: 'none', stroke: goldCol, 'stroke-width': '1.1', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.23) + ' Q ' + (w * 0.15) + ',' + (h * 0.06) + ' ' + (w * 0.47) + ',-2', fill: 'none', stroke: goldCol, 'stroke-width': '1.1', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.23) + ' Q ' + (-w * 0.19) + ',' + (h * 0.24) + ' ' + (-w * 0.35) + ',' + (h * 0.27), fill: 'none', stroke: goldCol, 'stroke-width': '1.0', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.23) + ' Q ' + (w * 0.19) + ',' + (h * 0.24) + ' ' + (w * 0.35) + ',' + (h * 0.27), fill: 'none', stroke: goldCol, 'stroke-width': '1.0', 'stroke-linecap': 'round' }, vg);
            } else if (this._leafStyle === 'birch' || this._leafStyle === 'serrated_birch' || this._leafStyle === 'elm') {
                var vg = mkSVG('g', { transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')', 'pointer-events': 'none', opacity: '0.65' }, g);
                mkSVG('path', { d: 'M 0,' + (h * 0.36) + ' L 0,' + (-h * 0.40), fill: 'none', stroke: goldCol, 'stroke-width': '1.4', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.24) + ' Q ' + (-w * 0.12) + ',' + (h * 0.22) + ' ' + (-w * 0.20) + ',' + (h * 0.23), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.24) + ' Q ' + (w * 0.12) + ',' + (h * 0.22) + ' ' + (w * 0.20) + ',' + (h * 0.23), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.13) + ' Q ' + (-w * 0.15) + ',' + (h * 0.10) + ' ' + (-w * 0.27) + ',' + (h * 0.10), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.13) + ' Q ' + (w * 0.15) + ',' + (h * 0.10) + ' ' + (w * 0.27) + ',' + (h * 0.10), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,0 Q ' + (-w * 0.16) + ',-2 ' + (-w * 0.29) + ',0', fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,0 Q ' + (w * 0.16) + ',-2 ' + (w * 0.29) + ',0', fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (-h * 0.11) + ' Q ' + (-w * 0.15) + ',' + (-h * 0.15) + ' ' + (-w * 0.27) + ',' + (-h * 0.09), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (-h * 0.11) + ' Q ' + (w * 0.15) + ',' + (-h * 0.15) + ' ' + (w * 0.27) + ',' + (-h * 0.09), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
            } else if (this._leafStyle === 'linden' || this._leafStyle === 'cordate_linden' || this._leafStyle === 'cordate') {
                var vg = mkSVG('g', { transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')', 'pointer-events': 'none', opacity: '0.65' }, g);
                mkSVG('path', { d: 'M 0,' + (h * 0.27) + ' L 0,' + (-h * 0.41), fill: 'none', stroke: goldCol, 'stroke-width': '1.4', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.25) + ' Q ' + (-w * 0.16) + ',' + (h * 0.16) + ' ' + (-w * 0.32) + ',' + (h * 0.08), fill: 'none', stroke: goldCol, 'stroke-width': '1.0', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.25) + ' Q ' + (w * 0.16) + ',' + (h * 0.16) + ' ' + (w * 0.32) + ',' + (h * 0.08), fill: 'none', stroke: goldCol, 'stroke-width': '1.0', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.12) + ' Q ' + (-w * 0.19) + ',0 ' + (-w * 0.29) + ',' + (-h * 0.14), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,' + (h * 0.12) + ' Q ' + (w * 0.19) + ',0 ' + (w * 0.29) + ',' + (-h * 0.14), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,-2 Q ' + (-w * 0.14) + ',' + (-h * 0.15) + ' ' + (-w * 0.20) + ',' + (-h * 0.26), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
                mkSVG('path', { d: 'M 0,-2 Q ' + (w * 0.14) + ',' + (-h * 0.15) + ' ' + (w * 0.20) + ',' + (-h * 0.26), fill: 'none', stroke: goldCol, 'stroke-width': '0.9', 'stroke-linecap': 'round' }, vg);
            }
        }

        // Family Member Name Text
        var lines = this._splitName(node.name || node.full_name || 'No Name');
        var fs = (node._gen === 0 ? 13 : 11) * sc, lineH = fs + 2.5;
        var tg = mkSVG('g', { transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')', 'pointer-events': 'none' }, g);
        var totalTH = lines.length * lineH;
        lines.forEach(function (ln, li) {
            var txt = mkSVG('text', {
                x: 0, y: -totalTH / 2 + li * lineH + lineH * .5,
                'text-anchor': 'middle', 'dominant-baseline': 'middle',
                'font-family': 'Georgia,serif', 'font-size': fs, 'font-weight': '700', fill: col.t
            }, tg);
            txt.textContent = ln;
        });

        // Interactive Collapse / Expand Button
        var kids = node.children || [];
        if (kids.length) {
            var rad = (ang - 90) * Math.PI / 180;
            var tipX = cx + Math.cos(rad) * (-h * .52), tipY = cy + Math.sin(rad) * (-h * .52);
            var tg2 = mkSVG('g', { cursor: 'pointer', class: 'collapse-btn' }, g);
            mkSVG('circle', { cx: tipX, cy: tipY, r: 10, fill: '#f9f3e0', stroke: col.s, 'stroke-width': '1.8' }, tg2);
            var bt = mkSVG('text', { x: tipX, y: tipY, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': '12', 'font-weight': '700', fill: '#3a1f13' }, tg2);
            bt.textContent = this._collapsed[node.id] ? '+' : '-';
            tg2.onclick = function (e) { e.stopPropagation(); self._toggleCollapse(node.id); };
        }
        if (!this._collapsed[node.id]) kids.forEach(function (c) { self._drawLeaf(c); });
    };

    FamilyTreeSVG.prototype._drawDecLeaf = function (cx, cy, w, h, ang, gen) {
        var gi = Math.min(gen, this._LC.length - 1);
        var col = this._LC[gi];
        var g = mkSVG('g', { opacity: '0.72' }, this._els.gDeco);
        var gid = 'dec_lg_' + Math.floor(cx) + '_' + Math.floor(cy) + '_' + Math.floor(w);
        var defs = this._els.svg.querySelector('defs');
        if (!defs.querySelector('#' + gid)) {
            var lg = mkSVG('linearGradient', { id: gid, x1: '25%', y1: '0%', x2: '78%', y2: '100%' }, defs);
            mkSVG('stop', { offset: '0%', 'stop-color': lighter(col.f, 0.2) }, lg);
            mkSVG('stop', { offset: '50%', 'stop-color': col.f }, lg);
            mkSVG('stop', { offset: '100%', 'stop-color': darker(col.f, 0.1) }, lg);
        }
        mkSVG('path', { d: leafD(0, 0, w, h, this._leafStyle), fill: 'rgba(0,0,0,0.15)', filter: 'url(#fts-ds-' + this._uid + ')', transform: 'translate(' + (cx + 2) + ',' + (cy + 3) + ') rotate(' + ang + ')' }, g);
        mkSVG('path', { d: leafD(0, 0, w, h, this._leafStyle), fill: 'url(#' + gid + ')', stroke: col.s, 'stroke-width': '1.3', transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')' }, g);
    };

    FamilyTreeSVG.prototype._drawDecorations = function () {
        var gDeco = this._els.gDeco;
        var gBr = this._els.gBr;
        gDeco.innerHTML = '';
        var ROOT = this._ROOT;
        var collapsed = this._collapsed;
        var self = this;
        var branches = [];
        (function collect(node) {
            var kids = collapsed[node.id] ? [] : (node.children || []);
            kids.forEach(function (c) {
                branches.push({ x1: node._x, y1: node._y, x2: c._x, y2: c._y, depth: c._depth, id: c.id, isP: c._isPartner });
                collect(c);
            });
        })(ROOT);

        // Trunk decorations
        var groundY = ROOT._y + self._TRUNK_H;
        var trunkH = groundY - (ROOT._y + self._LH * 0.45);
        for (var i = 0; i < 15; i++) {
            var t = rng('trunk_dec', i);
            var x = ROOT._x + (rng('trunk_dec_x', i) - 0.5) * 60;
            var y = groundY - t * trunkH;
            var size = 10 + rng('trunk_dec_s', i) * 12;
            var ang = rng('trunk_dec_a', i) * 360;
            var col = ['#7d5c48', '#a37f6a', '#5c3d2e'][Math.floor(rng('trunk_dec_c', i) * 3)];
            var gl = mkSVG('g', { transform: 'translate(' + x + ',' + y + ') rotate(' + ang + ')' }, gDeco);
            mkSVG('path', { d: leafD(0, 0, size, size * 1.3, self._leafStyle), fill: col, opacity: '0.4' }, gl);
        }

        // Twigs + sub-branches
        var twigColor = this._branchColor;
        var subTwigColor = darker(this._branchColor, 0.15);
        branches.forEach(function (b) {
            var num = Math.floor(rng(b.id, 'd_n') * 3) + 3;
            if (b.depth <= 2) num += 2;
            var dx = b.x2 - b.x1, dy = b.y2 - b.y1;
            var len = Math.sqrt(dx * dx + dy * dy) || 1;
            var px = -dy / len, py = dx / len;
            var sf = b.isP ? 0.04 : (0.10 + rng(b.id, 'sw') * 0.10);
            var sweep = len * sf;
            var bs = dx < 0 ? 1 : -1;
            var side = bs * (0.55 + rng(b.id, 'sd') * 0.35);
            for (var i = 0; i < num; i++) {
                var t = 0.2 + (i / num) * 0.65;
                var disp = Math.sin(t * Math.PI) * sweep * side;
                var lx = b.x1 + dx * t, ly = b.y1 + dy * t;
                var cx = lx + px * disp, cy = ly + py * disp;
                var dir = (i % 2 === 0 ? 1 : -1);
                var tl = 28 + rng(b.id, 'twig_l' + i) * 30;
                var ta = (rng(b.id, 'twig_a' + i) - 0.5) * 0.6;
                var tx = cx + (px * dir + ta) * tl, ty = cy + (py * dir - Math.abs(ta) * 0.3) * tl;
                if (ty > ROOT._y + 30) ty = ROOT._y + 30;
                mkSVG('line', { x1: cx, y1: cy, x2: tx, y2: ty, stroke: twigColor, 'stroke-width': '1.5', 'stroke-linecap': 'round' }, gBr);
                var scf = b.depth <= 2 ? 1.3 : 1.0;
                var ls = (22 + rng(b.id, 'd_s' + i) * 10) * scf;
                var la = Math.atan2(ty - cy, tx - cx) * 180 / Math.PI + 90;
                self._drawDecLeaf(tx, ty, ls * 0.9, ls * 1.1, la, b.depth);
                if (rng(b.id, 'sub' + i) > 0.45) {
                    var sl = 18 + rng(b.id, 'sub_l' + i) * 20;
                    var sd = rng(b.id, 'sub_d' + i) > 0.5 ? 1 : -1;
                    var sx = tx + (px * sd * 0.7 + (rng(b.id, 'sub_a' + i) - 0.5) * 0.5) * sl;
                    var sy = ty + (py * sd * 0.7 - 0.3) * sl;
                    if (sy > ROOT._y + 30) sy = ROOT._y + 30;
                    mkSVG('line', { x1: tx, y1: ty, x2: sx, y2: sy, stroke: subTwigColor, 'stroke-width': '1', 'stroke-linecap': 'round' }, gBr);
                    var ss = 16 + rng(b.id, 'sub_s' + i) * 8;
                    var sa = Math.atan2(sy - ty, sx - tx) * 180 / Math.PI + 90;
                    self._drawDecLeaf(sx, sy, ss * 0.85, ss * 1.05, sa, Math.min(b.depth + 1, 5));
                }
            }
        });

        // Leaf clusters
        var nm = this._nodeMap;
        Object.values(nm).forEach(function (n) {
            var kids = n.children || [];
            var nc = kids.length === 0 ? 4 : 2;
            var sc = n._gen === 0 ? 1.0 : n._gen === 1 ? 0.85 : n._gen === 2 ? 0.7 : 0.6;
            if (n._isPartner) sc *= 0.8;
            for (var i = 0; i < nc; i++) {
                var ao = -60 + i * (120 / nc) + (rng(n.id, 'cl_a' + i) - 0.5) * 25;
                var rad = (n._angle + ao - 90) * Math.PI / 180;
                var dist = (22 + rng(n.id, 'cl_d' + i) * 14) * sc;
                var lx = n._x + Math.cos(rad) * dist, ly = n._y + Math.sin(rad) * dist;
                if (ly > ROOT._y + 30) ly = ROOT._y + 30;
                var lw = (26 + rng(n.id, 'cl_w' + i) * 10) * sc;
                var lh = (32 + rng(n.id, 'cl_h' + i) * 12) * sc;
                var la = n._angle + ao + (rng(n.id, 'cl_r' + i) - 0.5) * 30;
                self._drawDecLeaf(lx, ly, lw, lh, la, n._gen);
            }
        });

        // Filler leaves
        var allN = Object.values(nm);
        if (allN.length > 1) {
            var nf = Math.max(20, Math.floor(allN.length * 1.5));
            for (var f = 0; f < nf; f++) {
                var si = Math.floor(rng('fill', f) * allN.length);
                var src = allN[si];
                var fx = src._x + (rng('fill_x', f) - 0.5) * 120;
                var fy = src._y + (rng('fill_y', f) - 0.5) * 80;
                if (fy > ROOT._y + 30) fy = ROOT._y + 30;
                var fs = 14 + rng('fill_s', f) * 14;
                var fa = rng('fill_a', f) * 360;
                self._drawDecLeaf(fx, fy, fs, fs * 1.2, fa, Math.min(src._gen + 1, 5));
            }
        }
    };

    // ═══════════════════════════════════════════════
    //  PUBLIC API
    // ═══════════════════════════════════════════════
    FamilyTreeSVG.prototype._toggleCollapse = function (id) {
        this._collapsed[id] = !this._collapsed[id];
        this.render();
    };

    FamilyTreeSVG.prototype.render = function () {
        if (!this._ROOT) return;
        this._updateColors();
        this._nodeMap = {};
        this._els.gBg.innerHTML = '';
        this._els.gTrunk.innerHTML = '';
        this._els.gBr.innerHTML = '';
        this._els.gLv.innerHTML = '';
        var defs = this._els.svg.querySelector('defs');
        defs.querySelectorAll('linearGradient').forEach(function (el) { defs.removeChild(el); });

        this._pass1(this._ROOT, 0);
        var mc = this._countMembers(this._ROOT);
        this._TRUNK_H = Math.max(200, Math.min(520, 140 + mc * 3.5));
        var CX = 700, CY = 1100;
        this._pass2(this._ROOT, CX, CY, CX, CY - this._TRUNK_H, 0, 0);
        this._resolveOverlaps();

        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        var nm = this._nodeMap, LW = this._LW, LH = this._LH;
        Object.keys(nm).forEach(function (id) {
            var n = nm[id];
            x0 = Math.min(x0, n._x - LW); y0 = Math.min(y0, n._y - LH);
            x1 = Math.max(x1, n._x + LW); y1 = Math.max(y1, n._y + LH);
        });
        var PAD = 140, ox = -x0 + PAD, oy = -y0 + PAD;
        Object.keys(nm).forEach(function (id) {
            var n = nm[id]; n._x += ox; n._y += oy; n._sx += ox; n._sy += oy;
        });
        this._SVG_W = (x1 - x0) + PAD * 2;
        this._SVG_H = (y1 - y0) + PAD * 2 + 150;
        this._els.svg.setAttribute('width', this._SVG_W);
        this._els.svg.setAttribute('height', this._SVG_H);
        this._els.svg.style.width = this._SVG_W + 'px';
        this._els.svg.style.height = this._SVG_H + 'px';

        var groundY = this._ROOT._y + this._TRUNK_H;
        this._drawBg(this._ROOT._x, groundY + 50);
        this._drawTrunk(this._ROOT._x, groundY + 25, this._ROOT._y + LH * .45);
        this._drawAllBranches(this._ROOT);
        this._drawDecorations();
        this._drawLeaf(this._ROOT);
    };

    FamilyTreeSVG.prototype.fitView = function (smooth) {
        var isSmooth = smooth === true;
        var sw = (this._els && this._els.stage && this._els.stage.clientWidth) || this._container.clientWidth || 1000;
        var sh = (this._els && this._els.stage && this._els.stage.clientHeight) || this._container.clientHeight || 650;
        if (!this._SVG_W || !this._SVG_H) return;
        var fz = Math.min(sw / this._SVG_W, sh / this._SVG_H) * 0.82;
        this._zoom = fz;
        this._panX = (sw - this._SVG_W * this._zoom) / 2;
        this._panY = (sh - this._SVG_H * this._zoom) / 2 + 30;
        this._applyTransform(isSmooth);
    };

    FamilyTreeSVG.prototype.setColors = function (leafColor, branchColor, trunkColor) {
        if (leafColor) this._leafColor = leafColor;
        if (branchColor) this._branchColor = branchColor;
        if (trunkColor) this._trunkColor = trunkColor;
        this.render();
    };

    FamilyTreeSVG.prototype.setBranchStyle = function (style) {
        if (style) this._branchStyle = style;
        this.render();
    };

    FamilyTreeSVG.prototype.setTrunkStyle = function (style) {
        if (style) this._trunkStyle = style;
        this.render();
    };

    FamilyTreeSVG.prototype.setLeafStyle = function (style) {
        if (style) this._leafStyle = style;
        this.render();
    };

    FamilyTreeSVG.prototype.setLeafRenderMode = function (mode, urls) {
        if (mode) this._leafRenderMode = mode;
        if (urls) Object.assign(this._leafPngUrls, urls);
        this.render();
    };

    FamilyTreeSVG.prototype.setStyles = function (styles) {
        if (!styles) return;
        if (styles.branchStyle) this._branchStyle = styles.branchStyle;
        if (styles.trunkStyle) this._trunkStyle = styles.trunkStyle;
        if (styles.leafStyle) this._leafStyle = styles.leafStyle;
        if (styles.leafRenderMode) this._leafRenderMode = styles.leafRenderMode;
        if (styles.leafPngUrls) Object.assign(this._leafPngUrls, styles.leafPngUrls);
        this.render();
    };

    FamilyTreeSVG.prototype.loadData = function (data) {
        var d = Array.isArray(data) ? data[0] : data;
        this._preprocess(d, new Set());
        this._ROOT = d;
        this._collapsed = {};
        this._autoCollapse(d);
        this.render();
        var self = this;
        setTimeout(function () { self.fitView(); }, 90);
    };

    FamilyTreeSVG.prototype.exportSVG = function () {
        var clone = this._els.svg.cloneNode(true);
        clone.removeAttribute('style');
        clone.removeAttribute('class');
        clone.querySelectorAll('.collapse-btn').forEach(function (el) { el.remove(); });
        var vpClone = clone.querySelector('#vp') || clone.querySelector('g');
        if (vpClone) vpClone.removeAttribute('transform');
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        clone.style.position = 'absolute';
        clone.style.top = '-99999px';
        clone.style.left = '-99999px';
        clone.style.visibility = 'hidden';
        document.body.appendChild(clone);
        var bbox = { x: 0, y: 0, width: this._SVG_W, height: this._SVG_H };
        try {
            if (vpClone && typeof vpClone.getBBox === 'function') {
                var b = vpClone.getBBox();
                if (b && b.width > 20 && b.height > 20 && !isNaN(b.x) && !isNaN(b.y)) {
                    bbox = b;
                }
            }
        } catch (e) {}
        document.body.removeChild(clone);

        var padding = 60;
        var vx = Math.round(bbox.x - padding);
        var vy = Math.round(bbox.y - padding);
        var vw = Math.round(bbox.width + padding * 2);
        var vh = Math.round(bbox.height + padding * 2);
        if (isNaN(vx) || isNaN(vy) || isNaN(vw) || isNaN(vh) || vw <= 0 || vh <= 0) {
            vx = 0; vy = 0; vw = Math.round(this._SVG_W || 3000); vh = Math.round(this._SVG_H || 2200);
        }

        var bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('x', vx);
        bgRect.setAttribute('y', vy);
        bgRect.setAttribute('width', vw);
        bgRect.setAttribute('height', vh);
        bgRect.setAttribute('fill', '#ffffff');
        if (vpClone) {
            clone.insertBefore(bgRect, vpClone);
        } else {
            clone.appendChild(bgRect);
        }

        clone.setAttribute('viewBox', vx + ' ' + vy + ' ' + vw + ' ' + vh);
        clone.setAttribute('width', vw);
        clone.setAttribute('height', vh);
        clone.style.position = '';
        clone.style.top = '';
        clone.style.left = '';
        clone.style.visibility = '';

        var serializer = new XMLSerializer();
        var svgString = serializer.serializeToString(clone);
        if (!svgString.startsWith('<?xml')) {
            svgString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n' + svgString;
        }
        var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        var familyName = 'family';
        if (this._ROOT) {
            familyName = (this._ROOT.family_name || this._ROOT.full_name || this._ROOT.name || 'family').toLowerCase().replace(/\s+/g, '_');
        }
        a.download = familyName + '_tree.svg';
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    FamilyTreeSVG.prototype.destroy = function () {
        if (this._ro) {
            this._ro.disconnect();
            this._ro = null;
        }
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
        window.removeEventListener('touchmove', this._onTouchMove);
        window.removeEventListener('touchend', this._onTouchEnd);
        this._container.innerHTML = '';
        this._container.classList.remove('fts-root');
    };

    // Static utilities
    FamilyTreeSVG.create = function (container, data, options) {
        return new FamilyTreeSVG(container, data, options);
    };
    FamilyTreeSVG.leafD = leafD;
    FamilyTreeSVG.prototype.leafD = leafD;

    return FamilyTreeSVG;
}));
