import { NavBar } from './NavBar'
import { render, screen } from '../../../test-utils'

const testUser = {
  email: 'test@test.com',
}

test('redirects to signin when clicking in the signin button', () => {
  const { history } = render(<NavBar />)
  screen.getByText(/sign in/i).click()

  expect(history.location.pathname).toBe('/signin')
})

test('see sign out button when user is truthy', () => {
  render(<NavBar />, { preloadedState: { user: { userDetails: testUser } } })

  expect(screen.getByText(/sign out/i)).toBeInTheDocument()
  expect(screen.getByText(/test@test.com/i)).toBeInTheDocument()
})

test('see sign in button when user is falsy', () => {
  render(<NavBar />)

  expect(screen.getByText(/sign in/i)).toBeInTheDocument()
})
