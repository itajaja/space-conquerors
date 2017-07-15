import * as _ from 'lodash'

import buildingTypes from './buildings'
import * as dx from './definitions'
import { GameCache } from './game'
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
  constructor(private game: GameCache) { }

  calculatePlanetProduction(locationId: string) {
    const buildings = this.game.buildingsByLocation()[locationId]
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
      this.calculateBuildingsProduction(this.game.buildingsByLocation()[locationId]),
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

  calculatePlanetsProduction(planets: sx.IPlanetState[]) {
    return planets.reduce(
      (prev, cur) => add(prev, this.calculatePlanetProduction(cur.locationId)),
      dx.zeroResources(),
    )
  }

  calculatePlayerProduction(playerId: string) {
    // [] in case the player is dead. we should handle this better somewhere
    return this.calculatePlanetsProduction(this.game.planetsByUser()[playerId] || [])
  }

  calculateFoodProduction() {
    return _.mapValues(this.game.buildingsByUser(), buildings => (
      _.sumBy(buildings, b => buildingTypes[b.buildingTypeId].foodYield || 0)
    ))
  }

  calculateFoodConsumption() {
    return _.mapValues(this.game.unitsByUser(), units => (
      _.sumBy(units, u => unitTypes[u.unitTypeId].foodConsumption)
    ))
  }
}
