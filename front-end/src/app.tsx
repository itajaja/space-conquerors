import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { ApolloClient, ApolloProvider, createBatchingNetworkInterface } from 'react-apollo'

import DialogController from './DialogController'
import MainPage from './localTest/mainPage'
import Router from './router'
import style from './style'

const client = new ApolloClient({
  queryDeduplication: true,
  networkInterface: createBatchingNetworkInterface({
    uri: '/graphql',
    batchInterval: 10,
  }),
})

const styles = StyleSheet.create({
  root: {
    position: 'fixed',
    left: 0, top: 0, right: 0, bottom: 0,
    overflow: 'auto',
    background: style.background,
    color: style.textColor,
  },
})

export default function App() {
  return (
    <ApolloProvider client={client}>
      <DialogController>
        <div className={css(styles.root)}>
          <Router defaultView={MainPage} />
        </div>
      </DialogController>
    </ApolloProvider>
  )
}
