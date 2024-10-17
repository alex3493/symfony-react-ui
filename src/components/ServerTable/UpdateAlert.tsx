import { Alert } from 'react-bootstrap'
import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  show: boolean
  dismissible: boolean
  timeOut?: number
  notification: string
  action?: () => void
  actionControl?: boolean
  actionOnClose?: () => void
}

function UpdateAlert(props: Props) {
  const {
    show,
    dismissible,
    notification,
    action,
    actionControl,
    actionOnClose
  } = props

  let timeOut = props.timeOut === undefined ? 10 : props.timeOut
  const [countDownValue, setCountDownValue] = useState<number>()

  const interval = useRef<unknown>(undefined)

  const stopCountdown = useCallback(() => {
    clearInterval(interval.current as number)
    setCountDownValue(undefined)
  }, [])

  const closeAlert = useCallback(() => {
    actionOnClose && actionOnClose()
  }, [actionOnClose])

  const startCountdown = useCallback(() => {
    interval.current = setInterval(() => {
      timeOut--
      setCountDownValue(timeOut)
      if (timeOut <= 0) {
        stopCountdown()
        closeAlert()
        if (actionControl && action) {
          action()
        }
      }
    }, 1000)
  }, [action, actionControl, closeAlert, stopCountdown, timeOut])

  useEffect(() => {
    if (timeOut && show) {
      startCountdown()
    } else {
      stopCountdown()
    }
    return () => {
      stopCountdown()
    }
  }, [actionOnClose, show, startCountdown, stopCountdown, timeOut])
  return (
    <Alert
      show={show}
      dismissible={dismissible}
      onClose={() => {
        closeAlert()
        stopCountdown()
      }}
    >
      {notification}{' '}
      {actionControl && timeOut && countDownValue ? (
        <>
          <span>Table will be reloaded in {countDownValue} seconds</span>{' '}
          <Alert.Link
            href="#"
            onClick={() => {
              stopCountdown()
              setCountDownValue(undefined)
            }}
          >
            Cancel
          </Alert.Link>{' '}
        </>
      ) : (
        <></>
      )}
      {actionControl && action && (
        <Alert.Link
          href="#"
          onClick={() => {
            closeAlert()
            stopCountdown()
            action()
          }}
        >
          Reload
        </Alert.Link>
      )}
    </Alert>
  )
}

export default UpdateAlert
