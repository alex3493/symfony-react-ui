import { USER_LIST_API_ROUTE } from '@/utils'
import UserModel from '@/models/UserModel'
import { ColumnConfig, ServerTable } from '@/components/ServerTable'
// import { useCallback } from 'react'

function UserList() {
  const columns: Array<ColumnConfig> = [
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
    }
  ]

  // const mapper = useCallback((data: UserModel) => {
  //   return new UserModel(data)
  // }, [])

  return (
    <div>
      <h1>User List</h1>
      <ServerTable<UserModel>
        columns={columns}
        dataUrl={USER_LIST_API_ROUTE}
        defaultSortBy={'name'}
        defaultSortDesc={false}
        // mapper={mapper}
        mapper={(data: UserModel) => new UserModel(data)}
      />
    </div>
  )
}

export default UserList
