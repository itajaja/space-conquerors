import { css, StyleSheet } from 'aphrodite'
import * as _ from 'lodash'
import * as React from 'react'
import { DefaultChildProps, gql, graphql } from 'react-apollo'
import * as ax from 'sco-engine/lib/actions'
import buildings from 'sco-engine/lib/buildings'
import * as dx from 'sco-engine/lib/definitions'
import { ICell } from 'sco-engine/lib/map'
import { IBuildingState } from 'sco-engine/lib/state'
import units from 'sco-engine/lib/units'
import { Button, Header, List, Modal } from 'semantic-ui-react'

import Layout from '../components/layout'
import style from '../style'
import { Query as GameViewQuery } from './index'
import ResourceAmountSegment from './resourceAmountSegment'
import SelectedUnitsSidebarMenu from './selectedUnitsSidebarMenu'
import Store from './store'
import ValidatedButton from './validatedButton'

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
    overflow: 'auto',
  },
})

const Query = gql`mutation SidebarMenu($input: SubmitActionsInput!) {
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

class SidebarMenu extends React.Component<Props, never> {
  onPurchase = async (item: dx.IItem & dx.PurchaseableItem) => {
    const { game, state, myActions, myPlayer } = this.props.store

    const newAction: ax.IProduceAction = {
      kind: 'produce',
      playerId: myPlayer.id,
      itemId: item.id,
      locationId: state.selectedLocationId,
    }

    const actions = [...myActions, newAction]

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
  }

  renderItem = (item: dx.IBuildingType | dx.IUnitType) => {
    return (
      <List.Item key={item.id}>
        <Layout direction="row" justify="space-between">
          <List.Content floated="left">
            <List.Header>{item.name}</List.Header>
            <List.Description>
              {item.description} - (<ResourceAmountSegment amount={item.cost} />)
            </List.Description>
          </List.Content>
          <ValidatedButton
            onClick={() => this.onPurchase(item)}
            error={this.validatePurchaseItem(item)}
          >
            Purchase
          </ValidatedButton>
        </Layout>
      </List.Item>
    )
  }

  isItemAvailable = (item: dx.IUnitType | dx.IBuildingType) => {
    const { game, myPlayer, validator, state } = this.props.store
    const planetState = game.state.planets[state.selectedLocationId!]

    return !validator.safe(() => validator.validateUnitOrBuildingAvailability(
      item, myPlayer, planetState,
    ))
  }

  validatePurchaseItem = (item: dx.IUnitType | dx.IBuildingType) => {
    const { myPlayer, scheduledStateValidator, state } = this.props.store

    return scheduledStateValidator.safe(
      () => scheduledStateValidator.validateProductionAction({
        itemId: item.id,
        kind: 'produce',
        playerId: myPlayer.id,
        locationId: state.selectedLocationId!,
      }),
    )
  }

  renderActions(cell: ICell) {
    const { game, myPlayer } = this.props.store
    const planetState = game.state.planets[cell.id]

    if (!planetState || planetState.ownerPlayerId !== myPlayer.id) {
      return
    }

    return (
      <Modal trigger={<Button>Build</Button>} size="fullscreen">
        <Modal.Header>Planet {cell.name} - Build</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Header>Buildings</Header>
            <List divided relaxed>
              {_.values(buildings)
                .filter(this.isItemAvailable)
                .map(this.renderItem)
              }
            </List>
            <Header>Units</Header>
            <List divided relaxed>
              {_.values(units)
                .filter(this.isItemAvailable)
                .map(this.renderItem)
              }
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
    const { game } = this.props.store
    const planetState = game.state.planets[cell.id]

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

    const { game } = this.props.store
    const buildings = _.values(game.state.buildings)
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
    const { game, state } = this.props.store
    if (state.selectedUnits.length) {
      return (
        <div className={css(styles.root)}>
          <SelectedUnitsSidebarMenu store={this.props.store} />
        </div>
      )
    }

    if (!state.selectedLocationId) {
      return null
    }

    const cell = game.map.cells[state.selectedLocationId]
    const system = game.map.systems[cell.systemId]

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

export default graphql<{}, ComponentProps>(Query)(SidebarMenu)
