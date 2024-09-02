import { Button, Card, Form, Spinner } from 'react-bootstrap'
import React, { useEffect, useState } from 'react'
import { api } from '@/services'
import { FORGOT_PASSWORD_API_ROUTE } from '@/utils'
import ValidatedControl from '@/components/ValidatedControl'
import { Link, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import { useApiValidation, useRoutePaths } from '@/hooks'
import { paths } from '@/router'

type ForgotPasswordForm = {
  email: string
}

function ForgotPassword() {
  const { removeErrors } = useApiValidation()

  useEffect(() => {
    removeErrors('User')
  }, [removeErrors])

  const [forgotPasswordRequestStatus, setForgotPasswordRequestStatus] =
    useState('success')

  const { LOGIN_PATH } = useRoutePaths()
  const navigate = useNavigate()

  const [values, setValues] = useState<ForgotPasswordForm>({
    email: ''
  })

  function handleChange(value: string, name: string) {
    setValues({
      ...values,
      [name]: value
    })
  }

  async function handleSubmit() {
    setForgotPasswordRequestStatus('loading')

    try {
      await api.post(FORGOT_PASSWORD_API_ROUTE, values)
      navigate(paths.LOGIN_PATH)
    } catch (error) {
      /**
       * an error handler can be added here
       */
    } finally {
      setForgotPasswordRequestStatus('success')
    }
  }

  return (
    <>
      <Container className="p-3 my-5 d-flex flex-column w-50">
        <Card>
          <Card.Header>Forgot password</Card.Header>
          <Card.Body>
            <Card.Text>
              If your email is registered in our system you will receive
              password reset link.
            </Card.Text>
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

              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={forgotPasswordRequestStatus === 'loading'}
              >
                {forgotPasswordRequestStatus === 'loading' && (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                )}{' '}
                Submit
              </Button>
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

export default ForgotPassword
