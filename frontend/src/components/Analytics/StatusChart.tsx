import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Statement } from "@/types/statement"

interface Props {
  statements: Statement[]
}

export default function StatusChart({ statements }: Props) {
  const statusCounts = statements.reduce((acc, s) => {
    const status = String(s.status).toUpperCase()
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusLabels: Record<string, string> = {
    PENDING: 'В обработке',
    APPROVED: 'Одобрено',
    REJECTED: 'Отклонено',
    COMPLETED: 'Завершено',
    FAILED: 'Отклонено',
    CANCELLED: 'Отменено',
  }

  const COLORS = ['#eab308', '#3b82f6', '#ef4444', '#22c55e', '#ef4444', '#6b7280']

  const data = Object.entries(statusCounts).map(([status, count], index) => ({
    name: statusLabels[status] || status,
    value: count,
    color: COLORS[index % COLORS.length],
  }))

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Распределение по статусам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Нет данных для отображения
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Распределение по статусам</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

