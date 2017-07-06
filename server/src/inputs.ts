/**
 * Define runtime input checks. the reason for not using graphql is that
 * gql type system is really bad, especially with interfaces, unions
 */

import * as t from 'tcomb'

const IProduceAction = t.struct({
  kind: t.enums({ produce: 'produce' }),
  playerId: t.String,
  itemId: t.String,
  locationId: t.maybe(t.String),
})

const IMovementAction = t.struct({
  kind: t.enums({ move: 'move' }),
  playerId: t.String,
  unitId: t.String,
  path: t.list(t.String),
  speed: t.Number,
})

const actionKinds = {
  move: IMovementAction,
  produce: IProduceAction,
}

const Action = t.union([IProduceAction, IMovementAction])
Action.dispatch = obj => actionKinds[obj.kind]

export const CreateGameInput = t.struct({
  name: t.String,
  players: t.list(t.String),
})

export const SubmitActionsInput = t.struct({
  gameId: t.String,

  actions: t.list(Action),
})

export const AdvanceTurnInput = t.struct({
  gameId: t.String,
})
