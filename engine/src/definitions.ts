export type Resource = 'gold' | 'iron' | 'gas' | 'darkMatter'

export type ResourceAmount = {
  [P in Resource]: number;
}

export function zeroResources(): ResourceAmount {
  return { gold: 0, iron: 0, gas: 0, darkMatter: 0 }
}

export type ItemKind = 'building' | 'unit' | 'tech' | 'techFamily'

export interface IItem {
  kind: ItemKind

  name: string
  id: string
  description: string
}

export interface IPurchaseable {
  cost: ResourceAmount,
  techRequirements: { [idx: string]: true }
  productionTime: number
}

export interface IBuildingType extends IItem, IPurchaseable {
  kind: 'building'

  maxPerPlanet?: number
  maxPerPlayer?: number
  maxPerSystem?: number

  resourceYield?: ResourceAmount[]
  resourceMultiplier?: ResourceAmount[]
}

export const enum UnitClass {
  // TODO need more explanation about this values...
  P,
  M,
  G,
  E,
  NONE,
}

export const enum ArmoringType {
  BASIC,
  PIERCING,
  BOMB,
}

export interface IUnitType extends IItem, IPurchaseable {
  kind: 'unit'

  unitType: UnitClass
  armoringType: ArmoringType

  firePower: number
  speed: number
  gasConsumption: number
  foodConsumption: number

  specials?: any // TBD
}

export interface ITechnology extends IItem, IPurchaseable {
  kind: 'tech'

  level: number
  family: string
}

export interface ITechnologyFamily extends IItem {
  kind: 'techFamily'
}

export type Item = IBuildingType | IUnitType | ITechnology | ITechnologyFamily
export type PurchaseableItem = IBuildingType | IUnitType | ITechnology
