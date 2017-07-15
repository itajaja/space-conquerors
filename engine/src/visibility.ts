import * as _ from 'lodash'

import { zeroResources } from './definitions'
import { GameCache } from './game'
import * as sx from './state'

export function getStateforPlayer(
  playerId: string, game: GameCache,
): sx.IGameState {
  // TODO allies should allow to see some data (eg techs, unit positions)

  const playerPlanets = game.planetsByUser()[playerId]
  const playerUnits = game.unitsByUser()[playerId]
  // the locations the player is on
  const baseLocations = [...playerPlanets, ...playerUnits].map(i => i.locationId)
  // ... + the neighboring locations
  const visibleLocations = _.merge({}, ...baseLocations.map(l => ({
    [l]: true,
    ...game.map.cells[l].edges,
  })))

  function filterVisibles<T extends { [idx: string]: { locationId: string } }>(items: T): T {
    return _.pickBy(items, b => !!visibleLocations[b.locationId]) as T
  }

  const players = _.mapValues(game.state.players, player => ({
    status: player.status,
    id: player.id,
    productionStatuses: [],
    resourcesAmount: zeroResources(),
    technologies: {},
  })) as sx.IGameState['players']

  players[playerId] = game.state.players[playerId]

  return {
    ...game.state,
    buildings: filterVisibles(game.state.buildings),
    marketState: game.state.marketState,
    planets: filterVisibles(game.state.planets),
    units: filterVisibles(game.state.units),
    players,
  }
}
