import { useEffect, useState } from 'react'
import { api } from '@/services'
import Table from 'react-bootstrap/Table'
import SortableHeader from './SortableHeader'
import { CanAccess, Loader } from '@/components'
import ModelBase from '@/models/ModelBase'
import SearchBox from '@/components/ServerTable/SearchBox'
import TableFooter from '@/components/ServerTable/TableFooter'
import { useSession } from '@/hooks'

export type ColumnConfig = {
  key: string
  label: string
  sortable: boolean
  sortKey?: string
  render?: (value: unknown) => string
}

export interface RowAction<T> {
  key: string
  label: string
  icon?: string | undefined
  permissions?: string[]
  callback: (item: T) => void
}

interface TableConfig<T> {
  mapper: (data: T) => T
  columns: ColumnConfig[]
  dataUrl: string
  defaultSortBy: string
  defaultSortDesc: boolean
  rowActions: RowAction<T>[]
  version: string
  withDeleted?: boolean
}

type Pagination = {
  page: number
  limit: number
  orderBy: string
  orderDesc: number
  withDeleted: 0 | 1
  query: string
}

type PaginationTotals = {
  totalItems: number
  totalPages: number
}

function ServerTable<T extends ModelBase>(config: TableConfig<T>) {
  const {
    mapper,
    columns,
    dataUrl,
    defaultSortBy,
    defaultSortDesc,
    rowActions,
    version,
    withDeleted
  } = config

  const [dataLoaded, setDataLoaded] = useState(false)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    orderBy: defaultSortBy,
    orderDesc: defaultSortDesc ? 1 : 0,
    withDeleted: withDeleted ? 1 : 0,
    query: ''
  })
  const [paginationTotals, setPaginationTotals] = useState<PaginationTotals>({
    totalItems: 0,
    totalPages: 1
  })
  const { user } = useSession()

  useEffect(() => {
    async function loadItems() {
      setDataLoaded(false)

      const response = await api.get(dataUrl, {
        params: pagination
      })
      console.log('Load items API response', response)
      const responseItems = (response?.data?.items || []).map((data: T) => {
        return mapper(data)
      })
      const totalItems = response.data.totalItems
      const totalPages = response.data.totalPages
      console.log(
        'Loaded items',
        responseItems,
        'Total items',
        totalItems,
        'Total pages',
        totalPages
      )

      setItems(responseItems)
      setPaginationTotals({ totalItems, totalPages })
      setDataLoaded(true)
    }

    loadItems().catch((error) => {
      console.log('Error loading users', error)
      setDataLoaded(true)
    })

    return () => {
      setDataLoaded(false)
    }
  }, [dataUrl, mapper, pagination, version])

  const isOrderedBy = (sortKey: string) => pagination.orderBy === sortKey
  const isOrderDesc = () => pagination.orderDesc === 1

  const onColumnHeaderClick = (sortKey: string) => {
    console.log(
      'Sort order changes',
      sortKey,
      isOrderedBy(sortKey) ? (isOrderDesc() ? 'asc' : 'desc') : 'new order'
    )

    if (isOrderedBy(sortKey)) {
      // Toggle sort direction.
      setPagination({ ...pagination, orderDesc: pagination.orderDesc ? 0 : 1 })
    } else {
      // Select as order by.
      setPagination({ ...pagination, orderBy: sortKey })
    }
  }

  const onSearchQueryChange = (query: string) => {
    console.log('Query string changed', query)

    setPagination({ ...pagination, query })
  }

  const onPageChange = (page: number) => {
    console.log('Page changed', page)

    setPagination({ ...pagination, page })
  }

  const renderFallback = (value: unknown): string => {
    if (value instanceof Date) {
      return value.toLocaleString()
    }
    if (value instanceof Object) {
      return ''
    }
    return value as string
  }

  return (
    <div>
      <SearchBox onInput={onSearchQueryChange} />
      <Table striped>
        <thead>
          <tr>
            {columns.map((column) =>
              column.sortable ? (
                <SortableHeader
                  key={column.sortKey || column.key}
                  isOrderDesc={isOrderDesc}
                  isOrderedBy={isOrderedBy}
                  onClick={onColumnHeaderClick}
                  label={column.label}
                  sortKey={column.sortKey || column.key}
                />
              ) : (
                <th key={column.key}>{column.label}</th>
              )
            )}
            <th key="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items?.length > 0 ? (
            items.map((item: T) => (
              <tr key={item.id}>
                {columns.map((column: ColumnConfig) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(item[column.key as keyof typeof item])
                      : renderFallback(item[column.key as keyof typeof item])}
                  </td>
                ))}
                <td>
                  {rowActions.map((action: RowAction<T>) => (
                    <CanAccess
                      key={action.key}
                      entity={item}
                      roles={user?.roles}
                      permissions={action.permissions}
                    >
                      {action.icon ? (
                        <i
                          className={'bi ' + action.icon}
                          style={{ cursor: 'pointer' }}
                          onClick={() => action.callback(item)}
                        />
                      ) : (
                        <a
                          style={{ marginRight: 5 }}
                          href="#"
                          onClick={() => action.callback(item)}
                        >
                          {action.label}
                        </a>
                      )}{' '}
                    </CanAccess>
                  ))}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={config.columns.length + 1}>
                {dataLoaded ? 'No items' : <Loader />}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <TableFooter
        currentPage={pagination.page}
        totalPages={paginationTotals.totalPages}
        perPage={pagination.limit}
        totalItems={paginationTotals.totalItems}
        onPageClick={onPageChange}
        dataLoaded={dataLoaded}
      />
    </div>
  )
}

export default ServerTable
