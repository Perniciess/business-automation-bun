import type { Statement, StatementFormData } from "@/types/statement"

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
        // Преобразуем плоскую структуру в вложенную, как ожидает сервер
        const payload = {
            sender: {
                senderFullname: formData.senderFullname,
                senderPassport: formData.senderPassport,
            },
            receiver: {
                receiverFullname: formData.receiverFullname,
                receiverAccountNumber: formData.receiverAccountNumber,
                receiverSwift: formData.receiverSwift,
            },
            amount: Number.parseFloat(formData.amount),
            currency: formData.currency,
        };

        const response = await fetch("/statements/create_statement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        // Safely parse JSON, fallback to text for non-JSON responses
        const contentType = response.headers.get("content-type") || ""
        let result: any
        if (contentType.includes("application/json")) {
            result = await response.json()
        } else {
            const text = await response.text()
            throw new StatementApiError(text || "Не удалось создать заявление")
        }

        if (!response.ok) {
            throw new StatementApiError(result?.error || "Не удалось создать заявление")
        }

        return { data: result.data ?? result }
    } catch (error) {
        if (error instanceof StatementApiError) {
            throw error;
        }
        throw new StatementApiError(
            error instanceof Error ? error.message : "Неизвестная ошибка сети"
        );
    }
},

    async getStatements(): Promise<ApiResponse<Statement[]>> {
        try {
            const response = await fetch("/statements/get_statements");

            const contentType = response.headers.get("content-type") || ""
            let result: any
            if (contentType.includes("application/json")) {
                result = await response.json()
            } else {
                const text = await response.text()
                throw new StatementApiError(text || "Не удалось получить список заявок")
            }

            if (!response.ok) {
                throw new StatementApiError(result?.error || "Не удалось получить список заявок")
            }

            // server returns { success, data, count }
            return { data: result.data ?? result }
        } catch (error) {
            throw new StatementApiError(
                error instanceof Error ? error.message : "Неизвестная ошибка сети"
            );
        }
    },
    async updateStatementStatus(id: number, status: string): Promise<ApiResponse<unknown>> {
        try {
            const response = await fetch(`/statements/update_statement/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })

            const contentType = response.headers.get('content-type') || ''
            let result: any
            if (contentType.includes('application/json')) {
                result = await response.json()
            } else {
                const text = await response.text()
                throw new StatementApiError(text || 'Ошибка при обновлении')
            }

            if (!response.ok) {
                throw new StatementApiError(result?.error || 'Ошибка при обновлении')
            }

            return { data: result.data ?? result }
        } catch (error) {
            throw new StatementApiError(error instanceof Error ? error.message : 'Неизвестная ошибка')
        }
    },

    async updateStatement(id: number, formData: StatementFormData): Promise<ApiResponse<unknown>> {
        try {
            // Преобразуем плоскую структуру в вложенную, как ожидает сервер
            const payload = {
                sender: {
                    senderFullname: formData.senderFullname,
                    senderPassport: formData.senderPassport,
                },
                receiver: {
                    receiverFullname: formData.receiverFullname,
                    receiverAccountNumber: formData.receiverAccountNumber,
                    receiverSwift: formData.receiverSwift,
                },
                amount: Number.parseFloat(formData.amount),
                currency: formData.currency,
            };

            const response = await fetch(`/statements/update_statement/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const contentType = response.headers.get('content-type') || ''
            let result: any
            if (contentType.includes('application/json')) {
                result = await response.json()
            } else {
                const text = await response.text()
                throw new StatementApiError(text || 'Ошибка при обновлении заявления')
            }

            if (!response.ok) {
                throw new StatementApiError(result?.error || 'Ошибка при обновлении заявления')
            }

            return { data: result.data ?? result }
        } catch (error) {
            if (error instanceof StatementApiError) {
                throw error;
            }
            throw new StatementApiError(
                error instanceof Error ? error.message : 'Неизвестная ошибка сети'
            );
        }
    }
};
