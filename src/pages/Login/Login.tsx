import React, { useEffect, useState } from 'react'
import {
  useApiValidation,
  useBusyIndicator,
  useRoutePaths,
  useSession
} from '@/hooks'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import { Link } from 'react-router-dom'
import { LOGIN_API_ROUTE } from '@/utils'

function initialFormValues() {
  return {
    email: '',
    password: ''
  }
}

function Login() {
  const [values, setValues] = useState(initialFormValues)
  const { signIn } = useSession()
  const { hasErrors, getErrors, removeErrors } = useApiValidation()
  const { REGISTER_PATH, FORGOT_PASSWORD_PATH } = useRoutePaths()

  const { isEndpointBusy } = useBusyIndicator()

  const disableSubmit = isEndpointBusy(LOGIN_API_ROUTE)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setValues({
      ...values,
      [name]: value
    })

    removeErrors('Global')
  }

  async function handleSubmit() {
    try {
      await signIn(values)
    } catch (error) {
      /**
       * an error handler can be added here
       */
    }
  }

  useEffect(() => {
    removeErrors('Global')
  }, [removeErrors])

  return (
    <Container className="p-3 my-5 d-flex flex-column w-50">
      <Card>
        <Card.Header>Sing In</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                autoComplete="username"
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                onChange={handleChange}
              />
            </Form.Group>
            {hasErrors('Global', undefined) && (
              <Alert variant="danger">{getErrors('Global', undefined)}</Alert>
            )}
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={disableSubmit}
            >
              {disableSubmit && (
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
          <div>
            Do not have an account? <Link to={REGISTER_PATH}>Sign Up</Link>
          </div>
          <div>
            Forgot your password?{' '}
            <Link to={FORGOT_PASSWORD_PATH}>Reset Password</Link>
          </div>
        </Card.Footer>
      </Card>
    </Container>
  )
}

export default Login
