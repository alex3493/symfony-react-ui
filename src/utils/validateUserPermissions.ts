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
    const userPermissions = ['user.list']

    // Admins can create users.
    if (user?.roles.includes('ROLE_ADMIN')) {
      userPermissions.push('user.create')
    }

    if (entity instanceof UserModel) {
      // Admins can edit active users.
      if (user?.roles.includes('ROLE_ADMIN') && !entity.deleted_at) {
        userPermissions.push('user.update')
      }
      // Admins can delete and restore users, except self.
      if (user?.roles.includes('ROLE_ADMIN') && user?.id !== entity.id) {
        userPermissions.push('user.delete')
        if (entity.deleted_at) {
          userPermissions.push('user.restore')
        } else {
          userPermissions.push('user.soft_delete')
        }
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
