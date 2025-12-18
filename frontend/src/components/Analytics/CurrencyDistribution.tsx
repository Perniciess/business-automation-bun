import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Statement } from "@/types/statement"

interface Props {
  statements: Statement[]
}

export default function CurrencyDistribution({ statements }: Props) {
  const currencyData = statements.reduce((acc, s) => {
    const currency = s.currency || 'UNKNOWN'
    if (!acc[currency]) {
      acc[currency] = { count: 0, total: 0 }
    }
    acc[currency].count += 1
    acc[currency].total += s.amount
    return acc
  }, {} as Record<string, { count: number; total: number }>)

  const data = Object.entries(currencyData)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([currency, data]) => ({
      currency,
      'Количество заявок': data.count,
      'Общая сумма': Number(data.total.toFixed(2)),
    }))

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Распределение по валютам</CardTitle>
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
        <CardTitle>Распределение по валютам</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="currency" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Количество заявок" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

