import { Pagination } from 'react-bootstrap'

type Props = {
  currentPage: number
  totalPages: number
  perPage: number
  totalItems: number
  onPageClick: (index: number) => void
}

function TableFooter(props: Props) {
  const { currentPage, totalPages, perPage, totalItems, onPageClick } = props

  const firstItemIndex = () => (currentPage - 1) * perPage + 1
  const lastItemIndex = () => {
    if (totalItems < perPage) return totalItems
    return currentPage * perPage
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
    paginationItems.push(<Pagination.Ellipsis />)
  }
  for (
    let index = Math.max(currentPage - 3, 1);
    index <= Math.min(currentPage + 3, totalPages);
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
  if (totalPages - currentPage >= 4) {
    paginationItems.push(<Pagination.Ellipsis />)
  }
  // TODO: Limit page links count, show only close indices and ... for the rest.
  // for (let index = 1; index <= totalPages; index++) {
  //   paginationItems.push(
  //     <Pagination.Item
  //       style={{ cursor: 'pointer' }}
  //       key={index}
  //       active={index === currentPage}
  //       onClick={() => pageClicked(index)}
  //     >
  //       {index}
  //     </Pagination.Item>
  //   )
  // }
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
          <p>
            Showing items {firstItemIndex()} - {lastItemIndex()} of {totalItems}
          </p>
          <Pagination>{paginationItems}</Pagination>
        </>
      )}
    </div>
  )
}

export default TableFooter
