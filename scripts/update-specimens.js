/**
 * update-specimens.js
 *
 * Re-uploads local specimen files and patches only the specimenImage /
 * specimenImageHeavy fields on existing Sanity records. All other fields
 * are left untouched.
 *
 * Usage:
 *   node scripts/update-specimens.js
 */

const { createClient } = require('@sanity/client');
const fs   = require('fs');
const path = require('path');
const { readEnvLocal } = require('./env');

const env = readEnvLocal();

const client = createClient({
  projectId:  env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:    env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token:      env.SANITY_API_TOKEN,
  useCdn:     false,
});

// Map of typeface _id → { specimenFile, specimenHeavyFile }
const SPECIMENS = [
  { id: 'typeface-ramboia',                 file: 'r-typography_ramboia_specimen.jpg',                  heavy: 'r-typography_ramboia_specimen_heavy.jpg' },
  { id: 'typeface-gliko-modern',            file: 'r-typography_gliko-modern_specimen.jpg',             heavy: 'r-typography_gliko-modern_specimen_heavy.jpg' },
  { id: 'typeface-gliko-modern-narrow',     file: 'r-typography_gliko-modern-narrow_specimen.jpg',      heavy: 'r-typography_gliko-modern-narrow_specimen_heavy.jpg' },
  { id: 'typeface-gliko-modern-condensed',  file: 'r-typography_gliko-modern-condensed_specimen.jpg',   heavy: 'r-typography_gliko-modern-condensed_specimen_heavy.jpg' },
  { id: 'typeface-flecha-s',                file: 'r-typography_flecha-s_specimen.jpg',                 heavy: 'r-typography_flecha-s_specimen_heavy.jpg' },
  { id: 'typeface-flecha-m',                file: 'r-typography_flecha-m_specimen.jpg',                 heavy: 'r-typography_flecha-m_specimen_heavy.jpg' },
  { id: 'typeface-flecha-l',                file: 'r-typography_flecha-l_specimen.jpg',                 heavy: 'r-typography_flecha-l_specimen_heavy.jpg' },
  { id: 'typeface-flecha-bronzea',          file: 'r-typography_flecha-bronzea_specimen.jpg',           heavy: 'r-typography_flecha-bronzea_specimen_heavy.jpg' },
  { id: 'typeface-flecha-variable',         file: 'r-typography_flecha-variable_specimen.jpg',          heavy: 'r-typography_flecha-variable_specimen_heavy.jpg' },
];

async function upload(filename) {
  const filePath = path.join(process.cwd(), 'specimens', filename);
  if (!fs.existsSync(filePath)) throw new Error(`Missing: specimens/${filename}`);
  process.stdout.write(`  → ${filename}… `);
  const asset = await client.assets.upload('image', fs.createReadStream(filePath), {
    filename,
    contentType: 'image/jpeg',
  });
  console.log(`✓ ${asset._id}`);
  return asset._id;
}

function ref(assetId) {
  return { _type: 'image', asset: { _type: 'reference', _ref: assetId } };
}

async function main() {
  console.log('\nTypeScout — specimen image update\n');

  for (const entry of SPECIMENS) {
    console.log(`\n${entry.id}`);
    const assetId = await upload(entry.file);
    const patch = { specimenImage: ref(assetId) };

    if (entry.heavy) {
      const heavyId = await upload(entry.heavy);
      patch.specimenImageHeavy = ref(heavyId);
    }

    await client.patch(entry.id).set(patch).commit();
    console.log(`  ✓ patched`);
  }

  console.log('\n✓ All specimens updated in Sanity.\n');
}

main().catch(err => {
  console.error('\n✗ Failed:', err.message);
  process.exit(1);
});
