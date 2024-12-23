import { Card, Form } from 'react-bootstrap'
import React, { useState } from 'react'
import { useSession } from '@/hooks'
import { api } from '@/services'
import { CHANGE_PASSWORD_API_ROUTE } from '@/utils'
import ValidatedControl from '@/components/ValidatedControl'
import ActionButton from '@/components/ActionButton'

type ChangePasswordForm = {
  current_password: string
  password: string
  password_confirmation: string
}

function ChangePassword() {
  const [values, setValues] = useState<ChangePasswordForm>({
    current_password: '',
    password: '',
    password_confirmation: ''
  })

  const { signOut } = useSession()

  function handleChange(value: string, name: string) {
    setValues({
      ...values,
      [name]: value
    })
  }

  async function handleSubmit() {
    try {
      await api.patch(CHANGE_PASSWORD_API_ROUTE, values)
      signOut()
    } catch (error) {
      /**
       * an error handler can be added here
       */
    }
  }

  return (
    <>
      <Card className="mt-3 mb-3">
        <Card.Header>Change Password</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3" controlId="current_password">
              <Form.Label column="sm">Current Password</Form.Label>
              <ValidatedControl
                name="current_password"
                validationName="currentPassword"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="password"
                  placeholder="Current password"
                  autoComplete="new-password"
                />
              </ValidatedControl>
            </Form.Group>

            <Form.Group className="mb-3" controlId="new_password">
              <Form.Label column="sm">New Password</Form.Label>
              <ValidatedControl
                name="password"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="password"
                  placeholder="New password"
                  autoComplete="new-password"
                />
              </ValidatedControl>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password_confirmation">
              <Form.Label column="sm">Confirm Password</Form.Label>
              <ValidatedControl
                name="password_confirmation"
                validationName="passwordConfirmation"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="password"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
              </ValidatedControl>
            </Form.Group>

            <ActionButton
              onClick={handleSubmit}
              variant="primary"
              label="Submit"
              route={CHANGE_PASSWORD_API_ROUTE}
            />
          </Form>
        </Card.Body>
      </Card>
    </>
  )
}

export default ChangePassword
