import * as _ from 'lodash'
import * as React from 'react'
import { items } from 'sco-engine/lib/gameEngine'
import * as lx from 'sco-engine/lib/logs'
import units from 'sco-engine/lib/units'
import { List } from 'semantic-ui-react'

import ResourceAmountSegment from './resourceAmountSegment'
import Store from './store'

type Props = {
  log: lx.Log,
  store: Store,
}

export default class LogMessage extends React.Component<Props, never> {
  renderSchedule = (log: lx.ScheduleLog) => {
    const { game } = this.props.store
    const item = items[log.itemId]
    const ScheduleMsg = log.successful ? 'Successfully scheduled' : 'Unable to schedule'

    let locationMsg
    if (log.location) {
      locationMsg = <span>on {game.map.cells[log.location].name}</span>
    }

    return (
      <span>
        {ScheduleMsg}{' '}
        the production of <b>{item.name}</b>{' '}
        {locationMsg}
      </span>
    )
  }

  renderResourceProduction = (log: lx.ResourceProductionLog) => {
    return (
      <span>
        The following resources were produced:
        <ResourceAmountSegment amount={log.amount} />
      </span>
    )
  }

  renderProductionCompleted = (log: lx.ProductionCompletedLog) => {
    const { game } = this.props.store
    const item = items[log.itemId]
    let locationMsg
    if (log.location) {
      locationMsg = <span>on {game.map.cells[log.location].name}</span>
    }
    return (
      <span>
        The production of <b>{item.name} ({item.kind})</b> has completed
        {locationMsg}
      </span>
    )
  }

  renderConqueredPlanet = (log: lx.ConqueredPlanetLog) => {
    const { game } = this.props.store
    const location = game.map.cells[log.location]
    const system = game.map.systems[location.systemId]
    let previousOwnerMsg
    if (log.previousOwnerId) {
      previousOwnerMsg = (
        <span>
          The planet has been liberated from the rule of{' '}
          <b>{game.players[log.previousOwnerId].name}</b>
        </span>
      )
    } else {
      previousOwnerMsg = <span>The planet was previously unhabited</span>
    }
    return (
      <div>
        The planet <b>{location.name} ({system.name})</b> has been conquered.{' '}
        {previousOwnerMsg}
      </div>
    )
  }

  renderLostPlanet = (log: lx.LostPlanetLog) => {
    const { game } = this.props.store
    const location = game.map.cells[log.location]
    const system = game.map.systems[location.systemId]
    return (
      <div>
        You lost control of <b>{location.name} ({system.name})</b>{' '}
        after the invasion from <b>{game.players[log.byPlayerId].name}</b>
      </div>
    )
  }

  renderBattle = (log: lx.BattleLog) => {
    let where: string
    const { map } = this.props.store.game
    if (Array.isArray(log.location)) {
      const [l1, l2] = log.location
      const c1 = map.cells[l1]
      const c2 = map.cells[l2]
      const s1 = map.systems[c1.systemId]
      const s2 = map.systems[c2.systemId]
      where = `between ${c1.name} (${s1.name}) and ${c2.name} (${s2.name})`
    } else {
      where = map.cells[log.location].name
    }

    return (
      <div>
        <b>
          There was a battle, you{' '}
          {this.renderWin(log.players[this.props.store.myPlayer.id].win)}
        </b>
        <br />
        <b>Turns:</b> {log.turns} <br />
        <b>Location:</b> {where} <br />
        {_.keys(log.players).map(playerId => (
          this.renderBattlePlayer(log.players[playerId], playerId)),
        )}
      </div>
    )
  }

  renderWin = (won: boolean) => {
    return won ? 'won' : 'lost'
  }

  renderBattlePlayer = (bp: lx.BattlePlayerSummary, playerId: string) => {
    const { players } = this.props.store.game
    return (
      <div key={playerId}>
        <b>{players[playerId].name}</b>, total forces: {this.renderUnkwown(bp.totalUnits)}
        <br />
        {bp.units.map(u => (
          <div key={u.unitTypeId}>
            - {this.renderUnkwown(u.unitTypeId, uid => units[uid].name)}:{' '}
            forces: {this.renderUnkwown(u.qtyBefore)},{' '}
            survived: {this.renderUnkwown(u.qtyAfter)}
          </div>
        ))}
      </div>
    )
  }

  renderUnkwown = (item, render?: (item) => string) => {
    if (item === undefined) {
      return <i>unknwon</i>
    }
    return render ? render(item) : item
  }

  // tslint:disable-next-line:member-ordering
  renderers: {[P in lx.Log['kind']]: (log: lx.Log) => any} = {
    battle: this.renderBattle,
    conqueredPlanet: this.renderConqueredPlanet,
    lostPlanet: this.renderLostPlanet,
    productionCompleted: this.renderProductionCompleted,
    resourceProduction: this.renderResourceProduction,
    schedule: this.renderSchedule,
  }

  render() {
    const log = this.renderers[this.props.log.kind](this.props.log)
    return <List.Item>{log}</List.Item>
  }
}
