import { Action } from 'sco-engine/src/actions'
import { ITurnLogEntry } from 'sco-engine/src/gameEngine'
import { IMap } from 'sco-engine/src/map'
import { MapLayout } from 'sco-engine/src/mapLayout'
import { IVisibleState } from 'sco-engine/src/visibility'

export type Game = {
  id: string,
  players: string[],
  currentTurnNumber: number,
  map: IMap,
  mapLayout: MapLayout,
}

interface IApi {
  playerId: string

  createGame(players: string[]): Promise<string>

  getGame(gameId: string): Promise<Game | null>

  getGameState(gameId: string): Promise<IVisibleState | null>

  getActions(gameId: string): Promise<Action[]>

  submitActions(gameId: string, actions: Action[]): Promise<void>

  getLog(gameId: string): Promise<ITurnLogEntry[]>
}

export default IApi
