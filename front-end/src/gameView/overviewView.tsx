import { css, StyleSheet } from 'aphrodite'
import * as _ from 'lodash'
import * as React from 'react'
import { DefaultChildProps, graphql } from 'react-apollo'
import * as ax from 'sco-engine/lib/actions'
import * as dx from 'sco-engine/lib/definitions'
import { items } from 'sco-engine/lib/gameEngine'
import technologies from 'sco-engine/lib/technologies'
import { Grid, Header, Icon, List, Table } from 'semantic-ui-react'

import AssetPopup from '../components/assetPopup'
import Layout from '../components/layout'
import { SubmitActionsMutation } from './fragments'
import ResourceAmountSegment from './resourceAmountSegment'
import Store from './store'
import ValidatedButton from './validatedButton'

const styles = StyleSheet.create({
  root: {
    padding: 20,
  },
  resourceAmount: {
    display: 'flex',
    justifyContent: 'space-between',
  },
})

type ComponentProps = {
  store: Store,
}
type Props = DefaultChildProps<ComponentProps, {}>

class IconHeader extends React.Component<{ icon: string }, never> {
  render() {
    const { icon, children } = this.props
    return (
      <Header as="h2" icon textAlign="center" inverted>
        <Icon name={icon} />
        {children}
      </Header>
    )
  }
}

class OverviewView extends React.Component<Props, never> {
  renderPlanetProduction(locationId: string) {
    const production = this.props.store.resourceCalculator
      .calculatePlanetProduction(locationId)
    return (
      <ResourceAmountSegment
        amount={production}
        zeros
        className={css(styles.resourceAmount)}
      />
    )
  }

  onPurchase(item: dx.IItem & dx.PurchaseableItem) {
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

    this.props.store.withBackdrop(() => this.props.mutate!({
      variables: { input },
    }))
  }

  isTechAvailable = (tech: dx.ITechnology) => {
    const { myPlayer, validator } = this.props.store
    return !validator.safe(
      () => validator.validateTechAvailability(tech, myPlayer),
    )
  }

  validatePurchaseTechnology = (tech: dx.ITechnology) => {
    const { myPlayer, scheduledStateValidator } = this.props.store
    return scheduledStateValidator.safe(
      () => scheduledStateValidator.validateProductionAction({
        itemId: tech.id,
        kind: 'produce',
        playerId: myPlayer.id,
      }),
    )
  }

  render() {
    const { game, myPlayer } = this.props.store
    const { planets, units } = game.state
    const playerPlanets = _.values(planets).filter(p => p.ownerPlayerId === myPlayer.id)
    const playerUnits = _.values(units).filter(u => u.playerId === myPlayer.id)
    const unitsByType = _.groupBy(playerUnits, 'unitTypeId')
    const techs = _.keys(myPlayer.technologies).map(t => technologies[t])
    const orderedTechnologies = _.orderBy(techs, ['family', 'level'])
    const totalResources = this.props.store.resourceCalculator
      .calculatePlayerProduction(myPlayer.id)

    return (
      <Grid columns={3} divided className={css(styles.root)}>
        <Grid.Row>
          <Grid.Column>
            <IconHeader icon="bar chart">Economy and Production</IconHeader>

            <Table celled inverted>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>System</Table.HeaderCell>
                  <Table.HeaderCell>Planet</Table.HeaderCell>
                  <Table.HeaderCell>Production</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {playerPlanets.map(p => (
                  <Table.Row key={p.locationId}>
                    <Table.Cell>
                      {game.map.systems[game.map.cells[p.locationId].systemId].name}
                    </Table.Cell>
                    <Table.Cell>{game.map.cells[p.locationId].name}</Table.Cell>
                    <Table.Cell>
                      {this.renderPlanetProduction(p.locationId)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell>—</Table.HeaderCell>
                  <Table.HeaderCell>Total</Table.HeaderCell>
                  <Table.HeaderCell>
                    <ResourceAmountSegment
                      amount={totalResources}
                      zeros
                      className={css(styles.resourceAmount)}
                    />
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Footer>
            </Table>

            <Header as="h3" inverted>Production Queue</Header>

            <Table celled inverted>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Item</Table.HeaderCell>
                  <Table.HeaderCell>Turns Left</Table.HeaderCell>
                  <Table.HeaderCell>Location</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {myPlayer.productionStatuses.map((s, idx) => (
                  <Table.Row key={idx}>
                    <Table.Cell>
                      <AssetPopup itemId={s.itemId}>
                        {items[s.itemId].name}
                      </AssetPopup>
                      ({items[s.itemId].kind.toLowerCase()})
                    </Table.Cell>
                    <Table.Cell>
                      {s.remainingTurns}
                    </Table.Cell>
                    <Table.Cell>
                      {s.locationId ? game.map.cells[s.locationId].name : '—'}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Grid.Column>
          <Grid.Column>
            <IconHeader icon="space shuttle">Units</IconHeader>

            <Table celled inverted>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Unit Type</Table.HeaderCell>
                  <Table.HeaderCell>#</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {_.values(unitsByType).map((u, idx) => (
                  <Table.Row key={idx}>
                    <Table.Cell>
                      <AssetPopup itemId={u[0].unitTypeId}>
                        {items[u[0].unitTypeId].name}
                      </AssetPopup>
                    </Table.Cell>
                    <Table.Cell>
                      {u.length}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

          </Grid.Column>
          <Grid.Column>
            <IconHeader icon="lab">Technology</IconHeader>

            <Table celled inverted>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Family</Table.HeaderCell>
                  <Table.HeaderCell>Level</Table.HeaderCell>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {_.values(orderedTechnologies).map(t => (
                  <Table.Row key={t.id}>
                    <Table.Cell>
                      {/*{TODO: use friendly name}*/}
                      {t.family}
                    </Table.Cell>
                    <Table.Cell>
                      {t.level}
                    </Table.Cell>
                    <Table.Cell>
                      <AssetPopup itemId={t.id}>
                        {t.name}
                      </AssetPopup>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            <Header as="h3" inverted>Available Technologies</Header>

            <List divided relaxed inverted>
              {_.values(technologies).filter(this.isTechAvailable).map(t => (
                <List.Item key={t.id}>
                  <Layout direction="row" justify="space-between">
                    <List.Content>
                      <List.Header>
                        {t.name}{' '}
                        ({t.family} level {t.level})
                      </List.Header>
                      <List.Description>
                        {t.description} - (<ResourceAmountSegment amount={t.cost} />)
                      </List.Description>
                    </List.Content>
                    <ValidatedButton
                      onClick={() => this.onPurchase(t)}
                      error={this.validatePurchaseTechnology(t)}
                    >
                      Purchase
                    </ValidatedButton>
                  </Layout>
                </List.Item>
              ))}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default graphql<{}, ComponentProps>(SubmitActionsMutation)(OverviewView)
