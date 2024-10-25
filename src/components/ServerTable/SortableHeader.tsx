type SortableHeaderProps = {
  sortKey: string
  label: string
  isOrderedBy: (column: string) => boolean
  isOrderDesc: () => boolean
  onClick: (column: string) => void
}

function SortableHeader(props: SortableHeaderProps) {
  const { sortKey, label, isOrderedBy, isOrderDesc, onClick } = props
  return (
    <th
      style={{
        cursor: 'pointer'
      }}
      onClick={() => onClick(sortKey)}
    >
      {isOrderedBy(sortKey) &&
        (isOrderDesc() ? (
          <i className="bi bi-sort-down"></i>
        ) : (
          <i className="bi bi-sort-up"></i>
        ))}{' '}
      {label}
    </th>
  )
}

export default SortableHeader
