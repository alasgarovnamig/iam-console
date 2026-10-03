/**
 * Tenant listesi / Tenant list.
 *
 * TR: Backend keyset (cursor) sayfalama kullanır: her sayfa `next_cursor`
 *     döner. "Önceki" butonu için gezdiğimiz cursor'ları bir yığında (stack)
 *     tutarız: [undefined, c1, c2] -> şu an 3. sayfadayız; geri = pop.
 * EN: The backend uses keyset (cursor) pagination: each page returns
 *     `next_cursor`. For "Previous" we keep visited cursors on a stack:
 *     [undefined, c1, c2] -> we are on page 3; back = pop.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import type { Tenant } from '../api/client'
import { CreateTenantForm } from './CreateTenantForm'
import { useTenantPage } from './api'
import { StatusBadge } from './StatusBadge'

export function TenantsPage() {
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined])
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()
  const current = cursors[cursors.length - 1]
  const page = useTenantPage(current)

  return (
    <section>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tenants</h1>
          <p className="mt-1 text-sm text-slate-600">
            Companies using the platform. Every user, role and policy belongs to exactly one tenant.
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="shrink-0 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            New tenant
          </button>
        )}
      </header>

      {creating && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">New tenant</h2>
          <CreateTenantForm
            onCancel={() => setCreating(false)}
            onCreated={(t: Tenant) => navigate(`/tenants/${t.id}`)}
          />
        </div>
      )}

      {page.isError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load tenants: {page.error.message}
        </p>
      )}

      {page.data && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {page.data.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    No tenants yet. Create the first one to start configuring access.
                  </td>
                </tr>
              )}
              {page.data.items.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link to={`/tenants/${t.id}`} className="hover:underline">
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono whitespace-nowrap text-slate-700">{t.slug}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <nav className="flex items-center justify-between border-t border-slate-200 px-4 py-3" aria-label="Pagination">
            <span className="text-xs text-slate-500">Page {cursors.length}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCursors((c) => c.slice(0, -1))}
                disabled={cursors.length === 1}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const next = page.data?.next_cursor
                  if (next) setCursors((c) => [...c, next])
                }}
                disabled={!page.data.next_cursor}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </nav>
        </div>
      )}
    </section>
  )
}
