import * as _ from 'lodash'
import * as React from 'react'
import { DefaultChildProps, gql, graphql } from 'react-apollo'
import { IMovementAction } from 'sco-engine/lib/actions'
import units from 'sco-engine/lib/units'
import { Button, Header, List } from 'semantic-ui-react'

import { Query as GameViewQuery } from './index'
import Store from './store'

const Query = gql`mutation SelectedUnitsSidebarMenu($input: SubmitActionsInput!) {
  submitActions(input: $input) {
    game {
      id
    }
  }
}`

type ComponentProps = {
  store: Store,
}
type Props = DefaultChildProps<ComponentProps, {}>

class SelectedUnitsSidebarMenu extends React.Component<Props, never> {
  onRemoveUnit = (idx: number) => {
    const { store } = this.props
    const selectedUnits = [...store.state.selectedUnits!]
    selectedUnits.splice(idx, 1)
    store.selectUnits(selectedUnits.map(u => store.game.state.units[u]))
  }

  onMove = async () => {
    const { state, game } = this.props.store
    const selectedUnits = state.selectedUnits!
    const indexedUnits = new Set(selectedUnits)
    const oldActions = game.actions.filter(a => (
      a.kind !== 'move' || !indexedUnits.has(a.unitId)
    ))

    const speeds = selectedUnits
      .map(u => game.state.units[u])
      .map(u => units[u.unitTypeId].speed)

    const newActions = selectedUnits.map(a => ({
      kind: 'move' as 'move',
      path: state.selectedPath,
      playerId: game.state.player.id,
      speed: _.min(speeds),
      unitId: a,
    }))

    const actions = [...oldActions, ...newActions]

    const input = {
      actions,
      gameId: game.id,
    }

    await this.props.mutate!({
      refetchQueries: [{
        query: GameViewQuery,
        variables: { gameId: game.id },
      }],
      variables: { input },
    })

    this.props.store.emptySelection()
  }

  renderUnit = (unitId: string, idx: number) => {
    const { game } = this.props.store
    const unit = game.state.units[unitId]
    const unitType = units[unit.unitTypeId]
    const movement = game.actions && game.actions
      .find(a => a.kind === 'move' && a.unitId === unitId) as IMovementAction
    const path = movement
      ? movement.path.map(p => game.map.cells[p].name).join(' -> ')
      : `Stationing on ${game.map.cells[unit.locationId].name}`

    return (
      <List.Item key={unitId}>
        <List.Content floated="left">
          <List.Header>{unitType.name}</List.Header>
          <List.Description>{path}</List.Description>
        </List.Content>
        <Button floated="right" onClick={() => this.onRemoveUnit(idx)}>
          -
        </Button>
      </List.Item>
    )
  }

  render() {
    const { state } = this.props.store

    return (
      <div>
        <Header>
          Selected units
        </Header>
        <List divided relaxed>
          {state.selectedUnits.map(this.renderUnit)}
        </List>
        {state.selectedPath && state.selectedPath.length > 1 && (
          <Button onClick={this.onMove}>Move</Button>
        )}
      </div>
    )
  }
}

export default graphql<{}, ComponentProps>(Query)(SelectedUnitsSidebarMenu)
