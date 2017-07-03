import { Collection, MongoClient } from 'mongodb'
import { Action } from 'sco-engine/lib/actions'
import { ITurnLogEntry } from 'sco-engine/lib/gameEngine'
import * as mx from 'sco-engine/lib/map'
import * as mlx from 'sco-engine/lib/mapLayout'
import * as sx from 'sco-engine/lib/state'

const MONGODB_URL = 'mongodb://127.0.0.1:27017'

export type Game = {
  _id?: string,

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

export type Models = {
  games: Collection<Game>,
}

export async function createModels(): Promise<Models> {
  let db = await MongoClient.connect(MONGODB_URL)
  db = await db.db('test')

  const games = await db.collection<Game>('games')
  await games.createIndex({ 'players.id': 1 })

  return {
    games,
  }
}
