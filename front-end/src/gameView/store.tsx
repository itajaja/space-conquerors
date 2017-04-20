import { IVisibleState } from 'sco-engine/src/visibility'

import { Game } from '../api'
import BaseStore from '../store'

export type State = {
  game: Game,
  gameState: IVisibleState,
  selectedLocationId?: string,
}

export default class Store extends BaseStore<State> {
  selectPlanet(selectedLocationId: string) {
    this.set({ selectedLocationId })
  }
}
