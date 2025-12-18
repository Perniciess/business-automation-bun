import { statementApi } from "@/api/statement.api"
import StatementCard from "@/components/Statements/StatementCard"
import StatementModal from "@/components/Statements/StatementModal"
import StatsBar from "@/components/Statements/StatsBar"
import { Button } from "@/components/ui/button"
import type { Statement } from "@/types/statement"
import { useEffect, useState } from "react"

export default function StatementsList() {
  const [statements, setStatements] = useState<Statement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Statement | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await statementApi.getStatements()
      if (res.data && Array.isArray(res.data)) {
        // Normalize server shape to frontend `Statement` shape
        const normalized = res.data.map((item: any) => {
          const sender = item.sender ?? item.senderId ? item.sender : undefined
          const receiver = item.receiver ?? item.receiverId ? item.receiver : undefined

          const amountNum = typeof item.amount === 'string' ? Number.parseFloat(item.amount) : Number(item.amount)

          // map server status enums to frontend statuses - keep original status for display
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

  useEffect(() => { load() }, [])

  const updateStatus = async (id: number, status: string) => {
    try {
      await statementApi.updateStatementStatus(id, status)
      await load()
      setSelected(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
      throw err
    }
  }

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selected) {
        setSelected(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selected])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-background border border-border rounded-lg p-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-1">Заявления</h1>
            <p className="text-sm text-muted-foreground">Управление вашими запросами на перевод</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => load()} disabled={isLoading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Обновить
            </Button>
          </div>
        </header>

        {/* Loading */}
        {isLoading && (
          <div className="bg-background border border-border rounded-lg p-16 text-center">
            <div className="w-10 h-10 border-3 border-border border-t-foreground rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Загрузка заявлений...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-8 text-sm font-medium">
            ❌ {error}
          </div>
        )}

        {/* Stats Bar */}
        {!isLoading && statements.length > 0 && <StatsBar statements={statements} />}

        {/* Statements Grid */}
        {!isLoading && statements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {statements.map(s => (
              <StatementCard key={s.id} statement={s} onOpen={setSelected} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && statements.length === 0 && (
          <div className="bg-background border border-border rounded-lg p-20 text-center">
            <div className="mb-6 text-muted-foreground">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="7" y1="9" x2="17" y2="9"/>
                <line x1="7" y1="13" x2="13" y2="13"/>
                <line x1="7" y1="17" x2="15" y2="17"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Заявлений пока нет</h2>
          </div>
        )}

        {/* Modal */}
        <StatementModal 
          statement={selected} 
          onClose={() => setSelected(null)} 
          onUpdateStatus={updateStatus} 
          onReload={() => load()} 
        />
      </div>
    </div>
  )
}
