import * as React from 'react'
import { Button, ButtonProps, Popup } from 'semantic-ui-react'

type Props = ButtonProps & {
  error: string | null,
}

export default function ValidatedButton({ error, ...props }: Props) {
  const button = (
    <div>
      <Button
        disabled={!!error}
        {...props}
      />
    </div>
  )
  if (error === null) {
    return button
  }

  return (
    <Popup
      trigger={button}
      content={error}
      on="hover"
    />
  )
}
