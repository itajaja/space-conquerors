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
import { Game, Models } from './models'

export type Context = {
  userId: string,
  userName: string,
  userMeta: { admin: boolean },
  models: Models,
}

const MAX_PLAYERS = 10

export default {
  Query: {
    viewer: () => ({}),
    game: (obj, args, ctx: Context) => ctx.models.games.findById(args.gameId),
  },

  Viewer: {
    games: async (obj, args, ctx: Context) => {
      return ctx.models.games.findAll()
    },
    user: (obj, args, ctx: Context) => ({
      id: ctx.userId,
      name: ctx.userName,
      admin: !!ctx.userMeta.admin,
    }),
    id: (obj, args, ctx: Context) => ctx.userId,
  },

  Game: {
    id: (obj: Game) => obj._id,
    players: (obj: Game) => _.keyBy(obj.players, 'id'),
    state: (obj: Game, args, ctx: Context): sx.IGameState => {
      if (args.full) {
        if (!ctx.userMeta.admin) {
          throw new Error('invalid_auth.admin_required')
        }

        return obj.state
      }

      return getStateforPlayer(ctx.userId, obj.state, obj.map)
    },
    actions: (obj: Game, args, ctx: Context): Game['actions'] => {
      if (args.full) {
        if (!ctx.userMeta.admin) {
          throw new Error('invalid_auth.admin_required')
        }

        return obj.actions
      }
      return _.pick(obj.actions, [ctx.userId]) as Game['actions']
    },
    log: (obj: Game, args, ctx: Context): Game['log'] => {
      if (args.full) {
        if (!ctx.userMeta.admin) {
          throw new Error('invalid_auth.admin_required')
        }

        return obj.log
      }
      return obj.log.filter(a => a.player === ctx.userId)
    },
    isPlayer: (obj: Game, args, ctx: Context) => (
      !!obj.players.find(u => u.id === ctx.userId)
    ),
    turnReady: (obj: Game, args, ctx: Context) => (
      !!obj.meta.turnReady[ctx.userId]
    ),
  },

  Mutation: {
    createGame: async (obj, { input }, ctx: Context) => {
      const { players, name } = inputs.CreateGameInput(input) as {
        players: string[],
        name: string,
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
        technologies: { tech_galaxy_trade: true } as { [idx: string]: true },
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
          name: id,
          color: randomcolor(),
        })),
        createdAt: new Date().toString(),
        currentTurnNumber: 0,
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
        if (action.playerId !== ctx.userId) {
          throw new Error('invalid_action.user_id')
        }

        if (action.kind === 'move') {
          validator.validateMovementAction(action)
        } else {
          validator.validateProductionAction(action)
        }
      })

      game.actions[ctx.userId] = actions
      await ctx.models.games.update(game)

      return {
        game,
      }
    },

    advanceTurn: async (obj, { input }, ctx: Context) => {
      const { gameId } = inputs.AdvanceTurnInput(input) as {
        gameId: string,
      }

      if (!ctx.userMeta.admin) {
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
      if (!game.players.find(u => u.id === ctx.userId)) {
        throw new Error('invalid_auth.not_player')
      }
      game.meta.turnReady[ctx.userId] = turnReady

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
