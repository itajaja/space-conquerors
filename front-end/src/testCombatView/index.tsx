import { css, StyleSheet } from 'aphrodite'
import * as _ from 'lodash'
import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import CombatEngine, { IUnit } from 'sco-engine/lib/combatEngine'
import * as definitions from 'sco-engine/lib/definitions'
import * as resources from 'sco-engine/lib/resources'
import unitTypes from 'sco-engine/lib/units'
import { Button } from 'semantic-ui-react'

import Layout from '../components/layout'
import ResourceAmountSegment from '../gameView/resourceAmountSegment'
import PickUnitsBar from './pickUnitsBar'

const styles = StyleSheet.create({
  root: {
    position: 'fixed',
    left: 0, top: 0, right: 0, bottom: 0,
  },
  combatPanel: {
    overflow: 'auto',
    whiteSpace: 'nowrap',
  },
  player1: {
    color: 'red',
  },
  player2: {
    color: 'yellow',
  },
  playerSummarySegment: {
    margin: 10,
  },
})

type ArmyCount = { [idx: string]: number }

type State = {
  player1: ArmyCount,
  player2: ArmyCount,
}
type Props = RouteComponentProps<any>

export default class TestCombatView extends React.Component<Props, State> {
  state = {
    player1: {},
    player2: {},
  }

  updateUnit = (unitTypeId: string, count: number, playerId: string) => {
    const newArmyCount = {
      ...this.state[playerId],
      [unitTypeId]: count,
    }

    this.setState({ [playerId]: newArmyCount } as any)
  }

  renderPlayer(playerId: string) {
    const armyCount: ArmyCount = this.state[playerId]
    const flattenedArmy: string[] = []
    Object.keys(armyCount).forEach(typeId => {
      flattenedArmy.push(..._.fill(Array(armyCount[typeId]), typeId))
    })
    const cost = flattenedArmy
      .map(typeId => unitTypes[typeId].cost)
      .reduce(resources.add, definitions.zeroResources())
    const foodConsumption = flattenedArmy
      .map(typeId => unitTypes[typeId].foodConsumption)
      .reduce((a, b) => a + b, 0)

    const onUpdateUnit = (unitTypeId: string, count: number) => (
      this.updateUnit(unitTypeId, count, playerId)
    )

    return (
      <Layout>
        <PickUnitsBar
          armyCount={armyCount}
          onUpdateUnit={onUpdateUnit}
        />
        <div>
          total Cost: <ResourceAmountSegment amount={cost} />
        </div>
        <div>
          total Food: {foodConsumption}
        </div>
      </Layout>
    )
  }

  renderUnitSummary(units: IUnit[] | undefined) {
    if (!units) {
      return null
    }
    const summary = units.map(u => (
      <div key={u.id}>
        {u.id}. {unitTypes[u.unitTypeId].name}
        ({u.hp.toFixed()} / {unitTypes[u.unitTypeId].endurance})
      </div>
    ))

    return <Layout>{summary}</Layout>
  }

  renderPlayersSummary(units: IUnit[]) {
    const unitsByPlayer = _.groupBy(units, u => u.playerId)

    return (
      <Layout classes={styles.playerSummarySegment}>
        <div className={css(styles.player1)}>
          {this.renderUnitSummary(unitsByPlayer.player1)}
        </div>
        <Layout grow />
        <div className={css(styles.player2)}>
          {this.renderUnitSummary(unitsByPlayer.player2)}
        </div>
      </Layout>
    )
  }

  renderTurn = ({ units, turnNumber}: { units: IUnit[], turnNumber: number }) => {
    return (
      <div key={turnNumber}>
        <h3>Turn {turnNumber}</h3>
        {this.renderPlayersSummary(units)}
      </div>
    )
  }

  renderCombat() {
    const units: IUnit[] = []
    let id = 0
    const players = [
      { playerId: 'player1', army: this.state.player1 },
      { playerId: 'player2', army: this.state.player2 },
    ]
    players.forEach(({ playerId, army }) => {
      Object.keys(army).forEach(unitTypeId => {
        const unitType = unitTypes[unitTypeId]
        for (let _ = 0; _ < army[unitTypeId]; _++) {
          units.push({
            hp: unitType.endurance,
            id: `${++id}`,
            locationId: 'x',
            playerId,
            unitTypeId,
          })
        }
      })
    })

    const engine = new CombatEngine(units)
    const turns: IUnit[][] = []

    while (!engine.isCombatOver()) {
      engine.performTurn()
      turns.push(_.cloneDeep(_.values(engine.units)))
    }

    const survivors = engine.computeSurvivors()

    const renderedTurns = turns
      // tslint:disable-next-line:no-shadowed-variable
      .map((units, idx) => ({ units, turnNumber: idx + 1}))
      .reverse()
      .map(this.renderTurn)

    return (
      <Layout>
        <Layout direction="row">
          <div>
            <h3>Survivors</h3>
            {this.renderPlayersSummary(survivors)}
          </div>
          {renderedTurns}
        </Layout>
      </Layout>
    )
  }

  render() {
    return (
      <Layout classes={styles.root}>
        <div className={css(styles.player1)}>
          {this.renderPlayer('player1')}
        </div>
        <Layout grow classes={styles.combatPanel}>
          {this.renderCombat()}
        </Layout>
        <div className={css(styles.player2)}>
          {this.renderPlayer('player2')}
        </div>
        <Button onClick={() => this.forceUpdate()}>Rerun simulation</Button>
      </Layout>
    )
  }
}
