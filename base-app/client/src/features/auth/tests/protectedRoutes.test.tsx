import { handleRequest, rest } from 'msw'
import { App } from '../../../App'
import { getByRole, render, screen, waitFor } from '../../../test-utils'
import userEvent from '@testing-library/user-event'
import { baseUrl, endpoints } from '../../../app/axios/constants'
import { server } from '../../../mocks/server'
import { handlers } from '../../../mocks/handlers'

test.each([
  { routeName: 'Profile', routePath: '/profile' },
  { routeName: 'Tickets', routePath: '/tickets/0' },
  { routeName: 'Confirm', routePath: '/confirm/0?holdId=123&seatCount=2' },
])('protected pageredirects to sign in', ({ routePath }) => {
  render(<App />, { routeHistory: [routePath] })
  const heading = screen.getByRole('heading', { name: /sign in/i })
  expect(heading).toBeInTheDocument()
})

test.each([{ buttonName: /sign in/i }, { buttonName: /sign up/i }])(
  'successful signin flow',
  async ({ buttonName }) => {
    // go to protected page
    const { history } = render(<App />, { routeHistory: ['/tickets/1'] })

    //Sign in after redirect
    const emailField = screen.getByLabelText(/email/i)
    userEvent.type(emailField, 'test@test.com')
    const passwordField = screen.getByLabelText(/password/i)
    userEvent.type(passwordField, 'abc123')

    const signInForm = screen.getByTestId('sign-in-form')
    const signInButton = getByRole(signInForm, 'button', { name: buttonName })
    userEvent.click(signInButton)

    await waitFor(() => {
      expect(history.location.pathname).toBe('/tickets/1')

      //sign in page to be removed from history
      expect(history.entries).toHaveLength(1)
    })
  },
)

const signInFailure = (req, res, ctx) => res(ctx.status(401))
const serverFailure = (req, res, ctx) => res(ctx.status(500))

test.each([
  { responseError: signInFailure, buttonName: /sign in/i },
  { responseError: serverFailure, buttonName: /sign in/i },
  { responseError: signInFailure, buttonName: /sign up/i },
  { responseError: serverFailure, buttonName: /sign up/i },
])(
  'unsuccessful signin followed by successful signin',
  async ({ responseError, buttonName }) => {
    const errorHandler = rest.post(
      `${baseUrl}/${endpoints.signIn}`,
      responseError,
    )
    server.resetHandlers(...handlers, errorHandler)

    const { history } = render(<App />, { routeHistory: ['/tickets/1'] })

    //Sign in after redirect
    const emailField = screen.getByLabelText(/email/i)
    userEvent.type(emailField, 'test@test.com')
    const passwordField = screen.getByLabelText(/password/i)
    userEvent.type(passwordField, 'abc123')

    const signInForm = screen.getByTestId('sign-in-form')
    const signInButton = getByRole(signInForm, 'button', { name: buttonName })
    userEvent.click(signInButton)

    server.resetHandlers()
    userEvent.click(signInButton)

    await waitFor(() => {
      expect(history.location.pathname).toBe('/tickets/1')

      //sign in page to be removed from history
      expect(history.entries).toHaveLength(1)
    })
  },
)

// test('internal server error', async () => {
//   const errorHandler = rest.post(
//     `${baseUrl}/${endpoints.signIn}`,
//     serverFailure,
//   )

//   server.resetHandlers(...handlers, errorHandler)

//   const { history } = render(<App />, { routeHistory: ['/tickets/1'] })

//   //Sign in after redirect
//   const emailField = screen.getByLabelText(/email/i)
//   userEvent.type(emailField, 'test@test.com')
//   const passwordField = screen.getByLabelText(/password/i)
//   userEvent.type(passwordField, 'abc123')

//   const signInForm = screen.getByTestId('sign-in-form')
//   const signInButton = getByRole(signInForm, 'button', { name: /sign in/i })
//   userEvent.click(signInButton)

//   server.resetHandlers()
//   userEvent.click(signInButton)

//   await waitFor(() => {
//     expect(history.location.pathname).toBe('/tickets/1')

//     //sign in page to be removed from history
//     expect(history.entries).toHaveLength(1)
//   })
// })
