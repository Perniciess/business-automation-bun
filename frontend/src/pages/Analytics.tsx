import { useEffect, useState } from "react"
import { statementApi } from "@/api/statement.api"
import type { Statement } from "@/types/statement"
import AnalyticsStats from "@/components/Analytics/AnalyticsStats"
import StatusChart from "@/components/Analytics/StatusChart"
import AmountChart from "@/components/Analytics/AmountChart"
import CurrencyDistribution from "@/components/Analytics/CurrencyDistribution"
import TimeSeriesChart from "@/components/Analytics/TimeSeriesChart"

export default function Analytics() {
  const [statements, setStatements] = useState<Statement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await statementApi.getStatements()
      if (res.data && Array.isArray(res.data)) {
        const normalized = res.data.map((item: any) => {
          const sender = item.sender ?? item.senderId ? item.sender : undefined
          const receiver = item.receiver ?? item.receiverId ? item.receiver : undefined
          const amountNum = typeof item.amount === 'string' ? Number.parseFloat(item.amount) : Number(item.amount)
          const rawStatus = String(item.status || 'PENDING').toUpperCase()
          const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED', 'CANCELLED'] as const
          const status = validStatuses.includes(rawStatus as any) ? rawStatus : 'PENDING'

          return {
            id: Number(item.id),
            senderFullname: sender?.senderFullname ?? item.senderFullname ?? '',
            senderPassport: sender?.senderPassport ?? item.senderPassport ?? '',
            receiverFullname: receiver?.receiverFullname ?? item.receiverFullname ?? '',
            receiverAccountNumber: receiver?.receiverAccountNumber ?? item.receiverAccountNumber ?? '',
            receiverSwift: receiver?.receiverSwift ?? item.receiverSwift ?? '',
            amount: Number.isFinite(amountNum) ? amountNum : 0,
            currency: item.currency ?? '',
            status: status as Statement['status'],
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          } as Statement
        })
        setStatements(normalized)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-3 border-border border-t-foreground rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4">
          Ошибка загрузки данных: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Аналитика</h1>
        <p className="text-muted-foreground">Визуализация данных по заявкам</p>
      </div>

      <div className="space-y-6">
        <AnalyticsStats statements={statements} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusChart statements={statements} />
          <CurrencyDistribution statements={statements} />
        </div>

        <AmountChart statements={statements} />
        <TimeSeriesChart statements={statements} />
      </div>
    </div>
  )
}

