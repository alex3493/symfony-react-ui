import { useBusyIndicator } from '@/hooks'
import { Button, Spinner } from 'react-bootstrap'
import React from 'react'

type Props = {
  label: string
  variant?: string | undefined
  action: () => void
  route: string
}

function ActionButton(props: Props) {
  const { label, variant = 'primary', action, route } = props

  const { isEndpointBusy } = useBusyIndicator()
  const disableSubmit = isEndpointBusy(route)

  return (
    <>
      <Button variant={variant} onClick={action} disabled={disableSubmit}>
        {disableSubmit && (
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
        )}{' '}
        {label}
      </Button>
    </>
  )
}

export default ActionButton
