/**
 * Sanity Studio configuration for TypeScout.
 *
 * This file defines the studio used to manage foundry and typeface records.
 * To run the embedded studio: npx sanity dev (or add a /studio route in Phase 1).
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET
 * to be set in .env.local.
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemaTypes'

export default defineConfig({
  name: 'typescout-studio',
  title: 'TypeScout',

  projectId: 'nycpz0oh',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('TypeScout')
          .items([
            S.listItem()
              .title('Foundries')
              .child(S.documentTypeList('foundry').title('Foundries')),
            S.divider(),
            S.listItem()
              .title('Typefaces')
              .child(S.documentTypeList('typeface').title('Typefaces')),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
