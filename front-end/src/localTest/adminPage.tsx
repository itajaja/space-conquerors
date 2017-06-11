// REVISIT ADMIN PAGE
// import { css, StyleSheet } from 'aphrodite'
// import * as _ from 'lodash'
// import * as React from 'react'
// import { Button, Grid } from 'semantic-ui-react'

// import { applyTurn } from 'sco-engine/lib/game'
// import * as storage from './storage'

// const styles = StyleSheet.create({
//   root: {
//     paddingTop: 20,
//   },
// })

// type State = {
//   data: storage.IStorageData,
// }

// export default class AdminPage extends React.Component<never, State> {
//   constructor(props, ctx) {
//     super(props, ctx)

//     this.state = {
//       data: storage.load()!,
//     }
//   }

//   renderJson(data) {
//     return (
//       <pre>
//         <code>
//           {JSON.stringify(data, undefined, 2)}
//         </code>
//       </pre>
//     )
//   }

//   nextTurn() {
//     const { data } = this.state

//     return applyTurn(data.state, data.map, _.flatten(_.values(data.actions)))
//   }

//   advanceTurn = () => {
//     const { data } = this.state

//     storage.save({
//       currentTurnNumber: data.currentTurnNumber + 1,
//       actions: {},
//       map: data.map,
//       players: data.players,
//       ...this.nextTurn(),
//       mapLayout: data.mapLayout,
//     })
//     this.setState({
//       data: storage.load()!,
//     })
//   }

//   render() {
//     const { actions, state, currentTurnNumber } = this.state.data
//     const nextTurn = this.nextTurn()

//     return (
//       <div className={css(styles.root)}>
//         <h2>Turn {currentTurnNumber}</h2>
//         <Button
//           size="big"
//           onClick={this.advanceTurn}
//         >
//           Advance To Next Turn
//         </Button>
//         <Grid columns={3} divided>
//           <Grid.Row>
//             <Grid.Column>
//               <h2>Actions</h2>
//               {this.renderJson(actions)}
//             </Grid.Column>
//             <Grid.Column>
//               <h2>Game State</h2>
//               {this.renderJson(state)}
//             </Grid.Column>
//             <Grid.Column>
//               <h2>Next Game State</h2>
//               {this.renderJson(nextTurn.state)}
//               <h2>Next Log</h2>
//               {this.renderJson(nextTurn.log)}
//             </Grid.Column>
//           </Grid.Row>
//         </Grid>
//       </div>
//     )
//   }
// }
