import { Alert } from 'react-bootstrap'
import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  show: boolean
  dismissible: boolean
  timeOut?: number
  notification: string
  action?: () => void
  actionOnClose?: () => void
}

function UpdateAlert(props: Props) {
  const { show, dismissible, notification, action, actionOnClose } = props

  let timeOut = props.timeOut === undefined ? 10 : props.timeOut
  const [countDownValue, setCountDownValue] = useState<number>()

  const interval = useRef<unknown>(undefined)

  const startCountdown = useCallback(() => {
    interval.current = setInterval(() => {
      timeOut--
      setCountDownValue(timeOut)
      if (timeOut <= 0) {
        clearInterval(interval.current as number)
        if (action) {
          action()
        }
      }
    }, 1000)
  }, [action, timeOut])

  const stopCountdown = useCallback(() => {
    clearInterval(interval.current as number)
    setCountDownValue(undefined)
  }, [])

  const closeAlert = useCallback(() => {
    actionOnClose && actionOnClose()
  }, [actionOnClose])

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
      {timeOut && countDownValue ? (
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
      {action && (
        <Alert.Link href="#" onClick={action}>
          Reload
        </Alert.Link>
      )}
    </Alert>
  )
}

export default UpdateAlert
