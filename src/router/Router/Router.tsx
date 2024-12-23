import { Route, Routes } from 'react-router-dom'
import { useRoutePaths } from '@/hooks'
import { Login, Profile, Register, ResetPassword } from '@/pages'
import { PrivateRoute } from '../PrivateRoute'
import { PublicRoute } from '../PublicRoute'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { Home } from '@/pages/Home'
import { UserList } from '@/pages/UserList'

function Router() {
  const {
    LOGIN_PATH,
    PROFILE_PATH,
    REGISTER_PATH,
    RESET_PASSWORD_PATH,
    FORGOT_PASSWORD_PATH,
    USER_LIST_PATH,
    ROOT_PATH
  } = useRoutePaths()

  return (
    <Routes>
      <Route
        path={ROOT_PATH}
        element={
          <PrivateRoute redirectTo={LOGIN_PATH}>
            <Home />
          </PrivateRoute>
        }
      />

      <Route
        path={LOGIN_PATH}
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path={REGISTER_PATH}
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path={RESET_PASSWORD_PATH}
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      <Route
        path={FORGOT_PASSWORD_PATH}
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path={PROFILE_PATH}
        element={
          <PrivateRoute redirectTo={LOGIN_PATH}>
            <Profile />
          </PrivateRoute>
        }
      />

      <Route
        path={USER_LIST_PATH}
        element={
          <PrivateRoute permissions={['user.list']} redirectTo={LOGIN_PATH}>
            <UserList />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<h1>404</h1>} />
    </Routes>
  )
}

export default Router
