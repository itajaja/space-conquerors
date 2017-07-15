import * as _ from 'lodash'

import { ResourceAmount } from './definitions'

export type BattlePlayerSummary = {
  win: boolean,
  totalUnits?: number,

  units: Array<{
    unitTypeId?: string,
    qtyBefore?: number,
    qtyAfter?: number,
  }>,
}

export type BattleLog = {
  kind: 'battle',

  location: string | [string, string],
  turns: number
  players: { [idx: string]: BattlePlayerSummary },
}

export type ScheduleLog = {
  kind: 'schedule',
  playerId: string,

  itemId: string,
  location?: string,
  successful: boolean,
}

export type LostPlanetLog = {
  kind: 'lostPlanet',
  playerId: string,

  location: string,
  byPlayerId: string,
}

export type ConqueredPlanetLog = {
  kind: 'conqueredPlanet',
  playerId: string,

  location: string,
  previousOwnerId?: string,
}

export type ResourceProductionLog = {
  kind: 'resourceProduction',
  playerId: string,

  amount: ResourceAmount,
}

export type ProductionCompletedLog = {
  kind: 'productionCompleted',
  playerId: string,

  itemId: string,
  location?: string,
}

export type Log = BattleLog | ScheduleLog | LostPlanetLog
  | ConqueredPlanetLog | ResourceProductionLog | ProductionCompletedLog

function getVisibleBattleLog(playerId: string, log: BattleLog): BattleLog {
  const player = log.players[playerId]
  if (player.win) {
    return log
  }
  return {
    ...log,
    players: _.mapValues(log.players, (p, pId) => {
      if (playerId === pId) {
        return p
      }
      return {
        ...p,
        totalUnits: undefined,
        units: p.units.map(u => ({ unitTypeId: u.unitTypeId })),
      }
    }),
  }
}

export function getLogsForPlayer(playerId: string, logs: Log[]) {
  const result: Log[] = []
  logs.forEach(log => {
    if (log.kind === 'battle') {
      if (!!log.players[playerId]) {
        result.push(getVisibleBattleLog(playerId, log))
      }
    } else if (log.playerId === playerId) {
      result.push(log)
    }
  })

  return result
}
