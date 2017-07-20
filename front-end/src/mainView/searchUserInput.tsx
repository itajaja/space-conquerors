import * as React from 'react'
import { ApolloClient, gql, withApollo } from 'react-apollo'
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react'

import { User } from '../gqlTypes'

type ComponentProps = DropdownProps
type ResultProps = { client: ApolloClient }
export type Props = ComponentProps & ResultProps

type State = {
  options: DropdownItemProps[],
  search: string,
  loading: boolean,
}

const Query = gql`query ($search: String!) {
  users(search: $search) {
    id
    name
    email
  }
}`

class SearchUserInput extends React.Component<Props, State> {
  currentTimeout: number

  state = {
    options: [],
    search: '',
    loading: false,
  }

  executeSearch = async (search: string) => {
    this.setState({ loading: true })
    const result = await this.props.client.query<{ users: User[] }>({
      query: Query,
      variables: { search },
    })
    const options = result.data!.users.map(user => ({
      key: user.id,
      value: user.id,
      text: `${user.name} (${user.email})`,
    }))
    this.setState({ options, loading: false })
  }

  onSearchChange = (_, search: string) => {
    if (search.length < 2) {
      this.setState({ options: [], search })
    } else {
      this.setState({ search })
      clearTimeout(this.currentTimeout)
      this.currentTimeout = setTimeout(() => this.executeSearch(search), 500)
    }
  }

  render() {
    const { client, ...props } = this.props
    const { loading, options, search } = this.state
    let noResultsMessage = 'No results found'
    if (loading) {
      noResultsMessage = 'Loading...'
    } else if (search.length < 2) {
      noResultsMessage = 'Start typing a player\'s email'
    }

    return (
      <Dropdown
        selection
        search
        fluid
        onSearchChange={this.onSearchChange}
        type="text"
        noResultsMessage={noResultsMessage}
        options={options}
        loading={loading}
        {...props}
      />
    )
  }
}

export default withApollo<ComponentProps, ResultProps>(SearchUserInput)
