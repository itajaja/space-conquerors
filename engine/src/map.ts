/**
 * Represent the map of a game. The Map contains data that doesn't
 * change over time.
 */
import { Resource, ResourceAmount } from './definitions'

export interface IMap {
  cells: ICell[]

  systems: ISystem[]

  gameId: string
}

export interface ICell {
  id: string

  name: string

  systemId: string

  planet?: IPlanet

  edges: { [idx: string]: true }
}

export interface ISystem {
  id: string

  name: string
}

export interface IPlanet {
  resourceTypeDefinition: Resource

  resourceYield: ResourceAmount[]
}
