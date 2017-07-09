import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { compose, gql, graphql, MutationFunc } from 'react-apollo'
import { Action } from 'sco-engine/lib/actions'
import { items } from 'sco-engine/lib/gameEngine'
import { Button, Checkbox, Grid, Header, List } from 'semantic-ui-react'

import { Query as GameViewQuery } from './index'
import Store from './store'

const styles = StyleSheet.create({
  root: {
    padding: 20,
  },
})

type ComponentProps = {
  store: Store,
}
type ResultProps = {
  setTurnReady: MutationFunc<{}>,
  submitActions: MutationFunc<{}>,
}
type Props = ComponentProps & ResultProps

const SubmitaActionsMutation = gql`
mutation SubmitaActionsQuery($input: SubmitActionsInput!) {
    submitActions(input: $input) {
      game {
        id
      }
    }
  }
`

const SetTurnReadyMutation = gql`
  mutation SetTurnReady($input: SetTurnReadyInput!) {
    setTurnReady(input: $input) {
      game {
        id
      }
    }
  }
`

class TurnView extends React.Component<Props, never> {
  renderAction(a: Action, props = {}) {
    const { game } = this.props.store
    let content

    if (a.kind === 'move') {
      const unit = game.state.units[a.unitId]
      const unitType = items[unit.unitTypeId]
      content = {
        header: `Move ${unitType.name}`,
        description: a.path.map(p => game.map.cells[p].name).join(' -> '),
      }
    } else if (a.kind === 'produce') {
      const item = items[a.itemId]
      content = {
        header: `Schedule Production of ${item.name}`,
        description: a.locationId && `Location: ${game.map.cells[a.locationId].name}`,
      }
    } else {
      throw new Error('Invalid Action')
    }

    return (
      <List.Content {...props}>
        <List.Header>{content.header}</List.Header>
        <List.Description>{content.description}</List.Description>
      </List.Content>
    )
  }

  removeAction = async (idx: number) => {
    const { game, myActions } = this.props.store

    const actions = myActions.slice()
    actions.splice(idx, 1)

    const input = {
      actions,
      gameId: game.id,
    }

    await this.props.submitActions({
      refetchQueries: [{
        query: GameViewQuery,
        variables: { gameId: game.id },
      }],
      variables: { input },
    })
  }

  onChangeTurnReady = async () => {
    const { game } = this.props.store

    const input = {
      gameId: game.id,
      turnReady: !game.turnReady,
    }

    await this.props.setTurnReady!({
      refetchQueries: [{
        query: GameViewQuery,
        variables: { gameId: game.id },
      }],
      variables: { input },
    })
  }

  render() {
    const { game, myActions } = this.props.store

    return (
      <Grid columns={2} divided className={css(styles.root)}>
        <Grid.Row>
          <Grid.Column>
            <Header as="h2" textAlign="center" inverted>
              Previous Turn Report
            </Header>
            {game.log.map((l, idx) => <p key={idx}>{l.message}</p>)}
          </Grid.Column>
          <Grid.Column>
            <Header as="h2" textAlign="center" inverted>
              Current Turn Actions
            </Header>

            <List divided relaxed inverted>
              {myActions.map((a, idx) => (
                <List.Item key={idx}>
                  {this.renderAction(a, {floated: 'left'})}
                  <Button floated="right" icon="trash" onClick={() => this.removeAction(idx)} />
                </List.Item>
              ))}
            </List>
            <Header as="h3" inverted>
              <Checkbox
                checked={game.turnReady}
                onChange={this.onChangeTurnReady}
              />
              {' '}Ready to advance turn
            </Header>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default compose(
  graphql<ResultProps, ComponentProps>(SubmitaActionsMutation, { name: 'submitActions' }),
  graphql<ResultProps, ComponentProps>(SetTurnReadyMutation, { name: 'setTurnReady' }),
)(TurnView)
