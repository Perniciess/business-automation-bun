import type { Statement } from "@/types/statement"

interface Props {
  statements: Statement[]
}

export default function StatsBar({ statements }: Props) {
  const total = statements.length

  // Normalize status to upper-case string
  const normalize = (s: Statement) => String(s.status).toUpperCase()

  const pending = statements.filter(s => normalize(s) === 'PENDING').length
  const approved = statements.filter(s => ['COMPLETED', 'APPROVED'].includes(normalize(s))).length
  const rejected = statements.filter(s => ['REJECTED', 'FAILED', 'CANCELLED'].includes(normalize(s))).length

  if (total === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-background border border-border rounded-lg p-6 flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Всего заявлений</span>
        <span className="text-4xl font-semibold text-foreground leading-none">{total}</span>
      </div>

      <div className="bg-background border border-border rounded-lg p-6 flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">В обработке</span>
        <span className="text-4xl font-semibold text-yellow-500 leading-none">{pending}</span>
      </div>

      <div className="bg-background border border-border rounded-lg p-6 flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Одобрено</span>
        <span className="text-4xl font-semibold text-green-500 leading-none">{approved}</span>
      </div>

      <div className="bg-background border border-border rounded-lg p-6 flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Отклонено</span>
        <span className="text-4xl font-semibold text-red-500 leading-none">{rejected}</span>
      </div>
    </div>
  )
}
