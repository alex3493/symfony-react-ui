import { Pagination } from 'react-bootstrap'

type Props = {
  currentPage: number
  totalPages: number
  perPage: number
  totalItems: number
  onPageClick: (index: number) => void
  dataLoaded: boolean
}

function TableFooter(props: Props) {
  const {
    currentPage,
    totalPages,
    perPage,
    totalItems,
    onPageClick,
    dataLoaded
  } = props

  const firstItemIndex = () => (currentPage - 1) * perPage + 1
  const lastItemIndex = () => {
    if (totalItems < perPage) return totalItems
    return Math.min(totalItems, currentPage * perPage)
  }

  const pageClicked = (index: number) => {
    if (index !== currentPage) {
      onPageClick(index)
    }
  }

  const paginationItems = []
  paginationItems.push(
    <Pagination.First
      disabled={currentPage === 1}
      key="first"
      onClick={() => pageClicked(1)}
    />
  )
  paginationItems.push(
    <Pagination.Prev
      disabled={currentPage === 1}
      key="prev"
      onClick={() => pageClicked(currentPage - 1)}
    />
  )
  if (currentPage >= 4) {
    paginationItems.push(<Pagination.Ellipsis disabled />)
  }
  for (
    let index = Math.max(currentPage - 2, 1);
    index <= Math.min(currentPage + 2, totalPages);
    index++
  ) {
    paginationItems.push(
      <Pagination.Item
        style={{ cursor: 'pointer' }}
        key={index}
        active={index === currentPage}
        onClick={() => pageClicked(index)}
      >
        {index}
      </Pagination.Item>
    )
  }
  if (totalPages - currentPage >= 3) {
    paginationItems.push(<Pagination.Ellipsis disabled />)
  }
  paginationItems.push(
    <Pagination.Next
      disabled={currentPage === totalPages}
      key="next"
      onClick={() => pageClicked(currentPage + 1)}
    />
  )
  paginationItems.push(
    <Pagination.Last
      disabled={currentPage === totalPages}
      key="last"
      onClick={() => pageClicked(totalPages)}
    />
  )

  return (
    <div>
      {totalItems > 0 && (
        <>
          <p style={{ visibility: dataLoaded ? 'visible' : 'hidden' }}>
            Showing items {firstItemIndex()} - {lastItemIndex()} of {totalItems}
          </p>
          <Pagination>{paginationItems}</Pagination>
        </>
      )}
    </div>
  )
}

export default TableFooter
