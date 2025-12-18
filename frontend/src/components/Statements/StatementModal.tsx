import { Button } from "@/components/ui/button"
import type { Statement } from "@/types/statement"
import { useEffect, useState } from "react"
import { formatFullDate, formatAmount } from "@/lib/dateUtils"
import EditStatementForm from "./EditStatementForm"

interface Props {
    statement: Statement | null
    onClose: () => void
    onUpdateStatus: (id: number, status: string) => Promise<void>
    onReload: () => void
}

export default function StatementModal({ statement, onClose, onUpdateStatus, onReload }: Props) {
    const [isUpdating, setIsUpdating] = useState(false)
    const [status, setStatus] = useState<string | null>(statement?.status ?? null)
    const [isEditing, setIsEditing] = useState(false)

    // Синхронизируем статус, если открываем новое заявление
    useEffect(() => {
        if (statement) setStatus(String(statement.status).toUpperCase())
    }, [statement])

    if (!statement || !status) return null

    const getStatusText = (s: string) => {
        const statusMap: Record<string, string> = {
            PENDING: 'В обработке',
            APPROVED: 'Одобрено',
            REJECTED: 'Отклонено',
            COMPLETED: 'Завершено',
            FAILED: 'Отклонено',
            CANCELLED: 'Отменено',
        }
        return statusMap[s.toUpperCase()] || s
    }

    const getStatusClass = (s: string) => {
        const classMap: Record<string, string> = {
            PENDING: 'status-pending',
            APPROVED: 'status-approved',
            REJECTED: 'status-rejected',
            COMPLETED: 'status-completed',
            FAILED: 'status-rejected',
            CANCELLED: 'status-rejected',
        }
        return classMap[s.toUpperCase()] || 'status-pending'
    }

    const handleUpdateStatus = async (nextStatus: string) => {
        if (isUpdating) return

        const statusText = getStatusText(nextStatus)
        if (!window.confirm(`Вы уверены, что хотите установить статус «${statusText}»?`)) return

        try {
            setIsUpdating(true)
            await onUpdateStatus(statement.id, nextStatus)
            setStatus(nextStatus)
            onReload()
        } catch (e) {
            alert(e instanceof Error ? e.message : "Ошибка обновления статуса")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleGenerateReport = (type: 'receipt' | 'print') => {
        if (type === 'print') {
            const url = `/statements/${statement.id}/print`
            window.open(url, '_blank')
        } else {
            const url = `/statements/${statement.id}/receipt`
            window.open(url, '_blank')
        }
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleEditSave = () => {
        setIsEditing(false)
        onReload()
    }

    const handleEditCancel = () => {
        setIsEditing(false)
    }

    // Show edit form if editing
    if (isEditing && statement) {
        return (
            <EditStatementForm 
                statement={statement} 
                onSave={handleEditSave}
                onCancel={handleEditCancel}
            />
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-xl shadow-2xl overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground mb-1">
                            Заявление #<span>{statement.id}</span>
                        </h2>
                        <p className="text-sm text-muted-foreground">Детальная информация о заявлении</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Status */}
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Статус:</span>
                        <span className={`status-badge ${getStatusClass(status)} px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border`}>
                            {getStatusText(status)}
                        </span>
                    </div>

                    {/* Sender Info */}
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-foreground mb-4">Информация об отправителе</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">ФИО отправителя</span>
                                <span className="text-sm font-medium text-foreground">{statement.senderFullname}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">Номер паспорта</span>
                                <span className="text-sm font-medium text-foreground">{statement.senderPassport}</span>
                            </div>
                        </div>
                    </div>

                    {/* Receiver Info */}
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-foreground mb-4">Информация о получателе</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">ФИО получателя</span>
                                <span className="text-sm font-medium text-foreground">{statement.receiverFullname}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">Номер счёта</span>
                                <span className="text-sm font-medium text-foreground">{statement.receiverAccountNumber}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">SWIFT код банка</span>
                                <span className="text-sm font-medium text-foreground">{statement.receiverSwift}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-foreground mb-4">Сумма перевода</h3>
                        <div className="flex items-baseline gap-3 p-4 bg-muted border border-border rounded-lg">
                            <span className="text-3xl font-bold text-foreground leading-none">{formatAmount(statement.amount)}</span>
                            <span className="px-2 py-1 bg-background border border-border rounded text-xs font-semibold text-muted-foreground">
                                {statement.currency}
                            </span>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div>
                        <h3 className="text-base font-semibold text-foreground mb-4">Временные метки</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">Создано</span>
                                <span className="text-sm font-medium text-foreground">
                                    {formatFullDate(statement.createdAt)}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">Обновлено</span>
                                <span className="text-sm font-medium text-foreground">
                                    {formatFullDate(statement.updatedAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-4 p-6 border-t border-border">
                    {/* Edit Button - скрываем для завершенных заявлений */}
                    {status !== 'COMPLETED' && (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEdit}
                                className="flex-1"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Редактировать
                            </Button>
                        </div>
                    )}

                    {/* Status Actions - скрываем для завершенных заявлений */}
                    {status !== 'COMPLETED' && (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus("COMPLETED")}
                                className="flex-1 bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                Завершить
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus("FAILED")}
                                className="flex-1 bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                Отклонить
                            </Button>
                        </div>
                    )}

                    {/* Report Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateReport('receipt')}
                            disabled={status !== 'COMPLETED'}
                            className="flex-1"
                            title={status !== 'COMPLETED' ? 'Квитанцию можно распечатать только после завершения перевода' : ''}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="12" y1="18" x2="12" y2="12"/>
                                <line x1="9" y1="15" x2="15" y2="15"/>
                            </svg>
                            Квитанция
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleGenerateReport('print')}
                            className="flex-1"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 9V2h12v7"/>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                                <path d="M6 14h12v8H6z"/>
                            </svg>
                            Печать заявления
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
