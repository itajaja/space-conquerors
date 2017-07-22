import * as React from 'react'
import * as ReactDOM from 'react-dom'

export default class RenderInBody extends React.Component {
  popup: any

  componentDidMount() {
    this.popup = document.createElement('div')
    document.body.appendChild(this.popup)
    this._renderLayer()
  }

  componentDidUpdate() {
    this._renderLayer()
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.popup)
    document.body.removeChild(this.popup)
  }

  _renderLayer() {
    ReactDOM.render(this.props.children as any, this.popup)
  }

  render() {
    return null
  }

}
