import * as d3Force from 'd3-force'
import * as _ from 'lodash'
import * as React from 'react'
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';

import { IMap } from 'sco-engine/src/map'

export type Props = {
  map: IMap,
}

function generateMapLayout(map: IMap) {
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

export default class MapView extends React.Component<Props, {}> {
  render() {
    const { map } = this.props
    const { cells, edges } = generateMapLayout(map)

    const cellComponents = cells.map(({ x, y, name, systemId, planet }) => (
      <g transform={`translate(${x},${y})`} key={name}>
        {planet && <circle r="20" />}
        <text
          fontSize="7"
          fill="white"
          textAnchor="middle"
        >
          {name}
        </text>
      </g>
    ))
    const cellLinks = edges.map((l, i) => (
      <line x1={l.source.x} y1={l.source.y} x2={l.target.x} y2={l.target.y} key={i} stroke="black"/>
    ))

    return (
      <ReactSVGPanZoom
        width="100%"
        height="100%"
        toolbarPosition="none"
        tool="pan"
        background="transparent"
        SVGBackground="transparent"
      >
        <svg>
          {cellLinks}
          {cellComponents}
        </svg>
      </ReactSVGPanZoom>
    )
  }
}
