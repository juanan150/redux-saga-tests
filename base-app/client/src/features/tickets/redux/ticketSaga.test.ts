import axios from 'axios'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { StaticProvider, throwError } from 'redux-saga-test-plan/providers'

import { showToast } from '../../toast/redux/toastSlice'
import {
  cancelPurchaseServerCall,
  releaseServerCall,
  reserveTicketServerCall,
} from '../api'
import { TicketAction } from '../types'
import {
  endTransaction,
  resetTransaction,
  selectors,
  startTicketAbort,
  startTicketPurchase,
  startTicketRelease,
} from './ticketSlice'
import {
  generateErrorToastOptions,
  cancelTransaction,
  purchaseTickets,
  ticketFlow,
} from './ticketSaga'
import {
  holdReservation,
  purchaseReservation,
  purchasePayload,
} from '../../../test-utils/fake-data'

const holdAction = {
  type: 'test',
  payload: holdReservation,
}

const networkProviders: Array<StaticProvider> = [
  [matchers.call.fn(reserveTicketServerCall), null],
  [matchers.call.fn(releaseServerCall), null],
  [matchers.call.fn(cancelPurchaseServerCall), null],
]

test('canceltransaction cancels hold and reset transctions', () => {
  return expectSaga(cancelTransaction, holdReservation)
    .provide(networkProviders)
    .call(releaseServerCall, holdReservation)
    .put(resetTransaction())
    .run()
})

// I have to mock all server calls in the provide section of the test, the null is teh return of the server call
describe('common to all flows', () => {
  test('starts with hold cal to server', () => {
    return expectSaga(ticketFlow, holdAction)
      .provide(networkProviders)
      .dispatch(
        startTicketAbort({
          reservation: holdReservation,
          reason: 'Abort! Abprt!',
        }),
      )
      .call(reserveTicketServerCall, holdReservation)
      .run()
  })

  test('show error toast and clean up after server error', () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [
          matchers.call.fn(reserveTicketServerCall),
          throwError(new Error('It did not work')),
        ],
        //write provider to selector
        [
          matchers.select.selector(selectors.getTicketAction),
          TicketAction.hold,
        ],
        ...networkProviders,
      ])
      .put(
        showToast(
          generateErrorToastOptions('It did not work', TicketAction.hold),
        ),
      )
      .call(cancelTransaction, holdReservation)
      .run()
  })
})

describe('purchase flow', () => {
  test('network error on purchase show toast and cancels transactions', () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [
          matchers.call.like({
            fn: reserveTicketServerCall,
            args: [purchaseReservation],
          }),
          throwError(new Error('It did not work')),
        ],
        [
          matchers.select.selector(selectors.getTicketAction),
          TicketAction.hold,
        ],
        ...networkProviders,
      ])
      .dispatch(startTicketPurchase(purchasePayload))
      .call.fn(cancelPurchaseServerCall)
      .put(
        showToast(
          generateErrorToastOptions('It did not work', TicketAction.hold),
        ),
      )
      .call(cancelTransaction, holdReservation)
      .run()
  })

  test('abort purchase while call to server is running', () => {
    const cancelSource = axios.CancelToken.source()
    return (
      expectSaga(purchaseTickets, purchasePayload, cancelSource)
        .provide([
          ...networkProviders,
          {
            race: () => ({ abort: true }),
          },
        ])
        //handle race so abort wins
        .call(cancelSource.cancel)
        .call(cancelPurchaseServerCall, purchaseReservation)
        .put(showToast({ title: 'purchase canceled', status: 'warning' }))
        .call(cancelTransaction, holdReservation)
        .not.put(showToast({ title: 'tickets purchased', status: 'success' }))
        .run()
    )
  })

  test('Purchase runs successfully', () => {
    const cancelSource = axios.CancelToken.source()
    return expectSaga(purchaseTickets, purchasePayload, cancelSource)
      .provide(networkProviders)
      .call(reserveTicketServerCall, purchaseReservation, cancelSource.token)
      .put(showToast({ title: 'tickets purchased', status: 'success' }))
      .put(endTransaction())
      .not.call.fn(cancelTransaction)
      .not.call.fn(cancelPurchaseServerCall)
      .not.put(showToast({ title: 'purchase canceled', status: 'warning' }))
      .run()
  })
})

describe('cancellation flow', () => {
  test.each([
    { name: 'cancel', actionCreator: startTicketRelease },
    { name: 'abort', actionCreator: startTicketAbort },
  ])('Abort event', ({ actionCreator }) => {
    return expectSaga(ticketFlow, holdAction)
      .provide(networkProviders)
      .dispatch(
        actionCreator({
          reservation: holdReservation,
          reason: 'test',
        }),
      )
      .put(showToast({ title: 'test', status: 'warning' }))
      .call(cancelTransaction, holdReservation)
      .run()
  })
  //   test('Abort event', () => {
  //     return expectSaga(ticketFlow, holdAction)
  //       .provide(networkProviders)
  //       .dispatch(
  //         startTicketAbort({
  //           reservation: holdReservation,
  //           reason: 'test',
  //         }),
  //       )
  //       .put(showToast({ title: 'test', status: 'warning' }))
  //       .call(cancelTransaction, holdReservation)
  //       .run()
  //   })

  //   test('Release event', () => {
  //     return expectSaga(ticketFlow, holdAction)
  //       .provide(networkProviders)
  //       .dispatch(
  //         startTicketRelease({
  //           reservation: holdReservation,
  //           reason: 'test',
  //         }),
  //       )
  //       .put(showToast({ title: 'test', status: 'warning' }))
  //       .call(cancelTransaction, holdReservation)
  //       .run()
  //   })
})
