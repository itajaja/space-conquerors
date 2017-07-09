import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { NavLink } from 'react-router-dom'
import { Dropdown, Menu } from 'semantic-ui-react'

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
    const myName = store.game.players[store.myPlayer.id].name

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
            amount={store.scheduledState.players[store.myPlayer.id].resourcesAmount}
            plusAmount={plusAmount}
            zeros
          />
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
