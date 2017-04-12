import { ItemKind } from './definitions'

export interface IProduceAction {
  kind: 'produce'

  itemKind: ItemKind
  itemId: string
  locationId?: string
}

export interface IMovementAction {
  kind: 'move'

  unitId: string

  path: string[]

  speed: number
}

export type Action = IProduceAction | IMovementAction
