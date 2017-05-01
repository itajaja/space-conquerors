import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { Button } from 'semantic-ui-react'

import { Game } from '../api'
import Layout from '../components/layout'
import { DialogContext } from '../DialogController'
import Router from '../router'
import Api from './api'
import SelectPlayerModal from './selectPlayerModal'
import StartGameModal from './StartGameModal'

const styles = StyleSheet.create({
  root: {
    paddingTop: 20,
    textAlign: 'center',
  },
  button: {
    marginBottom: 10,
  },
})

type Props = {
  router: Router,
}

export default class MainPage extends React.Component<Props, {}> {
  static contextTypes = {
    dialog: React.PropTypes.object,
  }

  api = new Api()

  async startGame(game: Game) {
    const dialog: DialogContext = this.context.dialog
    const player = await dialog.prompt(SelectPlayerModal, { players: game.players })

    if (!player) {
      return
    }
    if (player.result === '%%admin%%') {
      this.props.router.admin()
      return
    }

    this.api.playerId = player.result

    this.props.router.game({ gameId: game.id, api: this.api })
  }

  onContinueGame = async () => {
    const game = await this.api.getGame('')
    if (!game) {
      return
    }
    this.startGame(game!)
  }

  onStartGame = async () => {
    const dialog: DialogContext = this.context.dialog
    const players = await dialog.prompt(StartGameModal)
    if (!players) {
      return
    }
    const gameId = await this.api.createGame(players.result)
    const game = await this.api.getGame(gameId)
    this.startGame(game!)
  }

  render() {
    return (
      <div className={css(styles.root)}>
        <h1>
          S C O
        </h1>
        <Layout align="center">
          <Button
            size="big"
            className={css(styles.button)}
            onClick={this.onStartGame}
          >
            Start New Game
          </Button>
          <Button
            size="big"
            className={css(styles.button)}
            onClick={this.onContinueGame}
          >
            Continue Game
          </Button>
        </Layout>
      </div>
    )
  }
}
