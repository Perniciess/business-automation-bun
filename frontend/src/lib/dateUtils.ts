// Функция для форматирования даты (относительное время)
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } else if (days > 0) {
    const dayWord = days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'
    return `${days} ${dayWord} назад`
  } else if (hours > 0) {
    const hourWord = hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'
    return `${hours} ${hourWord} назад`
  } else if (minutes > 0) {
    const minuteWord = minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'
    return `${minutes} ${minuteWord} назад`
  } else {
    return 'только что'
  }
}

// Функция для полного форматирования даты
export function formatFullDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Функция для форматирования суммы
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

