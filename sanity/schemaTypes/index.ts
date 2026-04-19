/**
 * Barrel export for all Sanity schema types.
 * Add new schema types here as the database grows.
 */

import { foundry } from './foundry'
import { typeface } from './typeface'
import { searchLog } from './searchLog'

export const schemaTypes = [foundry, typeface, searchLog]
