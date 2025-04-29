/**
 * Check if the given argument is an array.
 * @param arg - The value to test.
 * @returns True if arg is an Array; otherwise false.
 */
export function isArray<T>(arg: T): boolean {
  return Array.isArray ? Array.isArray(arg) : Object.prototype.toString.call(arg) === "[object Array]"
}

/**
 * Check if the given value is a string.
 * @param str - The value to test.
 * @returns True if str is a string; otherwise false.
 */
export function isString(str: unknown): boolean {
  return typeof str === "string" || str instanceof String
}

/**
 * Check if the given path is an external URL (http(s), mailto, or tel).
 * @param path - The URL or path to test.
 * @returns True if path is an external link; otherwise false.
 */
export function isExternal(path: string): boolean {
  const reg = /^(https?:|mailto:|tel:)/
  return reg.test(path)
}
