import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStatementForm } from "@/hooks/useStatementForm";
import { Loader2, Send } from "lucide-react";
import { CurrencySelect } from "./CurrencySelect";
import { FormField } from "./FormField";
import { FormMessage } from "./FormMessage";

function StatementForm() {
    const { formData, isLoading, error, success, updateField, submitForm, clearMessages } =
        useStatementForm();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitForm();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateField(e.target.name as keyof typeof formData, e.target.value);
    };

    const handleCurrencyChange = (value: string) => {
        updateField("currency", value);
    };

    return (
        <div className="w-full flex justify-center p-6">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Создание заявления</CardTitle>
                    <CardDescription>
                        Подайте новый запрос на международный перевод
                    </CardDescription>
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

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Отправка...
                                </>
                            ) : (
                                <>
                                    <Send />
                                    Отправить заявление
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default StatementForm;
