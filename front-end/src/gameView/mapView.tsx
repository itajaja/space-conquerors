import * as _ from 'lodash'
import * as React from 'react'
import { ReactSVGPanZoom } from 'react-svg-pan-zoom'
import {AutoSizer} from 'react-virtualized'
import { IMovementAction } from 'sco-engine/lib/actions'
import { MapLayoutCell } from 'sco-engine/lib/mapLayout'

import Cell from './cell'
import SidebarMenu from './sidebarMenu'
import Store from './store'

const SELECTED_PATH_COLOR = 'green'
const PATH_OPACITY = 0.4
const PATH_COLOR = 'green'

type Props = {
  store: Store,
}

type State = {
  indexedCells: { [idx: string]: MapLayoutCell },
}

export default class MapView extends React.Component<Props, State> {
  constructor(props: Props, ctx) {
    super(props, ctx)
    this.state = {
      indexedCells: this.computeIndexedCells(props),
    }
  }

  computeIndexedCells(props: Props) {
    return _.keyBy(this.props.store.game.mapLayout.cells, c => c.id)
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      indexedCells: this.computeIndexedCells(nextProps),
    })
  }

  renderPath = (path: string[], idx: number, selected = false) => {
    const points = path.map(p => {
      const cell = this.state.indexedCells[p]
      return `${cell.x} ${cell.y}`
    })
    const linePath = `M ${points.join(' L ')}`

    const props = selected
      ? {
        stroke: SELECTED_PATH_COLOR,
        markerEnd: 'url(#pointyArrowSelected)',
      } : {
        stroke: SELECTED_PATH_COLOR,
        opacity: PATH_OPACITY,
        markerEnd: 'url(#pointyArrow)',
      }

    return (
      <path
        d={linePath}
        key={idx}
        strokeWidth="5"
        fill="transparent"
        {...props}
      />
    )
  }

  renderMap(width: number, height: number) {
    if (width === 0 || height === 0) {
      return null
    }
    const { game, state, myActions, scheduledGame } = this.props.store
    const unitsByPlanet = _.groupBy(_.values(game.state.units), 'locationId')

    const cellComponents = game.mapLayout.cells
      .map(({ x, y, name, systemId, planet, id }) => (
        <g transform={`translate(${x},${y})`} key={id}>
          <Cell
            cell={game.map.cells[id]}
            store={this.props.store}
            units={unitsByPlanet[id] || []}
            scheduledActions={scheduledGame.productionsByLocation()[id]}
          />
        </g>
      ))
    const cellLinks = game.mapLayout.edges.map((l, i) => (
      <line
        x1={l.source.x}
        y1={l.source.y}
        x2={l.target.x}
        y2={l.target.y}
        key={i}
        stroke="black"
      />
    ))

    const paths = myActions
      .filter(a => a.kind === 'move')
      .map((a: IMovementAction, idx) => {
        return this.renderPath(a.path, idx)
      })

    return (
      <ReactSVGPanZoom
        width={width}
        height={height}
        toolbarPosition="none"
        miniaturePosition="none"
        tool="auto"
        background="transparent"
        SVGBackground="transparent"
        detectAutoPan={false}
      >
        <svg width={1000} height={1000}>
          <defs>
            <marker
              id="pointyArrowSelected"
              markerWidth="3"
              markerHeight="3"
              refX="7"
              refY="1.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,3 L3,1.5 z" fill={SELECTED_PATH_COLOR} />
            </marker>
            <marker
              id="pointyArrow"
              markerWidth="3"
              markerHeight="3"
              refX="7"
              refY="1.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,3 L3,1.5 z"
                fill={PATH_COLOR}
                opacity={PATH_OPACITY}
              />
            </marker>
          </defs>
          {paths}
          {state.selectedPath && this.renderPath(state.selectedPath, 0, true)}
          {cellLinks}
          {cellComponents}
        </svg>
      </ReactSVGPanZoom>
    )
  }

  render() {
    const { store } = this.props

    return (
      <div style={{ height: '100%'}}>
        <AutoSizer>
          {({ width, height }) => this.renderMap(width, height)}
        </AutoSizer>
        <SidebarMenu store={store} />
      </div>
    )
  }
}
