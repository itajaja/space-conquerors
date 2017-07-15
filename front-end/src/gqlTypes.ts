import { Action } from 'sco-engine/lib/actions'
import { Log } from 'sco-engine/lib/logs'
import * as mx from 'sco-engine/lib/map'
import * as mlx from 'sco-engine/lib/mapLayout'
import * as sx from 'sco-engine/lib/state'

export type User = {
  id: string,
  email: string,
  name: string,
  admin?: boolean,
}

export type Game = {
  id: string,
  name: string,
  createdAt: string,
  state: sx.IGameState,
  players: {
    [idx: string]: User & {
      color: string,
    },
  },
  currentTurnNumber: number,
  map: mx.IMap,
  mapLayout: mlx.MapLayout,
  actions: { [idx: string]: Action[] }
  logs: Log[],
  turnReady: boolean,
}
