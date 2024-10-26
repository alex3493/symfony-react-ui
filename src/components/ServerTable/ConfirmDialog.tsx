import { Button, Modal } from 'react-bootstrap'

export type ConfirmDialogProps = {
  show: boolean
  title?: string
  body?: string
  acceptButton?: string
  cancelButton?: string
  acceptButtonVariant?:
    | 'primary'
    | 'secondary'
    | 'warning'
    | 'danger'
    | 'success'
  onAccept: () => Promise<void>
  onCancel: () => void | undefined
}

function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    show,
    title,
    body,
    acceptButton,
    cancelButton,
    acceptButtonVariant,
    onAccept,
    onCancel
  } = props

  return (
    <Modal show={show}>
      <Modal.Header>{title || 'Are you sure?'}</Modal.Header>
      <Modal.Body>{body || 'This action cannot be undone!'}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" autoFocus={true} onClick={onCancel}>
          {cancelButton || 'Cancel'}
        </Button>
        <Button variant={acceptButtonVariant || 'primary'} onClick={onAccept}>
          {acceptButton || 'OK'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmDialog
