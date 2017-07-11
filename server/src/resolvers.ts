import * as GraphQLJSON from 'graphql-type-json'
import * as _ from 'lodash'
import * as randomcolor from 'randomcolor'
import * as ax from 'sco-engine/lib/actions'
import * as dx from 'sco-engine/lib/definitions'
import Validator from 'sco-engine/lib/gameValidator'
import MapGenerator from 'sco-engine/lib/mapGenerator'
import * as mlx from 'sco-engine/lib/mapLayout'
import * as sx from 'sco-engine/lib/state'
import { getStateforPlayer } from 'sco-engine/lib/visibility'

import * as inputs from './inputs'
import { Game, Models, User } from './models'

export type Context = {
  user: {
    id: string,
    meta: { admin?: boolean },
    name: string,
    email: string,
  }
  models: Models,
}

const MAX_PLAYERS = 10

export default {
  Query: {
    viewer: () => ({}),
    game: (obj, args, ctx: Context) => ctx.models.games.findById(args.gameId),
    users: async (obj, args, ctx: Context) => {
      let query = {}
      if (args.search) {
        query = {
          email: { $regex: `^${args.search}` },
        }
      }
      return ctx.models.users.findAll(query)
    },
  },

  Viewer: {
    id: (obj, args, ctx: Context) => ctx.user.id,

    user: async (obj, args, ctx: Context) => {
      const user: User = {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
      }
      await ctx.models.users.collection.updateOne(
        { id: user.id }, user, { upsert: true },
      )
      return {
        ...user,
        admin: !!ctx.user.meta.admin,
      }
    },

    games: async (obj, args, ctx: Context) => ctx.models.games.findAll(),
  },

  Game: {
    id: (obj: Game) => obj._id,
    state: (obj: Game, args, ctx: Context): sx.IGameState => {
      if (args.full) {
        if (!ctx.user.meta.admin) {
          throw new Error('invalid_auth.admin_required')
        }

        return obj.state
      }

      return getStateforPlayer(ctx.user.id, obj.state, obj.map)
    },
    players: async (obj: Game, args, ctx: Context) => {
      const playerIds = obj.players.map(g => g.id)
      const indexedPlayers = _.keyBy(obj.players, 'id')
      const users = await ctx.models.users.findAll({ id: { $in: playerIds } })
      const players = {}
      users.forEach(u => players[u.id!] = {
        id: u.id,
        email: u.email,
        name: u.name,
        color: indexedPlayers[u.id!].color,
      })
      return players
    },
    actions: (obj: Game, args, ctx: Context): Game['actions'] => {
      if (args.full) {
        if (!ctx.user.meta.admin) {
          throw new Error('invalid_auth.admin_required')
        }

        return obj.actions
      }
      return _.pick(obj.actions, [ctx.user.id]) as Game['actions']
    },
    log: (obj: Game, args, ctx: Context): Game['log'] => {
      if (args.full) {
        if (!ctx.user.meta.admin) {
          throw new Error('invalid_auth.admin_required')
        }

        return obj.log
      }
      return obj.log.filter(a => a.player === ctx.user.id)
    },
    isPlayer: (obj: Game, args, ctx: Context) => (
      !!obj.players.find(u => u.id === ctx.user.id)
    ),
    turnReady: (obj: Game, args, ctx: Context) => (
      !!obj.meta.turnReady[ctx.user.id]
    ),
    meta: (obj: Game, args, ctx: Context) => {
      if (!ctx.user.meta.admin) {
        throw new Error('invalid_auth.admin_required')
      }
      return obj.meta
    },
  },

  Mutation: {
    createGame: async (obj, { input }, ctx: Context) => {
      const { players, name } = inputs.CreateGameInput(input) as {
        players: string[],
        name: string,
      }

      const users = await ctx.models.users.findAll({ id: { $in: players } })
      if (users.length !== players.length) {
        throw new Error('invalid_player_ids')
      }

      const playersSet = new Set(players)
      if (playersSet.size > MAX_PLAYERS) {
        throw new Error('too_many_players')
      }
      if (playersSet.size < players.length) {
        throw new Error('duplicate_users')
      }

      const mapGenerator = new MapGenerator()
      const { origins, ...map } = mapGenerator.generate(players.length)
      const planetStates: sx.IPlanetState[] = _.values(map.cells)
        .filter(c => c.planet)
        .map(p => ({ locationId: p.id }))
      const indexedPlanetStates = _.keyBy(planetStates, 'locationId')
      origins.forEach((o, idx) => {
        indexedPlanetStates[o.id].ownerPlayerId = players[idx]
      })

      const playerStates: sx.IPlayerState[] = players.map((p, idx) => ({
        id: p,
        status: sx.PlayerStatus.Alive,
        resourcesAmount: dx.zeroResources({ gold: 2000, iron: 300 }),
        productionStatuses: [],
        technologies: {},
      }))

      const actions = {}
      players.forEach(p => actions[p] = [])

      const state = {
        players: _.keyBy(playerStates, 'id'),
        planets: indexedPlanetStates,
        units: {},
        buildings: {},
        marketState: {},
      }

      const game: Game = {
        name,
        players: players.map(id => ({
          id,
          color: randomcolor(),
        })),
        createdAt: new Date().toString(),
        currentTurnNumber: 1,
        map,
        mapLayout: mlx.generate(map),
        state,
        actions,
        log: [],
        meta: {
          turnReady: {},
        },
      }

      const newGame = await ctx.models.games.insert(game)

      return {
        gameId: newGame._id!,
        viewer: {},
      }
    },

    submitActions: async (obj, { input }, ctx: Context) => {
      const { gameId, actions } = inputs.SubmitActionsInput(input) as {
        gameId: string,
        actions: ax.Action[],
      }
      const game = await ctx.models.games.findById(gameId)

      const validator = new Validator(game.state, game.map)
      validator.validateMovementActions(
        actions.filter(a => a.kind === 'move') as ax.IMovementAction[],
      )

      actions.forEach(action => {
        if (action.playerId !== ctx.user.id) {
          throw new Error('invalid_action.user_id')
        }

        if (action.kind === 'move') {
          validator.validateMovementAction(action)
        } else {
          validator.validateProductionAction(action)
        }
      })

      game.actions[ctx.user.id] = actions
      await ctx.models.games.update(game)

      return {
        game,
      }
    },

    advanceTurn: async (obj, { input }, ctx: Context) => {
      const { gameId } = inputs.AdvanceTurnInput(input) as {
        gameId: string,
      }

      if (!ctx.user.meta.admin) {
        throw new Error('invalid_auth.admin_required')
      }

      const game = await ctx.models.games.findById(gameId)

      ctx.models.games.advanceTurn(game)

      await ctx.models.games.update(game)

      return {
        game,
      }
    },

    setTurnReady: async (obj, { input }, ctx: Context) => {
      const { gameId, turnReady } = inputs.SetTurnReadyInput(input) as {
        gameId: string,
        turnReady: boolean,
      }

      const game = await ctx.models.games.findById(gameId)
      if (!game.players.find(u => u.id === ctx.user.id)) {
        throw new Error('invalid_auth.not_player')
      }
      game.meta.turnReady[ctx.user.id] = turnReady

      await ctx.models.games.update(game)
      const readys = _.values(game.meta.turnReady)

      if (readys.length === game.players.length && readys.every(r => r)) {
        ctx.models.games.advanceTurn(game)
      }

      await ctx.models.games.update(game)
      return {
        game,
      }
    },
  },

  JSON: GraphQLJSON,
}
