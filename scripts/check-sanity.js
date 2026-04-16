/**
 * check-sanity.js
 *
 * Quick duplicate check before starting an intake session.
 * Queries Sanity for an existing foundry and/or typeface by slug.
 *
 * Usage:
 *   npm run check -- --foundry <slug>
 *   npm run check -- --foundry <slug> --typeface <slug>
 *
 * Examples:
 *   npm run check -- --foundry klim
 *   npm run check -- --foundry sharp-type --typeface hauss
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

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--foundry')  result.foundry  = args[i + 1];
    if (args[i] === '--typeface') result.typeface = args[i + 1];
  }
  return result;
}

async function main() {
  const { foundry, typeface } = parseArgs();

  if (!foundry) {
    console.error('Usage: npm run check -- --foundry <slug> [--typeface <slug>]');
    process.exit(1);
  }

  console.log('\nTypeScout — Sanity duplicate check\n');

  // Check foundry
  const foundryDoc = await client.fetch(
    `*[_type == "foundry" && slug.current == $slug][0]{ _id, name, slug }`,
    { slug: foundry }
  );

  if (foundryDoc) {
    console.log(`✓ FOUNDRY EXISTS   "${foundryDoc.name}" (${foundryDoc._id})`);
    console.log(`  → Use _id "${foundryDoc._id}" as the foundry reference. Skip foundry intake.`);
  } else {
    console.log(`✗ Foundry not found — "${foundry}" is new, proceed with full intake.`);
  }

  // Check typeface (optional)
  if (typeface) {
    const typefaceDoc = await client.fetch(
      `*[_type == "typeface" && slug.current == $slug][0]{ _id, name, slug, foundry->{ name } }`,
      { slug: typeface }
    );

    if (typefaceDoc) {
      console.log(`\n⚠  TYPEFACE EXISTS  "${typefaceDoc.name}" from ${typefaceDoc.foundry?.name} (${typefaceDoc._id})`);
      console.log(`  → Stop. Confirm this is a different typeface before proceeding.`);
    } else {
      console.log(`\n✓ Typeface "${typeface}" is new — clear to proceed.`);
    }
  }

  console.log('');
}

main().catch((err) => {
  console.error('✗ Check failed:', err.message);
  process.exit(1);
});
