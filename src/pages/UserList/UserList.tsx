import { USER_LIST_API_ROUTE } from '@/utils'
import UserModel from '@/models/UserModel'
import { ColumnConfig, ServerTable } from '@/components/ServerTable'

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

  return (
    <div>
      <h1>User List</h1>
      <ServerTable<UserModel>
        columns={columns}
        dataUrl={USER_LIST_API_ROUTE}
        defaultSortBy={'name'}
        defaultSortDesc={false}
        mapper={(data: UserModel) => new UserModel(data)}
      />

      {/*<Table striped>*/}
      {/*  <thead>*/}
      {/*    <tr>*/}
      {/*      <SortableHeader*/}
      {/*        isOrderDesc={isOrderDesc}*/}
      {/*        isOrderedBy={isOrderedBy}*/}
      {/*        onClick={onColumnHeaderClick}*/}
      {/*        label="Name"*/}
      {/*        column="name"*/}
      {/*      />*/}
      {/*      <SortableHeader*/}
      {/*        isOrderDesc={isOrderDesc}*/}
      {/*        isOrderedBy={isOrderedBy}*/}
      {/*        onClick={onColumnHeaderClick}*/}
      {/*        label="Email"*/}
      {/*        column="email"*/}
      {/*      />*/}
      {/*    </tr>*/}
      {/*  </thead>*/}
      {/*  <tbody>*/}
      {/*    {items?.length > 0 ? (*/}
      {/*      items.map((user: UserModel) => (*/}
      {/*        <tr key={user.id}>*/}
      {/*          <td>{user.display_name}</td>*/}
      {/*          <td>{user.email}</td>*/}
      {/*        </tr>*/}
      {/*      ))*/}
      {/*    ) : (*/}
      {/*      <tr>*/}
      {/*        <td colSpan={2}>{dataLoaded ? 'No users found' : <Loader />}</td>*/}
      {/*      </tr>*/}
      {/*    )}*/}
      {/*  </tbody>*/}
      {/*</Table>*/}
    </div>
  )
}

export default UserList
