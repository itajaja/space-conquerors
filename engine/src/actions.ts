export interface IProduceAction {
  kind: 'produce'

  playerId: string

  itemId: string
  locationId?: string
}

export interface IMovementAction {
  kind: 'move'

  playerId: string

  unitId: string
  path: string[]
  speed: number
}

export type Action = IProduceAction | IMovementAction

export function isMovementAction(action: Action): action is IMovementAction {
  return action.kind === 'move'
}
export function isProduceAction(action: Action): action is IProduceAction {
  return action.kind === 'produce'
}
