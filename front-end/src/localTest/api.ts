import * as _ from 'lodash'
import { Action } from 'sco-engine/src/actions'
import * as dx from 'sco-engine/src/definitions'
import MapGenerator from 'sco-engine/src/mapGenerator'
import * as sx from 'sco-engine/src/state'
import { getStateforPlayer, IVisibleState } from 'sco-engine/src/visibility'

import IApi, { Game } from '../api'
import * as storage from './storage'

const GAME_ID = 'test game'

export default class TestApi implements IApi {
  game: Game | null = null
  gameState: sx.IGameState | null = null
  actions: {[idx: string]: Action[]}

  playerId: string

  constructor() {
    const data = storage.load()
    this.actions = {}

    if (data) {
      this.gameState = data.state
      this.game = {
        currentTurnNumber: data.currentTurnNumber,
        id: GAME_ID,
        map: data.map,
        players: data.players,
      }
      this.actions = data.actions
    }
  }

  async createGame(players: string[]): Promise<string> {
    const playerStates: sx.IPlayerState[] = players.map(p => ({
      id: p,
      status: sx.PlayerStatus.Alive,
      resourcesAmount: dx.zeroResources({ gold: 200, iron: 30 }),
      productionStatuses: [],
      technologies: {},
    }))

    const mapGenerator = new MapGenerator()
    const { origins, ...map } = mapGenerator.generate(players.length)
    const planetStates: sx.IPlanetState[] = _.values(map.cells)
      .filter(c => c.planet)
      .map(p => ({ locationId: p.id }))
    const indexedPlanetStates = _.keyBy(planetStates, 'locationId')
    origins.forEach((o, idx) => {
      indexedPlanetStates[o.id].ownerPlayerId = players[idx]
    })

    this.gameState = {
      players: _.keyBy(playerStates, 'id'),
      planets: indexedPlanetStates,
      units: {},
      buildings: {},
      marketState: {},
    }

    this.game = {
      id: GAME_ID,
      currentTurnNumber: 0,
      map,
      players,
    }

    this.actions = {}

    this.save()

    return GAME_ID
  }

  async getGame(gameId: string): Promise<Game | null> {
    return this.game
  }

  async getGameState(gameId: string): Promise<IVisibleState | null> {
    if (!this.gameState || !this.game) {
      return null
    }
    return getStateforPlayer(this.playerId, this.gameState, this.game.map)
  }

  async getActions(gameId: string): Promise<Action[]> {
    return this.actions[this.playerId] || []
  }

  async submitActions(gameId: string, actions: Action[]): Promise<void> {
    this.actions[this.playerId] = actions

    this.save()
  }

  private save() {
    if (!this.game || !this.gameState) {
      return
    }

    storage.save({
      currentTurnNumber: this.game.currentTurnNumber,
      map: this.game.map,
      players: this.game.players,
      state: this.gameState,
      actions: this.actions,
    })
  }
}