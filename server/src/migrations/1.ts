import { Db } from 'mongodb'

import { Game } from '../models'
import { Migration } from './index'

const migration: Migration = {
  id: '1',
  execute: async (db: Db) => {
    const gameCollection = await db.collection<Game>('games')
    const update = {
      $set: { meta: {turnReady: {}} },
    }
    await gameCollection.updateMany({}, update)
  },
}

export default migration
