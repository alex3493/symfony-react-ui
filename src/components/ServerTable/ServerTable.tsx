import { ReactNode, useCallback, useEffect, useReducer, useState } from 'react'
import { api } from '@/services'
import Table from 'react-bootstrap/Table'
import SortableHeader from './SortableHeader'
import { CanAccess, Loader } from '@/components'
import ModelBase from '@/models/ModelBase'
import SearchBox from '@/components/ServerTable/SearchBox'
import TableFooter from '@/components/ServerTable/TableFooter'
import { useBusyIndicator, useMercureUpdates, useSession } from '@/hooks'
import { AxiosError } from 'axios'
import UpdateAlert from '@/components/ServerTable/UpdateAlert'
import { notify } from '@/utils'

export type ColumnConfig<T> = {
  key: string
  label: string
  sortable: boolean
  sortKey?: string
  render?: (value: unknown, item?: T) => string | ReactNode
}

export interface RowAction<T> {
  key: string
  label: string
  icon?: string | undefined
  permissions?: string[]
  route?: string | string[]
  callback: (item: T) => void
}

interface TableConfig<T> {
  mapper: (data: T) => T
  columns: ColumnConfig<T>[]
  dataUrl: string
  defaultSortBy: string
  defaultSortDesc: boolean
  rowActions: RowAction<T>[]
  version: string
  withDeleted?: boolean
  mercureTopic?: string
  refreshTableCallback?: () => void
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

type State<T> = {
  items: T[]
  notification?: string | undefined
  actionControl?: boolean | undefined
  highlightedRows: HighlightedRow[]
}

type StateUpdateAction<T> =
  | { type: 'init'; payload: T[] }
  | { type: 'create'; payload: T; actionControl?: boolean }
  | {
      type: 'update'
      payload: T
      actionControl?: boolean
    }
  | { type: 'soft_delete'; payload: T; actionControl?: boolean }
  | { type: 'restore'; payload: T; actionControl?: boolean }
  | { type: 'force_delete'; payload: T; actionControl?: boolean }
  | { type: 'clear_notification' }

type HighlightedRow = {
  itemId: string | number
  highlightType: 'added' | 'updated' | 'deleted' | 'removed'
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
    withDeleted,
    mercureTopic,
    refreshTableCallback
  } = config

  const [dataLoaded, setDataLoaded] = useState(false)

  const setHighlightedRow = useCallback(
    (
      highlightedRows: HighlightedRow[],
      newHighlightedItem: {
        item: T
        highlightType: 'added' | 'updated' | 'deleted' | 'removed'
      }
    ) => {
      const existingIndex = highlightedRows.findIndex(
        (i) => i.itemId === newHighlightedItem.item.id
      )
      if (existingIndex >= 0) {
        highlightedRows.splice(existingIndex, 1, {
          itemId: newHighlightedItem.item.id,
          highlightType: newHighlightedItem.highlightType
        })
      } else {
        highlightedRows.push({
          itemId: newHighlightedItem.item.id,
          highlightType: newHighlightedItem.highlightType
        })
      }

      return highlightedRows
    },
    []
  )

