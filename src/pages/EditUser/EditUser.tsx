import UserModel from '@/models/UserModel'
import { Button, Form } from 'react-bootstrap'
import ValidatedControl from '@/components/ValidatedControl'
import React, { useState } from 'react'
import ActionButton from '@/components/ActionButton'

import { USER_UPDATE_API_ROUTE, USER_CREATE_API_ROUTE } from '@/utils'

// TODO: Add support for user create action.

type Props = {
  user: UserModel | undefined
  submitCallback: (form: UserUpdateForm) => void
  cancelCallback: () => void
}

export type UserUpdateForm = {
  email: string
  password?: string
  first_name: string
  last_name: string
}

function EditUser(props: Props) {
  const { user, submitCallback, cancelCallback } = props

  const [values, setValues] = useState<UserUpdateForm>({
    email: user?.email || '',
    password: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || ''
  })

  function handleChange(value: string, name: string) {
    setValues({
      ...values,
      [name]: value
    })
  }

  const userUpdateRoute = () => {
    console.log('userUpdateRoute getter', user?.id)
    return USER_UPDATE_API_ROUTE.replace(
      '{userId}',
      user ? user.id.toString() : ''
    )
  }

  return (
    <div>
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
              placeholder="Leave blank to keep current password"
              autoComplete="new-password"
            />
          </ValidatedControl>
        </Form.Group>
        <ActionButton
          label="Save"
          onClick={() => submitCallback(values)}
          route={userUpdateRoute()}
          variant="primary"
          style={{ marginRight: 10 }}
        />
        <Button variant="secondary" onClick={cancelCallback}>
          Close
        </Button>
      </Form>
    </div>
  )
}

export default EditUser
