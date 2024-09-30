import { useEffect, useState } from 'react'
import { api } from '@/services'
import Table from 'react-bootstrap/Table'
import SortableHeader from './SortableHeader'
import { Loader } from '@/components'
import ModelBase from '@/models/ModelBase'
import SearchBox from '@/components/ServerTable/SearchBox'
import TableFooter from '@/components/ServerTable/TableFooter'

export type ColumnConfig = {
  key: string
  label: string
  sortable: boolean
  sortKey?: string
}

interface TableConfig<T> {
  mapper: (data: T) => T
  columns: ColumnConfig[]
  dataUrl: string
  defaultSortBy: string
  defaultSortDesc: boolean
}

type Pagination = {
  page: number
  limit: number
  orderBy: string
  orderDesc: number
  query: string
}

type PaginationTotals = {
  totalItems: number
  totalPages: number
}

function ServerTable<T extends ModelBase>(config: TableConfig<T>) {
  const { mapper, columns, dataUrl, defaultSortBy, defaultSortDesc } = config

  const [dataLoaded, setDataLoaded] = useState(false)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 2,
    orderBy: defaultSortBy,
    orderDesc: defaultSortDesc ? 1 : 0,
    query: ''
  })
  const [paginationTotals, setPaginationTotals] = useState<PaginationTotals>({
    totalItems: 0,
    totalPages: 1
  })

  useEffect(() => {
    async function loadItems() {
      setDataLoaded(false)

      const response = await api.get(dataUrl, {
        params: pagination
      })
      console.log('Load users API response', response)
      const items = (response?.data?.items || []).map((data: T) => {
        return mapper(data)
      })
      const totalItems = response.data.totalItems
      const totalPages = response.data.totalPages
      console.log('Loaded users', items, totalItems, totalPages)

      setItems(items)
      setPaginationTotals({ totalItems, totalPages })
      setDataLoaded(true)
    }

    loadItems().catch((error) => {
      console.log('Error loading users', error)
      setDataLoaded(true)
    })

    return () => {
      setDataLoaded(false)
      setItems([])
    }
  }, [dataUrl, mapper, pagination])

  const isOrderedBy = (sortKey: string) => pagination.orderBy === sortKey
  const isOrderDesc = () => pagination.orderDesc === 1

  const onColumnHeaderClick = (sortKey: string) => {
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
          </tr>
        </thead>
        <tbody>
          {items?.length > 0 ? (
            items.map((item: T) => (
              <tr key={item.id}>
                {columns.map((column: ColumnConfig) => (
                  <td key={column.key}>
                    {item[column.key as keyof typeof item] as string}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={config.columns.length}>
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
      />
    </div>
  )
}

export default ServerTable
