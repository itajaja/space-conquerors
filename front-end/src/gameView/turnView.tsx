import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { Action } from 'sco-engine/lib/actions'
import { items } from 'sco-engine/lib/gameEngine'
import { Button, Grid, Header, List } from 'semantic-ui-react'

import Store from './store'

const styles = StyleSheet.create({
  root: {
    padding: 20,
  },
})

type Props = {
  store: Store,
}

export default class OverviewView extends React.Component<Props, never> {
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

  removeAction = (idx: number) => {
    throw new Error('Unimplemented: Add mutation')
  }

  render() {
    const { actions, log } = this.props.store.game

    return (
      <Grid columns={2} divided className={css(styles.root)}>
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
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}
