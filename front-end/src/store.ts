import * as React from 'react'

export default class Store<T extends React.Component<any, object>> {
  constructor(protected component: T) {}

  get state(): T['state'] {
    return this.component.state
  }

  forceUpdate = () => {
    this.set({})
  }

  protected set<K extends keyof T['state']>(
    state: Pick<T['state'], K>,
    cb?: () => any,
  ) {
    this.component.setState(state, cb)
  }
}
