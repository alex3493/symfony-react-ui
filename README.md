# Symfony React UI

### *This project is based
on [Eder Sampaio reactjs-auth-boilerplate](https://github.com/ederssouza/reactjs-auth-boilerplate).*

-----

This is front-end React JS application for testing Symfony API [project](https://github.com/alex3493/symfony-api)

This application requires user login. You can log in using pre-seeded admin user credentials:

- email: admin@example.com
- password: password

You can also register a new user in UI following "register" link in login form. Note, that UI registration
always creates regular users (ROLE_USER). If you need more admin users you can create them in API console (
See [API project documentation](https://github.com/alex3493/symfony-api/blob/main/Readme.md))

## Menu structure

### User name

Dropdown menu with the following items:

- Admin Greeting (only available to admin users).
- Profile: allows update user first / last names and password. Also, if current user has logged in from a mobile app
  before, this list of his registered mobile devices
  is also displayed. (See [API project documentation](https://github.com/alex3493/symfony-api/blob/main/Readme.md) on
  how to create user
  mobile app logins in Swagger Docs). Then user can log out from single device or log out from all devices (sign out).
  **Note: this action doesn't affect current user WEB account.**

- Log out.

## How to install

1. Clone this repo
2. cd to project root folder

### Docker (production mode)

3. cp .env.production .env.production.local
4. Run `docker compose build`
5. Run `docker compose up -d`
6. Open http://localhost:8080 in your browser

### Local hot-reload (development mode)

3. cp .env.development .env.development.local
4. Run `npm install`
5. Run `npm run dev`
6. Open the link displayed in terminal when `npm run dev` is running (with API docker container running it will most
   likely point to http://localhost:3001, because port 3000 is occupied by Symfony Mercure)

### *** IMPORTANT *** API is configured to accept https requests and uses self-signed SSL certificate.

**Do not forget** to visit https://symfony.test and accept browser security warning, otherwise all requests to API with
fail.



