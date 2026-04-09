import { format, isValid } from 'date-fns';

/**
 * Safely formats a date avoiding "Invalid time value" errors.
 * 
 * @param {string|Date|number} dateValue - The date to format
 * @param {string} formatStr - The date-fns format string
 * @param {string} fallback - The string to return if the date is invalid
 * @returns {string} The formatted date or fallback
 */
export const safeDate = (dateValue, formatStr = 'MMM dd, yyyy HH:mm', fallback = 'N/A') => {
  if (!dateValue) return fallback;
  
  // Convert to Date object if it's not already
  const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
  
  if (isValid(dateObj)) {
    return format(dateObj, formatStr);
  }
  
  return fallback;
};
