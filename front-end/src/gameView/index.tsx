// import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
// import { Button } from 'semantic-ui-react'

import IApi from '../api'

// const styles = StyleSheet.create({
//   root: {
//     paddingTop: 20,
//     textAlign: 'center',
//   },
//   button: {
//     marginBottom: 10,
//   },
// })

export type Props = {
  api: IApi,
  gameId: string,
}

export default class GameView extends React.Component<Props, {}> {
  render() {
    return (
      <div>test</div>
    )
  }
}
