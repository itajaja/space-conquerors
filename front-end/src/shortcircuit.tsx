import * as React from 'react'
import { ComponentClass, StatelessComponent } from 'react'

export type WrapWithShortCircuit =
  <P, TComponentConstruct extends (ComponentClass<P> | StatelessComponent<P>)>
  (component: TComponentConstruct) => TComponentConstruct

export default function shortcircuit(pred): WrapWithShortCircuit {
  return Component => {
    return (props) => pred(props) ? <Component {...props} /> : null
  }
}
