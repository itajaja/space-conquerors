import * as _ from 'lodash'

import * as ax from './actions'
import * as dx from './definitions'
import { items } from './gameEngine'
import { IMap } from './map'
import * as resources from './resources'
import * as sx from './state'
import technologyTypes from './technologies'
import unitTypes from './units'

class ValidationError extends Error {
  // tslint:disable-next-line:max-line-length
  // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

  constructor(m: string) {
    super(m)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export default class GameValidator {
  buildingsByLocation = _.groupBy(_.values(this.state.buildings), l => l.locationId)

  constructor(public state: sx.IGameState, public map: IMap) { }

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

  /**
   * Check if an item has the rigth technology requirement
   */
  validateItemTechRequirements(item: dx.IPurchaseable, player: sx.IPlayerState) {
    const techRequirements = Object.keys(item.technologyRequirements)
    if (techRequirements.some(t => !player.technologies[t])) {
      throw new ValidationError('technology requirements not satisfied')
    }
  }

  /**
   * Check if a technology is available to be researched
   */
  validateUnitOrBuildingAvailability(
    item: dx.IUnitType | dx.IBuildingType,
    player: sx.IPlayerState,
    location: sx.IPlanetState,
  ) {
    this.validateItemTechRequirements(item, player)
  }

  /**
   * Check if a technology is available to be researched
   */
  validateTechAvailability(item: dx.ITechnology, player: sx.IPlayerState) {
    this.validateItemTechRequirements(item, player)

    if (!!player.technologies[item.id]) {
      throw new ValidationError('already present')
    }

    const requirement = item.level === 1
      ? true
      : _.keys(player.technologies).map(t => technologyTypes[t])
        .some(t => t.family === item.family && t.level === item.level - 1)

    if (!requirement) {
      throw new ValidationError('technology level not available')
    }
  }

  validateProductionAction(action: ax.IProduceAction) {
    const item = items[action.itemId]
    const player = this.state.players[action.playerId]

    if (!resources.ge(player.resourcesAmount, item.cost)) {
      throw new ValidationError('not enough resources')
    }

    if (item.kind === 'tech') {
      this.validateTechAvailability(item, player)

      if (!!player.productionStatuses.find(p => p.itemId === item.id)) {
        throw new ValidationError('already scheduled')
      }
    }

    if (item.kind !== 'tech') {
      if (!action.locationId) {
        throw new ValidationError('must provide a location')
      }

      const location = this.state.planets[action.locationId]

      this.validateUnitOrBuildingAvailability(item, player, location)
      if (item.kind === 'building') {
        if (location.ownerPlayerId !== player.id) {
          throw new ValidationError('location not owned')
        }
        const existingBuildings = (this.buildingsByLocation[location.locationId] || [])
          .filter(b => b.buildingTypeId === item.id)
        const producingBuildings = player.productionStatuses
          .filter(p => p.itemId === item.id && p.locationId === location.locationId)
        const currentBuildings = existingBuildings.length + producingBuildings.length
        if (item.maxPerPlanet && currentBuildings >= item.maxPerPlanet) {
          throw new ValidationError('can\'t build more of this on this planet')
        }
      }
      // TODO add checks for max per planet and max per system
    }
  }

  validateMovementAction(action: ax.IMovementAction) {
    const unit = this.state.units[action.unitId]
    const player = this.state.players[action.playerId]

    if (unit.playerId !== player.id) {
      throw new ValidationError('cannot move a unit that is not owned')
    }

    if (action.speed <= 0 || action.speed > unitTypes[unit.unitTypeId].speed) {
      throw new ValidationError('invalid speed')
    }

    if (action.path.length < 2) {
      throw new ValidationError('invalid path length')
    }

    const [start, ...path] = action.path

    if (start !== unit.locationId) {
      throw new ValidationError('starting point of movement doesn\'t match unit position')
    }

    path.forEach((step, idx) => {
      const prevStep = action.path[idx]
      const stepLoc = this.map.cells[step]

      if (!stepLoc.edges[prevStep]) { // edges are undirected, so this is fine
        throw new ValidationError('steps provided are not contiguous')
      }
    })
  }

  validateMovementActions(actions: ax.IMovementAction[]) {
    const movedUnits = {}
    actions.forEach(action => {
      if (movedUnits[action.unitId]) {
        throw new ValidationError('cannot provide two movement actions for the same unit')
      }
      movedUnits[action.unitId] = true
    })
  }
}
