import { Db } from 'mongodb'

import { Model, MongoObject } from '../models'
import m1 from './1'

export type Migration = {
  id: string,
  execute: (db: Db) => Promise<void>,
}

type MigrationMeta = MongoObject & {
  migrationId: string,
}

const migrations: Migration[] = [
  m1,
]

export default async function executeMigrations(db: Db) {
  const migrationCollection = db.collection<MigrationMeta>('migrations')
  const model = new Model(migrationCollection)
  const migrationMeta = await model.findOneOrNull()

  let migrationIdx = migrationMeta
    ? migrations.findIndex(m => m.id === migrationMeta.migrationId) + 1
    : 0

  if (migrationIdx === -1) {
    throw new Error(`invalid migration specified: ${migrationMeta!.migrationId}`)
  }

  while (migrations[migrationIdx]) {
    const migration: Migration = migrations[migrationIdx]
    console.log('executing migration', migration.id)
    await migration.execute(db)
    await migrationCollection.updateOne({}, { migrationId: migration.id }, { upsert: true })
    console.log('done')
    migrationIdx++
  }
}
