import * as _ from 'lodash'

import { zeroResources } from './definitions'
import { IMap } from './map'
import * as sx from './state'

export function getStateforPlayer(
  playerId: string, state: sx.IGameState, map: IMap,
): sx.IGameState {
  // TODO allies should allow to see some data (eg techs, unit positions)

  const playerPlanets = _.values(state.planets).filter(p => p.ownerPlayerId === playerId)
  const playerUnits = _.values(state.units).filter(u => u.playerId === playerId)
  // the locations the player is on
  const baseLocations = [...playerPlanets, ...playerUnits].map(i => i.locationId)
  // ... + the neighboring locations
  const visibleLocations = _.merge({}, ...baseLocations.map(l => ({
    [l]: true,
    ...map.cells[l].edges,
  })))

  function filterVisibles<T extends { [idx: string]: { locationId: string } }>(items: T): T {
    return _.pickBy(items, b => !!visibleLocations[b.locationId]) as T
  }

  const players = _.mapValues(state.players, player => ({
    status: player.status,
    id: player.id,
    productionStatuses: [],
    resourcesAmount: zeroResources(),
    technologies: {},
  })) as sx.IGameState['players']

  players[playerId] = state.players[playerId]

  return {
    ...state,
    buildings: filterVisibles(state.buildings),
    marketState: state.marketState,
    planets: filterVisibles(state.planets),
    units: filterVisibles(state.units),
    players,
  }
}
