const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'frontend-dist');
const outAssetsDir = path.join(outDir, 'assets');
const apiBase = process.env.TALENTVAULT_API_BASE || 'http://localhost:1337/api';

const pageFiles = [
  'TalentVault.html',
  'jobs.html',
  'talent.html',
  'companies.html',
  'insights.html',
  'favicon.png',
];

const assetFiles = ['styles.css', 'app.js'];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
}

ensureDir(outDir);
ensureDir(outAssetsDir);

pageFiles.forEach((file) => {
  const srcPath = path.join(rootDir, file);
  const destPath = path.join(outDir, file);
  copyFile(srcPath, destPath);
});

copyFile(path.join(rootDir, 'TalentVault.html'), path.join(outDir, 'index.html'));

assetFiles.forEach((file) => {
  const srcPath = path.join(rootDir, 'assets', file);
  const destPath = path.join(outAssetsDir, file);
  copyFile(srcPath, destPath);
});

const configContents = `window.TALENTVAULT_CONFIG = {\n  API_BASE: '${apiBase.replace(/'/g, "\\'")}',\n};\n`;
fs.writeFileSync(path.join(outAssetsDir, 'config.js'), configContents);

console.log('Frontend build complete -> frontend-dist');
