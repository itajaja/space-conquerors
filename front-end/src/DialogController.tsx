import * as React from 'react'

import { ModalProps } from 'semantic-ui-react'

type DialogProps<T> = ModalProps & {
  onConfirm: (res: T) => void,
  onCancel?: () => void,
}
type DialogComponent<T> = React.Component<DialogProps<T>, any>
type DialogConstructor<T> = new(props?: DialogProps<T>, context?: any) => DialogComponent<T>

type PromptResult<T> = { result: T } | null

type State = {
  Dialog: DialogConstructor<any> | null,
  props: any,
}

export type DialogContext = {
  prompt<T>(Dialog: DialogConstructor<T>, props?: any): Promise<PromptResult<T>>,
}

export default class DialogController extends React.Component<{}, State> {
  static childContextTypes = {
    dialog: React.PropTypes.object.isRequired,
  }

  resolve: ((r: PromptResult<any>) => void) | null

  constructor(props, ctx) {
    super(props, ctx)
    this.state = { Dialog: null, props: null }
  }

  getChildContext(): { dialog: DialogContext } {
    return {
      dialog: {
        prompt: this.prompt,
      },
    }
  }

  onConfirm = (result: any) => {
    this.resolve!({ result })
    this.resolve = null
    this.setState({ Dialog: null, props: null })
  }

  onCancel = () => {
    this.resolve!(null)
    this.resolve = null
    this.setState({ Dialog: null, props: null })
  }

  prompt = (Dialog: DialogConstructor<any>, props?): Promise<PromptResult<any>> => {
    if (this.resolve) {
      throw new Error('cannot prompt twice')
    }

    this.setState({ Dialog, props })

    const promise = new Promise<PromptResult<any>>(resolve => {
      this.resolve = resolve
    })

    return promise
  }

  render() {
    const { children } = this.props
    const { Dialog, props } = this.state

    const dialog = Dialog && (
      <Dialog
        {...props}
        onConfirm={this.onConfirm}
        onCancel={this.onCancel}
        onClose={this.onCancel}
        open
      />
    )

    return (
      <div>
        {dialog}
        {children}
      </div>
    )
  }
}
