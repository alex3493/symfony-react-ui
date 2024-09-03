import { useBusyIndicator } from '@/hooks'
import { Button, Spinner } from 'react-bootstrap'
import React from 'react'

type Props = {
  label: string
  variant?: string | undefined
  onClick: () => void
  route: string
  disabled?: boolean | undefined
}

function ActionButton(props: Props) {
  const { label, variant = 'primary', onClick, route, disabled } = props

  const { isEndpointBusy } = useBusyIndicator()
  const showSpinner = isEndpointBusy(route)

  return (
    <>
      <Button
        variant={variant}
        onClick={onClick}
        disabled={showSpinner || disabled}
      >
        {showSpinner && (
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
