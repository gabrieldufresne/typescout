/**
 * verify-intake.js
 *
 * Post-intake verification against Sanity. Confirms all required fields
 * are populated on the foundry and typeface records without opening a browser.
 *
 * Usage:
 *   npm run verify -- --foundry <slug> --typeface <slug>
 *
 * Example:
 *   npm run verify -- --foundry tightype --typeface habitas
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

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--foundry')  result.foundry  = args[i + 1];
    if (args[i] === '--typeface') result.typeface = args[i + 1];
  }
  return result;
}

function field(label, value) {
  const ok = value !== null && value !== undefined && value !== '' &&
             !(Array.isArray(value) && value.length === 0);
  console.log(`  ${ok ? '✓' : '✗'} ${label}`);
  return ok;
}

async function main() {
  const { foundry, typeface } = parseArgs();

  if (!foundry || !typeface) {
    console.error('Usage: npm run verify -- --foundry <slug> --typeface <slug>');
    process.exit(1);
  }

  console.log('\nTypeScout — intake verification\n');

  let allPass = true;

  // ── Foundry ────────────────────────────────────────────────────────────────
  const foundryDoc = await client.fetch(
    `*[_type == "foundry" && slug.current == $slug][0]{
      _id, name, slug, location, website, description
    }`,
    { slug: foundry }
  );

  if (!foundryDoc) {
    console.log(`✗ FOUNDRY  "${foundry}" not found in Sanity.\n`);
    allPass = false;
  } else {
    console.log(`FOUNDRY  ${foundryDoc.name}  (${foundryDoc._id})`);
    if (!field('name',        foundryDoc.name))        allPass = false;
    if (!field('slug',        foundryDoc.slug?.current)) allPass = false;
    if (!field('location',    foundryDoc.location))    allPass = false;
    if (!field('website',     foundryDoc.website))     allPass = false;
    if (!field('description', foundryDoc.description)) allPass = false;
    console.log('');
  }

  // ── Typeface ───────────────────────────────────────────────────────────────
  const typefaceDoc = await client.fetch(
    `*[_type == "typeface" && slug.current == $slug][0]{
      _id, name, slug, editorialNote, classification,
      personalityTags, useCaseTags, licensing,
      specimenImage{ asset->{ _id } },
      foundry->{ _id, name }
    }`,
    { slug: typeface }
  );

  if (!typefaceDoc) {
    console.log(`✗ TYPEFACE  "${typeface}" not found in Sanity.\n`);
    allPass = false;
  } else {
    console.log(`TYPEFACE  ${typefaceDoc.name}  (${typefaceDoc._id})`);
    if (!field('name',           typefaceDoc.name))          allPass = false;
    if (!field('slug',           typefaceDoc.slug?.current)) allPass = false;
    if (!field('editorialNote',  typefaceDoc.editorialNote)) allPass = false;
    if (!field('specimenImage',  typefaceDoc.specimenImage?.asset?._id)) allPass = false;
    if (!field('classification', typefaceDoc.classification)) allPass = false;
    if (!field('personalityTags', typefaceDoc.personalityTags)) allPass = false;
    if (!field('useCaseTags',    typefaceDoc.useCaseTags))   allPass = false;
    if (!field('licensing',      typefaceDoc.licensing))     allPass = false;
    if (!field('foundry ref',    typefaceDoc.foundry?._id))  allPass = false;

    // Draft check
    const isDraft = typefaceDoc._id.startsWith('drafts.');
    if (isDraft) {
      allPass = false;
      console.log(`\n⚠  DRAFT DETECTED   "${typefaceDoc.name}" exists as an unpublished draft (${typefaceDoc._id})`);
      console.log(`  → This record is invisible to TypeScout search until published.`);
      console.log(`  → Open Sanity Studio and click Publish to make it live.`);
    }

    console.log('');
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  if (allPass) {
    console.log('✓ All checks passed.\n');
  } else {
    console.log('✗ One or more checks failed — review the fields marked above.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('✗ Verify failed:', err.message);
  process.exit(1);
});
