import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { compose, DefaultChildProps, gql, graphql } from 'react-apollo'
import { NavLink, RouteComponentProps } from 'react-router-dom'
import { Button, Loader } from 'semantic-ui-react'

import Layout from '../components/layout'
import { DialogContext } from '../dialogController'
import { Game } from '../gqlTypes'
import StartGameModal from './startGameModal'

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

const MainViewFragment = gql`fragment MainViewFragment on Viewer {
  id
  user { id, admin }
  games {
    id
    name
    createdAt
    currentTurnNumber
    players
    isPlayer
  }
}`

const Mutation = gql`
  mutation MainPageMutation($input: CreateGameInput!) {
    createGame(input: $input) {
      viewer {
        ...MainViewFragment
      }
    }
  }

  ${MainViewFragment}
`

const Query = gql`
  query MainPage {
    viewer {
      ...MainViewFragment
    }
  }

  ${MainViewFragment}
`

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
      variables: { input: dialogResult.result },
    })
  }

  renderAdminGameButton(game: Game) {
    if (!this.props.data!.viewer.user.admin) {
      return null
    }

    return (
      <Button as={NavLink} to={`/admin/${game.id}`}>
        Admin
      </Button>
    )
  }

  renderGame = (game: Game & { isPlayer: boolean }) => {
    const numPlayers = Object.keys(game.players).length
    return (
      <Button.Group size="big" key={game.id} className={css(styles.button)}>
        <Button
          onClick={() => this.onContinueGame(game.id)}
          disabled={!game.isPlayer}
        >
          {game.name} <i>({numPlayers} players, turn #{game.currentTurnNumber})</i>
        </Button>
        {this.renderAdminGameButton(game)}
      </Button.Group>
    )
  }

  render() {
    if (this.props.data!.loading) {
      return <Loader active size="big">Starting warp engines...</Loader>
    }

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

          {games.map(this.renderGame)}

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
)(MainView)
