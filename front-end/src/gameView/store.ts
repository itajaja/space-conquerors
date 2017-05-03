import * as _ from 'lodash'
import { Action, IProduceAction } from 'sco-engine/src/actions'
import * as dx from 'sco-engine/src/definitions'
import { IUnitState } from 'sco-engine/src/state'
import unitTypes from 'sco-engine/src/units'
import { IVisibleState } from 'sco-engine/src/visibility'

import { Game } from '../api'
import BaseStore from '../store'

export type State = {
  game: Game,
  gameState: IVisibleState,
  selectedLocationId?: string,
  selectedUnits?: string[],
  selectedDestinations?: { [idx: string]: true },
  selectedPath?: string[],
  actions?: Action[],
  view: 'map' | 'overview' | 'turn',
}

const EMPTY_SELECTION = {
  selectedPath: undefined,
  selectedDestinations: undefined,
  selectedLocationId: undefined,
  selectedUnits: undefined,
}

export default class Store extends BaseStore<State> {
  showMap = () => {
    this.set({ view: 'map', ...EMPTY_SELECTION })
  }

  showOverwiew = () => {
    this.set({ view: 'overview', ...EMPTY_SELECTION })
  }

  showTurn = () => {
    this.set({ view: 'turn', ...EMPTY_SELECTION })
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

    const speeds = this.state.selectedUnits!
      .map(u => this.state.gameState.units[u])
      .map(u => unitTypes[u.unitTypeId].speed)

    if (selectedPath.length > _.min(speeds)) {
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
      selectedDestinations: this.state.game.map.cells[locationId].edges,
    })
  }

  selectUnits(units: IUnitState[]) {
    this.set({
      ...EMPTY_SELECTION,
      selectedUnits: units.map(u => u.id),
    })

    const from = units[0].locationId
    if (units.every(u => u.locationId === from)) {
      this.selectPossibleDestinations(from)
      this.set({
        selectedPath: [from],
      })
    }
  }

  makePurchase(item: dx.IItem, locationId?: string) {
    const newAction: IProduceAction = {
      kind: 'produce',
      playerId: this.state.gameState.player.id,
      itemId: item.id,
      locationId,
    }

    this.addActions([newAction])
  }

  makeUnitMovement(units: string[], path: string[]) {
    const speeds = units
      .map(u => this.state.gameState.units[u])
      .map(u => unitTypes[u.unitTypeId].speed)

    const indexedUnits = new Set(units)

    const oldActions = (this.state.actions || [])
      .filter(a => {
        if (a.kind === 'move' && indexedUnits.has(a.unitId)) {
          return false
        }
        return true
      })

    const newActions = units.map(a => ({
      kind: 'move' as 'move',
      path,
      playerId: this.state.gameState.player.id,
      speed: _.min(speeds),
      unitId: a,
    }))

    this.set({ actions: [...oldActions, ...newActions] })

    this.set(EMPTY_SELECTION)
  }

  removeAction(index: number) {
    const { actions } = this.state
    actions!.splice(index, 1)

    this.set({ actions })
  }

  addActions(newActions: Action[]) {
    const actions = [...(this.state.actions || []), ...newActions]

    this.set({ actions })
  }
}
