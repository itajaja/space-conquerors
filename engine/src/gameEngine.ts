import * as _ from 'lodash'
import * as uuid from 'uuid/v4'

import * as ax from './actions'
import buildingTypes from './buildings'
import CombatEngine from './combatEngine'
import * as dx from './definitions'
import { GameCache } from './game'
import GameValidator from './gameValidator'
import { Log } from './logs'
import * as resources from './resources'
import { ResourceCalculator } from './resources'
import * as sx from './state'
import technologyTypes from './technologies'
import unitTypes from './units'
import { lcm } from './utils/index'

export const items: { [idx: string]: dx.PurchaseableItem } = {
  ...buildingTypes,
  ...technologyTypes,
  ...unitTypes,
}

/**
 * GameEngine contains all the logic to manipulate the game state
 */
export default class GameEngine {
  logs: Log[] = []
  validator: GameValidator

  private get state() {
    return this.game.state
  }

  private get map() {
    return this.game.map
  }

  constructor(public game: GameCache) {
    this.validator = new GameValidator(game)
  }

  schedulePlayerProduction(player: sx.IPlayerState, actions: ax.IProduceAction[]) {
    actions.forEach((a, idx) => {
      const item = items[a.itemId]

      const produceError = this.validator.safe(() =>
        this.validator.validateProductionAction(a),
      )
      if (!produceError) {
        player.resourcesAmount = resources.subtract(player.resourcesAmount, item.cost)
        player.productionStatuses.push({
          remainingTurns: item.productionTime,
          itemId: item.id,
          locationId: a.locationId,
        })
      }
      this.logs.push({
        kind: 'schedule',
        playerId: player.id,
        itemId: item.id,
        location: a.locationId,
        successful: !produceError,
      })
    })
  }

  scheduleProduction(actions: ax.IProduceAction[]) {
    const actionsByPlayer = _.groupBy(actions, 'playerId')

    Object.keys(actionsByPlayer).forEach(playerId => {
      const playerActions = actionsByPlayer[playerId]
      const player = this.state.players[playerId]
      this.schedulePlayerProduction(player, playerActions)
    })
  }

  edgeId(l1: string, l2: string) {
    return [l1, l2].map(l => l).sort().join('::')
  }

  cellsFromedgeId(edgeId: string): [string, string] {
    return edgeId.split('::') as [string, string]
  }

  executeStep(action: ax.IMovementAction, unit: sx.IUnitState, speed: number, step: number) {
    const pathIndex = Math.min(Math.floor(step / speed))
    const isInTransit = !!(step % speed)

    const from = action.path[pathIndex]
    const to = action.path[pathIndex + 1]

    if (!from) {
      return unit.locationId
    }

    // means it's either arrived or on a planet
    if (!to || !isInTransit) {
      const { resourcesAmount } = this.state.players[unit.playerId]
      const { gasConsumption } = unitTypes[unit.unitTypeId]
      const newGas = resourcesAmount.gas - gasConsumption
      if (newGas < 0) {
        return unit.locationId
      }
      // XXX mutation!
      if (this.state.units[unit.id].locationId !== from) {
        // decrease the gas amount and move
        resourcesAmount.gas = newGas
        this.state.units[unit.id].locationId = from
      }
      return from
    }

    return this.edgeId(from, to)
  }

  moveUnits(actions: ax.IMovementAction[]) {
    // there isn't a good way to resolve from this error. shouldn't happen anyway
    this.validator.validateMovementActions(actions)
    // filter out bad actions
    actions = actions.filter(action => (!this.validator.safe(() => (
      this.validator.validateMovementAction(action)
    ))))

    const steps = actions.reduce((prev, curr) => lcm(prev, curr.speed * 2), 1)

    let unitActions = actions.map(action => {
      const unit = this.state.units[action.unitId]
      const unitType = unitTypes[unit.unitTypeId]
      return {
        action,
        unit,
        speed: steps / unitType.speed,
      }
    })

    // + 2 to take into account that the first step is the initial cell
    for (let step = 0; step < steps + 2; ++step) {
      const actionByUnit = _.keyBy(unitActions, u => u.unit.id)
      const unitLocations = _.values(this.state.units).map(unit => {
        const action = actionByUnit[unit.id]
        const location = action
          ? this.executeStep(action.action, unit, action.speed, step)
          : unit.locationId
        return { location, unit, unitType: unitTypes[unit.unitTypeId] }
      })
      const unitLocationsByLocation = _.groupBy(unitLocations, u => u.location)

      _.forOwn(unitLocationsByLocation, (units, locationId) => {
        const unitsByPlayer = _.groupBy(units, u => u.unit.playerId)
        // TODO: check allies and such
        if (_.size(unitsByPlayer) > 1) {
          const combatUnits = units.map(u => ({ ...u.unit, hp: u.unitType.endurance }))
          const { survivors, turns } = new CombatEngine(combatUnits).start()
          const survivorsByPlayer = _.groupBy(survivors, s => s.playerId)

          // remove dead units
          const dead = _.difference(combatUnits.map(u => u.id), survivors.map(u => u.id))
          const deadByTypeByPlayer = _.mapValues(
            _.groupBy(dead, deadId => this.state.units[deadId].playerId),
            deadByPlayer => _.groupBy(deadByPlayer, d => this.state.units[d].unitTypeId),
          )
          dead.forEach(deadId => delete this.state.units[deadId])
          unitActions = unitActions.filter(u => this.state.units[u.unit.id])

          const location = this.map.cells[locationId]
            ? locationId
            : this.cellsFromedgeId(locationId)

          this.logs.push({
            kind: 'battle',
            location,
            turns,
            players: _.mapValues(unitsByPlayer, (p, pId) => ({
              win: !!(survivorsByPlayer[pId] || []).length,
              totalUnits: p.length,
              units: _.values(_.groupBy(p, u => u.unitType.id))
                .map(us => {
                  const unitTypeId = us[0].unitType.id
                  const qtyBefore = us.length
                  const deadByUnitType = (deadByTypeByPlayer[pId] || {})[unitTypeId]
                  return {
                    unitTypeId,
                    qtyBefore,
                    qtyAfter: qtyBefore - (deadByUnitType || []).length,
                  }
                }),
            })),

          })
        }
      })
    }
  }

