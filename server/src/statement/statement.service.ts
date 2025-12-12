import type { CreateStatementDTO, StatementResponse, UpdateStatementDTO } from '../../../shared/src/types/statements.types'
import { prisma } from '../config/prisma'

export class StatementService {
    /**
     * Создать новую заявку (Statement)
     */
    async createStatement(data: CreateStatementDTO): Promise<StatementResponse> {
        const { sender, receiver, amount, currency } = data

        // Проверяем или создаем отправителя
        const senderRecord = await prisma.sender.upsert({
            where: {
                senderPassport: sender.senderPassport,
            },
            update: {
                senderFullname: sender.senderFullname,
            },
            create: {
                senderFullname: sender.senderFullname,
                senderPassport: sender.senderPassport,
            },
        })

        // Проверяем или создаем получателя
        const receiverRecord = await prisma.receiver.upsert({
            where: {
                receiverAccountNumber: receiver.receiverAccountNumber,
            },
            update: {
                receiverFullname: receiver.receiverFullname,
                receiverSwift: receiver.receiverSwift,
            },
            create: {
                receiverFullname: receiver.receiverFullname,
                receiverAccountNumber: receiver.receiverAccountNumber,
                receiverSwift: receiver.receiverSwift,
            },
        })

        // Создаем заявку
        const statement = await prisma.statement.create({
            data: {
                senderId: senderRecord.id,
                receiverId: receiverRecord.id,
                amount,
                currency,
            },
            include: {
                sender: true,
                receiver: true,
            },
        })

        return {
            ...statement,
            amount: statement.amount.toString(),
        }
    }

    /**
     * Получить все заявки
     */
    async getAllStatements(): Promise<StatementResponse[]> {
        const statements = await prisma.statement.findMany({
            include: {
                sender: true,
                receiver: true,
            },
        })

        return statements.map(statement => ({
            ...statement,
            amount: statement.amount.toString(),
        }))
    }

    /**
     * Получить заявку по ID
     */
    async getStatementById(id: number): Promise<StatementResponse | null> {
        const statement = await prisma.statement.findUnique({
            where: { id },
            include: {
                sender: true,
                receiver: true,
                attachments: true,
            },
        })

        if (!statement) {
            return null
        }

        return {
            ...statement,
            amount: statement.amount.toString(),
        }
    }

    /**
     * Обновить заявку
     */
    async updateStatement(id: number, data: UpdateStatementDTO): Promise<StatementResponse | null> {
        try {
            // Проверяем существование заявки
            const existingStatement = await prisma.statement.findUnique({
                where: { id },
                include: {
                    sender: true,
                    receiver: true,
                },
            })

            if (!existingStatement) {
                return null
            }

            let senderId = existingStatement.senderId
            let receiverId = existingStatement.receiverId

            // Обновляем отправителя, если данные предоставлены
            if (data.sender) {
                // Если изменился паспорт, ищем или создаем нового отправителя
                if (data.sender.senderPassport && data.sender.senderPassport !== existingStatement.sender.senderPassport) {
                    const senderRecord = await prisma.sender.upsert({
                        where: {
                            senderPassport: data.sender.senderPassport,
                        },
                        update: {
                            senderFullname: data.sender.senderFullname || existingStatement.sender.senderFullname,
                        },
                        create: {
                            senderFullname: data.sender.senderFullname || '',
                            senderPassport: data.sender.senderPassport,
                        },
                    })
                    senderId = senderRecord.id
                }
                else if (data.sender.senderFullname) {
                    // Обновляем только имя существующего отправителя
                    await prisma.sender.update({
                        where: { id: existingStatement.senderId },
                        data: {
                            senderFullname: data.sender.senderFullname,
                        },
                    })
                }
            }

            // Обновляем получателя, если данные предоставлены
            if (data.receiver) {
                // Если изменился номер счета, ищем или создаем нового получателя
                if (data.receiver.receiverAccountNumber && data.receiver.receiverAccountNumber !== existingStatement.receiver.receiverAccountNumber) {
                    const receiverRecord = await prisma.receiver.upsert({
                        where: {
                            receiverAccountNumber: data.receiver.receiverAccountNumber,
                        },
                        update: {
                            receiverFullname: data.receiver.receiverFullname || existingStatement.receiver.receiverFullname,
                            receiverSwift: data.receiver.receiverSwift || existingStatement.receiver.receiverSwift,
                        },
                        create: {
                            receiverFullname: data.receiver.receiverFullname || '',
                            receiverAccountNumber: data.receiver.receiverAccountNumber,
                            receiverSwift: data.receiver.receiverSwift || '',
                        },
                    })
                    receiverId = receiverRecord.id
                }
                else {
                    // Обновляем существующего получателя
                    await prisma.receiver.update({
                        where: { id: existingStatement.receiverId },
                        data: {
                            ...(data.receiver.receiverFullname && { receiverFullname: data.receiver.receiverFullname }),
                            ...(data.receiver.receiverSwift && { receiverSwift: data.receiver.receiverSwift }),
                        },
                    })
                }
            }

            // Обновляем саму заявку
            const statement = await prisma.statement.update({
                where: { id },
                data: {
                    ...(senderId !== existingStatement.senderId && { senderId }),
                    ...(receiverId !== existingStatement.receiverId && { receiverId }),
                    ...(data.amount !== undefined && { amount: data.amount }),
                    ...(data.currency && { currency: data.currency }),
                    ...(data.status && { status: data.status }),
                },
                include: {
                    sender: true,
                    receiver: true,
                },
            })

            return {
                ...statement,
                amount: statement.amount.toString(),
            }
        }
        catch (error) {
            console.error('Error updating statement:', error)
            return null
        }
    }

    /**
     * Удалить заявку
     */
    async deleteStatement(id: number): Promise<boolean> {
        try {
            await prisma.statement.delete({
                where: { id },
            })
            return true
        }
        catch (error) {
            return false
        }
    }

    /**
     * Получить заявки по статусу
     */
    async getStatementsByStatus(status: string): Promise<StatementResponse[]> {
        const statements = await prisma.statement.findMany({
            where: {
                status: status as any,
            },
            include: {
                sender: true,
                receiver: true,
            },
        })

        return statements.map(statement => ({
            ...statement,
            amount: statement.amount.toString(),
        }))
    }
}

export const statementService = new StatementService()
