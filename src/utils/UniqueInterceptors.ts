import { useInterceptorsStore } from '@/store'
import {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import { api } from '@/services'
import { InterceptorStoreAction } from '@/store/AxiosInterceptorsStore'

export class UniqueInterceptors {
  store: () => InterceptorStoreAction

  constructor() {
    this.store = useInterceptorsStore.getState
  }

  useRequestInterceptor(
    context: string,
    callbackSuccess: (
      config: InternalAxiosRequestConfig<AxiosRequestConfig>
    ) => InternalAxiosRequestConfig<AxiosRequestConfig>,
    callbackError: (error: AxiosError) => Promise<AxiosError>
  ) {
    if (!this.store().hasRequestInterceptor(context)) {
      // console.log('+++++ Attaching request interceptor', context)
      const requestInterceptor = api.interceptors.request.use(
        callbackSuccess,
        callbackError
      )
      this.store().addRequestInterceptor(requestInterceptor, context)
    }
  }

  useResponseInterceptor(
    context: string,
    callbackSuccess: (response: AxiosResponse) => AxiosResponse,
    callbackError: (error: AxiosError<never>) => Promise<never>
  ) {
    if (!this.store().hasResponseInterceptor(context)) {
      // console.log('+++++ Attaching response interceptor', context)
      const responseInterceptor = api.interceptors.response.use(
        callbackSuccess,
        callbackError
      )
      this.store().addResponseInterceptor(responseInterceptor, context)
    }
  }

  ejectRequestInterceptor(context: string) {
    const interceptor = this.store().getRequestInterceptor(context)
    if (interceptor) {
      api.interceptors.request.eject(interceptor.index)
      this.store().removeRequestInterceptor(context)
      // console.log('----- Ejecting request interceptor', context)
    }
  }

  ejectResponseInterceptor(context: string) {
    const interceptor = this.store().getResponseInterceptor(context)
    if (interceptor) {
      api.interceptors.response.eject(interceptor.index)
      this.store().removeResponseInterceptor(context)
      // console.log('----- Ejecting response interceptor', context)
    }
  }
}
