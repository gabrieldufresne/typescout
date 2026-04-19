/**
 * Search log schema — records every query submitted to TypeScout.
 * Fire-and-forget writes from app/api/search/route.ts.
 * View in Sanity Studio under "Search Log".
 */

export const searchLog = {
  name: 'searchLog',
  title: 'Search Log',
  type: 'document',
  // Hide from Studio's "New document" menu — written programmatically only
  __experimental_actions: ['read', 'delete'],
  fields: [
    {
      name: 'query',
      title: 'Query',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'resultCount',
      title: 'Result Count',
      type: 'number',
      readOnly: true,
    },
    {
      name: 'tags',
      title: 'Extracted Tags',
      type: 'object',
      readOnly: true,
      fields: [
        { name: 'classification',  title: 'Classification',   type: 'array', of: [{ type: 'string' }] },
        { name: 'personalityTags', title: 'Personality Tags', type: 'array', of: [{ type: 'string' }] },
        { name: 'useCaseTags',     title: 'Use Case Tags',    type: 'array', of: [{ type: 'string' }] },
        { name: 'contrast',        title: 'Contrast',         type: 'array', of: [{ type: 'string' }] },
        { name: 'weightRange',     title: 'Weight Range',     type: 'array', of: [{ type: 'string' }] },
        { name: 'era',             title: 'Era',              type: 'array', of: [{ type: 'string' }] },
        { name: 'foundryQuery',    title: 'Foundry Query',    type: 'string' },
      ],
    },
    {
      name: 'searchedAt',
      title: 'Searched At',
      type: 'datetime',
      readOnly: true,
    },
  ],
  orderings: [
    {
      title: 'Newest First',
      name: 'searchedAtDesc',
      by: [{ field: 'searchedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'query',
      subtitle: 'searchedAt',
      resultCount: 'resultCount',
    },
    prepare({ title, subtitle, resultCount }: Record<string, any>) {
      const date = subtitle ? new Date(subtitle).toLocaleString() : 'Unknown time'
      return {
        title: title ?? '(empty query)',
        subtitle: `${resultCount ?? 0} results · ${date}`,
      }
    },
  },
}
