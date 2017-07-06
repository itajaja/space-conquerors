import { Collection, MongoClient, ObjectID } from 'mongodb'
import { Action } from 'sco-engine/lib/actions'
import { ITurnLogEntry } from 'sco-engine/lib/gameEngine'
import * as mx from 'sco-engine/lib/map'
import * as mlx from 'sco-engine/lib/mapLayout'
import * as sx from 'sco-engine/lib/state'

import { Context } from './resolvers'

const MONGODB_URL = 'mongodb://127.0.0.1:27017'

type MongoObject = {
  _id?: string,
}

export type Game = MongoObject & {
  name: string,
  createdAt: string,
  state: sx.IGameState,
  players: Array<{ id: string, name: string, color: string }>,
  currentTurnNumber: number,
  map: mx.IMap,
  mapLayout: mlx.MapLayout,
  actions: { [idx: string]: Action[] }
  log: ITurnLogEntry[],
}

/**
 * Small wrapper around mongoDB collection
 */
class Model<T extends MongoObject> {
  constructor(protected collection: Collection<T>, protected ctx: Context) { }
  authFilter(filter?: object): object | undefined {
    return filter
  }

  authorizeModify(item: T) {
    return
  }

  idFilter(id: string) {
    return { _id: new ObjectID(id) }
  }

  findById(id: string) {
    return this.findOne(this.idFilter(id))
  }

  find(query?: object) {
    query = this.authFilter(query)

    return this.collection.find(query)
  }

  async findAll(query?: object) {
    const result = await this.find(query)
    return await result.toArray()
  }

  async findOne(query?: object) {
    query = this.authFilter(query)

    const next = await this.find(query).limit(1).next()

    if (next == null) {
      throw new Error('object_not_found')
    }

    return next
  }

  async insert(item: T): Promise<T> {
    this.authorizeModify(item)
    const result = await this.collection.insertOne(item)
    return {
      // cast due to https://github.com/Microsoft/TypeScript/issues/10727
      ...(item as any),
      _id: result.insertedId,
    }
  }

  // explicit, albeit unnecessary, async/await to coerce the return type
  async update(item: T) {
    this.authorizeModify(item)
    if (!item._id) {
      throw new Error('item should have an _id field')
    }
    return await this.collection.updateOne(this.idFilter(item._id), item)
  }
}

export class GameModel extends Model<Game> {
  authFilter(filter: object = {}): object {
    return {
      $and: [
        this.ctx.userMeta.admin ? {} : { 'player.id': this.ctx.userId },
        filter,
      ],
    }
  }

  authorizeModify(item: Game) {
    super.authorizeModify(item)
    if (this.ctx.userMeta.admin) {
      return
    }
    if (!item.players.find(p => p.id === this.ctx.userId)) {
      throw new Error('invalid_game.no_self_as_player')
    }
  }
}

export type Models = {
  games: GameModel,
}

export async function initModels() {
  let db = await MongoClient.connect(MONGODB_URL)
  db = await db.db('test')

  const games = await db.collection<Game>('games')
  await games.createIndex({ 'players.id': 1 })

  return (ctx: Context) => {
    return {
      games: new GameModel(games, ctx),
    }
  }
}
