import validator from "validator";

/**
 * Sanitize a mandatory string (always sanitize).
 */
export function sanitizeString(str) {
	return validator.trim(str);
}

/**
 * Sanitize an optional string (return null if empty or undefined).
 */
export function sanitizeOptionalString(str) {
	if (!str) return null;
	return validator.trim(str);
}

/**
 * Sanitize a description field (trim + escape HTML special chars).
 */
export function sanitizeDescription(str) {
	if (!str) return null;
	return validator.escape(validator.trim(str));
}
