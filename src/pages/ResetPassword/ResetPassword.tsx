import { Card, Form } from 'react-bootstrap'
import React, { useEffect, useState } from 'react'
import { api } from '@/services'
import { RESET_PASSWORD_API_ROUTE } from '@/utils'
import ValidatedControl from '@/components/ValidatedControl'
import ActionButton from '@/components/ActionButton'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import { useApiValidation, useRoutePaths } from '@/hooks'
import { paths } from '@/router'

type ResetPasswordForm = {
  email: string
  password: string
  password_confirmation: string
}

function ResetPassword() {
  const { removeErrors } = useApiValidation()

  useEffect(() => {
    removeErrors('User')
  }, [removeErrors])

  const [searchParams] = useSearchParams()
  const { LOGIN_PATH } = useRoutePaths()
  const navigate = useNavigate()

  const [values, setValues] = useState<ResetPasswordForm>({
    email: '',
    password: '',
    password_confirmation: ''
  })

  function handleChange(value: string, name: string) {
    setValues({
      ...values,
      [name]: value
    })
  }

  async function handleSubmit() {
    try {
      await api.post(RESET_PASSWORD_API_ROUTE, {
        ...values,
        reset_token: searchParams.get('token')
      })
      navigate(paths.LOGIN_PATH)
    } catch (error) {
      /**
       * an error handler can be added here
       */
    }
  }

  return (
    <>
      <Container className="p-3 my-5 d-flex flex-column w-50">
        <Card>
          <Card.Header>Set new password</Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3" controlId="current_password">
                <Form.Label>Email</Form.Label>
                <ValidatedControl
                  name="email"
                  context="User"
                  onInput={(value, name) => handleChange(value, name)}
                >
                  <Form.Control
                    type="text"
                    placeholder="Email"
                    autoComplete="username"
                  />
                </ValidatedControl>
              </Form.Group>

              <Form.Group className="mb-3" controlId="new_password">
                <Form.Label>New Password</Form.Label>
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
                <Form.Label>Confirm Password</Form.Label>
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
                variant="primary"
                label="Set Password"
                onClick={handleSubmit}
                route={RESET_PASSWORD_API_ROUTE}
              />
            </Form>
          </Card.Body>
          <Card.Footer>
            Use your current password? <Link to={LOGIN_PATH}>Sign In</Link>
          </Card.Footer>
        </Card>
      </Container>
    </>
  )
}

export default ResetPassword
