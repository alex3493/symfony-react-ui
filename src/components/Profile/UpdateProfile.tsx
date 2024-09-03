import { Card, Form } from 'react-bootstrap'
import React, { useState } from 'react'
import { useSession } from '@/hooks'
import { api } from '@/services'
import { PROFILE_UPDATE_API_ROUTE } from '@/utils'
import ValidatedControl from '@/components/ValidatedControl'
import ActionButton from '@/components/ActionButton'

type ProfileUpdateForm = {
  email: string
  first_name: string
  last_name: string
}

function UpdateProfile() {
  const { user, updateUser } = useSession()

  const [values, setValues] = useState<ProfileUpdateForm>({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || ''
  })

  function handleChange(value: string, name: string) {
    setValues({
      ...values,
      [name]: value
    })
  }

  async function handleSubmit() {
    try {
      const { data } = await api.patch(PROFILE_UPDATE_API_ROUTE, values)
      updateUser(data.user)
    } catch (error) {
      /**
       * an error handler can be added here
       */
    }
  }

  return (
    <>
      <Card className="mt-3 mb-3">
        <Card.Header>Update Profile</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                id="email"
                value={user?.email}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="first_name">
              <Form.Label>First Name</Form.Label>
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
              <Form.Label>Last name</Form.Label>
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

            <ActionButton
              onClick={handleSubmit}
              variant="primary"
              label="Submit"
              route={PROFILE_UPDATE_API_ROUTE}
            />
          </Form>
        </Card.Body>
      </Card>
    </>
  )
}

export default UpdateProfile