  const stateReducer = (
    state: State<T>,
    action: StateUpdateAction<T>
  ): State<T> => {
    const notification = (
      action: 'create' | 'update' | 'soft_delete' | 'restore' | 'force_delete',
      item: T
    ) => {
      switch (action) {
        case 'create':
          return 'Item created: ' + item.displayName()
        case 'update':
          return 'Item updated: ' + item.displayName()
        case 'soft_delete':
          return 'Item deleted: ' + item.displayName()
        case 'restore':
          return 'Item restored: ' + item.displayName()
        case 'force_delete':
          return 'Item removed: ' + item.displayName()
      }
    }

    let index
    switch (action.type) {
      case 'init':
        return { ...state, items: action.payload }
      case 'create':
        console.log('***** Item created!', mapper(action.payload))
        return {
          ...state,
          notification: notification(action.type, action.payload),
          actionControl: action.actionControl,
          highlightedRows: setHighlightedRow([...state.highlightedRows], {
            item: action.payload,
            highlightType: 'added'
          })
        }
      case 'update':
      case 'soft_delete':
      case 'restore':
        // console.log('***** Item updated!', mapper(action.payload))
        index = state.items.findIndex((i: T) => i.id === action.payload.id)
        if (index >= 0) {
          const updated = [...state.items]
          updated.splice(index, 1, mapper(action.payload))
          return {
            ...state,
            items: updated,
            notification: notification(action.type, action.payload),
            actionControl: action.actionControl,
            highlightedRows: setHighlightedRow([...state.highlightedRows], {
              item: action.payload,
              highlightType:
                action.type === 'soft_delete' ? 'deleted' : 'updated'
            })
          }
        }
        break
      case 'force_delete':
        console.log('***** Item deleted!', mapper(action.payload))
        return {
          ...state,
          notification: notification(action.type, action.payload),
          actionControl: action.actionControl,
          highlightedRows: setHighlightedRow([...state.highlightedRows], {
            item: action.payload,
            highlightType: 'removed'
          })
        }
      case 'clear_notification':
        console.log('***** Clear notification')
        return { ...state, notification: undefined, highlightedRows: [] }
      default:
        console.log('ERROR :: Unknown action in list update message!')
        return state
    }

    return state
  }

  const [state, dispatch] = useReducer(stateReducer, {
    items: [],
    notification: undefined,
    highlightedRows: []
  })

  const getRowHighlightStyle = useCallback(
    (index: number): object => {
      const item = state.items[index]

      const highlight = state.highlightedRows?.find((r) => r.itemId === item.id)
      if (highlight) {
        if (highlight.highlightType === 'added') {
          return { border: '3px solid green' }
        }
        if (highlight.highlightType === 'updated') {
          return { border: '3px solid blue' }
        }
        if (highlight.highlightType === 'deleted') {
          return { opacity: 0.5 }
        }
        if (highlight.highlightType === 'removed') {
          return { opacity: 0.5, border: '3px solid red' }
        }
      }
      if ('deleted_at' in item && item.deleted_at) {
        return { opacity: 0.5 }
      }
      return {}
    },
    [state.highlightedRows, state.items]
  )

  const isRowRemoved = useCallback(
    (index: number): boolean => {
      const item = state.items[index]
      const highlight = state.highlightedRows?.find((r) => r.itemId === item.id)
      return !!highlight && highlight?.highlightType === 'removed'
    },
    [state.highlightedRows, state.items]
  )

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
  const { user, mercureHubUrl } = useSession()

  const { discoverMercureHub, addEventHandler, removeEventHandler } =
    useMercureUpdates()

  // Check activity for given endpoint and show spinner.
  const { isEndpointBusy } = useBusyIndicator()
  const actionDisabled = (route?: string | string[], itemId?: string) => {
    if (route) {
      if (!Array.isArray(route)) {
        route = [route]
      }

      route = route.map((r) => {
        if (itemId) {
          return r.replace(/{.*?}/, itemId)
        }
        return route
      }) as string[]
      return isEndpointBusy(route)
    }
    return false
  }

