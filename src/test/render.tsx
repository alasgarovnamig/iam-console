/**
 * TR: Uygulamayı GERÇEK rota tanımıyla, verilen URL'den başlatır. Her test
 *     temiz bir QueryClient alır (önbellek testler arasında sızmasın) ve
 *     testlerde yeniden deneme (retry) kapalıdır.
 * EN: Boots the app with the REAL route table at the given URL. Each test gets
 *     a fresh QueryClient (no cache leaking between tests); retries are off.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router'

import { routes } from '../routes'

export function renderApp(url: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(routes, { initialEntries: [url] })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { router }
}
