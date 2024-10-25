import { MercureContext } from '@/contexts'
import { ReactNode, useRef } from 'react'
import { api } from '@/services'
import { EventSourcePolyfill } from 'event-source-polyfill'

type Props = {
  children: ReactNode
}

export type Subscription = {
  topic: string
  eventSource: EventSourcePolyfill
  callbacks: ((event: MessageEvent) => void)[]
}

function MercureProvider(props: Props) {
  const { children } = props

  const mercureUrl = useRef<string>('')
  const mercureAuthToken = useRef<string>('')

  const subscriptions = useRef<Subscription[]>([])

  const isHubReady = () => !!mercureUrl.current && !!mercureAuthToken.current

  async function discoverMercureHub(hubUrl: string) {
    if (!isHubReady()) {
      console.log('Initialize Mercure hub', hubUrl)
      try {
        const token = await authorizeMercureHub()
        mercureUrl.current = hubUrl
        mercureAuthToken.current = token
        // console.log('Initialized mercure hub', hubUrl, token)
        // return Promise.resolve()
      } catch (error) {
        console.log('Error authorizing mercure hub', error)
        // return Promise.reject(error)
      }
    } else {
      console.log('Mercure hub already initialized')
    }
  }

  function authorizeMercureHub() {
    return api
      .get('/mercure-auth')
      .then(({ data }) => {
        console.log('Service response - auth', data)
        return Promise.resolve(data.token)
      })
      .catch(async (error) => {
        return Promise.reject(
          new Error('Error authorizing mercure updates ' + error.message)
        )
      })
  }

  async function addSubscription(
    topic: string,
    callback: (event: MessageEvent) => void
  ) {
    if (!isHubReady()) {
      return Promise.reject(
        new Error('Mercure Hub must be authorized before adding subscription')
      )
    }

    console.log('Adding subscription', topic)
    const existingIndex = subscriptions.current.findIndex(
      (s: Subscription) => s.topic === topic
    )
    if (existingIndex >= 0) {
      // Check that the callback is not yet registered.
      if (
        !subscriptions.current[existingIndex].callbacks.find(
          (c) => c.toString() === callback.toString()
        )
      ) {
        subscriptions.current[existingIndex].callbacks.push(callback)
        subscriptions.current[existingIndex].eventSource.addEventListener(
          'message',
          callback as never
        )
      }

      console.log('Updated subscription: current subscriptions', topic, [
        ...subscriptions.current
      ])

      return Promise.resolve(subscriptions.current[existingIndex])
    } else {
      // Only add subscription if not yet registered.
      const encoded = encodeURIComponent(topic)
      try {
        const eventSource = new EventSourcePolyfill(
          `${mercureUrl.current}?topic=${encoded}`,
          {
            withCredentials: false, // TODO: Check this option.
            headers: {
              Authorization: `Bearer ${mercureAuthToken.current}`
            }
          }
        )

        eventSource?.addEventListener('message', callback as never)

        subscriptions.current.push({
          topic,
          eventSource,
          callbacks: [callback]
        })

        console.log('Added subscription: current subscriptions', topic, [
          ...subscriptions.current
        ])

        return Promise.resolve({
          topic,
          eventSource
        })
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }

  async function addEventHandler(
    topic: string,
    callback: (event: MessageEvent) => void
  ) {
    console.log('Adding event handler', topic)

    const existingIndex = subscriptions.current.findIndex(
      (s: Subscription) => s.topic === topic
    )

    if (existingIndex === -1) {
      // console.log('***** addEventHandler :: add subscription')
      return await addSubscription(topic, callback)
    } else {
      const callbackIndex = subscriptions.current[
        existingIndex
      ].callbacks.findIndex((c) => c.toString() === callback.toString())

      if (callbackIndex === -1) {
        // console.log(
        //   '***** addEventHandler :: found subscription, adding handler'
        // )
        subscriptions.current[existingIndex].callbacks.push(callback)
        subscriptions.current[existingIndex].eventSource.addEventListener(
          'message',
          callback as never
        )
        // console.log(
        //   '***** addEventHandler :: after adding callback',
        //   subscriptions.current[existingIndex]
        // )
      }
      return Promise.resolve({
        topic,
        eventSource: subscriptions.current[existingIndex].eventSource
      })
    }
  }

  function removeSubscription(topic: string) {
    console.log('Removing subscription', topic)
    const existingIndex = subscriptions.current.findIndex(
      (s: Subscription) => s.topic === topic
    )
    if (existingIndex >= 0) {
      const subscription = subscriptions.current[existingIndex]
      const callbacks = subscriptions.current[existingIndex].callbacks || []
      callbacks.forEach((c) => {
        subscription.eventSource.removeEventListener('message', c as never)
      })

      subscription.eventSource?.close()
      subscriptions.current.splice(existingIndex, 1)

      console.log('Removed subscription: current subscriptions', topic, [
        ...subscriptions.current
      ])
    }
  }

  function removeEventHandler(
    topic: string,
    callback: (event: MessageEvent) => void
  ) {
    console.log('Removing event handler', topic)

    const subscriptionIndex = subscriptions.current.findIndex(
      (s: Subscription) => s.topic === topic
    )

    if (subscriptionIndex >= 0) {
      const callbackIndex = subscriptions.current[
        subscriptionIndex
      ].callbacks.findIndex((c) => c.toString() === callback.toString())

      if (callbackIndex >= 0) {
        subscriptions.current[
          subscriptionIndex
        ].eventSource.removeEventListener('message', callback as never)

        subscriptions.current[subscriptionIndex].callbacks.splice(
          callbackIndex,
          1
        )

        // Remove empty subscriptions.
        if (subscriptions.current[subscriptionIndex].callbacks.length === 0) {
          removeSubscription(topic)
        }
      }
    }
  }

  function removeAllSubscriptions() {
    console.log('Removing all subscriptions')
    subscriptions.current.forEach((subscription) => {
      removeSubscription(subscription.topic)
    })
  }

  return (
    <MercureContext.Provider
      value={{
        discoverMercureHub,
        addSubscription,
        removeSubscription,
        addEventHandler,
        removeEventHandler,
        removeAllSubscriptions
      }}
    >
      {children}
    </MercureContext.Provider>
  )
}

export default MercureProvider
