/**
 * Represent the immutable map of a game
 */
import { Resource, ResourceAmount } from './definitions'

export interface IMap {
  readonly cells: { [idx: string]: ICell }

  readonly systems: { [idx: string]: ISystem }
}

export interface ICell {
  readonly id: string

  readonly name: string

  readonly systemId: string

  readonly planet?: IPlanet

  readonly edges: { [idx: string]: true }
}

export interface ISystem {
  readonly id: string

  readonly name: string
}

export interface IPlanet {
  readonly resourceTypeDefinition: Resource

  readonly resourceYield: ResourceAmount
}
