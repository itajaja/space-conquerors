import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { Action } from 'sco-engine/actions'
import { items } from 'sco-engine/gameEngine'
import { Button, Grid, Header, List } from 'semantic-ui-react'

import IApi from '../api'
import Store from './store'

const styles = StyleSheet.create({
  root: {
    padding: 20,
  },
})

type Props = {
  api: IApi,
  store: Store,
}

type State = {
  submittedActions: Action[],
}

export default class OverviewView extends React.Component<Props, State> {
  constructor(props, ctx) {
    super(props, ctx)
    this.state = {
      submittedActions: [],
    }
    this.getSubmittedActions()
  }

  renderAction(a: Action, props = {}) {
    const { game, gameState } = this.props.store.state
    let content

    if (a.kind === 'move') {
      const unit = gameState.units[a.unitId]
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

  removeAction = (idx: number) => {
    this.props.store.removeAction(idx)
  }

  confirmActions = async () => {
    const { api, store } = this.props
    await api.submitActions(store.state.game.id, store.state.actions || [])
    this.getSubmittedActions()
  }

  async getSubmittedActions() {
    const { api, store } = this.props
    const submittedActions = await api.getActions(store.state.game.id)

    this.setState({
      submittedActions,
    })
  }

  render() {
    const { submittedActions } = this.state
    const { actions, log } = this.props.store.state

    return (
      <Grid columns={3} divided className={css(styles.root)}>
        <Grid.Row>
          <Grid.Column>
            <Header as="h2" textAlign="center" inverted>
              Previous Turn Report
            </Header>
            {log.map(l => (
              <p>
                {l.message}
              </p>
            ))}
          </Grid.Column>
          <Grid.Column>
            <Header as="h2" textAlign="center" inverted>
              Current Turn Actions
            </Header>

            <List divided relaxed inverted>
              {(actions || []).map((a, idx) => (
                <List.Item key={idx}>
                  {this.renderAction(a, {floated: 'left'})}
                  <Button floated="right" icon="trash" onClick={() => this.removeAction(idx)} />
                </List.Item>
              ))}
            </List>
            <Button onClick={this.confirmActions}>Confirm Actions</Button>
          </Grid.Column>
          <Grid.Column>
            <Header as="h2" textAlign="center" inverted>
              Saved Turn Actions
            </Header>

            <List divided relaxed inverted>
              {(submittedActions).map((a, idx) => (
                <List.Item key={idx}>
                  {this.renderAction(a)}
                </List.Item>
              ))}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}
