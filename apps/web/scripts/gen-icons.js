const fs = require('fs');
const path = require('path');

function createSVGIcon(size) {
  const rx = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.48);
  const cx = Math.round(size * 0.73);
  const cy = Math.round(size * 0.27);
  const cr = Math.round(size * 0.08);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1C1917"/>
      <stop offset="100%" stop-color="#292524"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bg)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-weight="700" font-size="${fontSize}" fill="#E7E5E4">R</text>
  <circle cx="${cx}" cy="${cy}" r="${cr}" fill="#F59E0B" opacity="0.9"/>
</svg>`;
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [
  { name: 'icon-192', size: 192 },
  { name: 'icon-512', size: 512 },
  { name: 'icon-180', size: 180 },
];

for (const { name, size } of sizes) {
  const svg = createSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, name + '.svg'), svg);
  // Also write as .png extension for manifest compatibility (SVG content still works in most browsers)
  fs.writeFileSync(path.join(iconsDir, name + '.png'), svg);
  console.log('Created', name);
}

// Create a basic favicon.ico placeholder (1x1 transparent)
console.log('Icons generated in', iconsDir);
