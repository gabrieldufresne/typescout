/**
 * audit-subclassification.js
 *
 * Fetches all typeface documents and prints _id, name, and subClassification.
 * Flags any value exceeding 3 words.
 *
 * Usage:
 *   node scripts/audit-subclassification.js
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

async function main() {
  const docs = await client.fetch(
    `*[_type == "typeface"] | order(name asc) { _id, name, subClassification }`
  );

  console.log('\nTypeScout — subClassification audit\n');
  console.log(`${'ID'.padEnd(36)}  ${'Name'.padEnd(28)}  Words  subClassification`);
  console.log('─'.repeat(100));

  let flagged = 0;
  for (const doc of docs) {
    const val = doc.subClassification || '—';
    const words = doc.subClassification ? doc.subClassification.trim().split(/\s+/).length : 0;
    const flag = words > 3 ? ' ⚠' : '';
    console.log(`${doc._id.padEnd(36)}  ${doc.name.padEnd(28)}  ${String(words).padEnd(5)}  ${val}${flag}`);
    if (words > 3) flagged++;
  }

  console.log('─'.repeat(100));
  console.log(`\n${docs.length} records total · ${flagged} exceed 3 words\n`);
}

main().catch(err => {
  console.error('\n✗ Audit failed:', err.message);
  process.exit(1);
});
