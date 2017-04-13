import { ResourceAmount } from './definitions'

export enum PlayerStatus {
  Dead,
  Alive,
}

export interface IProductionStatus {
  remainingTurns: number
  itemId: string
  locationId?: string
}

export interface IPlayerState {
  status: PlayerStatus

  resourcesAmount: ResourceAmount

  productionStatuses: IProductionStatus[]

  technologies: { [idx: string]: true }
}

export interface IUnitState {
  unitTypeId: string
  playerId: string

  locationId: string
}

export interface IBuildingState {
  buildingTypeId: string
  playerId: string

  level: number

  locationId: string
}

export interface IPlanetState {
  ownerPlayerId?: string
}

export interface IGameState {
  players: {[idx: string]: IPlayerState}

  planets: { [idx: string]: IPlanetState }

  units: { [idx: string]: IUnitState }
  buildings: { [idx: string]: IBuildingState }

  marketState: any // TBD
}
