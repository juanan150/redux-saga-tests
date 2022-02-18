import {
  getByRole,
  getByText,
  render,
  screen,
  fireEvent,
} from '../../../test-utils'

import { Shows } from './Shows'

test('display relevant show details for non sold-out show', async () => {
  render(<Shows />)
  const shows = await screen.findAllByRole('listitem')
  const nonSoldOutShow = shows[0]

  const ticketButton = getByRole(nonSoldOutShow, 'button', { name: /tickets/i })
  expect(ticketButton).toBeInTheDocument()
  const bandName = getByRole(nonSoldOutShow, 'heading', {
    name: /Avalanche of Cheese/i,
  })
  expect(bandName).toBeInTheDocument()
  const bandDescription = getByText(
    nonSoldOutShow,
    /rollicking country with ambitious kazoo solos/i,
  )
  expect(bandDescription).toBeInTheDocument()
})

test('display info about the sold-out show', async () => {
  render(<Shows />)
  const shows = await screen.findAllByRole('listitem')
  const soldOutShow = shows[1]

  const soldOutMessage = getByRole(soldOutShow, 'heading', {
    name: /sold out/i,
  })
  expect(soldOutMessage).toBeInTheDocument()
})

test("redirects to corect tickets URL when 'tickets' is clicked", async () => {
  const { history } = render(<Shows />)
  const ticketsButton = await screen.findByRole('button', { name: /tickets/i })
  fireEvent.click(ticketsButton)
  expect(history.location.pathname).toBe('/tickets/0')
})
