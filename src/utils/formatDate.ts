/**
 * Formats a Date object into ISO format string (YYYY-MM-DD)
 * @param date - The Date object to format
 * @returns Formatted date string or empty string if date is null
 */
export function formatDate(date: Date | null): string {
  if (!date) return '';
  
  // Get year, month, and day components
  const year = date.getFullYear();
  // Month is 0-indexed, so add 1 and pad with leading zero if needed
  const month = String(date.getMonth() + 1).padStart(2, '0');
  // Day of month - pad with leading zero if needed
  const day = String(date.getDate()).padStart(2, '0');
  
  // Format as YYYY-MM-DD
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string in a user-friendly format
 * @param dateStr - The date string to format
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns Formatted date string
 */
export function formatDateDisplay(dateStr: string, locale = 'en-US'): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateStr;
  }
} 