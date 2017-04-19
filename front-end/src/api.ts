import { Action } from 'sco-engine/src/actions'
import { IMap } from 'sco-engine/src/map'
import { IVisibleState } from 'sco-engine/src/visibility'

export type Game = {
  id: string,
  players: string[],
  currentTurnNumber: number,
  map: IMap,
}

interface IApi {
  createGame(players: string[]): Promise<string>

  getGame(gameId: string): Promise<Game | null>

  getGameState(gameId: string): Promise<IVisibleState | null>

  getActions(gameId: string): Promise<Action[]>

  submitActions(gameId: string, actions: Action[]): Promise<void>
}

export default IApi
