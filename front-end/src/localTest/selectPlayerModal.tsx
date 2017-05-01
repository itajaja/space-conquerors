import * as React from 'react'
import { Button, Form, Modal, ModalProps, Radio } from 'semantic-ui-react'

type Props = ModalProps & {
  onConfirm: (player: string) => void,
  players: string[],
}
type State = {
  selectedPlayer: string | null,
}

export default class SelectPlayerModal extends React.Component<Props, State> {
  constructor(props, ctx) {
    super(props, ctx)
    this.state = {
      selectedPlayer: null,
    }
  }

  onSubmit = () => {
    if (!this.state.selectedPlayer) {
      return
    }

    this.props.onConfirm(this.state.selectedPlayer)
  }

  onChange = (e, { value }) => {
    this.setState({ selectedPlayer: value })
  }

  render() {
    const { players, ...props } = this.props
    return (
      <Modal {...props}>
        <Modal.Header>Select a player to play as</Modal.Header>
        <Modal.Content>
          <Form>
              {players.map(player => (
                <Form.Field key={player}>
                  <Radio
                    label={player}
                    value={player}
                    checked={this.state.selectedPlayer === player}
                    onChange={this.onChange}
                  />
              </Form.Field>
            ))}
            <Form.Field>
              <Radio
                label="Play as Admin"
                value="%%admin%%"
                checked={this.state.selectedPlayer === '%%admin%%'}
                onChange={this.onChange}
              />
          </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary content="Confirm" onClick={this.onSubmit} />
        </Modal.Actions>
      </Modal>
    )
  }
}
