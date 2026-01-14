/**
 * Formats a Date according to the specified format string.
 *
 * Supported format tokens:
 * - YYYY: Full year (e.g., 2024)
 * - YY: 2-digit year (e.g., 24)
 * - MM: 2-digit month (01-12)
 * - M: Month without leading zero (1-12)
 * - DD: 2-digit day (01-31)
 * - D: Day without leading zero (1-31)
 * - HH: 2-digit hour (00-23)
 * - mm: 2-digit minute (00-59)
 * - ss: 2-digit second (00-59)
 *
 * @param date - The Date object to format
 * @param format - The format string with tokens
 * @returns The formatted date string
 * @throws Error if date is invalid or format is empty
 */
export function formatDate(date: Date, format: string): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date provided');
    }

    if (!format || typeof format !== 'string') {
        throw new Error('Format must be a non-empty string');
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return format
        .replace(/YYYY/g, year.toString())
        .replace(/YY/g, (year % 100).toString().padStart(2, '0'))
        .replace(/MM/g, month.toString().padStart(2, '0'))
        .replace(/M/g, month.toString())
        .replace(/DD/g, day.toString().padStart(2, '0'))
        .replace(/D/g, day.toString())
        .replace(/HH/g, hours.toString().padStart(2, '0'))
        .replace(/mm/g, minutes.toString().padStart(2, '0'))
        .replace(/ss/g, seconds.toString().padStart(2, '0'));
}
