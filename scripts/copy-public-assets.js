import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'apps/web/public');
const faviconDir = path.join(rootDir, 'assets/icons/favicon');
const socialDir = path.join(rootDir, 'assets/social');

fs.mkdirSync(publicDir, { recursive: true });

// Copy all favicons
if (fs.existsSync(faviconDir)) {
  for (const file of fs.readdirSync(faviconDir)) {
    fs.copyFileSync(path.join(faviconDir, file), path.join(publicDir, file));
  }
}

// Copy OG & Twitter images
if (fs.existsSync(socialDir)) {
  for (const file of fs.readdirSync(socialDir)) {
    fs.copyFileSync(path.join(socialDir, file), path.join(publicDir, file));
  }
}

console.log('Public assets copied successfully.');

