import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { compose, DefaultChildProps, gql, graphql } from 'react-apollo'
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

const Mutation = gql`mutation MainPageMutation($input: CreateGameInput!) {
  createGame(input: $input) {
    viewer {
      id
    }
  }
}`

const Query = gql`query MainPage {
  viewer {
    id
    user { id }
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
    this.props.history.push(`/${gameId}`)
  }

  onContinueGame = async (gameId: string) => {
    this.startGame(gameId)
  }

  onStartGame = async () => {
    const dialog: DialogContext = this.context.dialog
    const dialogResult = await dialog.prompt(
      StartGameModal, { userId: this.props.data!.viewer.user.id },
    )
    if (!dialogResult) {
      return
    }

    await this.props.mutate!({
      refetchQueries: [{
        query: Query,
      }],
      variables: { input: dialogResult.result },
    })
  }

  renderGame = (game: Game) => {
    const numPlayers = Object.keys(game.players).length
    return (
      <Button
        size="big"
        className={css(styles.button)}
        onClick={() => this.onContinueGame(game.id)}
        key={game.id}
      >
        {game.name} <i>({numPlayers} players, turn #{game.currentTurnNumber})</i>
      </Button>
    )
  }

  render() {
    const { games, user } = this.props.data!.viewer

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

          {games.map(this.renderGame)}

          <p>share this ID to create games: {user.id}</p>

          <Button onClick={this.logout}>
            Sign out
          </Button>
        </Layout>
      </div>
    )
  }
}

export default compose(
  graphql<ResultProps, ComponentProps>(Query),
  graphql<ResultProps, ComponentProps>(Mutation),
  shortcircuit(p => p.data.viewer),
)(MainView)
