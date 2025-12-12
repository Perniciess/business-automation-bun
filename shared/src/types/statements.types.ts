import type { Status, Currency } from "../../../server/src/generated/prisma/client";

export interface CreateStatementDTO {
    sender: {
        senderFullname: string;
        senderPassport: string;
    };
    receiver: {
        receiverFullname: string;
        receiverAccountNumber: string;
        receiverSwift: string;
    };
    amount: number;
    currency: Currency;
}

export interface StatementResponse {
    id: number;
    senderId: number;
    receiverId: number;
    amount: string;
    currency: Currency;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
    sender: {
        id: number;
        senderFullname: string;
        senderPassport: string;
    };
    receiver: {
        id: number;
        receiverFullname: string;
        receiverAccountNumber: string;
        receiverSwift: string;
    };
}

export interface UpdateStatementDTO {
    sender?: {
        senderFullname?: string;
        senderPassport?: string;
    };
    receiver?: {
        receiverFullname?: string;
        receiverAccountNumber?: string;
        receiverSwift?: string;
    };
    amount?: number;
    currency?: Currency;
    status?: Status;
}
