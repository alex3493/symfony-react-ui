import {
  USER_DELETE_API_ROUTE,
  USER_LIST_API_ROUTE,
  USER_RESTORE_API_ROUTE,
  USER_SOFT_DELETE_API_ROUTE
} from '@/utils'
import UserModel from '@/models/UserModel'
import { ColumnConfig, ServerTable } from '@/components/ServerTable'
import { useCallback, useEffect, useState } from 'react'
import { RowAction } from '@/components/ServerTable/ServerTable'
import { Button } from 'react-bootstrap'
import { EditUser } from '@/pages/EditUser'
import { useApiValidation, useMercureUpdates, useSession } from '@/hooks'
import { api } from '@/services'
import { CanAccess } from '@/components'
import { AxiosError } from 'axios'

export type UserToEdit = {
  user: UserModel | undefined
  update?: UserModel | undefined
  action?: 'update' | 'soft_delete' | 'force_delete'
  causer?: string
}

function UserList() {
  // TODO: just testing render performance.
  console.log('User list rendered')

  const columns: ColumnConfig<UserModel>[] = [
    {
      key: 'display_name',
      label: 'Name',
      sortable: true,
      sortKey: 'name',
      render: (value: unknown, item: UserModel | undefined) => {
        const name = item?.display_name
        if (item?.role === 'ROLE_ADMIN') {
          return (
            <>
              <strong>{name}</strong>
              <br />
              <em>Administrator</em>
            </>
          )
        }
        return value as string
      }
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      sortKey: 'createdAt',
      render: (value: unknown) => {
        if (value instanceof Date) {
          return value.toLocaleDateString('es')
        }
        // Should never be the case.
        return value as string
      }
    },
    {
      key: 'updated_at',
      label: 'Updated',
      sortable: true,
      sortKey: 'updatedAt',
      render: (value: unknown) => {
        if (value instanceof Date) {
          return value.toLocaleDateString('es')
        }
        // Should never be the case.
        return value as string
      }
    }
  ]

  const rowActions: RowAction<UserModel>[] = [
    {
      key: 'user.edit',
      label: 'Edit',
      icon: 'bi-pencil',
      permissions: ['user.update'],
      callback: async function (item: UserModel): Promise<void> {
        await openUserEditModal(item)
      }
    },
    {
      key: 'user.delete',
      label: 'Delete',
      icon: 'bi-trash',
      permissions: ['user.delete'],
      callback: function (item: UserModel): void {
        console.log('Delete action callback', item)
        userDelete(item).then(() => console.log('User deleted'))
      },
      route: USER_DELETE_API_ROUTE
    },
    {
      key: 'user.soft-delete',
      label: 'Disable',
      // icon: 'bi-x-circle-fill',
      permissions: ['user.soft_delete'],
      callback: function (item: UserModel): void {
        console.log('Soft-delete action callback', item)
        userSoftDelete(item).then(() => console.log('User deleted'))
      },
      route: [USER_SOFT_DELETE_API_ROUTE, USER_LIST_API_ROUTE]
    },
    {
      key: 'user.restore',
      label: 'Enable',
      // icon: 'bi-check-circle-fill',
      permissions: ['user.restore'],
      callback: function (item: UserModel): void {
        console.log('Restore action callback', item)
        userRestore(item).then(() => console.log('User deleted'))
      },
      route: [USER_RESTORE_API_ROUTE, USER_LIST_API_ROUTE]
    }
  ]

  const mapper = useCallback((data: UserModel) => {
    return new UserModel(data)
  }, [])

  const [modalOpen, setModalOpen] = useState(false)

  const [userToEdit, setUserToEdit] = useState<UserToEdit>({
    user: undefined
  })

  const { removeErrors } = useApiValidation()

  const { user, mercureHubUrl } = useSession()

  const subscriptionCallback = useCallback(
    (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      console.log(
        '***** User list parent :: Mercure message received',
        data,
        userToEdit, // TODO: We have an issue here - userToEdit is undefined!
        data.item,
        data.causer
      )
      if (userToEdit && userToEdit.user?.id === data.item.id) {
        console.log(
          '!!!!! Current open user edit form affected',
          data.item,
          data.action
        )
        setUserToEdit({
          ...userToEdit,
          action: data.action,
          update: data.item,
          causer: data.causer
        })
      }
    },
    [userToEdit]
  )

  const { addEventHandler, removeEventHandler, discoverMercureHub } =
    useMercureUpdates()

  useEffect(() => {
    async function subscribe() {
      try {
        await discoverMercureHub(mercureHubUrl)
        await addEventHandler('users::update', subscriptionCallback)
      } catch (error) {
        return error as AxiosError
      }
    }

    if (userToEdit) {
      subscribe().catch((error) =>
        console.log('Error subscribing to list updates for edit user', error)
      )
    } else {
      removeEventHandler('users::update', subscriptionCallback)
    }

    return () => {
      if (!userToEdit) {
        removeEventHandler('users::update', subscriptionCallback)
      }
    }
  }, [
    addEventHandler,
    discoverMercureHub,
    mercureHubUrl,
    removeEventHandler,
    subscriptionCallback,
    userToEdit
  ])

  const openUserEditModal = async (item?: UserModel) => {
    setUserToEdit({ user: item })
    removeErrors('User')
    setModalOpen(true)
  }

  const closeUserEditModal = () => {
    removeEventHandler('users::update', subscriptionCallback)
    setModalOpen(false)
    removeErrors('User')
    setUserToEdit({ user: undefined })
  }

  const acceptUpdate = () => {
    setUserToEdit({
      ...userToEdit,
      action: undefined,
      update: undefined,
      causer: undefined
    })
  }

  const randomVersion = () => (Math.random() + 1).toString(36).substring(7)
  const [dataVersion, setDataVersion] = useState<string>(randomVersion())

  const userDeleteRoute = (id: string | number) =>
    USER_DELETE_API_ROUTE.replace('{userId}', id.toString())

  const userSoftDeleteRoute = (id: string | number) =>
    USER_SOFT_DELETE_API_ROUTE.replace('{userId}', id.toString())

  const userRestoreRoute = (id: string | number) =>
    USER_RESTORE_API_ROUTE.replace('{userId}', id.toString())

  const refreshTable = () => setDataVersion(randomVersion())

  const userDelete = async (user: UserModel) => {
    try {
      await api.delete(userDeleteRoute(user.id))

      refreshTable()
    } catch (error) {
      /**
       * an error handler can be added here
       */
    }
  }

  const userSoftDelete = async (user: UserModel) => {
    try {
      await api.patch(userSoftDeleteRoute(user.id))

      refreshTable()
    } catch (error) {
      /**
       * an error handler can be added here
       */
    }
  }

  const userRestore = async (user: UserModel) => {
    try {
      await api.patch(userRestoreRoute(user.id))

      refreshTable()
    } catch (error) {
      /**
       * an error handler can be added here
       */
    }
  }

  return (
    <div>
      <h1>User List</h1>
      <CanAccess permissions={['user.create']}>
        <Button onClick={() => openUserEditModal()} className={'mb-2'}>
          Create
        </Button>
      </CanAccess>
      <ServerTable<UserModel>
        columns={columns}
        dataUrl={USER_LIST_API_ROUTE}
        defaultSortBy={'name'}
        defaultSortDesc={false}
        withDeleted={user?.role === 'ROLE_ADMIN'}
        mercureTopic="users::update"
        mapper={mapper}
        rowActions={rowActions}
        version={dataVersion}
        refreshTableCallback={refreshTable}
      />
      <EditUser
        editUser={userToEdit}
        show={modalOpen}
        onAcceptUpdate={acceptUpdate}
        onClose={closeUserEditModal}
      />
    </div>
  )
}

export default UserList
