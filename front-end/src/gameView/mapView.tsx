import * as d3Force from 'd3-force'
import * as _ from 'lodash'
import * as React from 'react'
import { ReactSVGPanZoom } from 'react-svg-pan-zoom'
import { IMap } from 'sco-engine/src/map'

import Cell from './cell'
import Store from './store'

type Props = {
  store: Store,
}

type State = {
  shift: boolean,
}

type Layout = {
  cells: any,
  edges: any,
}

function generateMapLayout(map: IMap): Layout {
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

export default class MapView extends React.Component<Props, State> {
  layout: Layout
  oldKeyPress: any
  oldKeyUp: any

  constructor(props: Props, ctx) {
    super(props, ctx)
    this.layout = generateMapLayout(props.store.state.game.map)
    this.state = {
      shift: false,
    }
  }

  componentDidMount() {
    this.oldKeyPress = document.onkeydown
    document.onkeydown = this.onKeyDown
    this.oldKeyUp = document.onkeyup
    document.onkeyup = this.onKeyUp
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Shift' && !this.state.shift) {
      return this.setState({ shift: true })
    } else if (e.key !== 'Shift' && this.state.shift) {
      return this.setState({ shift: false })
    }
  }

  onKeyUp = (e: KeyboardEvent) => {
    if (this.state.shift) {
      return this.setState({ shift: false })
    }
  }

  componentWillUnmount() {
    document.onkeypress = this.oldKeyPress
  }

  render() {
    const { store } = this.props
    const { cells, edges } = this.layout

    const cellComponents = cells.map(({ x, y, name, systemId, planet, id }) => (
      <g transform={`translate(${x},${y})`} key={id}>
        <Cell cell={store.state.game.map.cells[id]} store={store} />
      </g>
    ))
    const cellLinks = edges.map((l, i) => (
      <line
        x1={l.source.x}
        y1={l.source.y}
        x2={l.target.x}
        y2={l.target.y}
        key={i}
        stroke="black"
      />
    ))

    return (
      <ReactSVGPanZoom
        width="100%"
        height="100%"
        toolbarPosition="none"
        tool={this.state.shift ? 'pan' : 'else'}
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
