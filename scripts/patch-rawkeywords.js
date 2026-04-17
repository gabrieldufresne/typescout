/**
 * patch-rawkeywords.js
 *
 * One-off script to append keywords to existing Sanity typeface documents
 * without replacing the full record.
 *
 * Usage:
 *   node scripts/patch-rawkeywords.js
 */

const { createClient } = require('@sanity/client');
const { readEnvLocal } = require('./env');

const env = readEnvLocal();

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token:     env.SANITY_API_TOKEN,
  useCdn:    false,
});

// ── Patches ───────────────────────────────────────────────────────────────────
// Each entry: { id, add } — keywords to append if not already present.

const PATCHES = [
  // ── Previously run patches (idempotent — safe to re-run) ──────────────────
  {
    id:  'typeface-factor-a',
    add: ['Swiss grotesque', 'Swiss', 'International Style', 'geometric sans tradition'],
  },
  {
    id:  'typeface-neue-freigeist',
    add: ['Swiss grotesque', 'Swiss', 'International Style', 'Grotesk tradition', 'early grotesque'],
  },

  // ── Foundry name patches — enables foundry-name search ───────────────────
  // Rule: every typeface must have the foundry's exact display name in rawKeywords.
  {
    id:  'typeface-grotta',
    add: ['Due Studio', 'Due'],
  },
  {
    id:  'typeface-olivo',
    add: ['Typeverything', 'Type Everything', 'Andrei Robu'],
  },
  {
    id:  'typeface-hermanos',
    add: ['Nuform Type', 'Nuform'],
  },
  {
    id:  'typeface-plaid',
    add: ['Tigh Type'],
  },
  {
    id:  'typeface-plaid-mono',
    add: ['Tigh Type'],
  },
  // typeface-factor-a and typeface-armin-grotesk — add foundry name once confirmed.
  // Check Studio → the linked foundry record's name field.
];

async function main() {
  console.log('\nTypeScout → rawKeywords patch\n');

  for (const patch of PATCHES) {
    // Fetch current rawKeywords
    const doc = await client.fetch(
      `*[_id == $id][0]{ _id, name, rawKeywords }`,
      { id: patch.id }
    );

    if (!doc) {
      console.log(`  ✗ ${patch.id} — not found in Sanity, skipping`);
      continue;
    }

    const existing = doc.rawKeywords || [];
    const toAdd = patch.add.filter(kw => !existing.includes(kw));

    if (toAdd.length === 0) {
      console.log(`  ✓ ${doc.name} — already up to date`);
      continue;
    }

    await client
      .patch(patch.id)
      .setIfMissing({ rawKeywords: [] })
      .append('rawKeywords', toAdd)
      .commit();

    console.log(`  ✓ ${doc.name} — added: ${toAdd.join(', ')}`);
  }

  console.log('\n✓ Done.\n');
}

main().catch(err => {
  console.error('\n✗ Patch failed:', err.message);
  process.exit(1);
});
