import * as _ from 'lodash'

import buildingTypes from './buildings'
import * as dx from './definitions'
import technologyTypes from './technologies'
import unitTypes from './units'

export const items: { [idx: string]: dx.PurchaseableItem } = {
  ...buildingTypes,
  ...technologyTypes,
  ...unitTypes,
}

export function subtract(
  a: dx.ResourceAmount,
  b: dx.ResourceAmount,
): dx.ResourceAmount {
  return {
    gold: a.gold - b.gold,
    iron: a.iron - b.iron,
    gas: a.gas - b.gas,
    darkMatter: a.darkMatter - b.darkMatter,
  }
}

export function add(
  a: dx.ResourceAmount,
  b: dx.ResourceAmount,
): dx.ResourceAmount {
  return {
    gold: a.gold + b.gold,
    iron: a.iron + b.iron,
    gas: a.gas + b.gas,
    darkMatter: a.darkMatter + b.darkMatter,
  }
}

export function ge(a: dx.ResourceAmount, b: dx.ResourceAmount) {
  const result = subtract(a, b)
  return _.values(result).every(r => r >= 0)
}
