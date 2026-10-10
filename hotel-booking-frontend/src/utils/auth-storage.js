/**
 * Centralized auth storage helpers.
 * All auth-related localStorage keys are managed here so there's a single
 * source of truth for clearing/reading them.
 */

const AUTH_KEYS = [
  "session_id",
  "user_id",
  "user_email",
  "user_name",
  "user_image",
];

/** Remove all auth-related keys from localStorage */
export const clearAuthStorage = () => {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
};
