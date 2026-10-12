import { DEFAULT_PLACE } from './default-place.js'
import type { Place } from './place.js'
import { PLACES } from './places.js'

export const placeOf = (value: unknown): Place =>
  PLACES.find(place => place === value) ?? DEFAULT_PLACE
