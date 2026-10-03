/**
 * TR: Uygulama girişi: React Query istemcisi + router.
 * EN: App entry: React Query client + router.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router'

import './index.css'
import { routes } from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    // TR: 4xx hatalarını tekrar denemek anlamsız (aynı cevap gelir).
    // EN: Retrying 4xx errors is pointless (same answer every time).
    queries: { retry: 1, staleTime: 10_000 },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={createBrowserRouter(routes)} />
    </QueryClientProvider>
  </StrictMode>,
)
