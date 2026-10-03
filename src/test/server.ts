/**
 * TR: Sahte backend (MSW) ve sözleşme-tipli test verisi üreticileri.
 *     `tenant()` ve `problem()` dönüş tipleri sözleşmeden gelir: backend bir
 *     alanı kaldırır/yeniden adlandırırsa bu dosya DERLENMEZ -> tüketici
 *     tarafı (consumer-side) contract güvencesi.
 * EN: Fake backend (MSW) and contract-typed fixture builders. The return types
 *     of `tenant()` and `problem()` come from the contract: if the backend
 *     removes/renames a field this file does NOT COMPILE -> consumer-side
 *     contract guarantee.
 */
import { setupServer } from 'msw/node'

import type { ProblemDetails, Tenant } from '../api/client'

export const server = setupServer()

let seq = 0

export function tenant(overrides: Partial<Tenant> = {}): Tenant {
  seq += 1
  const n = String(seq).padStart(4, '0')
  return {
    id: `01900000-0000-7000-8000-00000000${n}`,
    slug: `tenant-${n}`,
    name: `Tenant ${n}`,
    status: 'active',
    created_at: '2026-10-03T10:00:00Z',
    updated_at: '2026-10-03T10:00:00Z',
    ...overrides,
  }
}

export function problem(status: number, detail: string, field?: string): ProblemDetails {
  const kind = { 400: 'validation', 404: 'not-found', 409: 'conflict' }[status] ?? 'internal'
  return {
    type: `https://iam.dev/problems/${kind}`,
    title: kind,
    status,
    detail,
    ...(field ? { field } : {}),
  }
}
