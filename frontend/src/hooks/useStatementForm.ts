import { useState } from "react";
import type { StatementFormData } from "@/types/statement";
import { statementApi } from "@/api/statement.api";

const INITIAL_FORM_DATA: StatementFormData = {
    senderFullname: "",
    senderPassport: "",
    receiverFullname: "",
    receiverAccountNumber: "",
    receiverSwift: "",
    amount: "",
    currency: "",
};

export function useStatementForm() {
    const [formData, setFormData] = useState<StatementFormData>(INITIAL_FORM_DATA);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const updateField = (name: keyof StatementFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA);
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const submitForm = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await statementApi.createStatement(formData);
            setSuccess("✅ Заявление успешно создано!");
            resetForm();
            return true;
        } catch (err) {
            setError(`❌ ${err instanceof Error ? err.message : "Неизвестная ошибка"}`);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { formData, isLoading, error, success, updateField, submitForm, clearMessages };
}
