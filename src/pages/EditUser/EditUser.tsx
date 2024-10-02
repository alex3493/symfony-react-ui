import UserModel from '@/models/UserModel'
import { Form } from 'react-bootstrap'
import ValidatedControl from '@/components/ValidatedControl'
import { forwardRef, useImperativeHandle, useState } from 'react'

// TODO: Add support for user create action.

type Props = {
  user: UserModel | undefined
}

export type UserUpdateForm = {
  email: string
  password?: string
  first_name: string
  last_name: string
}

export interface UserFromDataHandler {
  getFormData: () => UserUpdateForm
}

const EditUser = forwardRef(function EditUser(props: Props, ref) {
  const { user } = props

  const [values, setValues] = useState<UserUpdateForm>({
    email: user?.email || '',
    password: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || ''
  })

  useImperativeHandle(ref, () => {
    return {
      getFormData() {
        return values
      }
    }
  }, [values])

  function handleChange(value: string, name: string) {
    setValues({
      ...values,
      [name]: value
    })
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
      </Form>
    </div>
  )
})

export default EditUser
