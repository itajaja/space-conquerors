import { gql } from 'react-apollo'

export const GameViewFragment = gql`fragment GameViewFragment on Game {
  currentTurnNumber
  players
  state
  actions
  logs
  turnReady
}`

export const SubmitActionsMutation = gql`
  mutation OverviewView($input: SubmitActionsInput!) {
    submitActions(input: $input) {
      game {
        id
        ...GameViewFragment
      }
    }
  }

  ${GameViewFragment}
`

export const SetTurnReadyMutation = gql`
  mutation SetTurnReady($input: SetTurnReadyInput!) {
    setTurnReady(input: $input) {
      game {
        id
        ...GameViewFragment
      }
    }
  }

  ${GameViewFragment}
`
