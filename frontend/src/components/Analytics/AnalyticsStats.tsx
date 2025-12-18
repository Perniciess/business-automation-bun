import { Card, CardContent } from "@/components/ui/card"
import type { Statement } from "@/types/statement"
import { formatAmount } from "@/lib/dateUtils"

interface Props {
  statements: Statement[]
}

export default function AnalyticsStats({ statements }: Props) {
  const totalAmount = statements.reduce((sum, s) => sum + s.amount, 0)
  const completedAmount = statements
    .filter(s => String(s.status).toUpperCase() === 'COMPLETED')
    .reduce((sum, s) => sum + s.amount, 0)
  
  const avgAmount = statements.length > 0 ? totalAmount / statements.length : 0
  const completedCount = statements.filter(s => String(s.status).toUpperCase() === 'COMPLETED').length
  const completionRate = statements.length > 0 ? (completedCount / statements.length) * 100 : 0

  const stats = [
    {
      label: "Всего заявок",
      value: statements.length,
      description: "Общее количество заявок",
    },
    {
      label: "Общая сумма",
      value: formatAmount(totalAmount),
      description: "Сумма всех заявок",
    },
    {
      label: "Завершено",
      value: completedCount,
      description: "Успешно завершенных заявок",
    },
    {
      label: "Средняя сумма",
      value: formatAmount(avgAmount),
      description: "Средняя сумма заявки",
    },
    {
      label: "Сумма завершенных",
      value: formatAmount(completedAmount),
      description: "Сумма завершенных переводов",
    },
    {
      label: "Процент завершения",
      value: `${completionRate.toFixed(1)}%`,
      description: "Доля завершенных заявок",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-2xl font-semibold text-foreground mb-1">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.description}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

