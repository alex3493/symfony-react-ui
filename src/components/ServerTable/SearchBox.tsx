import { Form } from 'react-bootstrap'
import React, { useEffect, useRef } from 'react'
import { debounce } from 'lodash'

type Props = {
  onInput: (query: string) => void
}

function SearchBox(props: Props) {
  const { onInput } = props

  const debouncedSearch = useRef(
    debounce(async (query) => {
      onInput(query)
    }, 500)
  ).current

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  return (
    <Form>
      <Form.Group className="mb-2 mt-2">
        <Form.Control
          type="text"
          placeholder="Search by name or email..."
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            debouncedSearch(e.target.value)
          }
        />
      </Form.Group>
    </Form>
  )
}

export default SearchBox
