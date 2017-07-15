import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import * as dx from 'sco-engine/lib/definitions'

const styles = StyleSheet.create({
  warning: {
    color: 'red',
  },
})

const RESOURCES_ICONS = {
  gas: '🛢',
  darkMatter: '🔮',
  iron: '⚙️',
  gold: '💰',
}

type Props = React.HTMLAttributes<{}> & {
  amount: dx.ResourceAmount,
  plusAmount?: dx.ResourceAmount,
  zeros?: boolean,
}

export default class ResourceAmountSegment extends React.Component<Props, never> {
  renderResource(res: string) {
    const { amount, plusAmount, zeros } = this.props
    const resourceAmount = amount[res]
    const plusResourceAmount = plusAmount && plusAmount[res]
    if (resourceAmount || zeros) {
      return (
        <span style={{ paddingRight: 10 }}>
          <span>{RESOURCES_ICONS[res]}</span>{' '}
          <span className={css(resourceAmount < 0 && styles.warning)}>
            {resourceAmount}
          </span>
          {plusResourceAmount != null && ` (+${plusResourceAmount})`}
        </span>
      )
    }
  }

  render() {
    const { amount, plusAmount, zeros, ...props } = this.props

    return (
      <span {...props} style={{ marginRight: -10 }} >
        {this.renderResource('gold')}
        {this.renderResource('iron')}
        {this.renderResource('gas')}
        {this.renderResource('darkMatter')}
      </span>
    )
  }
}
