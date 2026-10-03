/**
 * TR: Tenant oluşturma akışı. Backend'in olası HER hata cevabının ekranda
 *     DOĞRU yerde göründüğünü tablo (permütasyon) ile test eder.
 * EN: Create-tenant flow. A table (permutation) test checks that EVERY possible
 *     backend error shows up in the RIGHT place on screen.
 */
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import type { CreateTenantRequest, ProblemDetails, TenantPage } from '../api/client'
import { problem, server, tenant } from '../test/server'
import { renderApp } from '../test/render'

async function openFormAndSubmit(values: CreateTenantRequest) {
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: 'New tenant' }))
  await user.type(screen.getByLabelText('Name'), values.name)
  await user.type(screen.getByLabelText('Slug'), values.slug)
  await user.click(screen.getByRole('button', { name: 'Create tenant' }))
}

function emptyList() {
  return http.get('/api/v1/tenants', () => HttpResponse.json<TenantPage>({ items: [], next_cursor: null }))
}

describe('CreateTenantForm', () => {
  it('sends exactly the typed values and navigates to the new tenant', async () => {
    const created = tenant({ slug: 'acme', name: 'Acme' })
    let sent: unknown
    server.use(
      emptyList(),
      http.post('/api/v1/tenants', async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json(created, { status: 201 })
      }),
      http.get('/api/v1/tenants/:id', () => HttpResponse.json(created)),
    )
    const { router } = renderApp('/tenants')

    await openFormAndSubmit({ slug: 'acme', name: 'Acme' })

    await waitFor(() => expect(router.state.location.pathname).toBe(`/tenants/${created.id}`))
    expect(sent).toEqual({ slug: 'acme', name: 'Acme' })
  })

  /**
   * TR: [backend cevabı] -> [mesajın görünmesi gereken yer]
   *     slug/name alan hataları ve 409 ilgili input'un altında, input
   *     `aria-invalid` olur; diğer her şey formun üstünde genel uyarıdır.
   * EN: [backend response] -> [where the message must appear]
   */
  const cases: { title: string; response: ProblemDetails; shownUnder: 'Slug' | 'Name' | 'alert' }[] = [
    { title: '400 on slug', response: problem(400, 'must not contain consecutive hyphens', 'slug'), shownUnder: 'Slug' },
    { title: '400 on name', response: problem(400, 'must not be empty', 'name'), shownUnder: 'Name' },
    { title: '409 slug taken', response: problem(409, 'tenant slug `acme` is already taken'), shownUnder: 'Slug' },
    { title: '400 on body', response: problem(400, 'Failed to deserialize the JSON body', 'body'), shownUnder: 'alert' },
    { title: '500 internal', response: problem(500, 'an unexpected error occurred'), shownUnder: 'alert' },
  ]

  it.each(cases)('$title -> message shown under $shownUnder', async ({ response, shownUnder }) => {
    server.use(emptyList(), http.post('/api/v1/tenants', () => HttpResponse.json(response, { status: response.status })))
    renderApp('/tenants')

    await openFormAndSubmit({ slug: 'acme', name: 'Acme' })

    const message = await screen.findByText(response.detail)
    if (shownUnder === 'alert') {
      expect(screen.getByRole('alert')).toHaveTextContent(response.detail)
      expect(screen.getByLabelText('Slug')).not.toHaveAttribute('aria-invalid')
      expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid')
    } else {
      const input = screen.getByLabelText(shownUnder)
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', message.id)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    }
  })

  it('cancel closes the form without calling the API', async () => {
    server.use(emptyList())
    const user = userEvent.setup()
    renderApp('/tenants')

    await user.click(await screen.findByRole('button', { name: 'New tenant' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('form', { name: 'Create tenant' })).not.toBeInTheDocument()
  })
})
