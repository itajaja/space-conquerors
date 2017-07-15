import * as _ from 'lodash'

import { IBuildingType, zeroResources } from '../definitions'

// tslint:disable:max-line-length

const buildingList: IBuildingType[] = [
  { kind: 'building', id: 'building_depot', name: 'Depot', cost: zeroResources({ gold: 150, iron: 30 }), productionTime: 1, description: 'Allows players to gather resources from the planet', maxPerPlanet: 1, technologyRequirements: {}, buildingRequirements: {} },
  { kind: 'building', id: 'building_marketPlace', name: 'Marketplace', cost: zeroResources({ gold: 300, iron: 10 }), productionTime: 1, resourceYield: zeroResources({ gold: 100 }), description: 'Produces 100 gold extra from the planet every turn', maxPerPlanet: 1, technologyRequirements: { tech_galaxy_trade: true }, buildingRequirements: {} },
  { kind: 'building', id: 'building_ironMine', name: 'Iron Mine', cost: zeroResources({ gold: 250, iron: 20 }), productionTime: 1, resourceYield: zeroResources({ iron: 10 }), description: 'Produces 10 iron extra from the planet every turn', maxPerPlanet: 1, technologyRequirements: { tech_iron1: true }, buildingRequirements: {} },
  { kind: 'building', id: 'building_pipeline', name: 'Pipeline', cost: zeroResources({ gold: 250, iron: 20 }), productionTime: 1, resourceYield: zeroResources({ gas: 30 }), description: 'Produces 30 gas extra from the planet every turn', maxPerPlanet: 1, technologyRequirements: { tech_gas1: true }, buildingRequirements: {} },
  { kind: 'building', id: 'building_farm', name: 'Farm', cost: zeroResources({ gold: 300, iron: 10 }), productionTime: 2, foodYield: 10, description: 'Increases population maximum by 10', maxPerPlanet: 1, technologyRequirements: {}, buildingRequirements: {} },
  { kind: 'building', id: 'building_foundry', name: 'Foundry', cost: zeroResources({ gold: 500, iron: 50 }), productionTime: 2, resourceYield: zeroResources({ iron: 20 }), description: 'Doubles iron income from the planet (Red planets only)', maxPerPlanet: 1, technologyRequirements: { tech_iron2: true}, buildingRequirements: {} },
  { kind: 'building', id: 'building_refinery', name: 'Refinery', cost: zeroResources({ gold: 500, iron: 50 }), productionTime: 2, resourceYield: zeroResources({ gas: 60 }), description: 'Doubles gas income from the planet (Blue planets only)', maxPerPlanet: 1, technologyRequirements: { tech_gas2: true }, buildingRequirements: {} },
  { kind: 'building', id: 'building_dmquarry', name: 'Dark matter quarry', cost: zeroResources({ gold: 1500, iron: 100 }), productionTime: 2, resourceYield: zeroResources({ darkMatter: 1 }), description: 'Produces 1 DM extra from the planet every turn (Dark Planets only)', maxPerPlanet: 1, technologyRequirements: { tech_dark_matter: true}, buildingRequirements: {} },
  { kind: 'building', id: 'building_spaceYard1', name: 'Space yard lev.1', cost: zeroResources({ gold: 500, iron: 50 }), productionTime: 1, description: 'Allows to build one small ship at a time.', maxPerPlanet: 1, technologyRequirements: {}, buildingRequirements: {} },
  { kind: 'building', id: 'building_spaceYard2', name: 'Space yard lev.2', cost: zeroResources({ gold: 700, iron: 100 }), productionTime: 1, description: 'Allows to build one medium or small ship at a time.', maxPerPlanet: 1, technologyRequirements: {}, buildingRequirements: {building_spaceYard1: true} },
  { kind: 'building', id: 'building_spaceYard3', name: 'Space yard lev.3', cost: zeroResources({ gold: 1000, iron: 200 }), productionTime: 2, description: 'Allows to build one large, medium or small ship at a time.', maxPerPlanet: 1, technologyRequirements: {}, buildingRequirements: {building_spaceYard2: true} },
  { kind: 'building', id: 'building_spaceYard4', name: 'Space yard lev.4', cost: zeroResources({ gold: 2000, iron: 400 }), productionTime: 2, description: 'Allows to build one huge, large, medium or small ship at a time.', maxPerPlanet: 1, technologyRequirements: {}, buildingRequirements: {building_spaceYard3: true} },
]

export default _.keyBy(buildingList, 'id')
