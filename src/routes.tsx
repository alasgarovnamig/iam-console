/** TR: Uygulama rotaları (testler de aynı tanımı kullanır). / EN: App routes (tests reuse the same definition). */
import { Navigate, type RouteObject } from 'react-router'

import { AppLayout } from './layout/AppLayout'
import { TenantDetailPage } from './tenants/TenantDetailPage'
import { TenantsPage } from './tenants/TenantsPage'

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/tenants" replace /> },
      { path: 'tenants', element: <TenantsPage /> },
      { path: 'tenants/:id', element: <TenantDetailPage /> },
    ],
  },
]
