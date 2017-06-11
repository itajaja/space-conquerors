import { Action } from 'sco-engine/lib/actions'
import { ITurnLogEntry } from 'sco-engine/lib/gameEngine'
import * as mx from 'sco-engine/lib/map'
import * as mlx from 'sco-engine/lib/mapLayout'
import * as sx from 'sco-engine/lib/state'
import { getStateforPlayer, IVisibleState } from 'sco-engine/lib/visibility'

import { cachedGame } from './tempDb'

// models

export type Game = {
  id: string,

  name: string,
  createdAt: string,
  state: sx.IGameState,
  players: { [idx: string]: { id: string, name: string, color: string } },
  currentTurnNumber: number,
  map: mx.IMap,
  mapLayout: mlx.MapLayout,
  actions: { [idx: string]: Action[] }
  log: ITurnLogEntry[],
}

export type GameState = IVisibleState

export type User = {
  id: string,
  name: string,
}

export { Action }

export type LogEntry = ITurnLogEntry

// resources

export type Context = {
  userId: string,
}

export type Resource<TModel> = {
  get: (id: string, ctx: Context) => TModel,
  list: (ctx: Context) => TModel[],
}

export const gameResource: Resource<Game> = {
  get: id => cachedGame,
  list: () => [cachedGame],
}

export const gameStateResource: Resource<GameState> = {
  get: (id, ctx) => {
    const game = gameResource.get(id, ctx)
    return getStateforPlayer(ctx.userId, game.state, game.map)
  },
  list: () => {
    throw new Error('Not Implemented')
  },
}

export const userResource: Resource<User> = {
  get: (id, ctx) => ({
    id: ctx.userId,
    name: ctx.userId,
  }),
  list: () => {
    throw new Error('Not Implemented')
  },
}

export const actionResource: Resource<Action> = {
  get: (id, ctx) => {
    throw new Error('Not Implemented')
  },
  list: (ctx) => {
    return cachedGame.actions[ctx.userId]
  },
}

export const logEntryResource: Resource<LogEntry> = {
  get: (id, ctx) => {
    throw new Error('Not Implemented')
  },
  list: (ctx) => {
    return cachedGame.log.filter(l => l.player === ctx.userId)
  },
}
