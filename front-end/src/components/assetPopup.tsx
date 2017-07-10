import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { Popup, PopupProps } from 'semantic-ui-react'

import { items } from 'sco-engine/lib/gameEngine'
import ResourceAmountSegment from '../gameView/resourceAmountSegment'

type Props = PopupProps & {
  itemId: string,
}

const styles = StyleSheet.create({
  trigger: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
})

export default function AssetPopup({ children, itemId, ...props }: Props) {
  const item = items[itemId]
  let content
  if (item.kind === 'unit') {
    content = (
      <div>
        <h5>{item.name}</h5>
        <i>{item.description}</i><br />
        <b>shootingSpeed</b>: {item.shootingSpeed}<br />
        <b>armoringType</b>: {item.armoringType}<br />
        <b>accuracy</b>: {item.accuracy}<br />
        <b>endurance</b>: {item.endurance}<br />
        <b>evasion</b>: {item.evasion}<br />
        <b>firePower</b>: {item.firePower}<br />
        <b>strategicCaliber</b>: {item.strategicCaliber}<br />
        <b>speed</b>: {item.speed}<br />
        <b>gasConsumption</b>: {item.gasConsumption}<br />
        <b>cost</b>: <ResourceAmountSegment amount={item.cost} /><br />
        <b>foodConsumption</b>: {item.foodConsumption}<br />
        <b>productionTime</b>: {item.productionTime}<br />
      </div>
    )
  }
  if (item.kind === 'building') {
    content = (
      <div>
        <h5>{item.name}</h5>
        <i>{item.description}</i><br />
        <b>resourceYield</b>: {item.resourceYield
          ? <ResourceAmountSegment amount={item.resourceYield} />
          : '--'
        }<br />
        <b>cost</b>: <ResourceAmountSegment amount={item.cost} /><br />
        <b>productionTime</b>: {item.productionTime}<br />
      </div>
    )
  }
  if (item.kind === 'tech') {
    content = (
      <div>
        <h5>{item.name}</h5>
        <i>{item.description}</i><br />
        <b>family</b>: {item.family} level {item.level}<br />
        <b>cost</b>: <ResourceAmountSegment amount={item.cost} /><br />
        <b>productionTime</b>: {item.productionTime}<br />
      </div>
    )
  }

  return (
    <Popup
      wide
      trigger={<span className={css(styles.trigger)}>{children}</span>}
      content={content}
      on="click"
    />
  )
}
