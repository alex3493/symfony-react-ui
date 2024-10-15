import { Alert } from 'react-bootstrap'
import { itemsUpdateAction } from '@/components/ServerTable/ServerTable'

type Props<T> = {
  show: boolean
  dismissible: boolean
  timeOut?: number
  notification: string
  action?: () => void
  actionOnClose?: (action: itemsUpdateAction<T>) => void
}

function UpdateAlert<T>(props: Props<T>) {
  const { show, dismissible, timeOut, notification, action, actionOnClose } =
    props

  return (
    <Alert show={show} dismissible={dismissible} onClose={actionOnClose}>
      {notification}{' '}
      <a href="#" onClick={action}>
        Reload
      </a>
    </Alert>
  )
}

export default UpdateAlert
