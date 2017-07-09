import * as _ from 'lodash'

import { ITechnology, TechnologyFamily, zeroResources } from '../definitions'

// tslint:disable:max-line-length

const techList: ITechnology[] = [
  { kind: 'tech', id: 'tech_galaxy_trade', name: 'Galaxy trade', cost: zeroResources({ gold: 500 }), productionTime: 2, description: 'Allows to build Market Places', technologyRequirements: {}, level: 1, family: TechnologyFamily.CIVIL },
  { kind: 'tech', id: 'tech_iron1', name: 'Iron 1', cost: zeroResources({ gold: 300 }), productionTime: 1, description: 'Allows to build Iron Mines', technologyRequirements: {}, level: 1, family: TechnologyFamily.CIVIL },
  { kind: 'tech', id: 'tech_gas1', name: 'Gas 1', cost: zeroResources({ gold: 300 }), productionTime: 1, description: 'Allows to build Pipelines', technologyRequirements: {}, level: 1, family: TechnologyFamily.CIVIL },
  { kind: 'tech', id: 'tech_advanced_farming', name: 'Advanced Farming', cost: zeroResources({ gold: 1000 }), productionTime: 2, description: 'Doubles farm benefits on Green planets', technologyRequirements: {}, level: 3, family: TechnologyFamily.CIVIL },
  { kind: 'tech', id: 'tech_advanced_science', name: 'Advanced Science', cost: zeroResources({ gold: 500 }), productionTime: 2, description: 'Allows players to research two technologies at once', technologyRequirements: {}, level: 3, family: TechnologyFamily.CIVIL },  
  { kind: 'tech', id: 'tech_iron2', name: 'Iron 2', cost: zeroResources({ gold: 1500 }), productionTime: 3, description: 'Allows to build Foundries', technologyRequirements: { tech_iron1: true, tech_advanced_farming: true }, level: 4, family: TechnologyFamily.CIVIL },
  { kind: 'tech', id: 'tech_gas2', name: 'Gas 2', cost: zeroResources({ gold: 1500 }), productionTime: 3, description: 'Allows to build Rafineries', technologyRequirements: { tech_gas1: true, tech_advanced_farming: true}, level: 4, family: TechnologyFamily.CIVIL },
  { kind: 'tech', id: 'tech_dm', name: 'Dark Matter', cost: zeroResources({ gold: 1500 }), productionTime: 3, description: 'Allows to build Dark matter quarry', technologyRequirements: { tech_gas1: true, tech_iron1: true, tech_advanced_farming: true}, level: 4, family: TechnologyFamily.CIVIL },
  { kind: 'tech', id: 'tech_small_ships', name: 'Small Ships', cost: zeroResources({ gold: 300 }), productionTime: 1, description: 'Allows to produce Small Ships', technologyRequirements: {}, level: 1, family: TechnologyFamily.MILITARY },
  { kind: 'tech', id: 'tech_anti_armor_laser', name: 'Anti-Armor Lasers', cost: zeroResources({ gold: 400 }), productionTime: 1, description: 'Allows to produce Ships with Anti-Armor Lasers', technologyRequirements: {}, level: 1, family: TechnologyFamily.MILITARY },
  { kind: 'tech', id: 'tech_medium_ships', name: 'Medium Ships', cost: zeroResources({ gold: 600 }), productionTime: 2, description: 'Allows to produce Medium Ships', technologyRequirements: { tech_small_ships: true}, level: 2, family: TechnologyFamily.MILITARY },
  { kind: 'tech', id: 'tech_bombs', name: 'Bombs', cost: zeroResources({ gold: 500 }), productionTime: 2, description: 'Allows to produce Ships with Bombs', technologyRequirements: { tech_small_ships: true }, level: 2, family: TechnologyFamily.MILITARY }
  { kind: 'tech', id: 'tech_large_ships', name: 'Large Ships', cost: zeroResources({ gold: 1500 }), productionTime: 3, description: 'Allows to produce Large Ships', technologyRequirements: { tech_medium_ships: true}, level: 3, family: TechnologyFamily.MILITARY },
  { kind: 'tech', id: 'tech_huge_ships', name: 'Huge Ships', cost: zeroResources({ gold: 2000 }), productionTime: 4, description: 'Allows to produce Huge Ships', technologyRequirements: { tech_large_ships: true}, level: 4, family: TechnologyFamily.MILITARY },
]

export default  _.keyBy(techList, 'id')
