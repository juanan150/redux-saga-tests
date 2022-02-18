/* eslint-disable prettier/prettier */
import { App } from '../../../App'
import { render, screen } from '../../../test-utils'
import { UserProfile } from './UserProfile'

const testUser = {
  email: 'test@test.com',
}

test('greeting the user', () => {
  render(<UserProfile />, {
    preloadedState: { user: { userDetails: testUser } },
  })
  expect(screen.getByText(/hi, test@test.com/i)).toBeInTheDocument()
})

test('redirects to signin if user is falsy', () => {
  const { history } = render(<UserProfile />)
  expect(history.location.pathname).toBe('/signin')
})

test('view sign-in page when loading profile while not logged in', () => {
  render(<App />, { routeHistory: ['/profile'] })
  const heading = screen.getByRole('heading', {
    name: /Sign in to your account/i,
  })
  expect(heading).toBeInTheDocument()
})
