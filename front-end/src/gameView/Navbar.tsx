import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { Menu } from 'semantic-ui-react'

import ResourceAmountSegment from './ResourceAmountSegment'
import Store, { State } from './store'

const styles = StyleSheet.create({
  root: {
    marginBottom: 0,
  },
})

type Props = {
  store: Store,
}

export default class Navbar extends React.Component<Props, State> {
  render() {
    const { store } = this.props

    return (
      <Menu inverted className={css(styles.root)}>
        <Menu.Item>
          Player Foo
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
            amount={store.state.gameState.player.resourcesAmount}
            zeros
          />
        </Menu.Item>
      </Menu>
    )
  }
}
