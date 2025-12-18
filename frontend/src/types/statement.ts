export interface StatementFormData {
    senderFullname: string;
    senderPassport: string;
    receiverFullname: string;
    receiverAccountNumber: string;
    receiverSwift: string;
    amount: string;
    currency: string;
}

export interface StatementPayload {
    senderFullname: string;
    senderPassport: string;
    receiverFullname: string;
    receiverAccountNumber: string;
    receiverSwift: string;
    amount: number;
    currency: string;
}

export type Currency = "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CNY" | "CHF" | "CAD" | "AUD";


export interface Statement {
    id: number;
    senderFullname: string;
    senderPassport: string;
    receiverFullname: string;
    receiverAccountNumber: string;
    receiverSwift: string;
    amount: number;
    currency: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "FAILED" | "CANCELLED" | "pending" | "completed" | "rejected";
    createdAt: Date | string;
    updatedAt: Date | string;
}
