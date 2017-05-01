import * as _ from 'lodash'

import { IBuildingType, zeroResources } from '../definitions'

// tslint:disable:max-line-length

const buildingList: IBuildingType[] = [
  { kind: 'building', id: 'building_depot', name: 'Depot', cost: zeroResources({ gold: 150, iron: 30 }), productionTime: 1, description: 'Allows players to gather resources from the planet', maxPerPlanet: 1, techRequirements: {} },
  { kind: 'building', id: 'building_marketPlace', name: 'Marketplace', cost: zeroResources({ gold: 300, iron: 10 }), productionTime: 1, resourceYield: zeroResources({ gold: 100 }), description: 'Produces 100 gold extra from the planet every turn', maxPerPlanet: 1, techRequirements: { tech_galaxy_trade: true } },
  { kind: 'building', id: 'building_ironMine', name: 'Iron Mine', cost: zeroResources({ gold: 250, iron: 20 }), productionTime: 1, resourceYield: zeroResources({ iron: 10 }), description: 'Produces 10 iron extra from the planet every turn', maxPerPlanet: 1, techRequirements: { tech_iron1: true } },
  { kind: 'building', id: 'building_pipeline', name: 'Pipeline', cost: zeroResources({ gold: 250, iron: 20 }), productionTime: 1, resourceYield: zeroResources({ gas: 30 }), description: 'Produces 30 gas extra from the planet every turn', maxPerPlanet: 1, techRequirements: { tech_gas1: true } },
]

export default _.keyBy(buildingList, 'id')
