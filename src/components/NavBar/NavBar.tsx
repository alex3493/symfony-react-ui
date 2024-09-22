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
  const { PROFILE_PATH, USER_LIST_PATH, ROOT_PATH } = useRoutePaths()
  const { updateUser, mercureHubUrl } = useSession()

  const {
    discoverMercureHub,
    addSubscription,
    // removeSubscription,
    removeAllSubscriptions
  } = useMercureUpdates()

  const subscriptionCallback = useCallback(
    (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      console.log('***** Mercure Event for current user', data)
      switch (data.action) {
        // Update profile action, we update current user here.
        case 'user_update':
          updateUser(data.item)
          break
        // User account delete action, we have to sign out immediately.
        case 'user_soft_delete':
        case 'user_force_delete':
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
        await discoverMercureHub(mercureHubUrl)
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

    // TODO: this clean-up method should be called when the component is unmounted.
    // TODO: we have an issue here - clean-up is called on every menu or mercure update!
    return () => {
      console.log('Navbar clean-up')
      removeAllSubscriptions()
    }
  }, [
    addSubscription,
    discoverMercureHub,
    mercureHubUrl,
    removeAllSubscriptions,
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
                <>
                  <Nav.Link as={Link} to={USER_LIST_PATH}>
                    Users
                  </Nav.Link>
                  <NavDropdown
                    title={user?.display_name}
                    id="basic-nav-dropdown"
                  >
                    <NavDropdown.Item as={Link} to={PROFILE_PATH}>
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={signOut}>
                      Log out
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default NavBar
