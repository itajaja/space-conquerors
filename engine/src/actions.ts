import { ItemKind } from './definitions'

export type IActionKind = 'produce' | 'move'

export interface IAction {
  kind: IActionKind
}

export interface IProduceAction extends IAction {
  kind: 'produce'

  itemKind: ItemKind
  itemId: string
  locationId?: string
}

export interface IMovementAction extends IAction {
  unitId: string

  path: string[]

  speed: number
}
