import { BrowserRouter } from 'react-router-dom'
import { NavBar } from './components'
import { AuthProvider } from './providers'
import { MercureProvider } from './providers'
import { Router } from './router'
import Container from 'react-bootstrap/Container'
import { ApiValidationProvider } from '@/providers/ApiValidationProvider'
import { BusyIndicatorProvider } from '@/providers'
import { LoadingProgressBar } from '@/components'

function App() {
  return (
    <BrowserRouter>
      <BusyIndicatorProvider>
        <LoadingProgressBar />
        <ApiValidationProvider>
          <AuthProvider>
            <MercureProvider>
              <NavBar />
              <Container>
                <Router />
              </Container>
            </MercureProvider>
          </AuthProvider>
        </ApiValidationProvider>
      </BusyIndicatorProvider>
    </BrowserRouter>
  )
}

export default App
