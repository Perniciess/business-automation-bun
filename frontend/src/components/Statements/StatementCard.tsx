import type { Statement } from "@/types/statement"
import { formatDate, formatAmount } from "@/lib/dateUtils"

interface Props {
    statement: Statement
    onOpen: (s: Statement) => void
}

export default function StatementCard({ statement, onOpen }: Props) {
    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            PENDING: 'В обработке',
            APPROVED: 'Одобрено',
            REJECTED: 'Отклонено',
            COMPLETED: 'Завершено',
            FAILED: 'Отклонено',
            CANCELLED: 'Отменено',
        }
        return statusMap[status.toUpperCase()] || status
    }

    const getStatusClass = (status: string) => {
        const classMap: Record<string, string> = {
            PENDING: 'status-pending',
            APPROVED: 'status-approved',
            REJECTED: 'status-rejected',
            COMPLETED: 'status-completed',
            FAILED: 'status-rejected',
            CANCELLED: 'status-rejected',
        }
        return classMap[status.toUpperCase()] || 'status-pending'
    }

    return (
        <div 
            onClick={() => onOpen(statement)} 
            className="cursor-pointer bg-background border border-border rounded-lg p-6 transition-all hover:border-muted-foreground/50 hover:shadow-sm"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-border">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Заявление #{statement.id}
                </span>
                <span className={`status-badge ${getStatusClass(statement.status as string)} px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border`}>
                    {getStatusText(statement.status as string)}
                </span>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-3 mb-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Отправитель</span>
                    <span className="text-sm font-medium text-foreground break-words">{statement.senderFullname}</span>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Получатель</span>
                    <span className="text-sm font-medium text-foreground break-words">{statement.receiverFullname}</span>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Счёт получателя</span>
                    <span className="text-sm font-medium text-foreground break-words">{statement.receiverAccountNumber}</span>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">SWIFT код</span>
                    <span className="text-sm font-medium text-foreground break-words">{statement.receiverSwift}</span>
                </div>

                <div className="flex items-baseline gap-2.5 mt-3 pt-4 border-t border-border">
                    <span className="text-3xl font-bold text-foreground leading-none">{formatAmount(statement.amount)}</span>
                    <span className="px-2 py-1 bg-muted border border-border rounded text-xs font-semibold text-muted-foreground">
                        {statement.currency}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                    {formatDate(statement.createdAt)}
                </span>
            </div>
        </div>
    )
}
