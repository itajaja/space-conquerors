/**
 * Just a temporary model to test things out
 */

import * as _ from 'lodash'
import * as dx from 'sco-engine/lib/definitions'
import MapGenerator from 'sco-engine/lib/mapGenerator'
import * as mlx from 'sco-engine/lib/mapLayout'
import * as sx from 'sco-engine/lib/state'

import { Game } from './models'

const PLAYER_COLORS = [
  '#da34b1',
  '#5f83a2',
  '#c825ee',
  '#964a2d',
  '#284e5e',
  '#8c552d',
  '#989a73',
  '#e0c877',
  '#0d01f2',
  '#f7d6bd',
  '#deb9d7',
  '#f78311',
  '#b61b53',
  '#a9ef42',
  '#e3e52f',
  '#f74af8',
  '#091e11',
  '#00bf95',
  '#1ca40b',
  '#3ec3c6',
  '#a831e2',
  '#d6d2a9',
  '#f6932e',
  '#5d2379',
  '#577b52',
  '#87aafc',
  '#078e4e',
  '#7a86b0',
  '#519cc6',
  '#ecbe82',
  '#743b4a',
  '#95929a',
  '#ea73c7',
  '#698f44',
  '#307f2a',
  '#7a939f',
  '#1d5233',
  '#5352fb',
  '#ba89e0',
  '#b8d098',
  '#72b378',
  '#778338',
]

const GAME_ID = 'test game'

function createGame(players: string[]): Game {
  const mapGenerator = new MapGenerator()
  const { origins, ...map } = mapGenerator.generate(players.length)
  const planetStates: sx.IPlanetState[] = _.values(map.cells)
    .filter(c => c.planet)
    .map(p => ({ locationId: p.id }))
  const indexedPlanetStates = _.keyBy(planetStates, 'locationId')
  origins.forEach((o, idx) => {
    indexedPlanetStates[o.id].ownerPlayerId = players[idx]
  })

  const playerStates: sx.IPlayerState[] = players.map((p, idx) => ({
    id: p,
    status: sx.PlayerStatus.Alive,
    resourcesAmount: dx.zeroResources({ gold: 2000, iron: 300 }),
    productionStatuses: [{
      remainingTurns: 1,
      itemId: 'unit_crusader',
      locationId: origins[idx].id,
    }],
    technologies: { tech_galaxy_trade: true } as { [idx: string]: true },
  }))

  const state = {
    players: _.keyBy(playerStates, 'id'),
    planets: indexedPlanetStates,
    units: {
      0: {
        id: '0',
        unitTypeId: 'unit_spear',
        playerId: 'a',
        locationId: _.values(map.cells)[0].id,
      },
      1: {
        id: '1',
        unitTypeId: 'unit_spear',
        playerId: 'a',
        locationId: _.values(map.cells)[0].id,
      },
      2: {
        id: '2',
        unitTypeId: 'unit_spear',
        playerId: 'b',
        locationId: _.values(map.cells)[3].id,
      },
    },
    buildings: {
      bar: {
        id: 'bar',
        buildingTypeId: 'building_depot',
        playerId: 'a',
        locationId: origins[0].id,
      },
    },
    marketState: {},
  }

  return {
    id: GAME_ID,
    name: 'a test',
    createdAt: new Date().toString(),
    currentTurnNumber: 0,
    map,
    players: _.keyBy(players.map((p, idx) => ({
      id: p,
      name: p,
      color: PLAYER_COLORS[idx],
    })), 'id'),
    mapLayout: mlx.generate(map),
    state,
    actions: {
      a: [
        {
          kind: 'produce',
          playerId: 'a',
          itemId: 'unit_spear',
          locationId: origins[0].id,
        }, {
          kind: 'move',
          playerId: 'a',
          unitId: '1',
          path: [_.values(map.cells)[0].id, _.values(map.cells)[1].id, _.values(map.cells)[2].id],
          speed: 3,
      }],
    },
    log: [
      { player: 'a', message: 'you did this!' },
      { player: 'a', message: 'you did that!' },
      { player: 'b', message: 'you should not see this' },
    ],
  }
}

export const cachedGame = createGame(['a', 'b'])
