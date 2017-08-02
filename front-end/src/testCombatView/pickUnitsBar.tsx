import { StyleSheet } from 'aphrodite'
import * as _ from 'lodash'
import * as React from 'react'
import unitTypes from 'sco-engine/lib/units'
import { Input } from 'semantic-ui-react'

import AssetPopup from '../components/assetPopup'
import Layout from '../components/layout'

const styles = StyleSheet.create({
  item: {
    overflow: 'auto',
  },
})

type Props = {
  armyCount: { [idx: string]: number },
  onUpdateUnit: (unitTypeId: string, count: number) => void,
}

export default class PickUnitsBar extends React.Component<Props, never> {
  render() {
    const { armyCount, onUpdateUnit } = this.props

    const unitControls = _.values(unitTypes).map(u => (
      <Layout key={u.id} classes={styles.item}>
        <AssetPopup itemId={u.id}>{u.name}</AssetPopup>
        <Input
          type="number"
          value={`${armyCount[u.id] || 0}`}
          onChange={(_, d) => onUpdateUnit(u.id, Number(d.value))}
        />
      </Layout>
    ))
    return (
      <Layout direction="row">
        {unitControls}
      </Layout>
    )
  }
}
