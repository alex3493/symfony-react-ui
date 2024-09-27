import { useEffect, useState } from 'react'
import { api } from '@/services'
import Table from 'react-bootstrap/Table'
import SortableHeader from './SortableHeader'
import { Loader } from '@/components'
import ModelBase from '@/models/ModelBase'

export type ColumnConfig = {
  name: string
  label: string
  sortable: boolean
}

interface TableConfig<T> {
  mapper: { new (data: ModelBase): T }
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
  // query: string
}

function ServerTable<ItemType extends ModelBase>(
  config: TableConfig<ItemType>
) {
  const { mapper, columns, dataUrl, defaultSortBy, defaultSortDesc } = config

  const [dataLoaded, setDataLoaded] = useState(false)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    orderBy: defaultSortBy,
    orderDesc: defaultSortDesc ? 1 : 0
    // query: ''
  })

  useEffect(() => {
    async function loadItems() {
      setDataLoaded(false)

      const response = await api.get(dataUrl, {
        params: pagination
      })
      console.log('Load users API response', response)
      const items = (response?.data?.items || []).map((g: ItemType) => {
        return new mapper(g)
      })
      console.log('Loaded users', items)
      setItems(items)
      setDataLoaded(true)
    }

    loadItems().catch((error) => {
      console.log('Error loading users', error)
      setDataLoaded(true)
    })

    return () => {
      setDataLoaded(false)
    }
  }, [dataUrl, pagination])

  const isOrderedBy = (name: string) => pagination.orderBy === name
  const isOrderDesc = () => pagination.orderDesc === 1

  const onColumnHeaderClick = (name: string) => {
    if (isOrderedBy(name)) {
      // Toggle sort direction.
      setPagination({ ...pagination, orderDesc: pagination.orderDesc ? 0 : 1 })
    } else {
      // Select as order by.
      setPagination({ ...pagination, orderBy: name })
    }
  }

  return (
    <Table striped>
      <thead>
        <tr>
          {columns.map((column) =>
            column.sortable ? (
              <SortableHeader
                key={column.name}
                isOrderDesc={isOrderDesc}
                isOrderedBy={isOrderedBy}
                onClick={onColumnHeaderClick}
                label={column.label}
                name={column.name}
              />
            ) : (
              <th key={column.name}>{column.label}</th>
            )
          )}
        </tr>
      </thead>
      <tbody>
        {items?.length > 0 ? (
          items.map((item: T) => (
            <tr key={item.id}>
              {columns.map((column: ColumnConfig) => (
                <td key={column.name}>{(item as any)[column.name]}</td>
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
  )
}

export default ServerTable
