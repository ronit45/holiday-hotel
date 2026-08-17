import { welcomeBackToast, welcomeNewToast, goodbyeToast, getStoredDisplayName } from "../toast-messages";

describe("toast-messages", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getStoredDisplayName prefers user_name over email", () => {
    localStorage.setItem("user_name", "Arnob");
    localStorage.setItem("user_email", "arnob@test.com");
    expect(getStoredDisplayName()).toBe("Arnob");
  });

  it("getStoredDisplayName falls back to email prefix", () => {
    localStorage.setItem("user_email", "arnob@test.com");
    expect(getStoredDisplayName()).toBe("arnob");
  });

  it("getStoredDisplayName falls back to 'there'", () => {
    expect(getStoredDisplayName()).toBe("there");
  });

  it("welcomeBackToast formats correctly with name", () => {
    const toast = welcomeBackToast("Arnob");
    expect(toast.title).toBe("Welcome back, Arnob 👋");
    expect(toast.type).toBe("SUCCESS");
  });

  it("welcomeNewToast formats correctly with fallback", () => {
    const toast = welcomeNewToast();
    expect(toast.title).toBe("Welcome, there 👋");
    expect(toast.type).toBe("SUCCESS");
  });

  it("goodbyeToast formats correctly", () => {
    localStorage.setItem("user_name", "Arnob");
    const toast = goodbyeToast();
    expect(toast.title).toBe("Goodbye, Arnob 👋");
    expect(toast.type).toBe("SUCCESS");
  });
});
