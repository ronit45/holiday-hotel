/**
 * Typed auth toast payloads for AppContext.showToast.
 * Display name prefers localStorage user_name, then email.
 */

/** Read display name before clearing auth storage */
export function getStoredDisplayName() {
  if (typeof window === "undefined") return "there";
  const name = localStorage.getItem("user_name")?.trim();
  if (name) return name;
  const email = localStorage.getItem("user_email")?.trim();
  if (email) return email.split("@")[0] || "there";
  return "there";
}

export function welcomeBackToast(name) {
  const display = name?.trim() || getStoredDisplayName() || "there";
  return {
    title: `Welcome back, ${display} 👋`,
    description:
      "Enjoy browsing your desired destinations and hotels. Happy travels!",
    type: "SUCCESS",
  };
}

export function welcomeNewToast(name) {
  const display = name?.trim() || getStoredDisplayName() || "there";
  return {
    title: `Welcome, ${display} 👋`,
    description:
      "Your account is ready — explore destinations and book your dream stay.",
    type: "SUCCESS",
  };
}

export function goodbyeToast(name) {
  const display = name?.trim() || getStoredDisplayName() || "there";
  return {
    title: `Goodbye, ${display} 👋`,
    description: "Hope to see you again soon. Safe travels!",
    type: "SUCCESS",
  };
}
