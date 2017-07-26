import { css, StyleSheet } from 'aphrodite'
import * as _ from 'lodash'
import * as React from 'react'
import { ICell } from 'sco-engine/lib/map'
import { IUnitState } from 'sco-engine/lib/state'

import Store from './store'

type Props = {
  cell: ICell,
  store: Store,
  units: IUnitState[],
}

type State = {
  shift: boolean,
}

const styles = StyleSheet.create({
  planet: {
    cursor: 'pointer',
    stroke: 'grey',
  },
  destination: {
    cursor: 'pointer',
  },
  unit: {
    transform: 'scale(.6) translate(10px, -66px)',
    stroke: 'black',
    cursor: 'pointer',
  },
  unitCounter: {
    transform: 'translate(26px, -30px)',
    fontSize: 10,
  },
  noInteraction: {
    pointerEvents: 'none',
  },
})

export default class Cell extends React.Component<Props, State> {
  onPlanetClick = () => {
    const { cell, store } = this.props
    store.selectPlanet(cell.id)
  }

  onUnitsClick = (units: IUnitState[]) => {
    this.props.store.selectUnits(units)
  }

  onDestinationClick = () => {
    const { cell, store } = this.props
    store.moveUnits(cell.id)
  }

  renderPlanet() {
    const { cell, store } = this.props
    if (!cell.planet) {
      return null
    }
    let fill = 'black'
    const planetState = store.game.state.planets[cell.id]
    if (planetState) {
      fill = planetState.ownerPlayerId
        ? store.game.players[planetState.ownerPlayerId].color
        : 'grey'
    }

    return (
      <circle
        onMouseUp={this.onPlanetClick}
        onTouchEnd={this.onPlanetClick}
        r="20"
        fill={fill}
        className={css(styles.planet)}
      />
    )
  }

  renderDestination() {
    const { cell, store } = this.props
    if (store.state.selectedDestinations && store.state.selectedDestinations[cell.id]) {
      return (
        <g>
          <defs>
            <radialGradient id="destination" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="red" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle
            fill="url(#destination)"
            r="20"
            className={css(styles.destination)}
            onMouseUp={this.onDestinationClick}
            onTouchEnd={this.onDestinationClick}
          />
        </g>
      )
    }

  }

  renderUnits = (units: IUnitState[], idx: number) => {
    const onClick = () => this.onUnitsClick(units)

    const { color } = this.props.store.game.players[units[0].playerId]

    return (
      <g key={idx}>
        <text fill={color} className={css(styles.unitCounter)}>
          {units.length}
        </text>
        <path
          onMouseUp={onClick}
          onTouchEnd={onClick}
          className={css(styles.unit)}
          d="M16 48 L32 40 L48 48 L32 16 Z"
          fill={color}
        />
      </g>
    )
  }

  render() {
    const { cell, units } = this.props
    const unitsByPlayer = _.groupBy(units, 'playerId')

    return (
      <g>
        {this.renderPlanet()}
        {_.values(unitsByPlayer).map(this.renderUnits)}
        <text
          className={css(styles.noInteraction)}
          fontSize="7"
          fill="white"
          textAnchor="middle"
        >
          {cell.name}
        </text>
        {this.renderDestination()}
      </g>
    )
  }
}
