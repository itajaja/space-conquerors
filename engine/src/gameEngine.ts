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

/**
 * GameEngine contains all the logic to manipulate the game state
 */
export default class GameEngine {
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

  executeStep(action: ax.IMovementAction, unit: sx.IUnitState, speed: number, step: number) {
    const pathIndex = Math.min(Math.floor(step / speed))
    const isInTransit = !!(step % speed)

    const from = action.path[pathIndex]
    const to = action.path[pathIndex + 1]

    if (!to || !isInTransit) {
      // means it's either arrived or on a planet
      unit.locationId = from
      return from
    }

    return this.edgeId(from, to)
  }

  moveUnits(actions: ax.IMovementAction[]) {
    const steps = actions.reduce((prev, curr) => lcm(prev, curr.speed), 0)

    let unitActions = actions.map(action => {
      const unit = this.state.units[action.unitId]
      const unitType = unitTypes[unit.unitTypeId]
      return {
        action,
        unit,
        unitType,
        speed: steps / unitType.speed,
      }
    })

    for (let step = 0; step <= steps; ++step) {
      const locations = _.groupBy(unitActions, ({ action, unit, speed }) => (
        this.executeStep(action, unit, speed, step)
      ))

      _.forOwn(locations, units => {
        const playersInvolved = _.keys(_.groupBy(units, u => u.unit.playerId))
        // TODO: check allies and such
        if (playersInvolved.length > 1) {
          const combatUnits = units.map(u => ({ ...u.unit, hp: u.unitType.endurance }))
          const survivors = new CombatEngine(combatUnits).start()

          // remove dead units
          const dead = _.difference(combatUnits.map(u => u.id), survivors.map(u => u.id))
          dead.forEach(deadId => delete this.state.units[deadId])
          unitActions = unitActions.filter(u => !this.state.units[u.unit.id])
        }
      })

    }
  }

  produceResources() {
    const buildingsByUser = _.groupBy(_.values(this.state.buildings), l => l.playerId)

    _.forOwn(this.state.players, p => {
      p.resourcesAmount = (buildingsByUser[p.id] || []).reduce(
        (prev, cur) => {
          const { resourceYield } = buildingTypes[cur.buildingTypeId]
          // TODO factor in planet type
          return resourceYield ? addResources(prev, resourceYield) : prev
      }, p.resourcesAmount)
    })
  }

  updateProduction() {
    _.forOwn(this.state.players, (player, playerId: string) => {
      const remainingProductions: sx.IProductionStatus[] = []
      for (const p of player.productionStatuses) {
        p.remainingTurns--

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
        } else {
          remainingProductions.push(p)
        }
      }
      player.productionStatuses = remainingProductions
    })
  }
}
