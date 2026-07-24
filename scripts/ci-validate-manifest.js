// scripts/ci-validate-manifest.js
// Validates assets-manifest.json entries and checks remote URLs for size limits.

import fs from 'fs';
import { promisify } from 'util';
import http from 'http';
import https from 'https';
import { URL } from 'url';

const readFile = promisify(fs.readFile);
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

function headSize(url) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(url);
      const get = u.protocol === 'https:' ? https.get : http.get;
      const req = get(url, { method: 'HEAD' }, (res) => {
        const len = parseInt(res.headers['content-length'] || '0', 10);
        resolve(len);
      });
      req.on('error', reject);
      req.setTimeout(15000, () => {
        req.abort();
        resolve(0);
      });
    } catch (err) {
      resolve(0);
    }
  });
}

async function run() {
  const raw = await readFile('assets-manifest.json', 'utf-8');
  const manifest = JSON.parse(raw);
  const categories = Object.keys(manifest);
  let ok = true;
  for (const cat of categories) {
    for (const item of manifest[cat]) {
      if (!item.url) {
        console.error(`Missing url for item in ${cat}: ${JSON.stringify(item)}`);
        ok = false;
      }
      if (!item.license_url) {
        console.error(`Missing license_url for ${item.name} in ${cat}`);
        ok = false;
      }
      if (item.url) {
        const size = await headSize(item.url);
        if (size > MAX_BYTES) {
          console.error(`Item ${item.name} is too large (${size} bytes): ${item.url}`);
          ok = false;
        }
      }
    }
  }
  if (!ok) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(2);
});
