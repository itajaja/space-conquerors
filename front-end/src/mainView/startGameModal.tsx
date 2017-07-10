import * as _ from 'lodash'
import * as React from 'react'
import { Button, Input, Label, List, Modal, ModalProps } from 'semantic-ui-react'

import Layout from '../components/layout'
import SearchUserInput from './searchUserInput'

type Props = ModalProps & {
  onConfirm: ({ players, name }: { players: string[], name: string }) => void,
  userId: string,
}

type State = {
  name: string,
  players: string[],
  error: string | null,
}

export default class StartGameModal extends React.Component<Props, State> {
  state = {
    name: '',
    players: [this.props.userId, ''],
    error: null,
  }

  onConfirm = () => {
    const { players, name } = this.state
    if (!name) {
      this.setState({ error: 'name required'})
    } else if (players.length < 2 || players.length > 10) {
      this.setState({ error: '2-10 players allowed'})
    } else if (_.uniq(players).length !== players.length) {
      this.setState({ error: 'players must have unique names'})
    } else if (players.some(p => !p || p.length < 1)) {
      this.setState({ error: 'fill in all the player names'})
    } else {
      this.props.onConfirm({ players, name })
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

  onChangeName = (_, { value }) => {
    this.setState({ name: value })
  }

  renderPlayer = (player: string, idx: number) => {
    const label = `player ${idx + 1}`
    const content = idx === 0
      ? <Input value="Myself" disabled fluid />
      : (
        <Layout direction="row">
          <SearchUserInput
            placeholder={label}
            value={player}
            onChange={(_, { value }) => this.onChangeUser(idx, value)}
          />
          <Button icon="trash" onClick={() => this.deleteUser(idx)} />
        </Layout>
      )
    return (
      <List.Item key={idx}>
        {content}
      </List.Item>
    )
  }

  render() {
    const { onConfirm, onCancel, userId, ...props } = this.props
    const { name, players, error } = this.state

    return (
      <Modal {...props}>
        <Modal.Header>Create New Game</Modal.Header>
        <Modal.Content>
          <Modal.Header as="h3">Game Name</Modal.Header>
          <Input
            fluid
            type="text"
            placeholder="name"
            value={name}
            onChange={this.onChangeName}
            />
          <Modal.Header as="h3">Players</Modal.Header>
          <List>
            {players.map(this.renderPlayer)}
            <List.Item>
              <Button icon="plus" onClick={this.addPlayer}></Button>
            </List.Item>
            <List.Item>
            </List.Item>
          </List>
        </Modal.Content>
        <Modal.Actions>
          {error && <Label basic color="red">{error}</Label>}
          <Button primary content="Confirm" onClick={this.onConfirm} />
        </Modal.Actions>
      </Modal>
    )
  }
}
