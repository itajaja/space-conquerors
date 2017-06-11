import * as React from 'react'
import { IMovementAction } from 'sco-engine/lib/actions'
import units from 'sco-engine/lib/units'
import { Button, Header, List } from 'semantic-ui-react'

import Store from './store'

type Props = {
  store: Store,
}

export default class SelectedUnitsSidebarMenu extends React.Component<Props, never> {
  onRemoveUnit = (idx: number) => {
    const { store } = this.props
    const selectedUnits = [...store.state.selectedUnits!]
    selectedUnits.splice(idx, 1)
    store.selectUnits(selectedUnits.map(u => store.game.state.units[u]))
  }

  submitPath = () => {
    throw new Error('not implemented: add mutation')
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
          <Button onClick={this.submitPath}>Submit Path</Button>
        )}
      </div>
    )
  }
}
