import { Alert, Button, Form, Modal } from 'react-bootstrap'
import ValidatedControl from '@/components/ValidatedControl'
import { useEffect, useMemo, useState } from 'react'
import ActionButton from '@/components/ActionButton'
import { api } from '@/services'
import { USER_CREATE_API_ROUTE, USER_UPDATE_API_ROUTE } from '@/utils'
import { UserToEdit } from '@/pages/UserList/UserList'
import UserModel from '@/models/UserModel'
import { useSession } from '@/hooks'

type Props = {
  editUser: UserToEdit
  show: boolean
  onAcceptUpdate: () => void
  onClose: () => void
}

type UserUpdateForm = {
  email: string
  password?: string
  first_name: string
  last_name: string
  role: string
}

function EditUser(props: Props) {
  const { editUser, show, onAcceptUpdate, onClose } = props

  const defaultFormData = useMemo(() => {
    return {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'ROLE_USER'
    }
  }, [])

  const { user } = useSession()

  const [values, setValues] = useState<UserUpdateForm>(defaultFormData)

  function handleChange(value: string, name: string) {
    setValues({
      ...values,
      [name]: value
    })
  }

  const passwordFieldPlaceholder = editUser
    ? 'Leave blank to keep current password'
    : 'Password'

  useEffect(() => {
    if (editUser.user) {
      setValues({
        email: editUser.user.email,
        password: '',
        first_name: editUser.user.first_name || '',
        last_name: editUser.user.last_name || '',
        role: editUser.user.role || 'ROLE_USER'
      })
    }

    return () => {
      setValues(defaultFormData)
    }
  }, [defaultFormData, editUser.user])

  const userSaveRoute = editUser.user
    ? USER_UPDATE_API_ROUTE.replace('{userId}', editUser.user.id.toString())
    : USER_CREATE_API_ROUTE

  const modalTitle = editUser.user ? 'Edit User' : 'Create User'

  async function userSaveSubmit() {
    if (editUser.user) {
      console.log('Update user request', values, editUser.user.id)

      try {
        await api.patch(userSaveRoute, values)
        onClose()
      } catch (error) {
        /**
         * an error handler can be added here
         */
      }
    } else {
      console.log('Create user request', values)

      try {
        await api.post(USER_CREATE_API_ROUTE, values)
        onClose()
      } catch (error) {
        /**
         * an error handler can be added here
         */
      }
    }
  }

  const updateFormData = (updatedUser: UserModel) => {
    setValues({
      email: updatedUser.email,
      password: '',
      first_name: updatedUser.first_name || '',
      last_name: updatedUser.last_name || '',
      role: updatedUser.role || 'ROLE_USER'
    })
    onAcceptUpdate()
  }

  const updateAlert = () => {
    if (editUser.update) {
      if (editUser.action === 'update') {
        return (
          <>
            User was updated someone else{' '}
            <Alert.Link
              onClick={() => updateFormData(editUser.update as UserModel)}
            >
              Accept Update
            </Alert.Link>
          </>
        )
      }

      if (editUser.action === 'soft_delete') {
        return (
          <>User was disabled by someone else. You cannot edit this user.</>
        )
      }
      if (editUser.action === 'force_delete') {
        return <>User was deleted by someone else. You cannot edit this user.</>
      }
    }
  }

  const showSaveButton = () => editUser.action === undefined

  return (
    <div>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>{modalTitle}</Modal.Header>
        <Modal.Body>
          <Alert show={!!editUser.action}>{updateAlert()}</Alert>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label column="sm">Email</Form.Label>
              <ValidatedControl
                name="email"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="email"
                  value={values.email}
                  placeholder="Email"
                  autoComplete="new-password"
                />
              </ValidatedControl>
            </Form.Group>
            <Form.Group className="mb-3" controlId="first_name">
              <Form.Label column="sm">First Name</Form.Label>
              <ValidatedControl
                name="first_name"
                validationName="firstName"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="text"
                  value={values.first_name}
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </ValidatedControl>
            </Form.Group>
            <Form.Group className="mb-3" controlId="last_name">
              <Form.Label column="sm">Last name</Form.Label>
              <ValidatedControl
                name="last_name"
                validationName="lastName"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="text"
                  value={values.last_name}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </ValidatedControl>
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label column="sm">Password</Form.Label>
              <ValidatedControl
                name="password"
                validationName="password"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="password"
                  value={values.password}
                  placeholder={passwordFieldPlaceholder}
                  autoComplete="new-password"
                />
              </ValidatedControl>
            </Form.Group>
            <Form.Group className="mb-3" controlId="role">
              <Form.Label column="sm">Role</Form.Label>
              <Form.Select
                value={values.role}
                onChange={(e) => handleChange(e.target.value, 'role')}
              >
                <option value="ROLE_ADMIN">Admin</option>
                <option value="ROLE_USER">User</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {showSaveButton() && (
            <ActionButton
              label="Save"
              onClick={() => userSaveSubmit()}
              route={userSaveRoute}
              variant="primary"
            />
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EditUser
