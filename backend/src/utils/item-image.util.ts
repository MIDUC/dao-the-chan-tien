/**
 * Utility functions for handling item images
 */

/**
 * Get the image URL for an item
 * @param itemId - Item ID
 * @param iconUrl - Icon URL from database (can be filename or full URL)
 * @returns Full URL to the item image
 */
export function getItemImageUrl(itemId: number, iconUrl: string | null): string {
  // If iconUrl is already a full URL, return it
  if (iconUrl && (iconUrl.startsWith('http://') || iconUrl.startsWith('https://'))) {
    return iconUrl;
  }

  // If iconUrl is a filename, construct the path
  if (iconUrl) {
    return `/public/items/${iconUrl}`;
  }

  // Default: use item ID to construct filename
  // Try common extensions
  const extensions = ['png', 'jpg', 'jpeg', 'webp', 'svg'];
  // For now, return a placeholder or default image
  return `/public/items/item_${itemId}.png`;
}

/**
 * Get the default image URL for an item
 * @param itemId - Item ID
 * @returns Default image URL
 */
export function getDefaultItemImageUrl(itemId: number): string {
  return `/public/items/item_${itemId}.png`;
}

/**
 * Validate image file extension
 * @param filename - Filename to validate
 * @returns True if valid image extension
 */
export function isValidImageExtension(filename: string): boolean {
  const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return validExtensions.includes(ext);
}

/**
 * Generate filename for item image
 * @param itemId - Item ID
 * @param originalFilename - Original filename
 * @returns Generated filename
 */
export function generateItemImageFilename(itemId: number, originalFilename: string): string {
  const ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
  return `item_${itemId}${ext}`;
}

