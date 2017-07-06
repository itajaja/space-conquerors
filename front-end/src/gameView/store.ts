import * as _ from 'lodash'
import { IUnitState } from 'sco-engine/lib/state'
import unitTypes from 'sco-engine/lib/units'

import BaseStore from '../store'
import { GameView } from './index'

const EMPTY_SELECTION = {
  selectedPath: undefined,
  selectedDestinations: undefined,
  selectedLocationId: undefined,
  selectedUnits: [],
}

export default class Store extends BaseStore<GameView> {
  get game() {
    return this.component.props.data!.game
  }

  selectPlanet(selectedLocationId: string) {
    this.set({ ...EMPTY_SELECTION, selectedLocationId })
  }

  moveUnits(to: string) {
    if (!this.state.selectedDestinations![to]) {
      return
    }

    const selectedPath = this.state.selectedPath
      ? [...this.state.selectedPath, to]
      : [to]

    const speeds = this.state.selectedUnits
      .map(u => this.game.state.units[u])
      .map(u => unitTypes[u.unitTypeId].speed)

    if (selectedPath.length > (_.min(speeds) || 0)) {
      this.set({
        selectedDestinations: undefined,
      })
    } else {
      this.selectPossibleDestinations(to)
    }

    this.set({ selectedPath })
  }

  selectPossibleDestinations(locationId: string) {
    this.set({
      selectedDestinations: this.game.map.cells[locationId].edges,
    })
  }

  selectUnits(units: IUnitState[]) {
    this.set({
      ...EMPTY_SELECTION,
      selectedUnits: units.map(u => u.id),
    })

    if (!units.length) {
      return
    }

    const from = units[0].locationId
    if (units.every(u =>
      u.locationId === from // all from same location
      && u.playerId === this.game.state.player.id, // all owned by player
    )) {
      this.selectPossibleDestinations(from)
      this.set({
        selectedPath: [from],
      })
    }
  }

  // This is deprecated, the mutations should be moved to GQL server
  // makePurchase(item: dx.IItem, locationId?: string) {
  //   const newAction: IProduceAction = {
  //     kind: 'produce',
  //     playerId: this.state.gameState.player.id,
  //     itemId: item.id,
  //     locationId,
  //   }

  //   this.addActions([newAction])
  // }

  // makeUnitMovement(units: string[], path: string[]) {
  //   const speeds = units
  //     .map(u => this.state.gameState.units[u])
  //     .map(u => unitTypes[u.unitTypeId].speed)

  //   const indexedUnits = new Set(units)

  //   const oldActions = (this.state.actions || [])
  //     .filter(a => {
  //       if (a.kind === 'move' && indexedUnits.has(a.unitId)) {
  //         return false
  //       }
  //       return true
  //     })

  //   const newActions = units.map(a => ({
  //     kind: 'move' as 'move',
  //     path,
  //     playerId: this.state.gameState.player.id,
  //     speed: _.min(speeds),
  //     unitId: a,
  //   }))

  //   this.set({ actions: [...oldActions, ...newActions] })

  //   this.set(EMPTY_SELECTION)
  // }

  // removeAction(index: number) {
  //   const { actions } = this.state
  //   actions!.splice(index, 1)

  //   this.set({ actions })
  // }

  // addActions(newActions: Action[]) {
  //   const actions = [...(this.state.actions || []), ...newActions]

  //   this.set({ actions })
  // }
}
