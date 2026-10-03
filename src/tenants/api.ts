/**
 * Tenant veri hook'ları / Tenant data hooks.
 *
 * TR: Bileşenler (component) asla doğrudan `fetch` çağırmaz; bu hook'ları
 *     kullanır. React Query; önbellek, yükleniyor/hata durumları ve
 *     "create sonrası listeyi tazele" işini üstlenir.
 *     Query key'ler hiyerarşiktir: ['tenants'] altını geçersiz kılmak
 *     (invalidate) hem listeleri hem detayları tazeler.
 * EN: Components never call `fetch` directly; they use these hooks. React Query
 *     handles caching, loading/error states and "refresh the list after create".
 *     Query keys are hierarchical: invalidating ['tenants'] refreshes both
 *     lists and details.
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, unwrap, type CreateTenantRequest } from '../api/client'

export const tenantKeys = {
  all: ['tenants'] as const,
  page: (after: string | undefined, limit: number) => ['tenants', 'page', { after, limit }] as const,
  detail: (id: string) => ['tenants', 'detail', id] as const,
}

/**
 * TR: Bir sayfa tenant. `after` = önceki sayfanın `next_cursor`'ı (ilk sayfa için undefined).
 *     `keepPreviousData`: sayfa değişirken tablo boşalıp titremesin, eski veri görünsün.
 * EN: One page of tenants. `after` = previous page's `next_cursor` (undefined for the first).
 *     `keepPreviousData`: keep showing the old page while the next loads (no flicker).
 */
export function useTenantPage(after: string | undefined, limit = 20) {
  return useQuery({
    queryKey: tenantKeys.page(after, limit),
    queryFn: () => unwrap(api.GET('/api/v1/tenants', { params: { query: { after, limit } } })),
    placeholderData: keepPreviousData,
  })
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => unwrap(api.GET('/api/v1/tenants/{id}', { params: { path: { id } } })),
  })
}

/** TR: Tenant oluşturur; başarıda tüm tenant sorgularını tazeler. / EN: Creates a tenant; refreshes all tenant queries on success. */
export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTenantRequest) => unwrap(api.POST('/api/v1/tenants', { body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tenantKeys.all }),
  })
}
