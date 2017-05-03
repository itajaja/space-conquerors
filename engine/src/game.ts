import * as ax from './actions'
import GameEngine, { ITurnLogEntry } from './gameEngine'
import { IMap } from './map'
import { IGameState } from './state'
import { deepClone } from './utils/index'

export interface IGame {
  currentTurnNumber: number,
  states: IGameState[],

  map: IMap,
}

/**
 * takes a game state and some actions and creates a new state for the next
 * turn where the passed actions are applied
 */
export function applyTurn(
  state: IGameState, map: IMap, actions: ax.Action[],
): { state: IGameState, log: ITurnLogEntry[] } {
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

  const newState = deepClone(state)
  const engine = new GameEngine(newState, map)

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

  return {
    state: newState,
    log: engine.getLog(),
  }
}
