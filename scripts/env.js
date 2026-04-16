/**
 * env.js
 * Shared utility for reading .env.local in Node scripts.
 * Used by push-to-sanity.js and check-sanity.js.
 */

const fs   = require('fs');
const path = require('path');

function readEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local not found — copy .env.example and fill in your credentials.');
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return env;
}

module.exports = { readEnvLocal };
