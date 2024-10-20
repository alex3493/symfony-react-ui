import {
  USER_DELETE_API_ROUTE,
  USER_LIST_API_ROUTE,
  USER_RESTORE_API_ROUTE,
  USER_SOFT_DELETE_API_ROUTE
} from '@/utils'
import UserModel from '@/models/UserModel'
import { ColumnConfig, ServerTable } from '@/components/ServerTable'
import { useCallback, useState } from 'react'
import { RowAction } from '@/components/ServerTable/ServerTable'
import { Button } from 'react-bootstrap'
import { EditUser } from '@/pages/EditUser'
import { useApiValidation, useSession } from '@/hooks'
import { api } from '@/services'
import { CanAccess } from '@/components'

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
      callback: function (item: UserModel): void {
        console.log('Edit action callback', item)
        openUserEditModal(item)
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
  const [userToEdit, setUserToEdit] = useState<UserModel | undefined>(undefined)

  const { removeErrors } = useApiValidation()

  const { user } = useSession()

  // const subscriptionCallback = useCallback((event: MessageEvent) => {
  //   console.log(
  //     '***** UserItem :: Mercure message received',
  //     JSON.parse(event.data)
  //   )
  //   // const eventData = JSON.parse(event.data)
  // }, [])

  // const { addSubscription } = useMercureUpdates()
  const openUserEditModal = async (item?: UserModel) => {
    // if (item) {
    //   const itemTopic = 'user::update::' + item.id
    //   await addSubscription(itemTopic, subscriptionCallback)
    // }
    setUserToEdit(item)
    removeErrors('User')
    setModalOpen(true)
  }

  const closeUserEditModal = () => {
    setModalOpen(false)
    removeErrors('User')
    setUserToEdit(undefined)
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
        mercureTopic={'user::update::{userId}'}
        onClose={closeUserEditModal}
      />
    </div>
  )
}

export default UserList
