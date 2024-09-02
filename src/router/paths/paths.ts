const ROOT_PATH = '/'
const LOGIN_PATH = '/login'
const REGISTER_PATH = '/register'
const RESET_PASSWORD_PATH = '/reset-password'
const FORGOT_PASSWORD_PATH = '/forgot-password'
const PROFILE_PATH = '/profile'
const USER_PATH = '/users/:id'

const paths = {
  ROOT_PATH,
  LOGIN_PATH,
  REGISTER_PATH,
  RESET_PASSWORD_PATH,
  FORGOT_PASSWORD_PATH,
  PROFILE_PATH,
  USER_PATH
} as const

export default paths
