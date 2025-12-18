import fs from 'node:fs'
import os from 'node:os'
import PDFDocument from 'pdfkit'
import type { StatementResponse } from '../../../shared/src/types/statements.types'

export class PDFService {
    /**
     * Получение путей к системным шрифтам в зависимости от ОС
     */
    private static getSystemFonts(): { regular: string, bold: string } {
        const platform = os.platform()

        let regular = ''
        let bold = ''

        if (platform === 'win32') {
            // Windows
            regular = 'C:/Windows/Fonts/arial.ttf'
            bold = 'C:/Windows/Fonts/arialbd.ttf'
        }
        else if (platform === 'darwin') {
            // macOS
            regular = '/System/Library/Fonts/Supplemental/Arial.ttf'
            bold = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
        }
        else {
            // Linux
            const possiblePaths = [
                { regular: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', bold: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' },
                { regular: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', bold: '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' },
                { regular: '/usr/share/fonts/TTF/DejaVuSans.ttf', bold: '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf' },
            ]

            for (const paths of possiblePaths) {
                if (fs.existsSync(paths.regular) && fs.existsSync(paths.bold)) {
                    regular = paths.regular
                    bold = paths.bold
                    break
                }
            }
        }

        return { regular, bold }
    }

    /**
     * Генерация PDF заявления
     */
    static generateStatement(statement: StatementResponse): PDFDocument {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
        })

        // Регистрируем шрифт
        this.registerFonts(doc)

        // Заголовок документа
        doc.font('Bold').fontSize(20).text('ЗАЯВЛЕНИЕ НА ПЕРЕВОД', { align: 'center' })
        doc.moveDown()

        // Информация об отправителе
        doc.font('Bold').fontSize(16).text('Информация об отправителе', { align: 'left' })
        doc.moveDown(0.5)
        doc.font('Regular').fontSize(12).text(`ФИО: ${statement.sender.senderFullname}`, { align: 'left' })
        doc.text(`Номер паспорта: ${statement.sender.senderPassport}`, { align: 'left' })
        doc.moveDown()

        // Информация о получателе
        doc.font('Bold').fontSize(16).text('Информация о получателе', { align: 'left' })
        doc.moveDown(0.5)
        doc.font('Regular').fontSize(12).text(`ФИО: ${statement.receiver.receiverFullname}`, { align: 'left' })
        doc.text(`Номер счёта: ${statement.receiver.receiverAccountNumber}`, { align: 'left' })
        doc.text(`SWIFT код банка: ${statement.receiver.receiverSwift}`, { align: 'left' })
        doc.moveDown()

        // Сумма перевода
        doc.font('Bold').fontSize(16).text('Сумма перевода', { align: 'left' })
        doc.moveDown(0.5)
        const amount = Number.parseFloat(statement.amount)
        doc.font('Regular').fontSize(14).text(`${this.formatAmount(amount)} ${statement.currency}`, { align: 'left' })

