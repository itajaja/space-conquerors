import { css, StyleSheet } from 'aphrodite'
import * as _ from 'lodash'
import * as React from 'react'
import { DefaultChildProps, gql, graphql } from 'react-apollo'
import * as ax from 'sco-engine/lib/actions'
import buildingTypes from 'sco-engine/lib/buildings'
import * as dx from 'sco-engine/lib/definitions'
import { items } from 'sco-engine/lib/gameEngine'
import * as resources from 'sco-engine/lib/resources'
import * as sx from 'sco-engine/lib/state'
import technologies from 'sco-engine/lib/technologies'
import { Button, Grid, Header, Icon, List, Table } from 'semantic-ui-react'

import { Query as GameViewQuery } from './index'
import ResourceAmountSegment from './ResourceAmountSegment'
import Store from './store'

const styles = StyleSheet.create({
  root: {
    padding: 20,
  },
})

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
  renderBuildingProduction(buildings: sx.IBuildingState[]) {
    const production = buildings.reduce(
      (prev, cur) => {
        const buildingType = buildingTypes[cur.buildingTypeId]
        // TODO factor in planet type
        return buildingType.resourceYield
          ? resources.add(prev, buildingType.resourceYield)
          : prev
      }, dx.zeroResources())
    return <ResourceAmountSegment amount={production} zeros />
  }

  async onPurchase(item: dx.IItem & dx.PurchaseableItem) {
    const { game, state } = this.props.store

    const newAction: ax.IProduceAction = {
      kind: 'produce',
      playerId: game.state.player.id,
      itemId: item.id,
      locationId: state.selectedLocationId,
    }

    const actions = [...game.actions, newAction]

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

  render() {
    const { game } = this.props.store
    const { buildings, player, planets, units } = game.state
    const playerPlanets = _.values(planets).filter(p => p.ownerPlayerId === player.id)
    const playerUnits = _.values(units).filter(u => u.playerId === player.id)
    const playerBuildings = _.values(buildings).filter(b => b.playerId === player.id)
    const planetBuildings = _.groupBy(buildings, 'locationId')
    const unitsByType = _.groupBy(playerUnits, 'unitTypeId')
    const techs = _.keys(player.technologies).map(t => technologies[t])
    const orderedTechnologies = _.orderBy(techs, ['family', 'level'])

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
                    <Table.Cell>{game.map.cells[p.locationId].name}</Table.Cell>
                    <Table.Cell>
                      {game.map.systems[game.map.cells[p.locationId].systemId].name}
                    </Table.Cell>
                    <Table.Cell>
                      {this.renderBuildingProduction(planetBuildings[p.locationId] || [])}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell>—</Table.HeaderCell>
                  <Table.HeaderCell>Total</Table.HeaderCell>
                  <Table.HeaderCell>
                    {this.renderBuildingProduction(playerBuildings)}
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
                {player.productionStatuses.map((s, idx) => (
                  <Table.Row key={idx}>
                    <Table.Cell>
                      {items[s.itemId].name} ({items[s.itemId].kind.toLowerCase()})
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
                      {items[u[0].unitTypeId].name}
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
                      {t.name}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            <Header as="h3" inverted>Available Technologies</Header>

            <List divided relaxed inverted>
              {_.values(technologies).map(t => (
                <List.Item key={t.id}>
                  <List.Content floated="left">
                    <List.Header>
                      {t.name}{' '}
                      ({t.family} level {t.level})
                    </List.Header>
                    <List.Description>
                      {t.description} - (<ResourceAmountSegment amount={t.cost} />)
                    </List.Description>
                  </List.Content>
                  <Button floated="right" onClick={() => this.onPurchase(t)}>
                    Purchase
                  </Button>
                </List.Item>
              ))}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default graphql<{}, ComponentProps>(Query)(OverviewView)
