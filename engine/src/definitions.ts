export type Resource = 'gold' | 'iron' | 'gas' | 'darkMatter'

export type ResourceAmount = {
  [P in Resource]?: number;
}

export type ItemKind = 'building' | 'unit' | 'tech'

export interface IItem {
  kind: ItemKind

  name: string
  id: string
  description: string
}

export interface IPurchaseable {
  cost: ResourceAmount,
  techRequirements: string[]
  productionTime: number
}

export interface IBuildingType extends IItem, IPurchaseable {
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
  unitType: UnitClass
  armoringType: ArmoringType

  firePower: number
  speed: number
  gasConsumption: number
  foodConsumption: number

  specials?: any // TBD
}

export interface ITechnology extends IItem, IPurchaseable {
  level: number
  family: string
}

export interface ITechnologyFamily extends IItem { }
