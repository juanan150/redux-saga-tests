import {
  getByRole,
  getByText,
  render,
  screen,
  fireEvent,
} from '../../../test-utils'

import { App } from '../../../App'

const testUser = {
  email: 'test@test.com',
}

test('See the band info in the tickets page', async () => {
  render(<App />, {
    routeHistory: ['/tickets/0'],
    preloadedState: { user: { userDetails: testUser } },
  })
  const bandName = await screen.findByRole('heading', {
    name: /Avalanche of Cheese/i,
  })

  expect(bandName).toBeInTheDocument()
})

test('purchase buttopn pushes the correcto URL', async () => {
  const { history } = render(<App />, {
    routeHistory: ['/tickets/0'],
    preloadedState: { user: { userDetails: testUser } },
  })

  const purchaseButton = await screen.findByRole('button', {
    name: /purchase/i,
  })
  fireEvent.click(purchaseButton)

  expect(history.location.pathname).toBe('/confirm/0')
  const searchRegex = expect.stringMatching(/holdId=\d+&seatCount=2/)
  expect(history.location.search).toEqual(searchRegex)
})

test('purchase tickets with wrong params', async () => {
  const { history } = render(<App />, {
    routeHistory: ['/confirm/0/holdId?12345'],
    preloadedState: { user: { userDetails: testUser } },
  })
  expect(history.location.pathname).toBe('/tickets/0')
})
