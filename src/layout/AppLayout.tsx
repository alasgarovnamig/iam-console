/**
 * TR: Konsolun iskeleti: solda gezinme, sağda sayfa. Yeni özellikler (Users,
 *     Roles, APIs, Policies...) backend'de yazıldıkça buraya eklenecek.
 * EN: Console shell: navigation on the left, page on the right. New features
 *     (Users, Roles, APIs, Policies...) are added here as the backend ships them.
 */
import { NavLink, Outlet } from 'react-router'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <aside className="border-b border-slate-200 bg-white md:w-56 md:shrink-0 md:border-r md:border-b-0">
        <div className="px-4 py-4">
          <p className="text-sm font-semibold tracking-tight">IAM Console</p>
          <p className="text-xs text-slate-500">Identity &amp; Access Management</p>
        </div>
        <nav className="flex gap-1 px-2 pb-3 md:flex-col" aria-label="Main">
          <NavLink
            to="/tenants"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            Tenants
          </NavLink>
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  )
}
