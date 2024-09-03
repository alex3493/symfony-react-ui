import UserModel from '@/models/UserModel'
import ModelBase from '@/models/ModelBase'

type Params = {
  user?: UserModel
  permissions?: string[]
  roles?: string[]
  entity?: ModelBase
}

export function validateUserPermissions(params: Params) {
  const { user, permissions, roles, entity } = params

  let hasAllPermissions = true
  let hasAllRoles = true

  if (permissions?.length) {
    const userPermissions = user?.roles.includes('ROLE_ADMIN')
      ? ['user.list', 'user.update', 'user.delete']
      : ['user.list']

    if (entity instanceof UserModel) {
      if (user?.roles.includes('ROLE_ADMIN') || user?.id === entity.id) {
        userPermissions.push('greeting.update')
        userPermissions.push('greeting.delete')
      }
    }

    hasAllPermissions = permissions.every((permission) => {
      return userPermissions.includes(permission)
    })
  }

  if (roles?.length) {
    const userRoles = user?.roles || []

    hasAllRoles = roles.every((role) => {
      return userRoles.includes(role)
    })
  }

  return { hasAllPermissions, hasAllRoles }
}
