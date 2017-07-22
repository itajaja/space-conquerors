import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'

import style from '../style'

const keyFrames = {
  cwSpin: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  ccwSpin: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(-360deg)' },
  },
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
  },

  outerCircle: {
    margin: '0 auto',
    boxSizing: 'content-box',

    width: 80,
    height: 80,
    borderTop: `7px solid ${style.blue}`,
    borderBottom: `7px solid ${style.blue}`,
    borderLeft: '7px solid transparent',
    borderRight: '7px solid transparent',

    borderRadius: 80,

    boxShadow: `0 0 20px ${style.blue}`,

    animationName: keyFrames.ccwSpin,
    animationDuration: '.666s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },

  innerCircle: {
    position: 'absolute',
    margin: '20px 0 0 20px',
    boxSizing: 'content-box',
    top: 0,

    width: 40,
    height: 40,
    borderTop: `7px solid ${style.blue}`,
    borderBottom: `7px solid ${style.blue}`,
    borderLeft: '7px solid transparent',
    borderRight: '7px solid transparent',

    borderRadius: 40,

    boxShadow: `0 0 20px ${style.blue}`,

    animationName: keyFrames.cwSpin,
    animationDuration: '.555s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },

  center: {
    margin: '5px 0 0 5px',
    boxSizing: 'content-box',

    width: 30,
    height: 30,

    background: style.blue,

    borderRadius: 30,
  },
})

export default class Loading extends React.Component<React.HTMLAttributes<{}>> {
  render() {
    return (
      <div {...this.props}>
        <div className={css(styles.root)}>
          <div className={css(styles.outerCircle)} />
          <div className={css(styles.innerCircle)}>
            <div className={css(styles.center)} />
          </div>
        </div>
      </div>
    )
  }

}
