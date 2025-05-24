
/**
 * Formats a byte size into a human-readable string
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted size string (e.g. "1.5 KB")
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Calculates the size of a string in bytes (UTF-16)
 * @param str - Input string
 * @returns Size in bytes
 */
export const getStringSizeInBytes = (str: string): number => {
  // Each character in JavaScript is UTF-16 encoded (2 bytes per character)
  return str.length * 2;
};
