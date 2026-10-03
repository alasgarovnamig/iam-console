/** TR: Tenant durum rozeti. / EN: Tenant status badge. */
const styles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  suspended: 'bg-amber-50 text-amber-800 ring-amber-200',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[status] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
      }`}
    >
      {status}
    </span>
  )
}
