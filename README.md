# family-tree-svg

<p align="center">
  <img src="./assets/khan_tree_1.svg" alt="Family Tree SVG — Main Showcase" width="100%" />
</p>

Pure organic SVG family tree visualization from JSON data — with leaves, branches, trunk, customizable colors, pan/zoom, and export.

---

### 🎨 Color Themes & Palettes

Dynamic coordinated color presets and full custom hex support:

<table>
  <tr>
    <td align="center" width="50%">
      <b>🌸 Cherry Blossom</b><br/><br/>
      <img src="./assets/khan_tree_2.svg" alt="Cherry Blossom Theme" width="100%"/><br/>
      <code>leaf: #a35c6a</code> &bull; <code>branch: #5e3b25</code> &bull; <code>trunk: #4a2c16</code>
    </td>
    <td align="center" width="50%">
      <b>🍂 Golden Autumn</b><br/><br/>
      <img src="./assets/khan_tree_3.svg" alt="Golden Autumn Theme" width="100%"/><br/>
      <code>leaf: #dfa467</code> &bull; <code>branch: #4d2b1a</code> &bull; <code>trunk: #3d1d11</code>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <b>❄️ Winter Pine</b><br/><br/>
      <img src="./assets/khan_tree_4.svg" alt="Winter Pine Theme" width="100%"/><br/>
      <code>leaf: #2a6b5c</code> &bull; <code>branch: #2d3e50</code> &bull; <code>trunk: #1f2937</code>
    </td>
    <td align="center" width="50%">
      <b>🌅 Sunset Clay</b><br/><br/>
      <img src="./assets/khan_tree_5.svg" alt="Sunset Clay Theme" width="100%"/><br/>
      <code>leaf: #d67b45</code> &bull; <code>branch: #4d2b1a</code> &bull; <code>trunk: #2d1607</code>
    </td>
  </tr>
</table>

---

## Features

- 🌳 **Organic Tree Structure** — Calligraphic trunk, smooth curving branches, and leaf-shaped nodes
- 🎨 **Fully Customizable Colors** — Set custom hex colors for leaves, branches, and trunk
- 🖱️ **Pan & Zoom** — Smooth drag-to-pan, mouse wheel zoom, and mobile touch support
- ➕➖ **Collapse/Expand** — Interactive branch collapse/expand buttons
- 👫 **Partner Support** — Spouses shown as attached companion leaves
- ⚡ **Auto-Collapse** — Large trees (500+ members) automatically collapse deeper branches for clean rendering
- 📤 **SVG Export** — Download your tree as a clean vector SVG
- 🪶 **Zero UI Clutter** — Pure tree component without unnecessary toolbars or widgets

---

## Installation

### Via Script Tag (Direct / CDN)

```html
<script src="path/to/family-tree-svg/src/family-tree-svg.js"></script>
```

### Via npm

```bash
npm install family-tree-svg
```

```javascript
// CommonJS
const FamilyTreeSVG = require('family-tree-svg');

// ES Module
import FamilyTreeSVG from 'family-tree-svg';
```

---

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; }
    #tree-container { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="tree-container"></div>

  <script src="src/family-tree-svg.js"></script>
  <script>
    const familyData = {
      full_name: "Ahmed Khan",
      family_name: "Khan",
      partners: [{ full_name: "Fatima Ahmed", family_name: "Khan" }],
      children: [
        {
          full_name: "Yusuf Ahmed",
          family_name: "Khan",
          partners: [{ full_name: "Ayesha Yusuf", family_name: "Khan" }],
          children: [
            { full_name: "Hamza Yusuf", family_name: "Khan", partners: [], children: [] }
          ]
        }
      ]
    };

    // Initialize the family tree with custom colors
    const tree = FamilyTreeSVG.create('#tree-container', familyData, {
      leafColor: '#17361a',    // Leaf color (e.g. green)
      branchColor: '#3a1f13',  // Branch color (e.g. brown)
      trunkColor: '#2d1607'    // Trunk color (e.g. dark brown)
    });
  </script>
</body>
</html>
```

---

## JSON Data Format

Each person node represents a family member and can have nested children:

```json
{
  "full_name": "Person Name",
  "family_name": "Surname",
  "partners": [
    { "full_name": "Spouse Name", "family_name": "Surname" }
  ],
  "children": [
    {
      "full_name": "Child Name",
      "family_name": "Surname",
      "partners": [],
      "children": []
    }
  ]
}
```

### Properties:
- `full_name` (*string*, required): Name displayed on the leaf.
- `family_name` (*string*, optional): Surname.
- `partners` (*array*, optional): List of partners / spouses.
- `children` (*array*, optional): Array of child node objects (recursive).

You can also pass an array of root nodes for multiple trees: `[ { ... }, { ... } ]`.

---

## API Reference

### `FamilyTreeSVG.create(container, data, options)`

Creates and returns a new `FamilyTreeSVG` instance.

| Parameter | Type | Description |
|---|---|---|
| `container` | `string \| HTMLElement` | CSS selector (e.g. `'#tree'`) or DOM element |
| `data` | `Object \| Array` | Root person object or array of roots |
| `options` | `Object` | Custom options (see below) |

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `leafColor` | `string` | `'#17361a'` | Hex color for the leaves |
| `branchColor` | `string` | `'#3a1f13'` | Hex color for branches |
| `trunkColor` | `string` | `'#2d1607'` | Hex color for trunk |

---

### Instance Methods

#### `tree.fitView()`
Centers and fits the entire tree inside the container viewport.

#### `tree.setColors(leafColor, branchColor, trunkColor)`
Updates the color palette and re-renders the tree dynamically.

```javascript
// Switch to autumn colors
tree.setColors('#dfa467', '#4d2b1a', '#3d1d11');

// Switch to cherry blossom colors
tree.setColors('#a35c6a', '#5e3b25', '#4a2c16');
```

#### `tree.loadData(newData)`
Loads a new JSON dataset, recalculates layout, and fits view.

```javascript
tree.loadData(newFamilyJson);
```

#### `tree.exportSVG()`
Downloads the current tree as a standalone `.svg` vector file.

#### `tree.destroy()`
Cleans up event listeners and empties the container DOM.

---

## Color Recipes

Here are some suggested color combinations:

| Style | Leaf | Branch | Trunk |
|---|---|---|---|
| **Emerald Forest** | `#17361a` | `#3a1f13` | `#2d1607` |
| **Golden Autumn** | `#dfa467` | `#4d2b1a` | `#3d1d11` |
| **Cherry Blossom** | `#a35c6a` | `#5e3b25` | `#4a2c16` |
| **Winter Pine** | `#2a6b5c` | `#2d3e50` | `#1f2937` |
| **Sunset Clay** | `#d67b45` | `#4d2b1a` | `#2d1607` |

---

## License

MIT
