import * as _ from 'lodash'

import * as ax from './actions'
import buildingTypes from './buildings'
import * as dx from './definitions'
import { IMap, ICell } from './map'
import * as sx from './state'
import { IGameState } from './state'
import technologyTypes from './technologies'
import unitTypes from './units'
import { lcm } from "./utils/index";

const items: { [idx: string]: dx.PurchaseableItem } = {
  ...buildingTypes,
  ...technologyTypes,
  ...unitTypes,
}

/**
 * GameEngine contains all the logic to manipulate the game state
 */
export default class GameEngine {
  constructor(public state: IGameState, public map: IMap) { }

  subtractResources(a: dx.ResourceAmount, b: dx.ResourceAmount): dx.ResourceAmount {
    return {
      gold: a.gold - b.gold,
      iron: a.iron - b.iron,
      gas: a.gas - b.gas,
      darkMatter: a.darkMatter - b.darkMatter,
    }
  }

  addResources(a: dx.ResourceAmount, b: dx.ResourceAmount): dx.ResourceAmount {
    return {
      gold: a.gold + b.gold,
      iron: a.iron + b.iron,
      gas: a.gas + b.gas,
      darkMatter: a.darkMatter + b.darkMatter,
    }
  }

  hasEnoughResources(a: dx.ResourceAmount, b: dx.ResourceAmount) {
    const result = this.subtractResources(a, b)
    Object.keys(k => result[k] >= 0)
  }

  canProduceItem(player: sx.IPlayerState, item: dx.PurchaseableItem) {
    // check if enough resources
    if (!this.hasEnoughResources(player.resourcesAmount, item.cost)) {
      return false
    }
    // check if tech present
    const techRequirements = Object.keys(item.techRequirements)
    if (techRequirements.some(t => !player.technologies[t])) {
      return false
    }

    // TODO: if building, check if exceeding caps

    return true
  }

  schedulePlayerProduction(player: sx.IPlayerState, actions: ax.IProduceAction[]) {
    for (const a of actions) {
      const item = items[a.itemId]

      if (this.canProduceItem(player, item)) {
        player.resourcesAmount = this.subtractResources(
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
    const unitStates = _.keyBy(this.state.units, 'id')

    const unitActions = actions.map(action => {
      const unit = unitStates[action.unitId]
      return {
        action,
        unit,
        speed: steps / unitTypes[unit.unitTypeId].speed,
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
          // TODO: BATTLE
          // TODO: make sure to handle destroyed units
        }
      })

    }
  }

  produceResources() {
  }

  updateProduction() {
  }
}
