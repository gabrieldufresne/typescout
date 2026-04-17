/**
 * Typeface document schema.
 * The core content unit of TypeScout — one record per typeface family.
 * Matches PRD Section 07 exactly, including all array fields, boolean fields,
 * and the rawKeywords parking-lot field.
 */

import { defineType, defineField } from 'sanity'
import {
  CLASSIFICATION,
  PERSONALITY_TAGS,
  USE_CASE_TAGS,
  ERA_TAGS,
  WEIGHT_RANGE,
} from '../../lib/taxonomy'

export const typeface = defineType({
  name: 'typeface',
  title: 'Typeface',
  type: 'document',
  groups: [
    { name: 'core', title: 'Core' },
    { name: 'classification', title: 'Classification & Tags' },
    { name: 'specimens', title: 'Specimens' },
    { name: 'licensing', title: 'Licensing' },
    { name: 'meta', title: 'Meta' },
  ],
  fields: [
    // ── Core ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Typeface Name',
      type: 'string',
      group: 'core',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'core',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'foundry',
      title: 'Foundry',
      type: 'reference',
      group: 'core',
      to: [{ type: 'foundry' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'editorialNote',
      title: 'Editorial Note',
      description: '1–3 sentences of curated context. Written or reviewed by a human. Also feeds rawKeywords.',
      type: 'text',
      rows: 3,
      group: 'core',
    }),
    defineField({
      name: 'typefaceURL',
      title: 'Typeface Page URL',
      description: 'The foundry\'s landing page for this typeface — the URL used to trigger intake.',
      type: 'url',
      group: 'core',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    }),

    // ── Specimens ─────────────────────────────────────────────────────────────
    defineField({
      name: 'specimenImage',
      title: 'Specimen Image (Regular)',
      description: 'Regular weight (400). Format: foundry-name_typeface-name_specimen.jpg',
      type: 'image',
      group: 'specimens',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'specimenImageHeavy',
      title: 'Specimen Image (Heavy — optional)',
      description: 'Heaviest weight (Black/ExtraBold). Only if meaningfully different. Format: …_specimen_heavy.jpg',
      type: 'image',
      group: 'specimens',
      options: { hotspot: true },
    }),

    // ── Classification & Tags ─────────────────────────────────────────────────
    defineField({
      name: 'classification',
      title: 'Classification',
      type: 'array',
      group: 'classification',
      of: [{ type: 'string' }],
      options: { list: CLASSIFICATION.map((v) => ({ title: v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, ' '), value: v })) },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'subClassification',
      title: 'Sub-Classification',
      description: '3 words max — e.g. "Humanist Grotesque", "Transitional Serif"',
      type: 'string',
      group: 'classification',
      validation: (Rule) => Rule.custom((val: string | undefined) => {
        if (!val) return true
        return val.trim().split(/\s+/).length <= 3 || 'Sub-classification must be 3 words or fewer'
      }),
    }),
    defineField({
      name: 'personalityTags',
      title: 'Personality Tags',
      type: 'array',
      group: 'classification',
      of: [{ type: 'string' }],
      options: { list: PERSONALITY_TAGS.map((t) => ({ title: t, value: t })) },
    }),
    defineField({
      name: 'useCaseTags',
      title: 'Use Case Tags',
      type: 'array',
      group: 'classification',
      of: [{ type: 'string' }],
      options: { list: USE_CASE_TAGS.map((t) => ({ title: t, value: t })) },
    }),
    defineField({
      name: 'era',
      title: 'Era / Reference',
      type: 'array',
      group: 'classification',
      of: [{ type: 'string' }],
      options: { list: ERA_TAGS.map((t) => ({ title: t, value: t })) },
    }),

    // ── Visual Properties ─────────────────────────────────────────────────────
    defineField({
      name: 'weightRange',
      title: 'Available Weights',
      type: 'array',
      group: 'classification',
      of: [{ type: 'string' }],
      options: { list: WEIGHT_RANGE.map((v) => ({ title: v.charAt(0).toUpperCase() + v.slice(1), value: v })) },
    }),
    defineField({
      name: 'width',
      title: 'Width',
      type: 'string',
      group: 'classification',
      options: {
        list: [
          { title: 'Condensed', value: 'condensed' },
          { title: 'Narrow', value: 'narrow' },
          { title: 'Normal', value: 'normal' },
          { title: 'Wide', value: 'wide' },
          { title: 'Extended', value: 'extended' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'contrast',
      title: 'Contrast',
      type: 'array',
      group: 'classification',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
          { title: 'Monolinear', value: 'monolinear' },
        ],
      },
    }),
    defineField({
      name: 'xHeight',
      title: 'x-Height',
      type: 'string',
      group: 'classification',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'Tall', value: 'tall' },
        ],
        layout: 'radio',
      },
    }),

    // ── Licensing ─────────────────────────────────────────────────────────────
    defineField({
      name: 'licensing',
      title: 'Licensing',
      description: 'Free = free/open-source/Google Fonts. Paid = purchase or subscription required.',
      type: 'string',
      group: 'licensing',
      options: {
        list: [
          { title: 'Free', value: 'free' },
          { title: 'Paid', value: 'paid' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'platforms',
      title: 'Platforms',
      type: 'string',
      group: 'licensing',
      options: {
        list: [
          { title: 'Google Fonts', value: 'google-fonts' },
          { title: 'Adobe Fonts', value: 'adobe-fonts' },
          { title: 'Both', value: 'both' },
          { title: 'Neither', value: 'neither' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'variableFont',
      title: 'Variable Font',
      type: 'boolean',
      group: 'licensing',
      initialValue: false,
    }),
    defineField({
      name: 'hasItalics',
      title: 'Has Italics',
      type: 'boolean',
      group: 'licensing',
      initialValue: false,
    }),
    defineField({
      name: 'multilingualSupport',
      title: 'Multilingual Support',
      type: 'boolean',
      group: 'licensing',
      initialValue: false,
    }),

    // ── Meta ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'featured',
      title: 'Featured',
      description: 'Pin to top of results on empty/landing state',
      type: 'boolean',
      group: 'meta',
      initialValue: false,
    }),
    defineField({
      name: 'rawKeywords',
      title: 'Raw Keywords (Parking Lot)',
      description:
        "Descriptors that don't fit the controlled vocabulary yet. Hidden from UI. Reviewed periodically for tag promotion.",
      type: 'array',
      group: 'meta',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'foundry.name',
      media: 'specimenImage',
    },
  },
})
