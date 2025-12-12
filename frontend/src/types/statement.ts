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
