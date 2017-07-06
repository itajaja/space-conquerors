import * as _ from 'lodash'

import * as ax from './actions'
import { items } from './gameEngine'
import { IMap } from './map'
import * as resources from './resources'
import { IGameState } from './state'
import technologyTypes from './technologies'
import unitTypes from './units'

class ValidationError extends Error {}

export default class GameValidator {
  constructor(public state: IGameState, public map: IMap) { }

  safe(func: () => void) {
    try {
      func()
    } catch (e) {
      if (e instanceof ValidationError) {
        return e.message
      }
      throw e
    }

    return null
  }

  validateProductionAction(action: ax.IProduceAction) {
    const item = items[action.itemId]
    if (!item) {
      throw new ValidationError('invalid_production_action.invalid_itemid')
    }

    const player = this.state.players[action.playerId]
    if (!player) {
      throw new ValidationError('invalid_production_action.invalid_player')
    }

    if (!resources.ge(player.resourcesAmount, item.cost)) {
      throw new ValidationError('invalid_production_action.not_enough_resources')
    }

    const techRequirements = Object.keys(item.technologyRequirements)
    if (techRequirements.some(t => !player.technologies[t])) {
      throw new ValidationError('invalid_production_action.tech_required')
    }

    if (item.kind === 'tech') {
      if (player.technologies[item.id]) {
        throw new ValidationError('invalid_production_action.tech_already_present')
      }

      const requirement = item.level === 1
        ? true
        : _.keys(player.technologies).map(t => technologyTypes[t])
          .some(t => t.family === item.family && t.level === item.level - 1)

      if (!requirement) {
        throw new ValidationError('invalid_production_action.tech_tree_not_satisfied')
      }
    }

    if (item.kind !== 'tech') {
      if (!action.locationId) {
        throw new ValidationError('invalid_production_action.no_location')
      }

      const location = this.state.planets[action.locationId]
      if (!location) {
        throw new ValidationError('invalid_production_action.invalid_location')
      }

      if (location.ownerPlayerId !== player.id) {
        throw new ValidationError('invalid_production_action.not_owned_location')
      }
    }

    // TODO: if building, check if exceeding caps
  }

  validateMovementAction(action: ax.IMovementAction) {
    const unit = this.state.units[action.unitId]
    if (!unit) {
      throw new ValidationError('invalid_movement_action.invalid_unitid')
    }

    const player = this.state.players[action.playerId]
    if (!player) {
      throw new ValidationError('invalid_movement_action.invalid_player')
    }
    if (unit.playerId !== player.id) {
      throw new ValidationError('invalid_movement_action.not_unit_owner')
    }

    if (action.speed <= 0 || action.speed > unitTypes[unit.unitTypeId].speed) {
      throw new ValidationError('invalid_movement_action.invalid_speed')
    }

    if (action.path.length < 2) {
      throw new ValidationError('invalid_movement_action.path_length')
    }

    const [start, ...path] = action.path

    if (start !== unit.locationId) {
      throw new ValidationError('invalid_movement_action.starting_point')
    }

    path.forEach((step, idx) => {
      const prevStep = action.path[idx]
      const stepLoc = this.map.cells[step]
      if (!stepLoc) {
        throw new ValidationError('invalid_movement_action.invalid_path_step')
      }

      if (!stepLoc.edges[prevStep]) { // edges are undirected, so this is fine
        throw new ValidationError('invalid_movement_action.invalid_path_step_edge')
      }
    })
  }

  validateMovementActions(actions: ax.IMovementAction[]) {
    const movedUnits = {}
    actions.forEach(action => {
      if (movedUnits[action.unitId]) {
        throw new ValidationError('invalid_movement_action.duplicate_unit_movement')
      }
      movedUnits[action.unitId] = true
    })
  }
}
