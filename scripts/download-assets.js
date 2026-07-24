#!/usr/bin/env node
/*
Download external asset files listed in assets-manifest.json into public/assets/.
Run: node scripts/download-assets.js
This script is simple and makes no license claims — verify each asset's license before redistribution.
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.resolve(__dirname, '..', 'assets-manifest.json');
const outBase = path.resolve(__dirname, '..', 'public', 'assets');

if (!fs.existsSync(manifestPath)) {
  console.error('assets-manifest.json not found.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function download(url, outPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outPath);
    const req = https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', reject);
  });
}

async function run() {
  console.log('Starting asset download...');
  ensureDir(outBase);

  const categories = Object.keys(manifest);
  for (const cat of categories) {
    const items = manifest[cat];
    const outDir = path.join(outBase, cat);
    ensureDir(outDir);
    for (const item of items) {
      try {
        const url = item.url;
        const urlObj = new URL(url);
        // Derive filename from URL path
        let filename = path.basename(urlObj.pathname);
        if (!filename || filename === '/') {
          filename = (item.name || 'asset').replace(/[^a-z0-9]/gi, '_') + '.json';
        }
        const outPath = path.join(outDir, filename + (urlObj.search ? '' : ''));
        console.log(`Downloading ${item.name} -> ${path.relative(process.cwd(), outPath)}`);
        await download(url, outPath);
      } catch (err) {
        console.error('Failed to download', item.name, item.url, err.message);
      }
    }
  }
  console.log('Done. Check public/assets/* for downloaded files.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
