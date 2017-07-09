import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { NavLink } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'

import ResourceAmountSegment from './resourceAmountSegment'
import Store from './store'

const styles = StyleSheet.create({
  root: {
    marginBottom: 0,
  },
})

type Props = RouteComponentProps<any> & {
  store: Store,
  userId: string,
}

class Navbar extends React.Component<Props, never> {
  render() {
    const { match, store } = this.props
    const plusAmount = store.resourceCalculator
      .calculatePlayerProduction(store.myPlayer.id)

    return (
      <Menu inverted className={css(styles.root)}>
        <Menu.Item
          as={NavLink}
          activeClassName="active"
          to={`/`}
          icon="home"
          exact
        />
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
            amount={store.scheduledState.players[store.myPlayer.id].resourcesAmount}
            plusAmount={plusAmount}
            zeros
          />
        </Menu.Item>
      </Menu>
    )
  }
}

export default withRouter(Navbar)
