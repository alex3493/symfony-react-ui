export interface UserProfileForm {
  first_name: string
  last_name: string
}

export interface UserChangePasswordForm {
  current_password: string
  password: string
  password_confirmation: string
}

export interface UserRegistrationForm {
  email: string
  password: string
  password_confirmation: string
  first_name: string
  last_name: string
}
