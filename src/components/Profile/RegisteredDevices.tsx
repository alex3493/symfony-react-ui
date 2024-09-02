import { Button, Card, Spinner, Table } from 'react-bootstrap'
import React from 'react'
import { useBusyIndicator, useSession } from '@/hooks'
import RegisteredDeviceModel from '@/models/RegisteredDeviceModel'
import {
  LOGOUT_FROM_ALL_DEVICES_API_ROUTE,
  LOGOUT_FROM_DEVICE_API_ROUTE
} from '@/utils'
import { api } from '@/services'

function RegisteredDevices() {
  const { user, updateUser } = useSession()

  const { isEndpointBusy } = useBusyIndicator()

  const handleLogout = async (device: RegisteredDeviceModel) => {
    console.log('Logging out from device', device)
    const url = LOGOUT_FROM_DEVICE_API_ROUTE.replace(
      '{tokenId}',
      device.id.toString()
    )
    try {
      const { data } = await api.delete(url)
      console.log('Logout from device response', data)
      updateUser(data.user)
    } catch (error) {
      console.log('Error logging out from device', error)
    }
  }

  const handleSignOut = async () => {
    console.log('Logging out from all devices')
    try {
      const { data } = await api.post(LOGOUT_FROM_ALL_DEVICES_API_ROUTE)
      console.log('Logout from all devices response', data)
      updateUser(data.user)
    } catch (error) {
      console.log('Error logging out from all devices', error)
    }
  }

  const disableDeviceLogoutSubmit = (device: RegisteredDeviceModel) => {
    const url = LOGOUT_FROM_DEVICE_API_ROUTE.replace(
      '{tokenId}',
      device.id.toString()
    )

    return isEndpointBusy(url)
  }

  const disableSignOutSubmit = isEndpointBusy(LOGOUT_FROM_ALL_DEVICES_API_ROUTE)

  return (
    <>
      <Card className="mt-3 mb-3">
        <Card.Header>Registered Devices</Card.Header>
        <Card.Body>
          <Table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Created</th>
                <th>Last used</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {user && user.auth_tokens.length > 0 ? (
                user?.auth_tokens.map((device) => (
                  <tr key={device.id}>
                    <td>{device.name}</td>
                    <td>{device.getCreatedAt()}</td>
                    <td>{device.getLastUsedAt()}</td>
                    <td>
                      <Button
                        variant="warning"
                        onClick={() => handleLogout(device)}
                        disabled={disableDeviceLogoutSubmit(device)}
                      >
                        {disableDeviceLogoutSubmit(device) && (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                        )}{' '}
                        Log out
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No registered devices</td>
                </tr>
              )}
            </tbody>
          </Table>
          {user && user.auth_tokens.length > 0 && (
            <Button
              variant="danger"
              onClick={handleSignOut}
              disabled={disableSignOutSubmit}
            >
              {disableSignOutSubmit && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              )}{' '}
              Log out from all devices
            </Button>
          )}
        </Card.Body>
      </Card>
    </>
  )
}

export default RegisteredDevices
