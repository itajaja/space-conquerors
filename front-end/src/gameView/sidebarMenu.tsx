import { css, StyleSheet } from 'aphrodite'
import * as _ from 'lodash'
import * as React from 'react'
import buildings from 'sco-engine/buildings'
import * as dx from 'sco-engine/definitions'
import { ICell } from 'sco-engine/map'
import { IBuildingState } from 'sco-engine/state'
import units from 'sco-engine/units'
import { Button, Header, List, Modal } from 'semantic-ui-react'

import style from '../style'
import ResourceAmountSegment from './ResourceAmountSegment'
import SelectedUnitsSidebarMenu from './selectedUnitsSidebarMenu'
import Store from './store'

const styles = StyleSheet.create({
  root: {
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 400,
    padding: 20,
    background: style.grey,
  },
})

type Props = {
  store: Store,
}

export default class SidebarMenu extends React.Component<Props, never> {
  onPurchase = (item: dx.IItem & dx.PurchaseableItem) => {
    const { store } = this.props
    store.makePurchase(item, store.state.selectedLocationId)
  }

  renderItem(item: dx.IItem & dx.PurchaseableItem) {
    return (
      <List.Item key={item.id}>
        <List.Content floated="left">
          <List.Header>{item.name}</List.Header>
          <List.Description>
            {item.description} - (<ResourceAmountSegment amount={item.cost} />)
          </List.Description>
        </List.Content>
        <Button floated="right" onClick={() => this.onPurchase(item)}>
          Purchase
        </Button>
      </List.Item>
    )
  }

  renderBuildingDescription = (building: dx.IBuildingType) => {
    return this.renderItem(building)
  }

  renderUnitDescription = (unit: dx.IUnitType) => {
    return this.renderItem(unit)
  }

  renderActions(cell: ICell) {
    const { state } = this.props.store
    const planetState = state.gameState.planets[cell.id]
    const thisPlayerId = state.gameState.player.id

    if (!planetState || planetState.ownerPlayerId !== thisPlayerId) {
      return
    }

    return (
      <Modal trigger={<Button>Build</Button>}>
        <Modal.Header>Planet {cell.name} - Build</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Header>Buildings</Header>
            <List divided relaxed>
              {_.values(buildings).map(this.renderBuildingDescription)}
            </List>
            <Header>Units</Header>
            <List divided relaxed>
              {_.values(units).map(this.renderUnitDescription)}
            </List>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    )
  }

  renderBuilding(building: IBuildingState, idx: number) {
    const buildingType = buildings[building.buildingTypeId]

    return (
      <p key={idx}>{buildingType.name}</p>
    )
  }

  renderPlanetState(cell: ICell) {
    const { state } = this.props.store
    const planetState = state.gameState.planets[cell.id]

    if (!planetState) {
      return (
        <div>
          This planet is out of reach for detailed information
        </div>
      )
    }

    const owner = planetState.ownerPlayerId || 'This planet is unhabited'

    return (
      <div>
        owner: {owner}
      </div>
    )
  }

  renderPlanetDescription(cell: ICell) {
    if (!cell.planet) {
      return
    }

    const { state } = this.props.store
    const buildings = _.values(state.gameState.buildings)
      .filter(b => b.locationId === cell.id)

    return (
      <div>
        <p>This planet is rich in {cell.planet.resourceTypeDefinition}</p>
        {this.renderPlanetState(cell)}
        {buildings.map(this.renderBuilding)}
      </div>
    )
  }

  render() {
    const { state } = this.props.store
    if (state.selectedUnits) {
      return (
        <div className={css(styles.root)}>
          <SelectedUnitsSidebarMenu store={this.props.store} />
        </div>
      )
    }

    if (!state.selectedLocationId) {
      return null
    }

    const cell = state.game.map.cells[state.selectedLocationId]
    const system = state.game.map.systems[cell.systemId]

    return (
      <div className={css(styles.root)}>
        <Header>
          <Header.Content>
            Planet: {cell.name}
            <Header.Subheader>
              System: {system.name}
            </Header.Subheader>
          </Header.Content>
        </Header>
        {this.renderPlanetDescription(cell)}
        {this.renderActions(cell)}
      </div>
    )
  }
}
