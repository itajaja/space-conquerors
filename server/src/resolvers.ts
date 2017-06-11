import * as GraphQLJSON from 'graphql-type-json'

import {
  actionResource, Context, gameResource, gameStateResource, logEntryResource,
  userResource,
} from './models'

export default {
  Query: {
    viewer: () => ({}),
    game: (obj, args, ctx) => gameResource.get(args.gameId, ctx),
  },

  Viewer: {
    games: (obj, args, ctx) => gameResource.list(ctx).map(g => ({ ...g, gameId: g.id })),
    user: (obj, args, ctx: Context) => userResource.get(ctx.userId, ctx),
    id: (obj, args, ctx) => ctx.userId,
  },

  Game: {
    state: (obj, args, ctx) => gameStateResource.get(obj.id, ctx),
    // TODO: add game filters on actions and logs
    actions: (obj, args, ctx) => actionResource.list(ctx),
    log: (obj, args, ctx) => logEntryResource.list(ctx),
  },

  JSON: GraphQLJSON,
}
