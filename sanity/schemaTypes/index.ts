/**
 * Barrel export for all Sanity schema types.
 * Add new schema types here as the database grows.
 */

import { foundry } from './foundry'
import { typeface } from './typeface'

export const schemaTypes = [foundry, typeface]
