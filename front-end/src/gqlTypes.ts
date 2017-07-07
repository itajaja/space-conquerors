import { Action } from 'sco-engine/lib/actions'
import { ITurnLogEntry } from 'sco-engine/lib/gameEngine'
import * as mx from 'sco-engine/lib/map'
import * as mlx from 'sco-engine/lib/mapLayout'
import * as sx from 'sco-engine/lib/state'
import { IVisibleState } from 'sco-engine/lib/visibility'

export type Game = {
  id: string,
  name: string,
  createdAt: string,
  currentTurnNumber: number,
  players: { [idx: string]: { id: string, name: string, color: string } }
  map: mx.IMap,
  mapLayout: mlx.MapLayout,
  state: IVisibleState,
  actions: Action[],
  log: ITurnLogEntry[],
}

export type FullGame = {
  name: string,
  createdAt: string,
  state: sx.IGameState,
  players: Array<{ id: string, name: string, color: string }>,
  currentTurnNumber: number,
  map: mx.IMap,
  mapLayout: mlx.MapLayout,
  actions: { [idx: string]: Action[] }
  log: ITurnLogEntry[],
}
