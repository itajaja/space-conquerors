import { IMap } from './map'
import { IGameState } from './state'

export interface IGame {
  currentTurnNumber: number,
  states: IGameState[],

  map: IMap,
}
