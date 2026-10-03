/**
 * TR: Tek tenant detayı. İleride bu sayfaya tenant'ın kullanıcıları, rolleri,
 *     API kayıtları ve policy'leri sekme olarak eklenecek.
 * EN: Single tenant details. Later the tenant's users, roles, API registrations
 *     and policies will be added here as tabs.
 */
import { Link, useParams } from 'react-router'

import { ApiError } from '../api/client'
import { useTenant } from './api'
import { StatusBadge } from './StatusBadge'

export function TenantDetailPage() {
  const { id = '' } = useParams()
  const tenant = useTenant(id)

  return (
    <section>
      <Link to="/tenants" className="text-sm text-slate-600 hover:text-slate-900">
        ← Tenants
      </Link>

      {tenant.isPending && <p className="mt-6 text-sm text-slate-500">Loading…</p>}

      {tenant.isError && (
        <p role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {tenant.error instanceof ApiError && tenant.error.problem.status === 404
            ? 'This tenant does not exist.'
            : tenant.error.message}
        </p>
      )}

      {tenant.data && (
        <>
          <header className="mt-3 mb-6 flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-900">{tenant.data.name}</h1>
            <StatusBadge status={tenant.data.status} />
          </header>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-sm sm:grid-cols-2">
            <Item label="Slug" value={tenant.data.slug} mono />
            <Item label="Tenant ID" value={tenant.data.id} mono />
            <Item label="Created" value={new Date(tenant.data.created_at).toLocaleString()} />
            <Item label="Updated" value={new Date(tenant.data.updated_at).toLocaleString()} />
          </dl>
        </>
      )}
    </section>
  )
}

function Item({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-1 break-all text-slate-900 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
