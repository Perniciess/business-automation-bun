import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Statement } from "@/types/statement"

interface Props {
  statements: Statement[]
}

export default function AmountChart({ statements }: Props) {
  if (statements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Распределение сумм</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Нет данных для отображения
          </div>
        </CardContent>
      </Card>
    )
  }

  const amounts = statements.map(s => s.amount).sort((a, b) => a - b)
  const min = amounts[0]
  const max = amounts[amounts.length - 1]
  const range = max - min

  // Разбиваем на 5 диапазонов
  const ranges = [
    { label: '0-20%', min: min, max: min + range * 0.2 },
    { label: '20-40%', min: min + range * 0.2, max: min + range * 0.4 },
    { label: '40-60%', min: min + range * 0.4, max: min + range * 0.6 },
    { label: '60-80%', min: min + range * 0.6, max: min + range * 0.8 },
    { label: '80-100%', min: min + range * 0.8, max: max },
  ]

  const data = ranges.map(range => ({
    диапазон: range.label,
    'Количество заявок': amounts.filter(a => a >= range.min && a <= range.max).length,
    'Диапазон': `${Number(range.min.toFixed(2))} - ${Number(range.max.toFixed(2))}`,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Распределение сумм по диапазонам</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="диапазон" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Количество заявок" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

