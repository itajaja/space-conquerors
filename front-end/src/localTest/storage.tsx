import { Action } from 'sco-engine/actions'
import { ITurnLogEntry } from 'sco-engine/gameEngine'
import { IMap } from 'sco-engine/map'
import { MapLayout } from 'sco-engine/mapLayout'
import { IGameState } from 'sco-engine/state'
import * as store from 'store'

const KEY = 'sco:gameState'

export interface IStorageData {
  state: IGameState,
  players: string[],
  currentTurnNumber: number,
  map: IMap,
  mapLayout: MapLayout,
  actions: { [idx: string]: Action[] }
  log: ITurnLogEntry[],
}

export function load(): IStorageData | null {
  const data = store.get(KEY)
  if (data) {
    return JSON.parse(data)
  }

  return null
}

export function save(data: IStorageData): void {
  store.set(KEY, JSON.stringify(data))
}

export function reset(): void {
  store.remove(KEY)
}
