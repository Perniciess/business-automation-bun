import type { StatementFormData, StatementPayload } from "@/types/statement";

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

class StatementApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "StatementApiError";
    }
}

export const statementApi = {
    async createStatement(formData: StatementFormData): Promise<ApiResponse<unknown>> {
        try {
            const payload: StatementPayload = {
                ...formData,
                amount: Number.parseFloat(formData.amount),
            };

            const response = await fetch("/statement/create_statement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new StatementApiError(result.error || "Не удалось создать заявление");
            }

            return { data: result };
        } catch (error) {
            if (error instanceof StatementApiError) {
                throw error;
            }
            throw new StatementApiError(
                error instanceof Error ? error.message : "Неизвестная ошибка сети"
            );
        }
    },
};
