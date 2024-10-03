// seconds * minutes * hours * days
export const COOKIE_EXPIRATION_TIME = 60 * 60 * 24 // 1 day
export const TOKEN_COOKIE = 'reactauth.token'
export const REFRESH_TOKEN_COOKIE = 'reactauth.refreshToken'

export const LOGIN_API_ROUTE = '/login_check'
export const REGISTER_API_ROUTE = '/register'
export const RESET_PASSWORD_API_ROUTE = '/reset-password'
export const FORGOT_PASSWORD_API_ROUTE = '/forgot-password'
export const REFRESH_TOKEN_API_ROUTE = '/token/refresh'
export const USER_ME_API_ROUTE = '/dashboard'
export const PROFILE_UPDATE_API_ROUTE = '/account/me/update'
export const CHANGE_PASSWORD_API_ROUTE = '/account/me/change-password'
export const LOGOUT_FROM_DEVICE_API_ROUTE = '/account/logout/{tokenId}'
export const LOGOUT_FROM_ALL_DEVICES_API_ROUTE = '/account/me/sign-out'

export const USER_LIST_API_ROUTE = '/admin/users'
export const USER_CREATE_API_ROUTE = '/admin/users'
export const USER_UPDATE_API_ROUTE = '/admin/user/{userId}'
export const USER_DELETE_API_ROUTE = '/admin/user/{userId}'
export const USER_SOFT_DELETE_API_ROUTE = '/admin/user/delete/{userId}'
export const USER_RESTORE_API_ROUTE = '/admin/user/restore/{userId}'
