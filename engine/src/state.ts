import { ResourceAmount } from './definitions'

export enum PlayerStatus {
  Dead,
  Alive,
}

export interface ILocatable {
  locationId: string
}

export interface IId {
  id: string
}

export interface IProductionStatus {
  remainingTurns: number
  itemId: string
  locationId?: string
}

export interface IPlayerState extends IId {
  status: PlayerStatus

  resourcesAmount: ResourceAmount

  productionStatuses: IProductionStatus[]

  technologies: { [idx: string]: true }
}

export interface IUnitState extends IId {
  unitTypeId: string
  playerId: string

  locationId: string
}

export interface IBuildingState extends IId {
  buildingTypeId: string
  playerId: string

  locationId: string
}

export interface IPlanetState {
  ownerPlayerId?: string

  locationId: string
}

export interface IGameState {
  players: { [idx: string]: IPlayerState }
  gameOver: boolean,

  planets: { [idx: string]: IPlanetState }

  units: { [idx: string]: IUnitState }
  buildings: { [idx: string]: IBuildingState }

  marketState: any // TBD
}
