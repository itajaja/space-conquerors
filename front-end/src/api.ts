import { Action } from 'sco-engine/actions'
import { ITurnLogEntry } from 'sco-engine/gameEngine'
import { IMap } from 'sco-engine/map'
import { MapLayout } from 'sco-engine/mapLayout'
import { IVisibleState } from 'sco-engine/visibility'

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
