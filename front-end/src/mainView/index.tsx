import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { DefaultChildProps, gql, graphql } from 'react-apollo'
import { RouteComponentProps } from 'react-router-dom'
import { Button } from 'semantic-ui-react'

import Layout from '../components/layout'
import { DialogContext } from '../DialogController'
import { Game } from '../gqlTypes'
import shortcircuit from '../shortcircuit'
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

type ComponentProps = RouteComponentProps<any>
type ResultProps = { viewer: any }
type Props = DefaultChildProps<ComponentProps, ResultProps>

const Query = gql`query MainPage {
  viewer {
    games {
      id
      name
      createdAt
      currentTurnNumber
      players
    }
  }
}`

class MainView extends React.Component<Props, {a: number}> {
  static contextTypes = {
    auth: React.PropTypes.object,
    dialog: React.PropTypes.object,
  }

  logout = () => this.context.auth.logout()

  async startGame(gameId: string) {
    this.props.history.push(`/games/${gameId}`)
  }

  onContinueGame = async (gameId: string) => {
    this.startGame(gameId)
  }

  onStartGame = async () => {
    const dialog: DialogContext = this.context.dialog
    const players = await dialog.prompt(StartGameModal)
    if (!players) {
      return
    }
  }

  renderGame = (game: Game) => {
    const numPlayers = Object.keys(game).length
    return (
      <Button
        size="big"
        className={css(styles.button)}
        onClick={() => this.onContinueGame(game.id)}
        key={game.id}
      >
        Continue game {game.name} ({numPlayers} players, turn #{game.currentTurnNumber})
      </Button>
    )
  }

  render() {
    const { games } = this.props.data!.viewer

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
            Start new game
          </Button>

          {games.map(this.renderGame as any)}

          <Button onClick={this.logout}>
            Sign out
          </Button>
        </Layout>
      </div>
    )
  }
}

export default graphql<ResultProps, ComponentProps>(Query)(
  shortcircuit(p => p.data.viewer)(MainView),
)
