import * as _ from 'lodash'
import * as uuid from 'uuid/v4'

import * as mx from './map'
import RandomNameGenerator from './randomNameGenerator'
import { getItemCircular } from './utils/index'

export default class MapGenerator {
  nameGen = new RandomNameGenerator()

  genNameId() {
    return {
      id: uuid() as string,
      name: this.nameGen.getRandom(),
    }
  }

  genRandomPlanet(): mx.IPlanet {
    // TODO: better planet definition
    return {
      resourceTypeDefinition: 'darkMatter',
      resourceYield: {
        darkMatter: 10,
        gas: 10,
        gold: 10,
        iron: 10,
      },
    }
  }

  assignEdge(c1: mx.ICell, c2: mx.ICell) {
    c1.edges[c2.id] = true
    c2.edges[c1.id] = true
  }

  generateSystem() {
    const system = this.genNameId()
    const systemId = system.id

    const cells = [
      {...this.genNameId(), systemId, edges: {}},
      {...this.genNameId(), systemId, planet: this.genRandomPlanet(), edges: {}},
      {...this.genNameId(), systemId, planet: this.genRandomPlanet(), edges: {}},
      {...this.genNameId(), systemId, planet: this.genRandomPlanet(), edges: {}},
      {...this.genNameId(), systemId, planet: this.genRandomPlanet(), edges: {}},
      {...this.genNameId(), systemId, planet: this.genRandomPlanet(), edges: {}},
      {...this.genNameId(), systemId, planet: this.genRandomPlanet(), edges: {}},
    ]

    this.assignEdge(cells[1], cells[2])
    this.assignEdge(cells[1], cells[3])
    this.assignEdge(cells[2], cells[4])
    this.assignEdge(cells[2], cells[0])
    this.assignEdge(cells[3], cells[0])
    this.assignEdge(cells[4], cells[5])
    this.assignEdge(cells[5], cells[0])
    this.assignEdge(cells[6], cells[0])

    return { system, cells }
  }

  generateCluster = () => {
    const systems = [
      this.generateSystem(),
      this.generateSystem(),
      this.generateSystem(),
      this.generateSystem(),
    ]

    this.assignEdge(systems[0].cells[0], systems[1].cells[0])
    this.assignEdge(systems[0].cells[0], systems[2].cells[0])
    this.assignEdge(systems[1].cells[0], systems[3].cells[0])
    this.assignEdge(systems[2].cells[0], systems[3].cells[0])

    return systems
  }

  generate(numPlayers: number): mx.IMap & { origins: mx.ICell[] } {
    const clusters = _.range(numPlayers).map(this.generateCluster)
    const origins = clusters.map(cluster => cluster[0].cells[1])

    clusters.forEach((cluster, idx) => {
      const nextCluster = getItemCircular(clusters, idx + 1)
      this.assignEdge(cluster[1].cells[0], nextCluster[2].cells[0])
    })

    let currentLayer = clusters
    while (currentLayer.length > 2) {
      const chunks = _.chunk(currentLayer, 3)
      currentLayer = chunks.map(([c1, c2, c3]) => {
        if (!c2) {
          return c1
        }
        const connectingSystem = this.generateSystem()
        clusters.push([connectingSystem])

        this.assignEdge(connectingSystem.cells[0], c1[3].cells[0])
        this.assignEdge(connectingSystem.cells[0], c2[3].cells[0])
        if (c3) {
          this.assignEdge(connectingSystem.cells[0], c3[3].cells[0])
        }

        return [connectingSystem]
      })
    }

    const systems = _.flatten(clusters)
    const cells = _.flatMap(systems, s => s.cells)

    return {
      cells: _.keyBy(cells, 'id'),
      systems: _.keyBy(systems.map(s => s.system), 'id'),
      origins,
    }
  }
}
