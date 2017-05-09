import * as _ from 'lodash'

import { ITechnology, ITechnologyFamily, zeroResources } from '../definitions'

// tslint:disable:max-line-length

const techList: ITechnology[] = [
  { kind: 'tech', id: 'tech_galaxy_trade', name: 'Galaxy trade', cost: zeroResources({ gold: 500 }), productionTime: 2, description: 'Allows to build Market Places', technologyRequirements: {}, level: 1, family: 'tech_family_civil' },
  { kind: 'tech', id: 'tech_iron1', name: 'Iron 1', cost: zeroResources({ gold: 300 }), productionTime: 1, description: 'Allows to build Iron Mines', technologyRequirements: {}, level: 1, family: 'tech_family_civil' },
  { kind: 'tech', id: 'tech_gas1', name: 'Gas 1', cost: zeroResources({ gold: 300 }), productionTime: 1, description: 'Allows to build Pipelines', technologyRequirements: {}, level: 1, family: 'tech_family_civil' },
  { kind: 'tech', id: 'tech_small_ships', name: 'Small Ships', cost: zeroResources({ gold: 300 }), productionTime: 2, description: 'Allows to produce Small Ships', technologyRequirements: {}, level: 1, family: 'tech_family_military' },
  { kind: 'tech', id: 'tech_anti_armor_laser', name: 'Anti-Armor Lasers', cost: zeroResources({ gold: 400 }), productionTime: 1, description: 'Allows to produce Ships with Anti-Armor Lasers', technologyRequirements: {}, level: 1, family: 'tech_family_military' },
]

export default  _.keyBy(techList, 'id')

const techFamilyList: ITechnologyFamily[] = [
  { kind: 'techFamily', description: 'Civil', id: 'tech_family_civil', name: 'Civil' },
  { kind: 'techFamily', description: 'Military', id: 'tech_family_military', name: 'Military' },
]

export const technologyFamilies = _.keyBy(techFamilyList, 'id')
