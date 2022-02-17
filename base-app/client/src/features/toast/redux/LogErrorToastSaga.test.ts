/* eslint-disable prettier/prettier */
import { expectSaga } from 'redux-saga-test-plan'

import { ToastOptions } from '../types'
import { logErrorToast, logErrorToasts } from './LogErrorToastSaga'

const errorToastOptions: ToastOptions = {
  title: "It's time to panic",
  status: 'error',
}

const errorToastAction = {
  type: 'test',
  payload: errorToastOptions,
}

// I can use either the return option or async/await for the tests using expectSaga
test('Saga console error when it receives error toast', async () => {
  await expectSaga(logErrorToasts, errorToastAction)
    .call(logErrorToast, "It's time to panic")
    .run()
})

const successToastOption: ToastOptions = {
  title: "Everything's fine",
  status: 'success',
}

const successToastAction = {
  type: 'test',
  payload: successToastOption,
}

test('Saga doesnt console anything when it receives successful toast', () => {
  return expectSaga(logErrorToasts, successToastAction)
    .not.call.fn(logErrorToast)
    .run()
})
