/**
 * Get the value of a CSS variable on a given element (defaults to :root).
 * @param varName - The name of the CSS variable (must start with `--`).
 * @param element - The element to query (default: document.documentElement).
 * @returns The value of the CSS variable, or an empty string if not set.
 */
export function getCssVar(
  varName: string,
  element: HTMLElement = document.documentElement
): string {
  if (!varName?.startsWith("--")) {
    console.error("CSS variable name must start with '--'")
    return ""
  }
  // Returns an empty string if the variable is not defined
  return getComputedStyle(element).getPropertyValue(varName)
}

/**
 * Set the value of a CSS variable on a given element (defaults to :root).
 * @param varName - The name of the CSS variable (must start with `--`).
 * @param value - The value to assign to the CSS variable.
 * @param element - The element to modify (default: document.documentElement).
 */
export function setCssVar(
  varName: string,
  value: string,
  element: HTMLElement = document.documentElement
): void {
  if (!varName?.startsWith("--")) {
    console.error("CSS variable name must start with '--'")
    return
  }
  element.style.setProperty(varName, value)
}
