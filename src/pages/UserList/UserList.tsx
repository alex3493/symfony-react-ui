import { useEffect, useState } from 'react'
import { api } from '@/services'
import { USER_LIST_API_ROUTE } from '@/utils'
import UserModel from '@/models/UserModel'
import Table from 'react-bootstrap/Table'
import { Loader } from '@/components'

type SortableHeaderProps = {
  column: string
  label: string
  isOrderedBy: (column: string) => boolean
  isOrderDesc: () => boolean
  onClick: (column: string) => void
}

function SortableHeader(props: SortableHeaderProps) {
  const { column, label, isOrderedBy, isOrderDesc, onClick } = props
  return (
    <th
      style={{
        cursor: 'pointer'
      }}
      onClick={() => onClick(column)}
    >
      {isOrderedBy(column) &&
        (isOrderDesc() ? (
          <i className="bi bi-sort-down"></i>
        ) : (
          <i className="bi bi-sort-up"></i>
        ))}{' '}
      {label}
    </th>
  )
}

function UserList() {
  type Pagination = {
    page: number
    limit: number
    orderBy: string
    orderDesc: number
    // query: string
  }
  const [dataLoaded, setDataLoaded] = useState(false)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    orderBy: 'name',
    orderDesc: 0
    // query: ''
  })

  useEffect(() => {
    async function loadUsers() {
      setDataLoaded(false)

      const response = await api.get(USER_LIST_API_ROUTE, {
        params: pagination
      })
      console.log('Load users API response', response)
      const items = (response?.data?.items || []).map(
        (g: UserModel) => new UserModel(g)
      )
      console.log('Loaded users', items)
      setItems(items)
      setDataLoaded(true)
    }

    loadUsers().catch((error) => {
      console.log('Error loading users', error)
      setDataLoaded(true)
    })

    return () => {
      setDataLoaded(false)
    }
  }, [pagination])

  const isOrderedBy = (column: string) => pagination.orderBy === column
  const isOrderDesc = () => pagination.orderDesc === 1

  const onColumnHeaderClick = (column: string) => {
    if (isOrderedBy(column)) {
      // Toggle sort direction.
      setPagination({ ...pagination, orderDesc: pagination.orderDesc ? 0 : 1 })
    } else {
      // Select as order by.
      setPagination({ ...pagination, orderBy: column })
    }
  }

  return (
    <div>
      <h1>User List</h1>
      <Table striped>
        <thead>
          <tr>
            <SortableHeader
              isOrderDesc={isOrderDesc}
              isOrderedBy={isOrderedBy}
              onClick={onColumnHeaderClick}
              label="Name"
              column="name"
            />
            <SortableHeader
              isOrderDesc={isOrderDesc}
              isOrderedBy={isOrderedBy}
              onClick={onColumnHeaderClick}
              label="Email"
              column="email"
            />
          </tr>
        </thead>
        <tbody>
          {items?.length > 0 ? (
            items.map((user: UserModel) => (
              <tr key={user.id}>
                <td>{user.display_name}</td>
                <td>{user.email}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>{dataLoaded ? 'No users found' : <Loader />}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  )
}

export default UserList
