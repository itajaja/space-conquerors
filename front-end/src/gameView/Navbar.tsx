import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { NavLink } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'

import ResourceAmountSegment from './ResourceAmountSegment'
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
    const { match, store, userId } = this.props
    const playerName = store.game.players[userId].name

    return (
      <Menu inverted className={css(styles.root)}>
        <Menu.Item>
          {playerName}
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
            amount={store.game.state.player.resourcesAmount}
            zeros
          />
        </Menu.Item>
      </Menu>
    )
  }
}

export default withRouter(Navbar)