  useEffect(() => {
    async function loadItems() {
      setDataLoaded(false)

      const response = await api.get(dataUrl, {
        params: pagination
      })
      if (!response?.data?.items.length && pagination.page > 1) {
        console.log(
          'Now rows found and we are not on the first page - get previous page results'
        )
        // When we update pagination we automatically repeat list request.
        setPagination({ ...pagination, page: pagination.page - 1 })
      }
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

      dispatch({ type: 'init', payload: responseItems })
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

  const subscriptionCallback = useCallback(
    (event: MessageEvent) => {
      console.log(
        '***** UserList :: Mercure message received',
        JSON.parse(event.data)
      )
      const eventData = JSON.parse(event.data)
      eventData.item = mapper(eventData.item)

      switch (eventData.action) {
        case 'create':
          dispatch({
            type: 'create',
            payload: eventData.item,
            actionControl: eventData.causer !== user?.email
          })
          notify('Item created', eventData.item.displayName())
          if (eventData.causer === user?.email) {
            if (refreshTableCallback) {
              refreshTableCallback()
            }
          }
          break
        case 'update':
          dispatch({
            type: 'update',
            payload: eventData.item,
            actionControl: false
          })
          break
        case 'soft_delete':
          dispatch({
            type: 'soft_delete',
            payload: eventData.item,
            actionControl: false
          })
          break
        case 'restore':
          dispatch({
            type: 'restore',
            payload: eventData.item,
            actionControl: false
          })
          break
        case 'force_delete':
          dispatch({
            type: 'force_delete',
            payload: eventData.item,
            actionControl: eventData.causer !== user?.email
          })
          notify('Item deleted', eventData.item.displayName())
          if (eventData.causer === user?.email) {
            if (refreshTableCallback) {
              refreshTableCallback()
            }
          }
          break
        default:
          console.log('ERROR :: Unknown action in list update message!')
      }
    },
    [mapper, refreshTableCallback, user?.email]
  )

  useEffect(() => {
    async function subscribe(mercureTopic: string) {
      try {
        console.log('***** Server table subscribing', mercureTopic)
        await discoverMercureHub(mercureHubUrl)
        await addEventHandler(mercureTopic, subscriptionCallback)
      } catch (error) {
        return error as AxiosError
      }
    }

    if (mercureTopic) {
      subscribe(mercureTopic).catch((error) => {
        console.log('Error subscribing to list updates', error)
      })
    }

    return () => {
      if (mercureTopic) {
        removeEventHandler(mercureTopic, subscriptionCallback)
      }
    }
  }, [
    addEventHandler,
    discoverMercureHub,
    mercureHubUrl,
    mercureTopic,
    removeEventHandler,
    subscriptionCallback
  ])

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

  const actionControl = (action: RowAction<T>, item: T) => {
    const disabled =
      // Disable all actions while table data is loading.
      !dataLoaded || actionDisabled(action.route, item.id.toString())
    if (action.icon) {
      if (disabled) {
        return <i className={'bi ' + action.icon} />
      } else {
        return (
          <i
            className={'bi ' + action.icon}
            style={{
              cursor: 'pointer'
            }}
            onClick={() => action.callback(item)}
          />
        )
      }
    } else {
      if (disabled) {
        return <span style={{ marginRight: 5 }}>{action.label}</span>
      } else {
        return (
          <a
            style={{ marginRight: 5 }}
            href="#"
            onClick={() =>
              actionDisabled(action.route, item.id.toString())
                ? {}
                : action.callback(item)
            }
          >
            {action.label}
          </a>
        )
      }
    }
  }

  return (
    <div>
      <SearchBox onInput={onSearchQueryChange} />
      <UpdateAlert
        show={state.notification !== undefined}
        dismissible={true}
        notification={state.notification || ''}
        action={refreshTableCallback}
        actionControl={state.actionControl}
        timeOut={10}
        actionOnClose={() => dispatch({ type: 'clear_notification' })}
      />
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
          {state.items?.length > 0 ? (
            state.items.map((item: T, index: number) => (
              <tr key={item.id} style={getRowHighlightStyle(index)}>
                {columns.map((column: ColumnConfig<T>) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(
                          item[column.key as keyof typeof item],
                          item
                        )
                      : renderFallback(item[column.key as keyof typeof item])}
                  </td>
                ))}
                <td>
                  {!isRowRemoved(index) &&
                    rowActions.map((action: RowAction<T>) => (
                      <CanAccess
                        key={action.key}
                        entity={item}
                        roles={user?.roles}
                        permissions={action.permissions}
                      >
                        {actionControl(action, item)}{' '}
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
