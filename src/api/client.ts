/**
 * Backend API istemcisi / Backend API client.
 *
 * TR: MİMARİ NOT — Frontend ile backend arasındaki sözleşme
 *     `enterprise-identity-access-management/contracts/openapi.json` dosyasıdır.
 *     `npm run contract:gen` bu dosyadan `schema.d.ts` tiplerini üretir;
 *     `openapi-fetch` bu tipleri kullanarak HER isteği derleme anında denetler:
 *     yanlış path, eksik alan veya yanlış tip -> TypeScript hatası.
 *     Backend API'yi değiştirirse `npm run contract:check` (build'in ilk adımı)
 *     kırılır ve frontend'in güncellenmesi gerektiğini söyler.
 * EN: ARCHITECTURE NOTE — the frontend/backend contract is
 *     `enterprise-identity-access-management/contracts/openapi.json`.
 *     `npm run contract:gen` turns it into `schema.d.ts`; `openapi-fetch` uses
 *     those types to check EVERY request at compile time: wrong path, missing
 *     field or wrong type -> TypeScript error. If the backend changes the API,
 *     `npm run contract:check` (first step of the build) fails.
 */
import createClient from 'openapi-fetch'

import type { components, paths } from './schema'

/** TR: Sözleşmeden gelen tipler için kısa adlar. / EN: Short aliases for contract types. */
export type Tenant = components['schemas']['TenantResponse']
export type TenantPage = components['schemas']['TenantPage']
export type CreateTenantRequest = components['schemas']['CreateTenantRequest']
export type ProblemDetails = components['schemas']['ProblemDetails']

/**
 * TR: `baseUrl` mutlak olmalı: test ortamında (Node fetch) göreli URL çözülmez.
 *     Geliştirmede origin Vite'tır ve `/api` backend'e proxy'lenir.
 * EN: `baseUrl` must be absolute: Node's fetch (tests) cannot resolve relative
 *     URLs. In development the origin is Vite, which proxies `/api` to the backend.
 */
export const api = createClient<paths>({
  baseUrl: window.location.origin,
  // TR: `fetch`'i HER çağrıda globalThis'ten oku. openapi-fetch varsayılan olarak
  //     `fetch`'i modül yüklenirken bir kez yakalar; testlerde MSW fetch'i daha
  //     sonra yamadığı için istekler mock'a hiç uğramaz.
  // EN: Read `fetch` from globalThis on EVERY call. openapi-fetch captures it once
  //     at module load by default; MSW patches fetch later in tests, so requests
  //     would bypass the mocks.
  fetch: (request) => globalThis.fetch(request),
})

/**
 * TR: Backend'in RFC 7807 hata gövdesini taşıyan Error. UI, `problem.field`'a
 *     bakarak hatayı doğru form alanının altında gösterir.
 * EN: Error carrying the backend's RFC 7807 body. The UI uses `problem.field`
 *     to show the error under the right form input.
 */
export class ApiError extends Error {
  readonly problem: ProblemDetails

  constructor(problem: ProblemDetails) {
    super(problem.detail)
    this.name = 'ApiError'
    this.problem = problem
  }
}

/**
 * TR: openapi-fetch `{ data, error }` döner. React Query ise hata durumunda
 *     `throw` bekler. Bu fonksiyon ikisini birleştirir: başarıda veriyi döner,
 *     hatada `ApiError` fırlatır. Gövdesi problem+json değilse (örn. backend
 *     kapalı, proxy 502) yine anlamlı bir ProblemDetails üretir.
 * EN: openapi-fetch returns `{ data, error }`; React Query expects a `throw`.
 *     This bridges them: returns data on success, throws `ApiError` otherwise.
 *     If the body isn't problem+json (backend down, proxy 502) it still builds
 *     a meaningful ProblemDetails.
 */
export async function unwrap<T>(
  call: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await call
  if (response.ok) {
    return data as T
  }
  if (isProblem(error)) {
    throw new ApiError(error)
  }
  throw new ApiError({
    type: 'about:blank',
    title: response.statusText || 'Request failed',
    status: response.status,
    detail: `The server responded with HTTP ${response.status}.`,
  })
}

function isProblem(value: unknown): value is ProblemDetails {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'status' in value &&
    'detail' in value
  )
}
