import type { CreateStatementDTO, UpdateStatementDTO } from '../../../shared/src/types/statements.types'
import { Hono } from 'hono'
import { statementService } from './statement.service'
import { PDFService } from '../pdf/pdf.service'

export const statementRoutes = new Hono()

/**
 * POST /statements - Создать новую заявку
 */
statementRoutes.post('/create_statement', async (c) => {
    try {
        const body = await c.req.json<CreateStatementDTO>()

        // Валидация обязательных полей
        if (!body.sender?.senderFullname || !body.sender?.senderPassport) {
            return c.json({ error: 'Sender information is required' }, 400)
        }

        if (!body.receiver?.receiverFullname || !body.receiver?.receiverAccountNumber || !body.receiver?.receiverSwift) {
            return c.json({ error: 'Receiver information is required' }, 400)
        }

        if (!body.amount || body.amount <= 0) {
            return c.json({ error: 'Amount must be greater than 0' }, 400)
        }

        if (!body.currency) {
            return c.json({ error: 'Currency is required' }, 400)
        }

        const statement = await statementService.createStatement(body)

        return c.json({
            success: true,
            data: statement,
        }, 201)
    }
    catch (error) {
        console.error('Error creating statement:', error)
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create statement',
        }, 500)
    }
})

/**
 * GET /statements - Получить все заявки
 */
statementRoutes.get('/get_statements', async (c) => {
    try {
        const status = c.req.query('status')

        let statements
        if (status) {
            statements = await statementService.getStatementsByStatus(status)
        }
        else {
            statements = await statementService.getAllStatements()
        }

        return c.json({
            success: true,
            data: statements,
            count: statements.length,
        })
    }
    catch (error) {
        console.error('Error fetching statements:', error)
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch statements',
        }, 500)
    }
})

/**
 * GET /statements/:id - Получить заявку по ID
 */
statementRoutes.get('/get_statement/:id', async (c) => {
    try {
        const id = Number.parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid ID' }, 400)
        }

        const statement = await statementService.getStatementById(id)

        if (!statement) {
            return c.json({ error: 'Statement not found' }, 404)
        }

        return c.json({
            success: true,
            data: statement,
        })
    }
    catch (error) {
        console.error('Error fetching statement:', error)
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch statement',
        }, 500)
    }
})

/**
 * PATCH /statements/:id - Частично обновить заявку
 */
statementRoutes.patch('/update_statement/:id', async (c) => {
    try {
        const id = Number.parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid ID' }, 400)
        }

        const body = await c.req.json<UpdateStatementDTO>()

        // Валидация: хотя бы одно поле должно быть для обновления
        if (!body.sender && !body.receiver && body.amount === undefined && !body.currency && !body.status) {
            return c.json({ error: 'At least one field is required for update' }, 400)
        }

        // Валидация amount
        if (body.amount !== undefined && body.amount <= 0) {
            return c.json({ error: 'Amount must be greater than 0' }, 400)
        }

        const statement = await statementService.updateStatement(id, body)

        if (!statement) {
            return c.json({ error: 'Statement not found' }, 404)
        }

        return c.json({
            success: true,
            data: statement,
            message: 'Statement updated successfully',
        })
    }
    catch (error) {
        console.error('Error updating statement:', error)
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update statement',
        }, 500)
    }
})

/**
 * PUT /statements/:id - Полностью заменить заявку
 */
statementRoutes.put('/:id', async (c) => {
    try {
        const id = Number.parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid ID' }, 400)
        }

        const body = await c.req.json<CreateStatementDTO>()

        // Валидация всех обязательных полей
        if (!body.sender?.senderFullname || !body.sender?.senderPassport) {
            return c.json({ error: 'Sender information is required' }, 400)
        }

        if (!body.receiver?.receiverFullname || !body.receiver?.receiverAccountNumber || !body.receiver?.receiverSwift) {
            return c.json({ error: 'Receiver information is required' }, 400)
        }

        if (!body.amount || body.amount <= 0) {
            return c.json({ error: 'Amount must be greater than 0' }, 400)
        }

        if (!body.currency) {
            return c.json({ error: 'Currency is required' }, 400)
        }

        // Формируем полное обновление
        const updateData: UpdateStatementDTO = {
            sender: body.sender,
            receiver: body.receiver,
            amount: body.amount,
            currency: body.currency,
        }

        const statement = await statementService.updateStatement(id, updateData)

        if (!statement) {
            return c.json({ error: 'Statement not found' }, 404)
        }

        return c.json({
            success: true,
            data: statement,
            message: 'Statement replaced successfully',
        })
    }
    catch (error) {
        console.error('Error replacing statement:', error)
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to replace statement',
        }, 500)
    }
})

/**
 * DELETE /statements/:id - Удалить заявку
 */
statementRoutes.delete('/delete_statement/:id', async (c) => {
    try {
        const id = Number.parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid ID' }, 400)
        }

        const deleted = await statementService.deleteStatement(id)

        if (!deleted) {
            return c.json({ error: 'Statement not found' }, 404)
        }

        return c.json({
            success: true,
            message: 'Statement deleted successfully',
        })
    }
    catch (error) {
        console.error('Error deleting statement:', error)
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete statement',
        }, 500)
    }
})

/**
 * GET /statements/:id/print - Получить PDF заявления
 */
statementRoutes.get('/:id/print', async (c) => {
    try {
        const id = Number.parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid ID' }, 400)
        }

        const statement = await statementService.getStatementById(id)

        if (!statement) {
            return c.json({ error: 'Statement not found' }, 404)
        }

        const doc = PDFService.generateStatement(statement)
        const pdfBuffer = await PDFService.pdfToBuffer(doc)

        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="statement_${id}.pdf"`,
            },
        })
    }
    catch (error) {
        console.error('Error generating PDF:', error)
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate PDF',
        }, 500)
    }
})

/**
 * GET /statements/:id/receipt - Получить PDF квитанции
 */
statementRoutes.get('/:id/receipt', async (c) => {
    try {
        const id = Number.parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid ID' }, 400)
        }

        const statement = await statementService.getStatementById(id)

        if (!statement) {
            return c.json({ error: 'Statement not found' }, 404)
        }

        // Проверка статуса: квитанцию можно распечатать только если перевод выполнен
        if (statement.status !== 'COMPLETED') {
            return c.json({
                success: false,
                error: 'Квитанцию можно распечатать только после завершения перевода',
            }, 403)
        }

        const doc = PDFService.generateReceipt(statement)
        const pdfBuffer = await PDFService.pdfToBuffer(doc)

        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="receipt_${id}.pdf"`,
            },
        })
    }
    catch (error) {
        console.error('Error generating receipt PDF:', error)
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate receipt PDF',
        }, 500)
    }
})

/**
 * GET /statements/:id/report - Получить PDF акта выполненных услуг
 */
statementRoutes.get('/:id/report', async (c) => {
    try {
        const id = Number.parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid ID' }, 400)
        }

        const statement = await statementService.getStatementById(id)

        if (!statement) {
            return c.json({ error: 'Statement not found' }, 404)
        }

        const doc = PDFService.generateDetailedReport(statement)
        const pdfBuffer = await PDFService.pdfToBuffer(doc)

        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="report_${id}.pdf"`,
            },
        })
    }
    catch (error) {
        console.error('Error generating report PDF:', error)
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate report PDF',
        }, 500)
    }
})
