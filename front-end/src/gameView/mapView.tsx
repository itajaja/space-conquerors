import * as React from 'react'
import { ReactSVGPanZoom } from 'react-svg-pan-zoom'

import Cell from './cell'
import Store from './store'

type Props = {
  store: Store,
}

type State = {
  shift: boolean,
}

export default class MapView extends React.Component<Props, State> {
  oldKeyPress: any
  oldKeyUp: any

  constructor(props: Props, ctx) {
    super(props, ctx)
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
    const { map, mapLayout } = store.state.game

    const cellComponents = mapLayout.cells.map(({ x, y, name, systemId, planet, id }) => (
      <g transform={`translate(${x},${y})`} key={id}>
        <Cell cell={map.cells[id]} store={store} />
      </g>
    ))
    const cellLinks = mapLayout.edges.map((l, i) => (
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
