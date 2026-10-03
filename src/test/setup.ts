/**
 * TR: Her test dosyasından önce çalışır.
 *     - jest-dom: `toBeInTheDocument()` gibi okunaklı DOM eşleştiricileri.
 *     - MSW: ağ isteklerini Node seviyesinde yakalar. `onUnhandledRequest: 'error'`
 *       -> test, mock'lanmamış bir isteğe çıkarsa KIRILIR (sessizce gerçek
 *       backend'e gitmesin).
 * EN: Runs before every test file.
 *     - jest-dom: readable DOM matchers like `toBeInTheDocument()`.
 *     - MSW: intercepts network at the Node level. `onUnhandledRequest: 'error'`
 *       -> a test FAILS if it makes an unmocked request.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
