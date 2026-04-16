/**
 * Foundry document schema.
 * Represents a type foundry — the publisher/creator of typefaces.
 * Matches PRD Section 07 exactly.
 */

import { defineType, defineField } from 'sanity'

export const foundry = defineType({
  name: 'foundry',
  title: 'Foundry',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      description: 'City, Country — e.g. "Wellington, New Zealand"',
      type: 'string',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Shown on typeface detail pages. 2–4 sentences.',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'foundryType',
      title: 'Foundry Type',
      type: 'string',
      options: {
        list: [
          { title: 'Independent', value: 'independent' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Open Source', value: 'open-source' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'location',
    },
  },
})
