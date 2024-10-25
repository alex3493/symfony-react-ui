# Symfony React UI

### This project is based
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

### Users

A basic user table with CRUD actions, just for testing admin user management.

CRUD actions are enabled only if you are logged in as administrator (e.g. admin@example.com/password).

Regular users can also view user list with pagination, sorting and text search, but cannot perform any action on users.

Admin users can:
- Create new users (both admins and regular roles).
- Edit any user. User password is updated only if provided in edit form (force password reset). Leave password field blank to keep current user password (normal flow).
- Block (soft-delete) users.
- Unblock (restore) users.
- Permanently delete (force-delete) users.

### User name

Dropdown menu with the following items:

- Profile: allows update user first / last names and password. Also, if current user has logged in from a mobile app
  before, this list of his registered mobile devices
  is also displayed. (See [API project documentation](https://github.com/alex3493/symfony-api/blob/main/Readme.md) on
  how to create user
  mobile app logins in Swagger Docs). Then user can log out from single device or log out from all devices (sign out).
  **Note: this action doesn't affect current user WEB account.**
- Log out.

## This project is powered with Symfony Mercure

All user changes are automatically reflected in all browsers and browser tabs, doesn't matter if viewed by the same logged-in user or different users.

For updates that do not change user count (i.e. update, soft-delete and restore), table rows are updated silently in all open windows if affected row is visible on currently displayed table page.

Updates that affect user count (i.e. create and force-delete) we show an alert with timer (default 10 sec.) and table data is refreshed automatically.

*This is not a perfect UI/UX solution, of course. We implement it here just for demonstration of the power of Symfony Mercure.*

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




