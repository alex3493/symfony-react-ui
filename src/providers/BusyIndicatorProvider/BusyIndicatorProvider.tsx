import { ReactNode, useEffect, useMemo, useReducer } from 'react'
import { BusyEndpoint, BusyIndicatorContext } from '@/contexts'
import {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import { UniqueInterceptors } from '@/utils'

type Props = {
  children: ReactNode
}

// Do not display activity indicator for given endpoints.
const excludedEndpoints = ['/token/refresh']

function BusyIndicatorProvider(props: Props) {
  const { children } = props

  const [busyEndpoints, dispatch] = useReducer(busyEndpointsReducer, [])

  type BusyEndpointData = {
    url: string
    type: 'sending' | 'receiving'
  }

  type BusyIndicatorUpdateAction = {
    type: 'increment' | 'decrement' | 'reset'
    endpoint: BusyEndpointData
  }

  function busyEndpointsReducer(
    busyEndpoints: BusyEndpoint[],
    action: BusyIndicatorUpdateAction
  ) {
    const updated = [...busyEndpoints]
    let index: number

    const findBusyEndpointIndex = (url: string, type: string) =>
      busyEndpoints.findIndex((e) => e.url === url && e.type === type)

    // console.log('Dispatched action :: busy indicator', action)

    if (excludedEndpoints.includes(action.endpoint.url)) {
      return updated
    }

    switch (action.type) {
      case 'reset':
        return []
      case 'increment':
        index = findBusyEndpointIndex(action.endpoint.url, action.endpoint.type)
        if (index >= 0) {
          updated[index] = {
            ...busyEndpoints[index],
            processingCount: busyEndpoints[index].processingCount + 1
          }
        } else {
          updated.push({ ...action.endpoint, processingCount: 1 })
        }
        // console.log("***** After increment action", updated);
        return updated
      case 'decrement':
        index = findBusyEndpointIndex(action.endpoint.url, action.endpoint.type)
        if (index >= 0) {
          updated[index] = {
            ...busyEndpoints[index],
            processingCount:
              busyEndpoints[index].processingCount > 0
                ? busyEndpoints[index].processingCount - 1
                : 0
          }
          if (updated[index].processingCount === 0) {
            updated.splice(index, 1)
          }
        } else {
          // Should never be the case!
          console.log(
            'ERROR :: Busy endpoint not found',
            action.endpoint.url,
            action.endpoint.type,
            busyEndpoints
          )
        }
        // console.log("***** After decrement action", updated);
        return updated
    }
  }

  const uniqueInterceptors = useMemo(() => {
    return new UniqueInterceptors()
  }, [])

  useEffect(() => {
    const onRequest = (
      config: InternalAxiosRequestConfig<AxiosRequestConfig>
    ): InternalAxiosRequestConfig<AxiosRequestConfig> => {
      if (config.url && config.method) {
        // console.log(
        //   '***** BusyIndicatorProvider :: onRequest',
        //   config.url,
        //   config.method
        // )
        dispatch({
          type: 'increment',
          endpoint: {
            url: config.url,
            type:
              config.method.toUpperCase() === 'GET' ? 'receiving' : 'sending'
          }
        })
      }

      return config
    }

    const onResponse = (response: AxiosResponse): AxiosResponse => {
      if (response.config.url && response.config.method) {
        // console.log(
        //   '***** BusyIndicatorProvider :: onResponse',
        //   response.config.url,
        //   response.config.method
        // )
        dispatch({
          type: 'decrement',
          endpoint: {
            url: response.config.url,
            type:
              response.config.method.toUpperCase() === 'GET'
                ? 'receiving'
                : 'sending'
          }
        })
      }

      return response
    }

    const onRequestError = (error: AxiosError): Promise<AxiosError> => {
      console.log(
        'BusyIndicator onRequestError',
        error.config?.method,
        error.config?.url
        // JSON.stringify(error, null, 2),
      )
      return Promise.reject(error)
    }

    const onResponseError = (error: AxiosError) => {
      if (error.config?.url && error.config?.method) {
        dispatch({
          type: 'decrement',
          endpoint: {
            url: error.config.url,
            type:
              error.config.method.toUpperCase() === 'GET'
                ? 'receiving'
                : 'sending'
          }
        })
      } else {
        // Panic (?)
        dispatch({
          type: 'reset',
          // Fake endpoint - reset action doesn't care about the endpoint.
          // TODO: make it better.
          endpoint: {
            type: 'receiving',
            url: ''
          }
        })
      }

      return Promise.reject(error)
    }

    // console.log('***** BusyIndicatorProvider :: effect triggered')

    uniqueInterceptors.useRequestInterceptor(
      'busy-indicator',
      onRequest,
      onRequestError
    )

    uniqueInterceptors.useResponseInterceptor(
      'busy-indicator',
      onResponse,
      onResponseError
    )

    // console.log(
    //   '***** Existing interceptors',
    //   api.interceptors.request,
    //   api.interceptors.response
    // )
  }, [busyEndpoints, uniqueInterceptors])

  useEffect(() => {
    return () => {
      // console.log('***** BusyIndicatorProvider :: effect clean-up')
      uniqueInterceptors.ejectRequestInterceptor('busy-indicator')
      uniqueInterceptors.ejectResponseInterceptor('busy-indicator')
    }
  }, [uniqueInterceptors])

  const loadingCount = () => {
    return busyEndpoints.filter((e) => e.type === 'receiving').length
  }

  const sendingCount = () => {
    return busyEndpoints.filter((e) => e.type === 'sending').length
  }

  const busyCount = () => {
    return loadingCount() + sendingCount()
  }

  const isBusy = (activity?: 'all' | 'sending' | 'receiving') => {
    if (!activity || activity === 'all') {
      return loadingCount() + sendingCount() > 0
    } else if (activity === 'sending') {
      return sendingCount() > 0
    } else {
      return loadingCount() > 0
    }
  }

  const isEndpointBusy = (
    endpoint: string | string[],
    activity?: 'all' | 'sending' | 'receiving'
  ) => {
    // We support multiple endpoints in this check. Always convert endpoint to array.
    if (!Array.isArray(endpoint)) {
      endpoint = [endpoint]
    }
    if (!activity || activity === 'all') {
      // Ignore query string when matching endpoint.
      return (
        busyEndpoints.filter((e) => endpoint.includes(e.url.split('?')[0]))
          .length > 0
      )
    }
    return (
      busyEndpoints.filter(
        (e) => e.type === activity && endpoint.includes(e.url.split('?')[0])
      ).length > 0
    )
  }

  return (
    <BusyIndicatorContext.Provider
      value={{
        busyEndpoints,
        loadingCount,
        sendingCount,
        isEndpointBusy,
        isBusy,
        busyCount
      }}
    >
      {children}
    </BusyIndicatorContext.Provider>
  )
}

export default BusyIndicatorProvider