  conquerPlanets() {
    _.values(this.state.units).forEach(u => {
      const location = this.map.cells[u.locationId]
      const oldPlanetState = this.state.planets[location.id]
      const oldOwner = oldPlanetState && oldPlanetState.ownerPlayerId
      if (location.planet && oldOwner !== u.playerId) {
        // transfer ownership of planet
        this.state.planets[u.locationId].ownerPlayerId = u.playerId
        // transfer ownership of buildings
        _.values(this.state.buildings)
          .filter(b => b.locationId === location.id)
          .forEach(p => { p.playerId = u.playerId })

        if (oldOwner) {
          this.logs.push({
            kind: 'lostPlanet',
            playerId: oldOwner,
            location: location.id,
            byPlayerId: u.playerId,
          })
        }
        this.logs.push({
          kind: 'conqueredPlanet',
          playerId: u.playerId,
          location: location.id,
          previousOwnerId: oldOwner,
        })
      }
    })
  }

  produceResources() {
    const calculator = new ResourceCalculator(this.game)

    _.forOwn(this.state.players, p => {
      const newAmount = calculator.calculatePlayerProduction(p.id)
      p.resourcesAmount = resources.add(p.resourcesAmount, newAmount)

      this.logs.push({
        kind: 'resourceProduction',
        playerId: p.id,
        amount: newAmount,
      })
    })
  }

  updateProduction() {
    _.forOwn(this.state.players, (player, playerId: string) => {
      const remainingProductions: sx.IProductionStatus[] = []
      for (const p of player.productionStatuses) {
        p.remainingTurns--

        const item = items[p.itemId]
        if (p.locationId) {
          const planet = this.state.planets[p.locationId]
          if (planet.ownerPlayerId !== playerId) {
            // this happens when the planet has been conquered
            break
          }
        }

        if (p.remainingTurns === 0) {
          if (unitTypes[p.itemId]) {
            const id = uuid()
            this.state.units[id] = {
              id,
              locationId: p.locationId!,
              playerId,
              unitTypeId: p.itemId,
            }
          } else if (buildingTypes[p.itemId]) {
            const id = uuid()
            this.state.buildings[id] = {
              id,
              locationId: p.locationId!,
              playerId,
              buildingTypeId: p.itemId,
            }
          } else { // must be technology
            player.technologies[p.itemId] = true
          }
          this.logs.push({
            kind: 'productionCompleted',
            playerId: player.id,
            itemId: item.id,
            location: p.locationId,
          })
        } else {
          remainingProductions.push(p)
        }
      }
      player.productionStatuses = remainingProductions
    })
  }

  updatePlayerStatus() {
    const unitsByPlayer = _.groupBy(_.values(this.state.units), u => u.playerId)
    const planetsByPlayer = _.groupBy(_.values(this.state.planets), u => u.ownerPlayerId)

    _.forOwn(this.state.players, p => {
      if (
        p.status === sx.PlayerStatus.Alive &&
        !unitsByPlayer[p.id]
        && !planetsByPlayer[p.id]
      ) {
        p.status = sx.PlayerStatus.Dead
      }
    })

    const alivePlayers = _.values(this.state.players)
      .filter(p => p.status === sx.PlayerStatus.Alive)
      .length

    if (alivePlayers <= 1) {
      this.state.gameOver = true
    }
  }

  getLogs() {
    return this.logs
  }
}
