import { useEffect, useState } from 'react'
import { api } from '@/services'
import { USER_LIST_API_ROUTE } from '@/utils'
import UserModel from '@/models/UserModel'
import Table from 'react-bootstrap/Table'
import { Loader } from '@/components'

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

      try {
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
      } catch (error) {
        console.log('Error loading users', error)
      }
    }

    loadUsers().catch((e) => console.log(e))

    return () => {
      setDataLoaded(false)
    }
  }, [pagination])
  return (
    <div>
      <h1>User List</h1>
      {!dataLoaded ? (
        <>Loading</>
      ) : (
        <Table striped>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
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
                <td colSpan={2}>
                  {dataLoaded ? 'No users found' : <Loader />}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  )
}

export default UserList
