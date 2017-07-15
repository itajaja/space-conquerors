import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { NavLink } from 'react-router-dom'
import * as ax from 'sco-engine/lib/actions'
import * as dx from 'sco-engine/lib/definitions'
import * as movement from 'sco-engine/lib/movement'
import * as resources from 'sco-engine/lib/resources'
import { Dropdown, Menu } from 'semantic-ui-react'

import ResourceAmountSegment from './resourceAmountSegment'
import Store from './store'

const styles = StyleSheet.create({
  root: {
    marginBottom: 0,
  },
  foodWarning: {
    color: 'red',
  },
})

type Props = RouteComponentProps<any> & {
  store: Store,
  userId: string,
}

class Navbar extends React.Component<Props, never> {
  renderFood() {
    const { store } = this.props
    const consumption = store.scheduledGame.foodConsumption()[store.myPlayer.id]
    const production = store.scheduledGame.foodProduction()[store.myPlayer.id]

    return (
      <span>
        🍗{' '}
        <span className={css(consumption > production && styles.foodWarning)}>
          {consumption}/{production}
        </span>
      </span>
    )
  }

  render() {
    const { match, store } = this.props
    const plusAmount = store.resourceCalculator
      .calculatePlayerProduction(store.myPlayer.id)
    const myName = store.game.players[store.myPlayer.id].name
    const actions = store.myActions.filter(ax.isMovementAction)
    const estimatedAmount = resources.subtract(
      store.scheduledGame.state.players[store.myPlayer.id].resourcesAmount,
      dx.zeroResources({ gas: movement.estimateGasCost(actions, store.scheduledGame) }),
    )

    return (
      <Menu inverted className={css(styles.root)}>
        <Menu.Item>
          {store.game.name} (turn #{store.game.currentTurnNumber})
        </Menu.Item>
        <Menu.Item
          as={NavLink}
          activeClassName="active"
          to={`${match.url}/map`}
        >
          Map
        </Menu.Item>
        <Menu.Item
          as={NavLink}
          activeClassName="active"
          to={`${match.url}/overview`}
        >
          Overview
        </Menu.Item>
        <Menu.Item
          as={NavLink}
          activeClassName="active"
          to={`${match.url}/turn`}
        >
          Turn
        </Menu.Item>
        <Menu.Item>
          <ResourceAmountSegment
            amount={estimatedAmount}
            plusAmount={plusAmount}
            zeros
          />
        </Menu.Item>
        <Menu.Item>
          {this.renderFood()}
        </Menu.Item>

        <Menu.Menu position="right">
          <Dropdown item text={myName}>
            <Dropdown.Menu>
              <Dropdown.Item as={NavLink} to={`/`}>
                Exit Game
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Menu>
    )
  }
}

export default withRouter(Navbar)
