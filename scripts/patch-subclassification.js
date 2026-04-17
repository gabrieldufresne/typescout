/**
 * patch-subclassification.js
 *
 * Trims subClassification values to 3 words max.
 * Prints old → new before committing each change.
 *
 * Usage:
 *   node scripts/patch-subclassification.js
 */

const { createClient } = require('@sanity/client');
const { readEnvLocal } = require('./env');

const env = readEnvLocal();

const client = createClient({
  projectId:  env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:    env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token:      env.SANITY_API_TOKEN,
  useCdn:     false,
});

const PATCHES = [
  {
    id:  'typeface-lorne-serif',
    sub: 'Humanist Calligraphic Serif',
  },
  {
    id:  'typeface-superscotch',
    sub: 'Scotch Roman',
  },
  {
    id:  'typeface-superscotch-display',
    sub: 'Display Scotch Roman',
  },
  {
    id:  'typeface-plaid',
    sub: 'Geometric Sans',
  },
];

async function main() {
  console.log('\nTypeScout → subClassification patch\n');

  for (const patch of PATCHES) {
    const doc = await client.fetch(
      `*[_id == $id][0]{ _id, name, subClassification }`,
      { id: patch.id }
    );

    if (!doc) {
      console.log(`  ✗ ${patch.id} — not found, skipping`);
      continue;
    }

    console.log(`  ${doc.name}`);
    console.log(`    old: ${doc.subClassification}`);
    console.log(`    new: ${patch.sub}`);

    await client
      .patch(patch.id)
      .set({ subClassification: patch.sub })
      .commit();

    console.log(`    ✓ patched\n`);
  }

  console.log('✓ Done.\n');
}

main().catch(err => {
  console.error('\n✗ Patch failed:', err.message);
  process.exit(1);
});
