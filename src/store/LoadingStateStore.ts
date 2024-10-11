import { create } from 'zustand'

type InterceptorData = {
  index: number
  context: string
}

type State = {
  requestInterceptors: InterceptorData[]
  responseInterceptors: InterceptorData[]
}

type Action = {
  addRequestInterceptor: (index: number, context: string) => void
  addResponseInterceptor: (index: number, context: string) => void
  removeRequestInterceptor: (index: number) => void
  removeResponseInterceptor: (index: number) => void
  hasRequestInterceptor: (context: string) => boolean
  hasResponseInterceptor: (context: string) => boolean
}

const requestInterceptorIndex = (state: State, context: string): number => {
  return state.requestInterceptors.findIndex((s) => s.context === context)
}

const responseInterceptorIndex = (state: State, context: string): number => {
  return state.responseInterceptors.findIndex((s) => s.context === context)
}

const useInterceptorsStore = create<State & Action>((set, getState) => ({
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
  removeRequestInterceptor: (index) =>
    set((state) => {
      state.requestInterceptors.splice(index, 1)
      return state
    }),
  removeResponseInterceptor: (index) =>
    set((state) => {
      state.responseInterceptors.splice(index, 1)
      return state
    }),
  hasRequestInterceptor: (context) => {
    return getState().requestInterceptors.some((s) => s.context === context)
  },
  hasResponseInterceptor: (context) => {
    return getState().responseInterceptors.some((s) => s.context === context)
  }
}))

export default useInterceptorsStore