        doc.end()
        return doc
    }

    /**
     * Генерация квитанции по форме 1 (стиль JUSAN)
     */
    static generateReceipt(statement: StatementResponse): PDFDocument {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 60, bottom: 60, left: 60, right: 60 },
        })

        // Регистрируем шрифт
        this.registerFonts(doc)

        // Серый цвет для разделителей
        const lineColor = '#e5e5e5'

        // === ЗАГОЛОВОК ===
        doc.font('Bold')
            .fontSize(24)
            .text('КВИТАНЦИЯ', { align: 'left' })
            .moveDown(1.5)

        // === ИНФОРМАЦИЯ О ПЕРЕВОДЕ ===
        const infoStartY = doc.y

        doc.font('Regular').fontSize(10).fillColor('#666666')
        doc.text('Номер операции:', 60, infoStartY)
        doc.text('Дата операции:', 60, infoStartY + 20)
        doc.text('Статус:', 60, infoStartY + 40)

        doc.font('Regular').fontSize(10).fillColor('#000000')
        doc.text(`#${statement.id}`, 300, infoStartY)
        doc.text(this.formatFullDate(statement.createdAt), 300, infoStartY + 20)

        // Статус с зеленой галочкой
        doc.fillColor('#22c55e')
        doc.text(`${this.getStatusText(statement.status)} ✓`, 300, infoStartY + 40)

        // Горизонтальная линия
        doc.moveTo(60, infoStartY + 70)
            .lineTo(535, infoStartY + 70)
            .strokeColor(lineColor)
            .lineWidth(1)
            .stroke()

        // === ОТПРАВИТЕЛЬ ===
        let currentY = infoStartY + 95

        doc.font('Bold').fontSize(14).fillColor('#000000')
        doc.text('Отправитель', 60, currentY)
        currentY += 25

        doc.font('Regular').fontSize(10).fillColor('#666666')
        doc.text('ФИО:', 60, currentY)
        doc.text('Паспорт:', 60, currentY + 20)

        doc.font('Regular').fontSize(10).fillColor('#000000')
        doc.text(statement.sender.senderFullname, 300, currentY)
        doc.text(statement.sender.senderPassport, 300, currentY + 20)

        currentY += 55

        // Линия
        doc.moveTo(60, currentY)
            .lineTo(535, currentY)
            .strokeColor(lineColor)
            .lineWidth(1)
            .stroke()

        // === ПОЛУЧАТЕЛЬ ===
        currentY += 25

        doc.font('Bold').fontSize(14).fillColor('#000000')
        doc.text('Получатель', 60, currentY)
        currentY += 25

        doc.font('Regular').fontSize(10).fillColor('#666666')
        doc.text('ФИО:', 60, currentY)
        doc.text('Номер счёта:', 60, currentY + 20)
        doc.text('SWIFT код:', 60, currentY + 40)

        doc.font('Regular').fontSize(10).fillColor('#000000')
        doc.text(statement.receiver.receiverFullname, 300, currentY)
        doc.text(statement.receiver.receiverAccountNumber, 300, currentY + 20)
        doc.text(statement.receiver.receiverSwift, 300, currentY + 40)

        currentY += 75

        // Линия
        doc.moveTo(60, currentY)
            .lineTo(535, currentY)
            .strokeColor(lineColor)
            .lineWidth(1)
            .stroke()

        // === СУММА ПЕРЕВОДА ===
        currentY += 25

        const amount = Number.parseFloat(statement.amount)

        doc.font('Regular').fontSize(10).fillColor('#666666')
        doc.text('Сумма перевода:', 60, currentY)
        doc.text('Сумма комиссии:', 60, currentY + 20)

        doc.font('Regular').fontSize(10).fillColor('#000000')
        doc.text(`${this.formatAmount(amount)} ${statement.currency}`, 300, currentY)
        doc.text(`0.00 ${statement.currency}`, 300, currentY + 20)

        currentY += 45

        // === ИТОГО (жирным шрифтом) ===
        doc.font('Bold').fontSize(12).fillColor('#000000')
        doc.text('Итого:', 60, currentY)
        doc.text(`${this.formatAmount(amount)} ${statement.currency}`, 300, currentY)

        // === ПЕЧАТЬ (окружность) ===
        currentY += 60

        // Рисуем три окружности (печать)
        const centerX = 480
        const centerY = currentY + 40
        const radius = 35

        doc.circle(centerX, centerY, radius)
            .strokeColor('#ff6b35')
            .lineWidth(2)
            .stroke()

        doc.circle(centerX, centerY, radius - 5)
            .strokeColor('#ff6b35')
            .lineWidth(1)
            .stroke()

        doc.circle(centerX, centerY, radius - 10)
            .strokeColor('#ff6b35')
            .lineWidth(1)
            .stroke()

        // Текст внутри печати
        doc.font('Bold').fontSize(8).fillColor('#ff6b35')
        doc.text('СИСТЕМА', centerX - 25, centerY - 8, { width: 50, align: 'center' })
        doc.text('АВТОМАТИЗАЦИИ', centerX - 25, centerY + 2, { width: 50, align: 'center' })

        // === ФУТЕР ===
        const footerY = 750

        doc.font('Regular').fontSize(8).fillColor('#999999')
        doc.text(
            'Сгенерировано автоматически системой бизнес-автоматизации',
            60,
            footerY,
            { align: 'center', width: 475 },
        )

        doc.end()
        return doc
    }

    /**
     * Генерация Акта выполненных услуг (Форма 2)
     */
    static generateDetailedReport(statement: StatementResponse): PDFDocument {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 60, bottom: 60, left: 60, right: 60 },
        })

        this.registerFonts(doc)

        const lineColor = '#e5e5e5'

        // === ШАПКА ДОКУМЕНТА ===
        doc.font('Bold').fontSize(18).fillColor('#000000')
        doc.text('АКТ №', 60, 60)
        doc.font('Regular').fontSize(14)
        doc.text(` ${statement.id}`, 125, 63)

        doc.font('Regular').fontSize(11)
        doc.text('выполненных услуг по международному переводу', 60, 85)

        doc.fontSize(10).fillColor('#666666')
        doc.text('г. Москва', 60, 105)
        doc.text(`${this.formatDate(new Date())}`, 450, 105)

        // Линия под заголовком
        doc.moveTo(60, 130)
            .lineTo(535, 130)
            .strokeColor(lineColor)
            .lineWidth(1)
            .stroke()

        // === СТОРОНЫ ДОГОВОРА ===
        let currentY = 150

        doc.font('Bold').fontSize(11).fillColor('#000000')
        doc.text('Исполнитель:', 60, currentY)
        doc.font('Regular').fontSize(10)
        doc.text('ООО "Система бизнес-автоматизации"', 160, currentY)
        doc.text('ИНН: 7701234567, КПП: 770101001', 160, currentY + 15)
        doc.text('Адрес: г. Москва, ул. Ленина, д. 1', 160, currentY + 30)

        currentY += 60

        doc.font('Bold').fontSize(11).fillColor('#000000')
        doc.text('Заказчик:', 60, currentY)
        doc.font('Regular').fontSize(10)
        doc.text(statement.sender.senderFullname, 160, currentY)
        doc.text(`Паспорт: ${statement.sender.senderPassport}`, 160, currentY + 15)

        currentY += 45

        // Линия
        doc.moveTo(60, currentY)
            .lineTo(535, currentY)
            .strokeColor(lineColor)
            .lineWidth(1)
            .stroke()

        // === ОПИСАНИЕ УСЛУГ ===
        currentY += 25

        doc.font('Bold').fontSize(12).fillColor('#000000')
        doc.text('1. ПРЕДМЕТ АКТА', 60, currentY)

        currentY += 25

        doc.font('Regular').fontSize(10)
        doc.text(
            'Исполнитель оказал, а Заказчик принял следующие услуги по осуществлению международного денежного перевода:',
            60,
            currentY,
            { width: 475, align: 'justify' },
        )

        currentY += 50

        const amount = Number.parseFloat(statement.amount)

        // === ТАБЛИЦА УСЛУГ ===
        // Заголовок таблицы
        doc.rect(60, currentY, 475, 25).fillAndStroke('#f5f5f5', lineColor)

        doc.font('Bold').fontSize(9).fillColor('#000000')
        doc.text('№', 70, currentY + 8)
        doc.text('Наименование услуги', 100, currentY + 8)
        doc.text('Кол-во', 350, currentY + 8)
        doc.text('Цена', 410, currentY + 8)
        doc.text('Сумма', 470, currentY + 8)

        currentY += 25

        // Строка 1 - Перевод
        doc.rect(60, currentY, 475, 30).stroke(lineColor)
        doc.font('Regular').fontSize(9).fillColor('#000000')
        doc.text('1', 70, currentY + 10)
        doc.text(
            `Международный перевод денежных средств\nна сумму ${this.formatAmount(amount)} ${statement.currency}`,
            100,
            currentY + 5,
            { width: 240 },
        )
        doc.text('1', 360, currentY + 10)
        doc.text(`${this.formatAmount(amount)}`, 400, currentY + 10)
        doc.text(`${this.formatAmount(amount)}`, 455, currentY + 10)

        currentY += 30

        // Строка 2 - Комиссия
        doc.rect(60, currentY, 475, 20).stroke(lineColor)
        doc.text('2', 70, currentY + 6)
        doc.text('Комиссия за перевод', 100, currentY + 6)
        doc.text('1', 360, currentY + 6)
        doc.text('0.00', 410, currentY + 6)
        doc.text('0.00', 475, currentY + 6)

        currentY += 20

        // ИТОГО
        doc.rect(60, currentY, 475, 25).fillAndStroke('#f5f5f5', lineColor)
        doc.font('Bold').fontSize(10)
        doc.text('ИТОГО:', 350, currentY + 7)
        doc.text(`${this.formatAmount(amount)} ${statement.currency}`, 440, currentY + 7)

        currentY += 45

        // === ДЕТАЛИ ПЕРЕВОДА ===
        doc.font('Bold').fontSize(12).fillColor('#000000')
        doc.text('2. ДЕТАЛИ ПЕРЕВОДА', 60, currentY)

        currentY += 25

        const details = [
            ['Получатель:', statement.receiver.receiverFullname],
            ['Номер счёта получателя:', statement.receiver.receiverAccountNumber],
            ['SWIFT код банка:', statement.receiver.receiverSwift],
            ['Валюта перевода:', statement.currency],
            ['Дата выполнения:', this.formatFullDate(statement.createdAt)],
            ['Статус:', this.getStatusText(statement.status)],
        ]

        details.forEach((detail) => {
            doc.font('Bold').fontSize(9).fillColor('#666666')
            doc.text(detail[0], 60, currentY, { width: 150 })
            doc.font('Regular').fontSize(9).fillColor('#000000')
            doc.text(detail[1], 220, currentY, { width: 315 })
            currentY += 18
        })

        currentY += 20

        // === ПОДПИСИ ===
        doc.font('Bold').fontSize(12).fillColor('#000000')
        doc.text('3. ПОДПИСИ СТОРОН', 60, currentY)

        currentY += 35

        // Исполнитель
        doc.font('Bold').fontSize(10)
        doc.text('Исполнитель:', 60, currentY)
        doc.font('Regular').fontSize(9)
        doc.text('ООО "Система бизнес-автоматизации"', 60, currentY + 18)
        doc.text('_________________', 60, currentY + 45)
        doc.fontSize(8).fillColor('#999999')
        doc.text('(подпись)', 90, currentY + 60)

        // Заказчик
        doc.font('Bold').fontSize(10).fillColor('#000000')
        doc.text('Заказчик:', 320, currentY)
        doc.font('Regular').fontSize(9)
        doc.text(statement.sender.senderFullname, 320, currentY + 18)
        doc.text('_________________', 320, currentY + 45)
        doc.fontSize(8).fillColor('#999999')
        doc.text('(подпись)', 350, currentY + 60)

        // === ПЕЧАТЬ ===
        const sealX = 480
        const sealY = currentY + 35

        doc.circle(sealX, sealY, 35)
            .strokeColor('#0066cc')
            .lineWidth(2)
            .stroke()

        doc.circle(sealX, sealY, 30)
            .strokeColor('#0066cc')
            .lineWidth(1)
            .stroke()

        doc.font('Bold').fontSize(7).fillColor('#0066cc')
        doc.text('М.П.', sealX - 10, sealY - 3)

        // === ФУТЕР ===
        doc.font('Regular').fontSize(7).fillColor('#999999')
        doc.text(
            'Акт составлен в двух экземплярах, имеющих одинаковую юридическую силу, по одному для каждой стороны.',
            60,
            750,
            { width: 475, align: 'center' },
        )

        doc.end()
        return doc
    }

    /**
     * Регистрация шрифтов с поддержкой кириллицы
     */
    private static registerFonts(doc: PDFDocument): void {
        try {
            const fonts = this.getSystemFonts()

            if (fs.existsSync(fonts.regular)) {
                doc.registerFont('Regular', fonts.regular)
            }

            if (fs.existsSync(fonts.bold)) {
                doc.registerFont('Bold', fonts.bold)
            }
        }
        catch (error) {
            console.error('Ошибка при регистрации шрифтов:', error)
        }
    }

    /**
     * Преобразование PDF документа в буфер
     */
    static async pdfToBuffer(doc: PDFDocument): Promise<Buffer> {
        const chunks: Uint8Array[] = []

        return new Promise((resolve, reject) => {
            doc.on('data', (chunk) => {
                chunks.push(chunk)
            })

            doc.on('end', () => {
                const buffer = Buffer.concat(chunks)
                resolve(buffer)
            })

            doc.on('error', (error) => {
                reject(error)
            })
        })
    }

    // Вспомогательные методы
    private static formatAmount(amount: number): string {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    private static formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('ru-RU')
    }

    private static formatFullDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    private static getStatusText(status: string): string {
        const statusMap: Record<string, string> = {
            PENDING: 'В обработке',
            APPROVED: 'Одобрено',
            REJECTED: 'Отклонено',
            COMPLETED: 'Перевод успешно совершен',
            FAILED: 'Отклонено',
            CANCELLED: 'Отменено',
        }
        return statusMap[status] || status
    }
}

