import * as _ from 'lodash'
import * as uuid from 'uuid/v4'

import * as ax from './actions'
import buildingTypes from './buildings'
import CombatEngine from './combatEngine'
import * as dx from './definitions'
import { IMap } from './map'
import * as sx from './state'
import { IGameState } from './state'
import technologyTypes from './technologies'
import unitTypes from './units'
import { lcm } from './utils/index'

export const items: { [idx: string]: dx.PurchaseableItem } = {
  ...buildingTypes,
  ...technologyTypes,
  ...unitTypes,
}

function subtractResources(a: dx.ResourceAmount, b: dx.ResourceAmount): dx.ResourceAmount {
  return {
    gold: a.gold - b.gold,
    iron: a.iron - b.iron,
    gas: a.gas - b.gas,
    darkMatter: a.darkMatter - b.darkMatter,
  }
}

export function addResources(a: dx.ResourceAmount, b: dx.ResourceAmount): dx.ResourceAmount {
  return {
    gold: a.gold + b.gold,
    iron: a.iron + b.iron,
    gas: a.gas + b.gas,
    darkMatter: a.darkMatter + b.darkMatter,
  }
}

function hasEnoughResources(a: dx.ResourceAmount, b: dx.ResourceAmount) {
  const result = subtractResources(a, b)
  return _.values(result).every(r => r >= 0)
}

export function canProduceItem(player: sx.IPlayerState, item: dx.PurchaseableItem) {
  // check if enough resources
  if (!hasEnoughResources(player.resourcesAmount, item.cost)) {
    return false
  }
  // check if tech present
  const techRequirements = Object.keys(item.techRequirements)
  if (techRequirements.some(t => !player.technologies[t])) {
    return false
  }
  if (item.kind === 'tech') {
    // check that there is a purchased tech from previous level
    const requirement = item.level === 1
      ? true
      : _.keys(player.technologies).map(t => technologyTypes[t])
        .some(t => t.family === item.family && t.level === item.level - 1)

    if (player.technologies[item.id] || !requirement) {
      return false
    }
  }

  // TODO: if building, check if exceeding caps

  return true
}

export interface ITurnLogEntry {
  player: string,
  message: string,
}

/**
 * GameEngine contains all the logic to manipulate the game state
 */
export default class GameEngine {
  log: ITurnLogEntry[] = []

  constructor(public state: IGameState, public map: IMap) { }

  schedulePlayerProduction(player: sx.IPlayerState, actions: ax.IProduceAction[]) {
    for (const a of actions) {
      const item = items[a.itemId]

      if (canProduceItem(player, item)) {
        player.resourcesAmount = subtractResources(
          player.resourcesAmount, item.cost,
        )
        player.productionStatuses.push({
          remainingTurns: item.productionTime,
          itemId: item.id,
          locationId: a.locationId,
        })
        let message = `Successfully scheduled the production of ${item.name} (${item.kind})`
        if (a.locationId) {
          message += ` on ${this.map.cells[a.locationId].name}`
        }
        this.log.push({
          player: player.id,
          message,
        })
      } else {
        this.log.push({
          player: player.id,
          message: `Unable to schedule ${item.name}`,
        })
      }
    }
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

  cellsFromedgeId(edgeId: string) {
    return edgeId.split('::')
  }

  executeStep(action: ax.IMovementAction, unit: sx.IUnitState, speed: number, step: number) {
    const pathIndex = Math.min(Math.floor(step / speed))
    const isInTransit = !!(step % speed)

    const from = action.path[pathIndex]
    const to = action.path[pathIndex + 1]

    if (!from) {
      return unit.locationId
    }

    if (!to || !isInTransit) {
      // XXX mutation!
      // means it's either arrived or on a planet
      this.state.units[unit.id].locationId = from
      return from
    }

    return this.edgeId(from, to)
  }

  moveUnits(actions: ax.IMovementAction[]) {
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
        const playersInvolved = _.keys(_.groupBy(units, u => u.unit.playerId))
        // TODO: check allies and such
        if (playersInvolved.length > 1) {
          const combatUnits = units.map(u => ({ ...u.unit, hp: u.unitType.endurance }))
          const survivors = new CombatEngine(combatUnits).start()
          const survivorsByPlayer = _.groupBy(survivors, s => s.playerId)

          // remove dead units
          const dead = _.difference(combatUnits.map(u => u.id), survivors.map(u => u.id))
          const deadByPlayer = _.groupBy(dead, deadId => this.state.units[deadId].playerId)
          dead.forEach(deadId => delete this.state.units[deadId])
          unitActions = unitActions.filter(u => this.state.units[u.unit.id])

          const location = this.map.cells[locationId!]
          let where = ''
          if (location) {
            const system = this.map.systems[location.systemId]
            where = `at ${location.name} (${system.name})`
          } else { // must be on an edge
            const [l1, l2] = this.cellsFromedgeId(locationId!)
            const c1 = this.map.cells[l1]
            const c2 = this.map.cells[l2]
            const s1 = this.map.systems[l1]
            const s2 = this.map.systems[l2]
            where = `between ${c1} (${s1.name}) and ${c2} (${s2.name})`
          }

          playersInvolved.forEach(p => this.log.push({
            player: p,
            message: `There was a battle ${where} against`
            + ` players ${playersInvolved.filter(op => op !== p)}.`
            + ` ${(survivorsByPlayer[p] || []).length} units survived,`
            + ` ${(deadByPlayer[p] || []).length} were killed`,
          }))
        }
      })
    }
  }

  conquerPlanets() {
    _.values(this.state.units).forEach(u => {
      const location = this.map.cells[u.locationId]
      const oldPlanetState = this.state.planets[location.id]
      const oldOwner = oldPlanetState && oldPlanetState.ownerPlayerId
      const system = this.map.systems[location.systemId]
      if (location.planet && oldOwner !== u.playerId) {
        this.state.planets[u.locationId].ownerPlayerId = u.playerId
        this.log.push({
          player: u.playerId,
          message: `The planet ${location.name} (${system.name}) has been conquered`,
        })
      }
    })
  }

  produceResources() {
    const buildingsByUser = _.groupBy(_.values(this.state.buildings), l => l.playerId)

    _.forOwn(this.state.players, p => {
      const newAmount = (buildingsByUser[p.id] || []).reduce(
        (prev, cur) => {
          const { resourceYield } = buildingTypes[cur.buildingTypeId]
          // TODO factor in planet type
          return resourceYield ? addResources(prev, resourceYield) : prev
        }, dx.zeroResources())

      p.resourcesAmount = addResources(p.resourcesAmount, newAmount)

      const resourceSummary = _.toPairs(newAmount)
        .map(([res, amount]) => `${res}: ${amount}`)
        .join(', ')
      this.log.push({
        player: p.id,
        message: `The following resources were produced: ${resourceSummary}`,
      })
    })
  }

  updateProduction() {
    _.forOwn(this.state.players, (player, playerId: string) => {
      const remainingProductions: sx.IProductionStatus[] = []
      for (const p of player.productionStatuses) {
        p.remainingTurns--

        const item = items[p.itemId]
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
          let message = `the production of ${item.name} (${item.kind}) has completed`
          if (p.locationId) {
            message += ` on ${this.map.cells[p.locationId].name}`
          }

          this.log.push({
            player: player.id,
            message,
          })
        } else {
          remainingProductions.push(p)
        }
      }
      player.productionStatuses = remainingProductions
    })
  }

  getLog() {
    return this.log
  }
}
