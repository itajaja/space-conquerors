import * as _ from 'lodash'

import buildingTypes from './buildings'
import * as dx from './definitions'
import * as sx from './state'
import technologyTypes from './technologies'
import unitTypes from './units'

export const items: { [idx: string]: dx.PurchaseableItem } = {
  ...buildingTypes,
  ...technologyTypes,
  ...unitTypes,
}

export function subtract(
  a: dx.ResourceAmount,
  b: dx.ResourceAmount,
): dx.ResourceAmount {
  return {
    gold: a.gold - b.gold,
    iron: a.iron - b.iron,
    gas: a.gas - b.gas,
    darkMatter: a.darkMatter - b.darkMatter,
  }
}

export function add(
  a: dx.ResourceAmount,
  b: dx.ResourceAmount,
): dx.ResourceAmount {
  return {
    gold: a.gold + b.gold,
    iron: a.iron + b.iron,
    gas: a.gas + b.gas,
    darkMatter: a.darkMatter + b.darkMatter,
  }
}

export function ge(a: dx.ResourceAmount, b: dx.ResourceAmount) {
  const result = subtract(a, b)
  return _.values(result).every(r => r >= 0)
}

export class ResourceCalculator {
  // Maybe we should move these indexes in a common place
  buildingsByUser = _.groupBy(_.values(this.state.buildings), l => l.playerId)
  buildingsByLocation = _.groupBy(_.values(this.state.buildings), l => l.locationId)
  planetsByUser = _.groupBy(_.values(this.state.planets), l => l.ownerPlayerId)

  constructor(private state: sx.IGameState) { }

  calculatePlanetProduction(locationId: string) {
    const buildings = this.buildingsByLocation[locationId]
    if (!buildings) {
      return dx.zeroResources()
    }
    const hasDepot = buildings.find(d => d.buildingTypeId === 'building_depot')
    if (!hasDepot) {
      return dx.zeroResources()
    }
    // TODO: for now this is the same for all planets. we should factor in
    // the planet type
    let resources = dx.zeroResources({ gold: 250, iron: 25, gas: 50 })

    resources = add(
      resources,
      this.calculateBuildingsProduction(this.buildingsByLocation[locationId]),
    )

    return resources
  }

  calculateBuildingProduction(building: sx.IBuildingState) {
    return buildingTypes[building.buildingTypeId].resourceYield || dx.zeroResources()
  }

  calculateBuildingsProduction(buildings: sx.IBuildingState[]) {
    return buildings.reduce(
      (prev, cur) => add(prev, this.calculateBuildingProduction(cur)),
      dx.zeroResources(),
    )
  }

  calculatePlayerProduction(playerId: string) {
    return this.calculateBuildingsProduction(this.buildingsByUser[playerId] || [])
  }
}
