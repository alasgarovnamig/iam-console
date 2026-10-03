/**
 * TR: Tenant listesi davranışı. Testler kullanıcının gördüğü metinler ve
 *     rollerle yazılır (CSS sınıfı veya iç state'e bakılmaz).
 * EN: Tenant list behaviour. Tests use what the user sees (text and roles),
 *     never CSS classes or internal state.
 */
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import type { TenantPage } from '../api/client'
import { problem, server, tenant } from '../test/server'
import { renderApp } from '../test/render'

describe('TenantsPage', () => {
  it('shows an empty state when the platform has no tenants', async () => {
    server.use(http.get('/api/v1/tenants', () => HttpResponse.json<TenantPage>({ items: [], next_cursor: null })))

    renderApp('/tenants')

    expect(await screen.findByText(/No tenants yet/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
  })

  it('renders one row per tenant with name, slug and status', async () => {
    const rows = [tenant({ name: 'Acme', slug: 'acme' }), tenant({ name: 'Globex', slug: 'globex', status: 'suspended' })]
    server.use(http.get('/api/v1/tenants', () => HttpResponse.json<TenantPage>({ items: rows, next_cursor: null })))

    renderApp('/tenants')

    const acme = (await screen.findByRole('link', { name: 'Acme' })).closest('tr')!
    expect(within(acme).getByText('acme')).toBeInTheDocument()
    expect(within(acme).getByText('active')).toBeInTheDocument()
    const globex = screen.getByRole('link', { name: 'Globex' }).closest('tr')!
    expect(within(globex).getByText('suspended')).toBeInTheDocument()
  })

  it('follows next_cursor forward and walks the cursor stack back', async () => {
    const page1 = [tenant({ name: 'P1' })]
    const page2 = [tenant({ name: 'P2' })]
    const requested: (string | null)[] = []
    server.use(
      http.get('/api/v1/tenants', ({ request }) => {
        const after = new URL(request.url).searchParams.get('after')
        requested.push(after)
        return HttpResponse.json<TenantPage>(
          after === null ? { items: page1, next_cursor: page1[0].id } : { items: page2, next_cursor: null },
        )
      }),
    )
    const user = userEvent.setup()
    renderApp('/tenants')

    await screen.findByRole('link', { name: 'P1' })
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('link', { name: 'P2' })).toBeInTheDocument()
    expect(screen.getByText('Page 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(await screen.findByRole('link', { name: 'P1' })).toBeInTheDocument()
    // TR: 3. istek: geri dönülen sayfa önbellekten ANINDA gösterilir, sonra
    //     arka planda tazelenir (React Query stale-while-revalidate).
    // EN: 3rd request: the page we return to is shown from cache INSTANTLY, then
    //     revalidated in the background (React Query stale-while-revalidate).
    await waitFor(() => expect(requested).toEqual([null, page1[0].id, null]))
  })

  it('shows the backend problem detail when loading fails', async () => {
    server.use(http.get('/api/v1/tenants', () => HttpResponse.json(problem(500, 'an unexpected error occurred'), { status: 500 })))

    renderApp('/tenants')

    expect(await screen.findByRole('alert')).toHaveTextContent('an unexpected error occurred')
  })

  it('opens the detail page when a tenant name is clicked', async () => {
    const t = tenant({ name: 'Acme' })
    server.use(
      http.get('/api/v1/tenants', () => HttpResponse.json<TenantPage>({ items: [t], next_cursor: null })),
      http.get('/api/v1/tenants/:id', () => HttpResponse.json(t)),
    )
    const user = userEvent.setup()
    const { router } = renderApp('/tenants')

    await user.click(await screen.findByRole('link', { name: 'Acme' }))

    await waitFor(() => expect(router.state.location.pathname).toBe(`/tenants/${t.id}`))
    expect(await screen.findByText(t.id)).toBeInTheDocument()
  })
})
