import * as _ from 'lodash'
import * as React from 'react'
import * as dx from 'sco-engine/src/definitions'

type Props = {
  amount: dx.ResourceAmount,
  zeros?: boolean,
}

export default function ResourceAmountSegment({ amount, zeros }: Props) {
  const content = _.toPairs(amount)
    .filter(([, cost]) => zeros || cost !== 0)
    .map(([resource, cost]) => `${resource}: ${cost}`)
    .join(', ')

  return <span>{content}</span>
}
