import { Action } from 'sco-engine/lib/actions'
import { ITurnLogEntry } from 'sco-engine/lib/gameEngine'
import * as mx from 'sco-engine/lib/map'
import * as mlx from 'sco-engine/lib/mapLayout'
import * as sx from 'sco-engine/lib/state'

export type Game = {
  id: string,
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
