# IAM Console

**TR:** Enterprise IAM platformunun yönetim konsolu (React + TypeScript + Vite).
**EN:** Admin console of the Enterprise IAM platform (React + TypeScript + Vite).

Backend: `../enterprise-identity-access-management` (Rust, `iam-server`).

## Sözleşme / Contract

API tipleri elle YAZILMAZ; backend'in `contracts/openapi.json` dosyasından üretilir.
API types are NEVER hand-written; they are generated from the backend's `contracts/openapi.json`.

```bash
npm run contract:gen     # tipleri yeniden üret / regenerate types
npm run contract:check   # tipler güncel mi? (build'in ilk adımı) / are types up to date? (first build step)
```

## Çalıştırma / Running

Node ≥ 20.19 gerekir (Vite 8). / Requires Node ≥ 20.19 (Vite 8).

```bash
npm install
npm run dev              # http://localhost:5173, /api -> http://127.0.0.1:8080
npm test                 # Vitest + Testing Library + MSW
npm run build
```

## Yapı / Layout

Klasörler backend gibi özellik bazlıdır / Folders are per-feature, like the backend:

- `src/api/` — sözleşmeden üretilen tipler + istemci / generated types + client
- `src/tenants/` — hook'lar, sayfalar, form ve testleri / hooks, pages, form and their tests
- `src/test/` — MSW sahte backend, sözleşme-tipli fixture'lar / MSW fake backend, contract-typed fixtures
