const fs = require('fs');
const path = require('path');

const iconsDir = path.resolve(__dirname, '../projects/design-system/src/assets/icons/32x32');
const icons = fs.readdirSync(iconsDir)
  .filter(f => f.endsWith('.svg'))
  .map(f => f.replace('.svg', ''));

const content = `
export const SVG_ICONS = ${JSON.stringify(icons)} as const;
export type SVGIcons = typeof SVG_ICONS[number];
`;

fs.writeFileSync('src/icons.ts', content);
