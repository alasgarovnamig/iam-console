/**
 * Tenant oluşturma formu / Create-tenant form.
 *
 * TR: Doğrulama kurallarının TEK kaynağı backend'dir (model.rs). Burada slug
 *     kuralını tekrar yazmıyoruz; aksi halde iki kural seti zamanla ayrışır.
 *     Backend 400 döndüğünde `problem.field` hangi input'un hatalı olduğunu
 *     söyler ve mesaj o input'un altında gösterilir. 409 (slug alınmış) da
 *     slug alanına bağlanır. Diğer hatalar formun üstünde genel uyarı olur.
 * EN: The backend (model.rs) is the SINGLE source of validation rules. We do not
 *     re-implement the slug rule here; two rule sets would drift apart. On 400,
 *     `problem.field` names the offending input and the message is shown under
 *     it. A 409 (slug taken) is attached to the slug input too. Anything else
 *     becomes a general alert above the form.
 */
import { useState, type FormEvent } from 'react'

import { ApiError, type Tenant } from '../api/client'
import { useCreateTenant } from './api'

type Props = {
  onCreated: (tenant: Tenant) => void
  onCancel: () => void
}

type FieldName = 'slug' | 'name'

export function CreateTenantForm({ onCreated, onCancel }: Props) {
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const create = useCreateTenant()

  const { fieldErrors, generalError } = describeError(create.error)

  function submit(e: FormEvent) {
    e.preventDefault()
    create.mutate({ slug, name }, { onSuccess: onCreated })
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-label="Create tenant" noValidate>
      {generalError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {generalError}
        </p>
      )}

      <Field
        id="tenant-name"
        label="Name"
        hint="Shown in the console and on login screens."
        value={name}
        onChange={setName}
        error={fieldErrors.name}
        placeholder="Acme Corporation"
      />
      <Field
        id="tenant-slug"
        label="Slug"
        hint="3–63 lowercase letters, digits or hyphens. Used in URLs and token issuers; cannot be changed later."
        value={slug}
        onChange={setSlug}
        error={fieldErrors.slug}
        placeholder="acme"
        mono
      />

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {create.isPending ? 'Creating…' : 'Create tenant'}
        </button>
      </div>
    </form>
  )
}

/**
 * TR: Backend hatasını "hangi alana ne yazılacak" bilgisine çevirir.
 * EN: Translates a backend error into "what to show under which input".
 */
function describeError(error: Error | null): {
  fieldErrors: Partial<Record<FieldName, string>>
  generalError?: string
} {
  if (!error) return { fieldErrors: {} }
  if (!(error instanceof ApiError)) return { fieldErrors: {}, generalError: error.message }

  const { problem } = error
  if (problem.status === 400 && (problem.field === 'slug' || problem.field === 'name')) {
    return { fieldErrors: { [problem.field]: problem.detail } }
  }
  if (problem.status === 409) {
    return { fieldErrors: { slug: problem.detail } }
  }
  return { fieldErrors: {}, generalError: problem.detail }
}

type FieldProps = {
  id: string
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  mono?: boolean
}

function Field({ id, label, hint, value, onChange, error, placeholder, mono }: FieldProps) {
  const describedBy = error ? `${id}-error` : `${id}-hint`
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:ring-red-200'
            : 'border-slate-300 focus:border-slate-500 focus:ring-slate-200'
        } ${mono ? 'font-mono' : ''}`}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  )
}
