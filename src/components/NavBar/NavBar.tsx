import { useMercureUpdates, useRoutePaths, useSession } from '@/hooks'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { useCallback, useEffect } from 'react'
import { AxiosError } from 'axios'

function NavBar() {
  const { isAuthenticated, user, signOut } = useSession()
  const { PROFILE_PATH, ROOT_PATH } = useRoutePaths()
  const { updateUser } = useSession()

  const {
    discoverMercureHub,
    addSubscription,
    removeSubscription,
    removeAllSubscriptions
  } = useMercureUpdates()

  // TODO: check update action causer and act only if not self.
  const subscriptionCallback = useCallback(
    (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      console.log('***** Mercure Event for current user', data)
      switch (data.action) {
        // Update profile action, we update current user here.
        case 'update':
          updateUser(data.user)
          break
        // User account delete action, we have to sign out immediately.
        case 'soft_delete':
        case 'force_delete':
          signOut()
          break
        default:
          console.log(
            'Only update, soft-delete and force_delete actions should be published in user item topic'
          )
      }
    },
    [signOut, updateUser]
  )

  useEffect(() => {
    async function subscribe(userId: string | number) {
      try {
        await discoverMercureHub('http://localhost:3000/.well-known/mercure')
        await addSubscription(`user::update::${userId}`, subscriptionCallback)
      } catch (error) {
        return error as AxiosError
      }
    }

    if (user?.id) {
      subscribe(user.id).catch((error) => {
        console.log('Error subscribing to user updates', error)
      })
    } else {
      // User was logged out.
      console.log('User was logged out - remove subscriptions')
      removeAllSubscriptions()
    }

    return () => {
      console.log('Navbar clean-up')
      removeAllSubscriptions()
    }
  }, [
    addSubscription,
    discoverMercureHub,
    removeAllSubscriptions,
    removeSubscription,
    subscriptionCallback,
    user?.id
  ])

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand as={Link} to={ROOT_PATH}>
            Home
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthenticated && (
                <NavDropdown title={user?.display_name} id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to={PROFILE_PATH}>
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={signOut}>Log out</NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default NavBar
