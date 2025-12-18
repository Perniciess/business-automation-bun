import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Statement } from "@/types/statement"

interface Props {
  statements: Statement[]
}

export default function TimeSeriesChart({ statements }: Props) {
  if (statements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Динамика заявок по времени</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Нет данных для отображения
          </div>
        </CardContent>
      </Card>
    )
  }

  // Группируем по дням
  const dailyData = statements.reduce((acc, s) => {
    const date = new Date(s.createdAt)
    const dateKey = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    if (!acc[dateKey]) {
      acc[dateKey] = { count: 0, amount: 0 }
    }
    acc[dateKey].count += 1
    acc[dateKey].amount += s.amount
    return acc
  }, {} as Record<string, { count: number; amount: number }>)

  const sortedDates = Object.keys(dailyData).sort((a, b) => {
    return new Date(a.split('.').reverse().join('-')).getTime() - 
           new Date(b.split('.').reverse().join('-')).getTime()
  })

  const data = sortedDates.map(date => ({
    дата: date,
    'Количество заявок': dailyData[date].count,
    'Сумма заявок': Number(dailyData[date].amount.toFixed(2)),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика заявок по времени</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="дата" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="Количество заявок" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Количество заявок"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="Сумма заявок" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Сумма заявок"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

