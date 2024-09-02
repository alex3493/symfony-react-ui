import ProgressBar from 'react-bootstrap/ProgressBar'
import { useBusyIndicator } from '@/hooks'

function LoadingProgressBar() {
  const { loadingCount, sendingCount } = useBusyIndicator()

  const loadingStyles = {
    progressBar: {
      borderRadius: 0,
      height: 3,
      top: 0
    }
  }

  const actionStyles = {
    progressBar: {
      borderRadius: 0,
      height: 6,
      top: 0
    }
  }

  return (
    <>
      {loadingCount() > 0 && (
        <ProgressBar
          className="sticky-top"
          variant="success"
          now={100 / loadingCount()}
          style={loadingStyles.progressBar}
        />
      )}
      {sendingCount() > 0 && (
        <ProgressBar
          className="sticky-top"
          variant="danger"
          now={100 / sendingCount()}
          style={actionStyles.progressBar}
        />
      )}
    </>
  )
}

export default LoadingProgressBar
