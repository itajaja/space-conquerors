import * as _ from 'lodash'

import * as sx from './state'
import unitTypes from './units'

interface IUnit extends sx.IUnitState {
  id: string
  hp: number
}

// only units with more than this percentage of hp left will survive
const SURVIVE_THRESHOLD = .15

/**
 * CombatEngine contains all the logic to handle combats
 */
export default class CombatEngine {
  private units: {[idx: string]: IUnit}

  constructor(units: IUnit[]) {
    this.units = _.keyBy(units, u => u.id)
  }

  start() {
    while (true) {
      this.performTurn()

      const survivingPlayers = _.keys(_.keyBy(_.values(this.units), u => u.playerId))

      if (survivingPlayers.length === 0) {
        return this.computeSurvivors()
      }
    }
  }

  computeSurvivors() {
    return _.values(this.units).filter(u => {
      const endurance = unitTypes[u.unitTypeId].endurance
      return u.hp / endurance > SURVIVE_THRESHOLD
    })
  }

  orderUnits(units: IUnit[]) {
    return _.sortBy(units, u => -(unitTypes[u.unitTypeId].shootingSpeed + Math.random() * 500))
  }

  weightedRandomPick(items: number[]): number {
    const sum = items.reduce((a, b) => a + b, 0)
    const draw = Math.random() * sum

    let acc = 0
    for (const [i, value] of Array.from(items.entries())) {
      acc += value
      if (acc > draw) {
        return i
      }
    }

    throw new Error('Unreachable')
  }

  shoot(unit: IUnit, targets: IUnit[]) {
    const targetCalibers =  targets.map(u => unitTypes[u.unitTypeId].strategicCaliber)
    const targetIndex = this.weightedRandomPick(targetCalibers)
    const target = targets[targetIndex]
    const unitType = unitTypes[unit.unitTypeId]
    const targetType = unitTypes[target.unitTypeId]

    const x = Math.random() * 1000 / unitType.accuracy
    const σ = 100 / targetType.accuracy
    const exp = - (x * x) / (2 * σ * σ)
    const damage = unitType.firePower * Math.exp(exp)

    target.hp -= damage
    if (target.hp <= 0) {
      delete this.units[target.id]
    }
  }

  performTurn() {
    const units = _.values(this.units)

    const orderedUnits = this.orderUnits(units)

    for (const unit of orderedUnits) {
      if (!this.units[unit.id]) { // check if dead
        continue
      }

      const targets = units.filter(u => u.playerId !== unit.playerId)
      this.shoot(unit, targets)
    }
  }
}
