import * as _ from 'lodash'

import * as ax from './actions'
import GameEngine from './gameEngine'
import { Log } from './logs'
import { IMap } from './map'
import { ResourceCalculator } from './resources'
import * as sx from './state'
import { deepClone } from './utils/index'

/**
 * takes a game state and some actions and creates a new state for the next
 * turn where the passed actions are applied
 */
export function applyTurn(
  state: sx.IGameState, map: IMap, actions: ax.Action[],
): { state: sx.IGameState, logs: Log[] } {
  const produceActions: ax.IProduceAction[] = []
  const moveActions: ax.IMovementAction[] = []

  actions.forEach(a => {
    switch (a.kind) {
      case 'produce':
        produceActions.push(a)
        break
      case 'move':
        moveActions.push(a)
        break
      default: throw new Error('Unsuported action')
    }
  })

  const newGameCache = new GameCache(deepClone(state), map)
  const engine = new GameEngine(newGameCache)

  // produce
  engine.scheduleProduction(produceActions)

  // move
  engine.moveUnits(moveActions)
  engine.conquerPlanets()

  // tick turn

  // produce resource
  engine.produceResources()

  // update production queue
  engine.updateProduction()

  // check if some players are dead, and check game over conditions
  engine.updatePlayerStatus()

  return {
    state: newGameCache.state,
    logs: engine.getLogs(),
  }
}

// TODO this is not an actual cache, because we need to solve
// consistency problems better
export class GameCache {
  resourceCalculator = new ResourceCalculator(this)

  constructor(public state: sx.IGameState, public map: IMap) { }

  buildingsByUser = () => this.padUsers(
    _.groupBy(_.values(this.state.buildings), l => l.playerId), () => [],
  )

  buildingsByLocation = () => (
    _.groupBy(_.values(this.state.buildings), l => l.locationId)
  )

  planetsByUser = () => this.padUsers(
    _.groupBy(_.values(this.state.planets), l => l.ownerPlayerId), () => [],
  )

  unitsByUser = () => this.padUsers(
    _.groupBy(_.values(this.state.units), u => u.playerId), () => [],
  )

  foodConsumption = () => this.padUsers(
    this.resourceCalculator.calculateFoodConsumption(), () => 0,
  )

  foodProduction = () => this.padUsers(
    this.resourceCalculator.calculateFoodProduction(), () => 0,
  )

  private padUsers<T>(obj: {[idx: string]: T}, defaultVal: () => T) {
    _.keys(this.state.players).forEach(p => {
      if (obj[p] === undefined) {
        obj[p] = defaultVal()
      }
    })

    return obj
  }
}
