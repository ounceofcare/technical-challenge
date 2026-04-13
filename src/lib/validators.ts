/**
 * Validates that an ID matches expected format.
 * IDs should be nanoid format (21 alphanumeric chars + _ and -).
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  // Allow alphanumeric, underscore, and hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return false;
  // Check expected length for nanoid
  if (id.length !== 21) return false;
  return true;
}

export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[%_]/g, "\\$&").trim();
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRequired(
  fields: Record<string, unknown>,
  required: string[]
): string[] {
  const missing: string[] = [];
  for (const field of required) {
    if (!fields[field] && fields[field] !== 0) {
      missing.push(field);
    }
  }
  return missing;
}
