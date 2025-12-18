import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencySelect } from "@/components/StatementForm/CurrencySelect"
import { FormField } from "@/components/StatementForm/FormField"
import { FormMessage } from "@/components/StatementForm/FormMessage"
import { statementApi } from "@/api/statement.api"
import type { Statement, StatementFormData } from "@/types/statement"
import { useState } from "react"
import { Loader2, Save, X } from "lucide-react"

interface Props {
    statement: Statement
    onSave: () => void
    onCancel: () => void
}

export default function EditStatementForm({ statement, onSave, onCancel }: Props) {
    const [formData, setFormData] = useState<StatementFormData>({
        senderFullname: statement.senderFullname,
        senderPassport: statement.senderPassport,
        receiverFullname: statement.receiverFullname,
        receiverAccountNumber: statement.receiverAccountNumber,
        receiverSwift: statement.receiverSwift,
        amount: statement.amount.toString(),
        currency: statement.currency,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleCurrencyChange = (value: string) => {
        setFormData((prev) => ({ ...prev, currency: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            await statementApi.updateStatement(statement.id, formData)
            setSuccess("✅ Заявление успешно обновлено!")
            setTimeout(() => {
                onSave()
            }, 1000)
        } catch (err) {
            setError(`❌ ${err instanceof Error ? err.message : "Неизвестная ошибка"}`)
        } finally {
            setIsLoading(false)
        }
    }

    const clearMessages = () => {
        setError(null)
        setSuccess(null)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                onClick={onCancel}
            />

            {/* Form Content */}
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-xl shadow-2xl overflow-y-auto">
                <Card className="border-0 shadow-none">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl font-bold">Редактирование заявления</CardTitle>
                                <CardDescription>
                                    Измените данные заявления #{statement.id}
                                </CardDescription>
                            </div>
                            <button
                                onClick={onCancel}
                                className="p-2 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {(error || success) && (
                            <FormMessage
                                message={error || success || ""}
                                type={error ? "error" : "success"}
                                onDismiss={clearMessages}
                            />
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <FormField
                                id="senderFullname"
                                name="senderFullname"
                                label="ФИО отправителя"
                                placeholder="Иванов Иван Иванович"
                                value={formData.senderFullname}
                                onChange={handleInputChange}
                                required
                            />

                            <FormField
                                id="senderPassport"
                                name="senderPassport"
                                label="Номер паспорта отправителя"
                                placeholder="1234 567890"
                                value={formData.senderPassport}
                                onChange={handleInputChange}
                                required
                            />

                            <FormField
                                id="receiverFullname"
                                name="receiverFullname"
                                label="ФИО получателя"
                                placeholder="Петров Пётр Петрович"
                                value={formData.receiverFullname}
                                onChange={handleInputChange}
                                required
                            />

                            <FormField
                                id="receiverAccountNumber"
                                name="receiverAccountNumber"
                                label="Номер счёта получателя"
                                placeholder="GB29 NWBK 6016 1331 9268 19"
                                value={formData.receiverAccountNumber}
                                onChange={handleInputChange}
                                required
                            />

                            <FormField
                                id="receiverSwift"
                                name="receiverSwift"
                                label="SWIFT код банка получателя"
                                placeholder="DEUTDEFFXXX"
                                value={formData.receiverSwift}
                                onChange={handleInputChange}
                                maxLength={11}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    id="amount"
                                    name="amount"
                                    label="Сумма"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="10000.00"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                />

                                <CurrencySelect
                                    value={formData.currency}
                                    onValueChange={handleCurrencyChange}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="flex-1" 
                                    onClick={onCancel}
                                    disabled={isLoading}
                                >
                                    Отмена
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="flex-1" 
                                    size="lg" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            Сохранение...
                                        </>
                                    ) : (
                                        <>
                                            <Save />
                                            Сохранить изменения
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

