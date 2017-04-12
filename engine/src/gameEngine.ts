import * as ax from './actions'
import { IGameState } from './state'

/**
 * GameEngine contains all the logic to manipulate the game state
 */
export default class GameEngine {
  constructor(public state: IGameState) { }

  scheduleProduction(actions: ax.IProduceAction[]) {
  }

  moveUnits(actions: ax.IMovementAction[]) {
  }

  produceResources() {
  }

  updateProduction() {
  }
}
