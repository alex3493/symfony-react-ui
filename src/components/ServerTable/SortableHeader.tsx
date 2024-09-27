type SortableHeaderProps = {
  name: string
  label: string
  isOrderedBy: (column: string) => boolean
  isOrderDesc: () => boolean
  onClick: (column: string) => void
}

function SortableHeader(props: SortableHeaderProps) {
  const { name, label, isOrderedBy, isOrderDesc, onClick } = props
  return (
    <th
      style={{
        cursor: 'pointer'
      }}
      onClick={() => onClick(name)}
    >
      {isOrderedBy(name) &&
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
