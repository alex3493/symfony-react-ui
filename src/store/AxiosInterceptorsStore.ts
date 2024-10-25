import { create } from 'zustand'

type InterceptorData = {
  index: number
  context: string
}

type State = {
  requestInterceptors: InterceptorData[]
  responseInterceptors: InterceptorData[]
}

export type InterceptorStoreAction = {
  addRequestInterceptor: (index: number, context: string) => void
  addResponseInterceptor: (index: number, context: string) => void
  removeRequestInterceptor: (context: string) => void
  removeResponseInterceptor: (context: string) => void
  hasRequestInterceptor: (context: string) => boolean
  hasResponseInterceptor: (context: string) => boolean
  getRequestInterceptor: (context: string) => InterceptorData | undefined
  getResponseInterceptor: (context: string) => InterceptorData | undefined
}

const requestInterceptorIndex = (state: State, context: string): number => {
  return state.requestInterceptors.findIndex((s) => s.context === context)
}

const responseInterceptorIndex = (state: State, context: string): number => {
  return state.responseInterceptors.findIndex((s) => s.context === context)
}

const useInterceptorsStore = create<State & InterceptorStoreAction>(
  (set, getState) => ({
    requestInterceptors: [],
    responseInterceptors: [],
    addRequestInterceptor: (index, context) =>
      set((state) => {
        const found = requestInterceptorIndex(state, context)
        if (found >= 0) {
          state.requestInterceptors[index] = { index, context }
        } else {
          state.requestInterceptors.push({ index, context })
        }
        return state
      }),
    addResponseInterceptor: (index, context) =>
      set((state) => {
        const found = responseInterceptorIndex(state, context)
        if (found >= 0) {
          state.responseInterceptors[index] = { index, context }
        } else {
          state.responseInterceptors.push({ index, context })
        }
        return state
      }),
    removeRequestInterceptor: (context: string) =>
      set((state) => {
        const found = requestInterceptorIndex(state, context)
        if (found >= 0) {
          state.requestInterceptors.splice(found, 1)
        }
        return state
      }),
    removeResponseInterceptor: (context: string) =>
      set((state) => {
        const found = responseInterceptorIndex(state, context)
        if (found >= 0) {
          state.responseInterceptors.splice(found, 1)
        }
        return state
      }),
    hasRequestInterceptor: (context) => {
      return getState().requestInterceptors.some((s) => s.context === context)
    },
    hasResponseInterceptor: (context) => {
      return getState().responseInterceptors.some((s) => s.context === context)
    },
    getRequestInterceptor: (context: string) => {
      return getState().requestInterceptors.find((i) => i.context === context)
    },
    getResponseInterceptor: (context: string) => {
      return getState().responseInterceptors.find((i) => i.context === context)
    }
  })
)

export default useInterceptorsStore
