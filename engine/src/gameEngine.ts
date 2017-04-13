import * as _ from 'lodash'

import * as ax from './actions'
import buildings from './buildings'
import * as dx from './definitions'
import * as sx from './state'
import { IGameState } from './state'
import technologies from './technologies'
import units from './units'

const items: { [idx: string]: dx.PurchaseableItem } = {
  ...buildings,
  ...technologies,
  ...units,
}

/**
 * GameEngine contains all the logic to manipulate the game state
 */
export default class GameEngine {
  constructor(public state: IGameState) { }

  subtractResources(
    a: dx.ResourceAmount, b: dx.ResourceAmount,
  ): dx.ResourceAmount {
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

  schedulePlayerProduction(
    player: sx.IPlayerState,
    actions: ax.IProduceAction[],
  ) {
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

  moveUnits(actions: ax.IMovementAction[]) {
  }

  produceResources() {
  }

  updateProduction() {
  }
}
