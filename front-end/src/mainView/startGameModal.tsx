import * as _ from 'lodash'
import * as React from 'react'
import { Button, Input, Label, List, Modal, ModalProps } from 'semantic-ui-react'

type Props = ModalProps & {
  onConfirm: (players: string[]) => void,
}

type State = {
  players: string[],
  error: string | null,
}

export default class StartGameModal extends React.Component<Props, State> {
  state = {
    players: ['', ''],
    error: null,
  }

  onConfirm = () => {
    const { players } = this.state
    if (players.length < 2) {
      this.setState({ error: '2 players minum'})
    } else if (_.uniq(players).length !== players.length) {
      this.setState({ error: 'players must have unique names'})
    } else if (players.some(p => !p || p.length < 1)) {
      this.setState({ error: 'fill in all the player names'})
    } else {
      this.props.onConfirm(players)
    }
  }

  addPlayer = () => {
    this.setState({
      players: [...this.state.players, ''],
    })
  }

  deleteUser = (idx: number) => {
    const { players } = this.state
    players.splice(idx, 1)
    this.setState({ players })
  }

  onChangeUser = (idx: number, value: string) => {
    const { players } = this.state
    players[idx] = value
    this.setState({ players, error: null })
  }

  renderPlayer = (player: string, idx: number) => {
    const label = `player ${idx + 1}`
    return (
      <List.Item key={idx}>
        <Input
          type="text"
          placeholder={label}
          action={{ icon: 'trash', onClick: () => this.deleteUser(idx) }}
          value={player}
          onChange={(_, { value }) => this.onChangeUser(idx, value)}
        />
      </List.Item>
    )
  }

  render() {
    return (
      <Modal {...this.props}>
        <Modal.Header>Select Players</Modal.Header>
        <Modal.Content>
          <List>
            {this.state.players.map(this.renderPlayer)}
            <List.Item>
              <Button icon="plus" onClick={this.addPlayer}></Button>
            </List.Item>
            <List.Item>
            </List.Item>
          </List>
        </Modal.Content>
        <Modal.Actions>
          {this.state.error && <Label basic color="red">{this.state.error}</Label>}
          <Button primary content="Confirm" onClick={this.onConfirm} />
        </Modal.Actions>
      </Modal>
    )
  }
}
