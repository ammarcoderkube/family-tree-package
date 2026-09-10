/**
 * FamilyTreeSVG — Pure organic SVG family tree from JSON data
 * 
 * Usage:
 *   FamilyTreeSVG.create('#container', familyData, {
 *     leafColor: '#17361a',
 *     branchColor: '#3a1f13',
 *     trunkColor: '#2d1607'
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
    //  MINIMAL CSS (just for pan/zoom cursor)
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
    function leafD(ox, oy, w, h) {
        var hw = w / 2;
        return 'M ' + ox + ',' + (oy - h * .50) +
            ' C ' + (ox + hw * .12) + ',' + (oy - h * .40) + ' ' + (ox + hw) + ',' + (oy - h * .12) + ' ' + (ox + hw * .93) + ',' + (oy + h * .12) +
            ' C ' + (ox + hw * .78) + ',' + (oy + h * .38) + ' ' + (ox + hw * .36) + ',' + (oy + h * .50) + ' ' + ox + ',' + (oy + h * .50) +
            ' C ' + (ox - hw * .36) + ',' + (oy + h * .50) + ' ' + (ox - hw * .78) + ',' + (oy + h * .38) + ' ' + (ox - hw * .93) + ',' + (oy + h * .12) +
            ' C ' + (ox - hw) + ',' + (oy - h * .12) + ' ' + (ox - hw * .12) + ',' + (oy - h * .40) + ' ' + ox + ',' + (oy - h * .50) + ' Z';
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

        this._LC = [];
        this._BC = [];
        this._BW = [38, 26, 17, 10.5, 6.5, 4.0];
        this._TRUNK_H = 480;
        this._BR_LEN = [0, 260, 185, 135, 95, 70];
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
    //  DOM — just the stage + SVG, nothing else
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
    //  EVENTS — pan, zoom, touch only
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
        if (kids.length > 0) totalSpread = Math.max(totalSpread, minSp[depth2] || 52);
        if (kids.length < 3) totalSpread = totalSpread * 1.35;
        totalSpread = Math.min(240, totalSpread * Math.max(1, Math.pow(totalSW, 0.28) * 0.72));
        if (depth === 0) totalSpread = Math.min(200, totalSpread);
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
            if (!k._isPartner) kidAngle = Math.max(-82, Math.min(82, kidAngle));
            var swMul = Math.max(1, Math.min(1.32, Math.pow(k._sw, 0.25) * 0.75));
            var lenVar = branchLen * (k._isPartner ? 0.32 : (0.88 + rng(k.id, 'l') * 0.26)) * swMul;
            var rad = (kidAngle - 90) * Math.PI / 180;
            var kex = endX + Math.cos(rad) * lenVar;
            var key = endY + Math.sin(rad) * lenVar;
            // Gravity sag for long lateral branches
            if (ROOT && ROOT._x !== undefined && depth >= 2) {
                var latDist = Math.abs(kex - ROOT._x);
                if (latDist > 220) {
                    var sag = Math.pow((latDist - 220) / 380, 1.5) * 45;
                    key += sag;
                }
            }
            var limitY = (ROOT && ROOT._y !== undefined ? ROOT._y : endY) + 20;
            if (key > limitY) key = limitY;
            self._pass2(k, endX, endY, kex, key, kidAngle, depth + 1);
        });
    };

    FamilyTreeSVG.prototype._resolveOverlaps = function () {
        var nodes = Object.values(this._nodeMap);
        var N = nodes.length;
        var R = Math.max(480, Math.min(950, Math.sqrt(N) * 115));
        var rx = R * 1.30, ry = R * 0.90;
        var ccx = this._ROOT._x, ccy = this._ROOT._y - ry * 0.52;
        var LW = this._LW, ROOT = this._ROOT;
        for (var it = 0; it < 80; it++) {
            var moved = false;
            for (var j = 0; j < nodes.length; j++) {
                for (var k = j + 1; k < nodes.length; k++) {
                    var n1 = nodes[j], n2 = nodes[k];
                    var dx = n1._x - n2._x, dy = n1._y - n2._y;
                    var d2 = dx * dx + dy * dy;
                    var sc1 = n1._gen === 0 ? 1.5 : n1._gen === 1 ? 1.18 : n1._gen === 2 ? 1.02 : 0.90;
                    var sc2 = n2._gen === 0 ? 1.5 : n2._gen === 1 ? 1.18 : n2._gen === 2 ? 1.02 : 0.90;
                    if (n1._isPartner) sc1 *= 0.85;
                    if (n2._isPartner) sc2 *= 0.85;
                    var r1 = LW * sc1 * 0.65, r2 = LW * sc2 * 0.65;
                    var isSib = (n1._sx === n2._sx && n1._sy === n2._sy);
                    var pad = isSib ? 65 : 35;
                    var minD = r1 + r2 + pad;
                    if (n1.children && n1.children.some(function (c) { return c.id === n2.id && n2._isPartner; })) minD = (r1 + r2) * 0.7;
                    if (n2.children && n2.children.some(function (c) { return c.id === n1.id && n1._isPartner; })) minD = (r1 + r2) * 0.7;
                    if (d2 < minD * minD) {
                        var dist = Math.sqrt(d2) || 0.1;
                        var force = (minD - dist) / dist * 0.35;
                        var ox = dx * force, oy = dy * force;
                        var m1 = n1._gen === 0 ? 0.01 : 1, m2 = n2._gen === 0 ? 0.01 : 1;
                        n1._x += ox * m1; n1._y += oy * m1;
                        n2._x -= ox * m2; n2._y -= oy * m2;
                        moved = true;
                    }
                }
            }
            nodes.forEach(function (n) {
                if (n.id !== ROOT.id) {
                    var dx = n._x - ccx, dy = n._y - ccy;
                    var ed = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
                    if (ed > 1.0) { var s = 1.0 / Math.sqrt(ed); n._x = ccx + dx * s; n._y = ccy + dy * s; moved = true; }
                }
            });
            nodes.forEach(function (n) {
                if (n.id !== ROOT.id) { var lim = ROOT._y + 20; if (n._y > lim) { n._y = lim; moved = true; } }
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

    FamilyTreeSVG.prototype._drawTrunk = function (rx, groundY, topY) {
        var gTrunk = this._els.gTrunk;
        gTrunk.innerHTML = '';
        var mc = this._countMembers(this._ROOT);
        var ts = Math.max(0.45, Math.min(1.0, mc / 60));
        var bw = Math.round(40 + 50 * ts), tw = Math.round(16 + 18 * ts);
        var h = groundY - topY;
        var ptsL = [], ptsR = [], steps = 40;
        var leanX = (rng('trunk', 'lean') - 0.5) * 60;
        var tc = this._trunkColor;

        for (var i = 0; i <= steps; i++) {
            var t = i / steps;
            var co = Math.sin(t * Math.PI) * leanX * 0.4 + Math.sin(t * 2 * Math.PI) * 15;
            var cw = tw + (bw - tw) * Math.pow(1 - t, 2.2);
            var sw = Math.sin(t * 8 * Math.PI) * 1.5;
            ptsL.push({ x: rx - cw + co + sw, y: groundY - t * h });
            ptsR.push({ x: rx + cw + co + sw, y: groundY - t * h });
        }
        var dL = 'M' + ptsL[0].x + ',' + ptsL[0].y; ptsL.forEach(function (p, i) { if (i > 0) dL += ' L' + p.x + ',' + p.y; });
        var dR = ' L' + ptsR[ptsR.length - 1].x + ',' + ptsR[ptsR.length - 1].y;
        for (var i = ptsR.length - 2; i >= 0; i--) dR += ' L' + ptsR[i].x + ',' + ptsR[i].y;
        var d = dL + dR + ' Z';
        mkSVG('path', { d: d, fill: tc, stroke: 'none' }, gTrunk);

        // Mid-tone
        var midL = [], midR = [];
        for (var i = 0; i <= steps; i++) {
            var t = i / steps;
            var cw = tw + (bw - tw) * Math.pow(1 - t, 2.2);
            var co = Math.sin(t * Math.PI) * leanX * 0.4 + Math.sin(t * 2 * Math.PI) * 15;
            var sw = Math.sin(t * 8 * Math.PI) * 1.5;
            midL.push({ x: rx - cw * 0.72 + co + sw, y: groundY - t * h });
            midR.push({ x: rx + cw * 0.78 + co + sw, y: groundY - t * h });
        }
        var dML = 'M' + midL[0].x + ',' + midL[0].y; midL.forEach(function (p, i) { if (i > 0) dML += ' L' + p.x + ',' + p.y; });
        var dMR = ' L' + midR[midR.length - 1].x + ',' + midR[midR.length - 1].y;
        for (var i = midR.length - 2; i >= 0; i--) dMR += ' L' + midR[i].x + ',' + midR[i].y;
        mkSVG('path', { d: dML + dMR + ' Z', fill: lighter(tc, 0.12), stroke: 'none' }, gTrunk);

        // Highlight
        var hiL = [], hiR = [];
        for (var i = 0; i <= steps; i++) {
            var t = i / steps;
            var cw = tw + (bw - tw) * Math.pow(1 - t, 2.2);
            var co = Math.sin(t * Math.PI) * leanX * 0.4 + Math.sin(t * 2 * Math.PI) * 15;
            var sw = Math.sin(t * 8 * Math.PI) * 1.5;
            hiL.push({ x: rx - cw * 0.25 + co + sw, y: groundY - t * h });
            hiR.push({ x: rx + cw * 0.45 + co + sw, y: groundY - t * h });
        }
        var dHL = 'M' + hiL[0].x + ',' + hiL[0].y; hiL.forEach(function (p, i) { if (i > 0) dHL += ' L' + p.x + ',' + p.y; });
        var dHR = ' L' + hiR[hiR.length - 1].x + ',' + hiR[hiR.length - 1].y;
        for (var i = hiR.length - 2; i >= 0; i--) dHR += ' L' + hiR[i].x + ',' + hiR[i].y;
        mkSVG('path', { d: dHL + dHR + ' Z', fill: lighter(tc, 0.28), stroke: 'none', opacity: '0.65' }, gTrunk);

        var outCol = getContrastYIQ(tc) === '#3a1f13' ? 'rgba(0,0,0,0.15)' : 'rgba(214,166,97,0.5)';
        mkSVG('path', { d: dR, fill: 'none', stroke: outCol, 'stroke-width': '4.5', 'stroke-linecap': 'round' }, gTrunk);
        mkSVG('path', { d: d, fill: 'none', stroke: darker(tc, 0.2), 'stroke-width': '3.5' }, gTrunk);
    };

    FamilyTreeSVG.prototype._drawSeg = function (x1, y1, x2, y2, depth, nid, isP) {
        var g = Math.min(depth, this._BC.length - 1);
        var bw = Math.max(2, this._BW[g]);
        var dx = x2 - x1, dy = y2 - y1;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var px = -dy / len, py = dx / len;
        var sf = isP ? 0.05 : (0.16 + rng(nid, 'sw') * 0.12);
        var sweep = len * sf;
        var bs = dx < 0 ? 1 : -1;
        var side = bs * (0.45 + rng(nid, 'sd') * 0.55);
        var d = 'M' + x1 + ',' + y1;
        var ROOT = this._ROOT;
        var steps = 12;
        for (var i = 1; i <= steps; i++) {
            var t = i / steps;
            var lx = x1 + dx * t, ly = y1 + dy * t;
            var bow = Math.sin(t * Math.PI) * sweep * side;
            var grav = Math.sin(t * Math.PI) * (len * 0.05);
            var wig = i < steps ? (rng(nid, 'wg_' + i) - 0.5) * (len * 0.045) : 0;
            var cx = lx + px * (bow + wig), cy = ly + py * (bow + wig) + grav;
            if (cy > ROOT._y + 30) cy = ROOT._y + 30;
            d += ' L' + cx + ',' + cy;
        }
        mkSVG('path', {
            d: d, fill: 'none',
            stroke: isP ? 'rgba(214,166,97,0.5)' : this._BC[g],
            'stroke-width': isP ? bw * 0.6 : bw,
            'stroke-linecap': 'round', 'stroke-linejoin': 'round'
        }, this._els.gBr);
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
        if (!defs.querySelector('#' + gid)) {
            var lg = mkSVG('linearGradient', { id: gid, x1: '25%', y1: '0%', x2: '78%', y2: '100%' }, defs);
            mkSVG('stop', { offset: '0%', 'stop-color': lighter(col.f, 0.2) }, lg);
            mkSVG('stop', { offset: '50%', 'stop-color': col.f }, lg);
            mkSVG('stop', { offset: '100%', 'stop-color': darker(col.f, 0.1) }, lg);
        }
        mkSVG('path', { d: leafD(0, 0, w, h), fill: 'rgba(0,0,0,0.25)', filter: 'url(#fts-ds-' + this._uid + ')', transform: 'translate(' + (cx + 3) + ',' + (cy + 5) + ') rotate(' + ang + ')' }, g);
        mkSVG('path', { d: leafD(0, 0, w, h), fill: 'url(#' + gid + ')', stroke: col.s, 'stroke-width': node._isPartner ? '1.5' : '2.5', transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')' }, g);
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
        mkSVG('path', { d: leafD(0, 0, w, h), fill: 'rgba(0,0,0,0.15)', filter: 'url(#fts-ds-' + this._uid + ')', transform: 'translate(' + (cx + 2) + ',' + (cy + 3) + ') rotate(' + ang + ')' }, g);
        mkSVG('path', { d: leafD(0, 0, w, h), fill: 'url(#' + gid + ')', stroke: col.s, 'stroke-width': '1.3', transform: 'translate(' + cx + ',' + cy + ') rotate(' + ang + ')' }, g);
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
            mkSVG('path', { d: leafD(0, 0, size, size * 1.3), fill: col, opacity: '0.4' }, gl);
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
        this._panY = (sh - this._SVG_H * this._zoom) / 2;
        this._applyTransform(isSmooth);
    };

    FamilyTreeSVG.prototype.setColors = function (leafColor, branchColor, trunkColor) {
        if (leafColor) this._leafColor = leafColor;
        if (branchColor) this._branchColor = branchColor;
        if (trunkColor) this._trunkColor = trunkColor;
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
        var vpClone = clone.children[0]?.children[1] ? clone.children[0] : clone.querySelector('g');
        // Remove bg
        if (vpClone && vpClone.children[0]) vpClone.children[0].remove();
        clone.querySelectorAll('.collapse-btn').forEach(function (el) { el.remove(); });
        if (vpClone) vpClone.removeAttribute('transform');
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.style.position = 'absolute'; clone.style.top = '-9999px'; clone.style.left = '-9999px'; clone.style.visibility = 'hidden';
        document.body.appendChild(clone);
        var bbox = { x: 0, y: 0, width: this._SVG_W, height: this._SVG_H };
        try { bbox = vpClone.getBBox(); } catch (e) {}
        document.body.removeChild(clone);
        var p = 40;
        var vx = bbox.x - p, vy = bbox.y - p, vw = bbox.width + p * 2, vh = bbox.height + p * 2;
        if (isNaN(vx) || vw <= 0) { vx = 0; vy = 0; vw = this._SVG_W; vh = this._SVG_H; }
        clone.setAttribute('viewBox', vx + ' ' + vy + ' ' + vw + ' ' + vh);
        clone.setAttribute('width', vw); clone.setAttribute('height', vh);
        clone.style.position = ''; clone.style.top = ''; clone.style.left = ''; clone.style.visibility = '';
        var s = new XMLSerializer().serializeToString(clone);
        if (!s.startsWith('<?xml')) s = '<?xml version="1.0" standalone="no"?>\r\n' + s;
        var blob = new Blob([s], { type: 'image/svg+xml;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.download = ((this._ROOT.family_name || this._ROOT.full_name || 'family') + '_tree.svg').toLowerCase().replace(/\s+/g, '_');
        a.href = url; document.body.appendChild(a); a.click(); document.body.removeChild(a);
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

    // Static factory
    FamilyTreeSVG.create = function (container, data, options) {
        return new FamilyTreeSVG(container, data, options);
    };

    return FamilyTreeSVG;
}));
