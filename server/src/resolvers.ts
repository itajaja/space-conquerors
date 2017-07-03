import * as GraphQLJSON from 'graphql-type-json'
import * as _ from 'lodash'
import { ObjectID } from 'mongodb'

import { getStateforPlayer } from 'sco-engine/lib/visibility'
import { Game, Models } from './models'

export type Context = {
  userId: string,
  userName: string,
  models: Models,
}

export default {
  Query: {
    viewer: () => ({}),
    game: (obj, args, ctx: Context) => ctx.models.games
      .findOne({ _id: new ObjectID(args.gameId) }),
  },

  Viewer: {
    games: async (obj, args, ctx: Context) => {
      const c = await ctx.models.games.find({ 'players.id': ctx.userId })
      return await c.toArray()
    },
    user: (obj, args, ctx: Context) => ({
      id: ctx.userId,
      name: ctx.userName,
    }),
    id: (obj, args, ctx: Context) => ctx.userId,
  },

  Game: {
    id: (obj: Game) => obj._id,
    players: (obj: Game) => _.keyBy(obj.players, 'id'),
    state: (obj: Game, args, ctx: Context) => (
      getStateforPlayer(ctx.userId, obj.state, obj.map)
    ),
    actions: (obj: Game, args, ctx: Context) => obj.actions[ctx.userId],
    log: (obj: Game, args, ctx: Context) => (
      obj.log.filter(a => a.player === ctx.userId)
    ),
    name: (obj: Game) => obj.name,
  },

  JSON: GraphQLJSON,
}
