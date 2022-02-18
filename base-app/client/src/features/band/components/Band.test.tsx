import { render, screen } from '../../../test-utils'

import { App } from '../../../App'

test('band page displays band name for correct bandId', async () => {
  render(<App />, { routeHistory: ['/bands/0'] })
  const heading = await screen.findByRole('heading', {
    name: /Avalanche of Cheese/i,
  })
  expect(heading).toBeInTheDocument()
})
