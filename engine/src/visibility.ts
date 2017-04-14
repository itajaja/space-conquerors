import * as _ from 'lodash'

import { IMap } from './map'
import * as sx from './state'

type VisibleState = Pick<sx.IGameState, 'buildings' | 'marketState' | 'planets' | 'units'>
interface IVisibleState extends VisibleState {
  player: sx.IPlayerState,
  players: string[],
}

export function getStateforPlayer(
  playerId: string, state: sx.IGameState, map: IMap,
): IVisibleState {
  const playerPlanets = _.values(state.planets).filter(p => p.ownerPlayerId === playerId)
  const playerUnits = _.values(state.units).filter(u => u.playerId === playerId)
  // the locations the player is on
  const baseLocations = [...playerPlanets, ...playerUnits].map(i => i.locationId)
  // + the neighboring locations
  const visibleLocations = _.merge({}, baseLocations.map(l => ({
    [l]: true,
    ...map.cells[l].edges,
  })))

  function filterVisibles<T extends { [idx: string]: { locationId: string } }>(items: T): T {
    return _.pickBy(items, b => !!visibleLocations[b.locationId]) as T
  }

  return {
    buildings: filterVisibles(state.buildings),
    marketState: state.marketState,
    planets: filterVisibles(state.planets),
    units: filterVisibles(state.units),
    player: state.players[playerId],
    players: Object.keys(state.players)
      .filter(p => state.players[p].status === sx.PlayerStatus.Alive),
  }
}
