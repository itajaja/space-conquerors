import * as d3Force from 'd3-force'
import * as _ from 'lodash'

import { IMap } from './map'

export type MapLayout = {
  cells: any,
  edges: any,
}

export function generate(map: IMap): MapLayout {
  const width = 1000
  const height = 1000

  const nodes = _.values(map.cells).map(c => ({ ...c, x: 0, y: 0 }))
  const indexedNodes = _.keyBy(nodes, 'id')

  const links = _.flatMap(nodes, source => {
    return Object.keys(source.edges).map(to => {
      const target = indexedNodes[to]
      const weight = source.systemId === target.systemId ? 30 : 180
      return { source, target, weight }
    })
  })

  const simulation = d3Force.forceSimulation()
    .force('link', d3Force.forceLink(links).id(d => d.id ).strength(.8).distance(l => l.weight))
    .force('charge', d3Force.forceManyBody().strength(-200))
    .force('collide', d3Force.forceCollide(40))
    .force('center', d3Force.forceCenter(width / 2, height / 2))

  simulation.nodes(nodes)
  simulation.stop()

  _.range(500).forEach(simulation.tick)

  return {
    cells: nodes,
    edges: links,
  }
}
