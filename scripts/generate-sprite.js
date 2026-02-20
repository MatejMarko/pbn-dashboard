const fs = require('fs');
const path = require('path');
const svgstore = require('svgstore');

const ICONS_BASE = path.resolve(__dirname, '../projects/design-system/src/assets/icons');
const OUTPUT_DIR = path.resolve(__dirname, '../projects/design-system/src/assets/icons');

// Usage:
//   npm run generate:icons                → generates sprites for all subfolders
//   npm run generate:icons -- 32x32       → icons-32x32.svg
//   npm run generate:icons -- 64x64       → icons-64x64.svg

const arg = process.argv[2];

function generateSprite(folder) {
  const iconsDir = path.join(ICONS_BASE, folder);

  if (!fs.statSync(iconsDir).isDirectory()) {
    return;
  }

  const files = fs
    .readdirSync(iconsDir)
    .filter((file) => file.endsWith('.svg'))
    .sort();

  if (files.length === 0) {
    console.log(`Skipping "${folder}" — no SVG files found`);
    return;
  }

  const sprite = svgstore({
    // Copy `fill` from source <svg> to <symbol>, preserving fill="none"
    copyAttrs: ['fill'],
  });

  for (const file of files) {
    const id = path.basename(file, '.svg');
    const content = fs.readFileSync(path.join(iconsDir, file), 'utf-8');
    sprite.add(id, content);
  }

  const outputPath = path.join(OUTPUT_DIR, `icons-${folder}.svg`);
  fs.writeFileSync(outputPath, sprite.toString());
  console.log(`Generated sprite with ${files.length} icons → icons-${folder}.svg`);
}

if (arg) {
  // Single folder
  if (!fs.existsSync(path.join(ICONS_BASE, arg))) {
    console.error(`Folder not found: ${path.join(ICONS_BASE, arg)}`);
    process.exit(1);
  }
  generateSprite(arg);
} else {
  // All subfolders
  const folders = fs
    .readdirSync(ICONS_BASE)
    .filter((entry) => fs.statSync(path.join(ICONS_BASE, entry)).isDirectory())
    .sort();

  if (folders.length === 0) {
    console.log('No icon folders found');
    process.exit(0);
  }

  for (const folder of folders) {
    generateSprite(folder);
  }
}
