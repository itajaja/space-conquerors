import * as _ from 'lodash'

import { ArmoringType, IUnitType, UnitClass, zeroResources } from '../definitions'

// tslint:disable:max-line-length

const unitList: IUnitType[] = [
  { kind: 'unit', id: 'unit_spear', name: 'Spear', shootingSpeed: 400, accuracy: 55, evasion: 17, endurance: 900, firePower: 150, strategicCaliber: 300, armoringType: ArmoringType.BASIC, unitClass: UnitClass.NONE, speed: 3, gasConsumption: 2, foodConsumption: 2, cost: zeroResources({ gold: 150, iron: 20, darkMatter: 0 }), technologyRequirements: {}, productionTime: 1, description: 'TODO' },
  { kind: 'unit', id: 'unit_explorer', name: 'Explorer', shootingSpeed: 300, accuracy: 30, evasion: 18, endurance: 1200, firePower: 200, strategicCaliber: 500, armoringType: ArmoringType.BASIC, unitClass: UnitClass.NONE, speed: 3, gasConsumption: 3, foodConsumption: 2, cost: zeroResources({ gold: 250, iron: 25, darkMatter: 0 }), technologyRequirements: { tech_small_ships: true }, productionTime: 1, description: 'TODO' },
  { kind: 'unit', id: 'unit_crusader', name: 'Crusader', shootingSpeed: 500, accuracy: 70, evasion: 16, endurance: 1500, firePower: 300, strategicCaliber: 400, armoringType: ArmoringType.BASIC, unitClass: UnitClass.NONE, speed: 3, gasConsumption: 4, foodConsumption: 3, cost: zeroResources({ gold: 150, iron: 40, darkMatter: 0 }), technologyRequirements: { tech_small_ships: true, tech_anti_armor_laser: true }, productionTime: 1, description: 'TODO' },
]

export default _.keyBy(unitList, 'id')
