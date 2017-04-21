import { Action, IProduceAction } from 'sco-engine/src/actions'
import * as dx from 'sco-engine/src/definitions'
import { IVisibleState } from 'sco-engine/src/visibility'

import { Game } from '../api'
import BaseStore from '../store'

export type State = {
  game: Game,
  gameState: IVisibleState,
  selectedLocationId?: string,
  actions?: Action[],
}

export default class Store extends BaseStore<State> {
  selectPlanet(selectedLocationId: string) {
    this.set({ selectedLocationId })
  }

  makePurchase(item: dx.IItem, locationId?: string) {
    const newAction: IProduceAction = {
      kind: 'produce',
      playerId: this.state.gameState.player.id,
      itemId: item.id,
      locationId,
    }

    this.addAction(newAction)
  }

  removeAction(index: number) {
    const { actions } = this.state
    actions!.splice(index, 1)

    this.set({ actions })
  }

  addAction(action: Action) {
    const actions = [...(this.state.actions || []), action]

    this.set({ actions })
  }
}
