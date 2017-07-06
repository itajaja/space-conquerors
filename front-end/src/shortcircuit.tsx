import * as React from 'react'
import { ComponentClass, StatelessComponent } from 'react'

export default function shortcircuit(pred: (props: any) => boolean) {
  function wrap<P>(Component: ComponentClass<P> | StatelessComponent<P>) {
    return class extends React.Component<P, never> {
      render() {
        return pred(this.props) ? <Component {...this.props} /> : null
      }
    }
  }

  return wrap
}
