import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'

import style from './style'

const styles = StyleSheet.create({
  main: {
    fontFamily: 'Play, sans-serif',
    position: 'fixed',
    left: 0, top: 0, right: 0, bottom: 0,
    overflow: 'auto',
    background: style.background,
    color: style.textColor,
  },
  title: {
    textAlign: 'center',
  },
})

export default function App() {
  return (
    <div className={css(styles.main)}>
      <h1 className={css(styles.title)}>
        S C O
      </h1>
    </div>
  )
}
