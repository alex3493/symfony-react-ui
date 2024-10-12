import { BrowserRouter } from 'react-router-dom'
import { NavBar } from './components'
import { AuthProvider, MercureProvider } from './providers'
import { Router } from './router'
import Container from 'react-bootstrap/Container'
import { ApiValidationProvider } from '@/providers/ApiValidationProvider'
import { BusyIndicatorProvider } from '@/providers'
import { LoadingProgressBar } from '@/components'
import { StrictMode } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'

function App() {
  return (
    <StrictMode>
      <BusyIndicatorProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </BusyIndicatorProvider>
    </StrictMode>
  )
}

export default App
