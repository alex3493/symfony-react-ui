import UserModel from '@/models/UserModel'
import { Button, Form, Modal } from 'react-bootstrap'
import ValidatedControl from '@/components/ValidatedControl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AxiosError } from 'axios'
import { useMercureUpdates, useSession } from '@/hooks'
import ActionButton from '@/components/ActionButton'
import { api } from '@/services'
import { USER_CREATE_API_ROUTE, USER_UPDATE_API_ROUTE } from '@/utils'

type Props = {
  editUser: UserModel | undefined
  show: boolean
  mercureTopic: string
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
  const { editUser, show, mercureTopic, onClose } = props

  const defaultFormData = useMemo(() => {
    return {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'ROLE_USER'
    }
  }, [])

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
    if (editUser) {
      setValues({
        email: editUser.email,
        password: '',
        first_name: editUser.first_name || '',
        last_name: editUser?.last_name || '',
        role: editUser.role || 'ROLE_USER'
      })
    }

    return () => {
      setValues(defaultFormData)
    }
  }, [defaultFormData, editUser])

  const { mercureHubUrl, user } = useSession()
  const { discoverMercureHub, addSubscription, removeSubscription } =
    useMercureUpdates()

  const subscriptionCallback = useCallback((event: MessageEvent) => {
    console.log(
      '***** UserItem :: Mercure message received',
      JSON.parse(event.data)
    )
    // const eventData = JSON.parse(event.data)
  }, [])

  const itemTopic = useCallback(
    () =>
      editUser?.id
        ? mercureTopic.replace(/{.*?}/, editUser.id.toString())
        : undefined,
    [mercureTopic, editUser?.id]
  )

  useEffect(() => {
    async function subscribe() {
      const topic = itemTopic()
      console.log('***** Edit user subscribing', topic)
      if (topic) {
        try {
          await discoverMercureHub(mercureHubUrl)
          await addSubscription(topic, subscriptionCallback)
        } catch (error) {
          return error as AxiosError
        }
      }
    }

    subscribe().catch((error) => {
      console.log('Error subscribing to user item updates', error)
    })

    return () => {
      const topic = itemTopic()
      console.log('***** Edit user clean-up', topic)
      // Do not remove topic for currently logged-in user.
      if (topic && editUser?.id !== user?.id) {
        removeSubscription(topic)
      }
    }
  }, [
    addSubscription,
    discoverMercureHub,
    itemTopic,
    mercureHubUrl,
    mercureTopic,
    removeSubscription,
    subscriptionCallback,
    editUser?.id,
    user?.id
  ])

  const userSaveRoute = editUser
    ? USER_UPDATE_API_ROUTE.replace('{userId}', editUser.id.toString())
    : USER_CREATE_API_ROUTE

  async function userSaveSubmit() {
    if (editUser) {
      console.log('Update user request', values, editUser.id)

      try {
        // TODO: Issue here - with Mercure subscription await api.patch() never ends.
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

  return (
    <div>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>Edit User</Modal.Header>
        <Modal.Body>
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
          <ActionButton
            label="Save"
            onClick={() => userSaveSubmit()}
            route={userSaveRoute}
            variant="primary"
          />
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EditUser
