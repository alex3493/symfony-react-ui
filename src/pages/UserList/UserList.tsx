import { USER_LIST_API_ROUTE, USER_UPDATE_API_ROUTE } from '@/utils'
import UserModel from '@/models/UserModel'
import { ColumnConfig, ServerTable } from '@/components/ServerTable'

import { useCallback, useState } from 'react'
import { RowAction } from '@/components/ServerTable/ServerTable'
import { Modal } from 'react-bootstrap'
import { EditUser } from '@/pages/EditUser'
import { UserUpdateForm } from '@/pages/EditUser/EditUser'
import { api } from '@/services'
import { useApiValidation } from '@/hooks'

function UserList() {
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

  const openUserEditModal = (item: UserModel) => {
    setUserToEdit(item)
    removeErrors('User')
    setModalOpen(true)
  }

  const closeUserEditModal = () => {
    setModalOpen(false)
    removeErrors('User')
    setUserToEdit(undefined)
  }

  const userUpdateSubmit = async (form: UserUpdateForm) => {
    console.log('Updated user form', form)

    const userUpdateRoute = () =>
      USER_UPDATE_API_ROUTE.replace(
        '{userId}',
        userToEdit ? userToEdit.id.toString() : ''
      )

    try {
      await api.patch(userUpdateRoute(), form)
      closeUserEditModal()
    } catch (error) {
      /**
       * an error handler can be added here
       */
    }
  }

  // const testUpdateSubmit = async () => {
  //   // TODO: Is there a way to read EditUser state here?
  //   console.log('testUpdateSubmit')
  // }

  return (
    <div>
      <h1>User List</h1>
      <ServerTable<UserModel>
        columns={columns}
        dataUrl={USER_LIST_API_ROUTE}
        defaultSortBy={'name'}
        defaultSortDesc={false}
        mapper={mapper}
        rowActions={rowActions}
      />
      <Modal show={modalOpen} onHide={closeUserEditModal}>
        <Modal.Header closeButton>Edit User</Modal.Header>
        <Modal.Body>
          <EditUser
            user={userToEdit}
            submitCallback={userUpdateSubmit}
            cancelCallback={closeUserEditModal}
          />
        </Modal.Body>
        {/*<Modal.Footer>
          <Button variant="secondary" onClick={closeUserEditModal}>
            Close
          </Button>
          <Button variant="primary" onClick={() => testUpdateSubmit()}>
            Save
          </Button>
        </Modal.Footer>*/}
      </Modal>
    </div>
  )
}

export default UserList
