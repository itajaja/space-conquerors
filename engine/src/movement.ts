import * as _ from 'lodash'

import * as ax from './actions'
import { GameCache } from './game'
import unitTypes from './units'

export function estimateGasCost(actions: ax.IMovementAction[], game: GameCache) {
  return _.sumBy(actions, a => {
    const unit = game.state.units[a.unitId]
    const { gasConsumption } = unitTypes[unit.unitTypeId]
    return gasConsumption * (a.path.length - 1)
  })
}
