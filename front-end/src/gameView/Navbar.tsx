import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { Menu } from 'semantic-ui-react'

import ResourceAmountSegment from './ResourceAmountSegment'
import Store from './store'

const styles = StyleSheet.create({
  root: {
    marginBottom: 0,
  },
})

type Props = {
  store: Store,
  userId: string,
}

export default class Navbar extends React.Component<Props, never> {
  render() {
    const { store, userId } = this.props
    const playerName = store.game.players[userId].name

    return (
      <Menu inverted className={css(styles.root)}>
        <Menu.Item>
          {playerName}
        </Menu.Item>
        <Menu.Item onClick={store.showMap} active={store.state.view === 'map'}>
          Map
        </Menu.Item>
        <Menu.Item onClick={store.showOverwiew} active={store.state.view === 'overview'}>
          Overview
        </Menu.Item>
        <Menu.Item onClick={store.showTurn} active={store.state.view === 'turn'}>
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
