import { useCallback, useEffect, useReducer, useState } from 'react'
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
  route?: string | string[]
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
          actionControl: action.actionControl
        }
      case 'update':
      case 'soft_delete':
      case 'restore':
        console.log('***** Item updated!', mapper(action.payload))
        index = state.items.findIndex((i: T) => i.id === action.payload.id)
        if (index >= 0) {
          const updated = [...state.items]
          updated.splice(index, 1, mapper(action.payload))
          return {
            items: updated,
            notification: notification(action.type, action.payload),
            actionControl: action.actionControl
          }
        }
        break
      case 'force_delete':
        console.log('***** Item deleted!', mapper(action.payload))
        return {
          ...state,
          notification: notification(action.type, action.payload),
          actionControl: action.actionControl
        }
      case 'clear_notification':
        console.log('***** Clear notification')
        return { ...state, notification: undefined }
      default:
        console.log('ERROR :: Unknown action in list update message!')
        return state
    }

    return state
  }

  const [state, dispatch] = useReducer(stateReducer, {
    items: [],
    notification: undefined
  })

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

  const { discoverMercureHub, addSubscription, removeSubscription } =
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
        await discoverMercureHub(mercureHubUrl)
        await addSubscription(mercureTopic, subscriptionCallback)
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
        removeSubscription(mercureTopic)
      }
    }
  }, [
    addSubscription,
    discoverMercureHub,
    mercureHubUrl,
    mercureTopic,
    removeSubscription,
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
    const disabled = actionDisabled(action.route, item.id.toString())
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
            state.items.map((item: T) => (
              <tr
                key={item.id}
                style={
                  'deleted_at' in item && item.deleted_at
                    ? { opacity: 0.5 }
                    : { opacity: 1 }
                }
              >
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
