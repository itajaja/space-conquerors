import { css, StyleSheet } from 'aphrodite'
import * as _ from 'lodash'
import * as React from 'react'
import { compose, DefaultChildProps, gql, graphql } from 'react-apollo'
import { RouteComponentProps } from 'react-router-dom'
import { applyTurn } from 'sco-engine/lib/game'
import { Button, Grid } from 'semantic-ui-react'

import { Game } from '../gqlTypes'
import shortcircuit from '../shortcircuit'

const styles = StyleSheet.create({
  root: {
    paddingTop: 20,
  },
})

type ComponentProps = RouteComponentProps<any>
type ResultProps = { game: Game & { meta: any } }
export type Props = DefaultChildProps<ComponentProps, ResultProps>

const AdminGameViewFragment = gql`fragment AdminGameViewFragment on Game {
  id
  name
  createdAt
  currentTurnNumber
  players
  map
  mapLayout
  state(full: true)
  actions(full: true)
  logs(full: true)
  meta
}`

const Mutation = gql`
  mutation MainPageMutation($input: AdvanceTurnInput!) {
    advanceTurn(input: $input) {
      game {
        id
        ...AdminGameViewFragment
      }
    }
  }

  ${AdminGameViewFragment}
`

export const Query = gql`
  query adminGameView($gameId: String!) {
    game(gameId: $gameId) {
      ...AdminGameViewFragment
    }
  }

  ${AdminGameViewFragment}
`

class AdminGameView extends React.Component<Props, never> {
  renderJson(data) {
    return (
      <pre>
        <code>
          {JSON.stringify(data, undefined, 2)}
        </code>
      </pre>
    )
  }

  nextTurn() {
    const { state, map, actions } = this.props.data!.game

    return applyTurn(state, map, _.flatten(_.values(actions)))
  }

  advanceTurn = async () => {
    const gameId = this.props.data!.game.id

    await this.props.mutate!({
      variables: { input: { gameId } },
    })
  }

  render() {
    const { game } = this.props.data!
    const nextTurn = this.nextTurn()

    return (
      <div className={css(styles.root)}>
        <h2>Turn {game.currentTurnNumber}</h2>
        <Button size="big" onClick={this.advanceTurn}>
          Advance To Next Turn
        </Button>
        <Grid columns={3} divided>
          <Grid.Row>
            <Grid.Column>
              <h2>Actions</h2>
              {this.renderJson(game.actions)}
              <h2>Meta</h2>
              {this.renderJson(game.meta)}
            </Grid.Column>
            <Grid.Column>
              <h2>Game State</h2>
              {this.renderJson(game.state)}
            </Grid.Column>
            <Grid.Column>
              <h2>Next Game State</h2>
              {this.renderJson(nextTurn.state)}
              <h2>Next Logs</h2>
              {this.renderJson(nextTurn.logs)}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

export default compose(
  graphql<ResultProps, ComponentProps>(Query, {
    options: ({ match }) => ({
      variables: { gameId: match.params.gameId },
    }),
  }),
  graphql<ResultProps, ComponentProps>(Mutation),
  shortcircuit(p => p.data.game),
)(AdminGameView)
