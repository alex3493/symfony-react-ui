import { useBusyIndicator } from '@/hooks'
import { Button, Spinner } from 'react-bootstrap'
import React from 'react'

type Props = {
  label: string
  variant?: string | undefined
  onClick: () => void
  route: string
  // There are cases when we have to disable a button, not showing activity spinner.
  disabled?: boolean | undefined
}

function ActionButton(props: Props) {
  const { label, variant = 'primary', onClick, route, disabled } = props

  // Check activity for given endpoint and show spinner.
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
