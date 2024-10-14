import toast from 'react-hot-toast'

export function notify(title: string, text: string) {
  return toast(
    <div>
      <b>{title}</b>
      <p>{text}</p>
    </div>,
    {
      duration: 10000
    }
  )
}
