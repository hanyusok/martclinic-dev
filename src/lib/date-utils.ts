// Date formatting utilities
export const dateUtils = {
  // Format date for Korean locale
  formatKoreanDate: (dateString: string | Date, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    })
  },

  // Format date for display (short format)
  formatDisplayDate: (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  },

  // Format date and time for display
  formatDateTime: (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  },

  // Format date for datetime-local input
  formatForDateTimeInput: (date: Date = new Date()) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  },

  // Format date for date input
  formatForDateInput: (date: Date = new Date()) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // Get current date/time for forms
  getCurrentDateTime: () => {
    return dateUtils.formatForDateTimeInput(new Date())
  },

  // Get current date for forms
  getCurrentDate: () => {
    return dateUtils.formatForDateInput(new Date())
  },

  // Format month name for charts/trends
  formatMonthName: (date: Date) => {
    return date.toLocaleDateString('ko-KR', { month: 'short' })
  }
} 