import {
  USER_CREATE_API_ROUTE,
  USER_LIST_API_ROUTE,
  USER_UPDATE_API_ROUTE
} from '@/utils'
import UserModel from '@/models/UserModel'
import { ColumnConfig, ServerTable } from '@/components/ServerTable'
import { useCallback, useRef, useState } from 'react'
import { RowAction } from '@/components/ServerTable/ServerTable'
import { Button, Modal } from 'react-bootstrap'
import { EditUser } from '@/pages/EditUser'
import { UserFromDataHandler } from '@/pages/EditUser/EditUser'
import { useApiValidation } from '@/hooks'
import ActionButton from '@/components/ActionButton'
import { api } from '@/services'

function UserList() {
  // TODO: just testing render performance.
  console.log('User list rendered')

  const columns: ColumnConfig[] = [
    {
      key: 'display_name',
      label: 'Name',
      sortable: true,
      sortKey: 'name'
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
      permissions: ['user.update'],
      callback: function (item: UserModel): void {
        console.log('Edit action callback', item)
        openUserEditModal(item)
      }
    },
    {
      key: 'user.delete',
      label: 'Delete',
      permissions: ['user.delete'],
      callback: function (item: UserModel): void {
        console.log('Delete action callback', item)
      }
    }
  ]

  const mapper = useCallback((data: UserModel) => {
    return new UserModel(data)
  }, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<UserModel | undefined>(undefined)

  const { removeErrors } = useApiValidation()

  const openUserEditModal = (item?: UserModel) => {
    setUserToEdit(item)
    removeErrors('User')
    setModalOpen(true)
  }

  const closeUserEditModal = () => {
    setModalOpen(false)
    removeErrors('User')
    setUserToEdit(undefined)
  }

  const ref = useRef<UserFromDataHandler>(null)

  const randomVersion = () => (Math.random() + 1).toString(36).substring(7)
  const [dataVersion, setDataVersion] = useState<string>(randomVersion())

  const userSaveRoute = userToEdit
    ? USER_UPDATE_API_ROUTE.replace('{userId}', userToEdit.id.toString())
    : USER_CREATE_API_ROUTE
  console.log('Setting user save route', userSaveRoute)

  const userSaveSubmit = async () => {
    const data = ref.current?.getFormData()

    if (data) {
      if (userToEdit) {
        console.log('Update user request', data, userToEdit.id)

        try {
          await api.patch(userSaveRoute, data)
          closeUserEditModal()

          setDataVersion(randomVersion())
        } catch (error) {
          /**
           * an error handler can be added here
           */
        }
      } else {
        try {
          await api.post(USER_CREATE_API_ROUTE, data)
          closeUserEditModal()

          setDataVersion(randomVersion())
        } catch (error) {
          /**
           * an error handler can be added here
           */
        }
      }
    }
  }

  return (
    <div>
      <h1>User List</h1>
      <Button onClick={() => openUserEditModal()} className={'mb-2'}>
        Create
      </Button>
      <ServerTable<UserModel>
        columns={columns}
        dataUrl={USER_LIST_API_ROUTE}
        defaultSortBy={'name'}
        defaultSortDesc={false}
        mapper={mapper}
        rowActions={rowActions}
        version={dataVersion}
      />
      <Modal show={modalOpen} onHide={closeUserEditModal}>
        <Modal.Header closeButton>Edit User</Modal.Header>
        <Modal.Body>
          <EditUser ref={ref} user={userToEdit} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeUserEditModal}>
            Cancel
          </Button>
          <ActionButton
            label="Save"
            onClick={() => userSaveSubmit()}
            route={userSaveRoute}
            variant="primary"
          />
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UserList
