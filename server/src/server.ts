import { Hono } from 'hono'
import { statementRoutes } from './statement/statement.routes'

const app = new Hono()

// Базовый роут
app.get('/', c => c.json({ message: 'Business Automation API' }))

// Подключение роутов для заявок
app.route('/statements', statementRoutes)

// Запуск сервера
const port = 3000

export default {
    port,
    fetch: app.fetch,
}

console.log(`🚀 Server is running on http://localhost:${port}`)
