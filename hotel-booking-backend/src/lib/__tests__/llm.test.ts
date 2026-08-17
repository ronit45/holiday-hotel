import { generateDraft } from "../llm";

describe("llm", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Setup some fake API keys so buildChain produces targets
    process.env.GROQ_API_KEY = "fake-groq-key";
    process.env.GROQ_MODEL = "fake-model";
    
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("should return draft on successful fetch", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Mocked LLM draft" } }],
      }),
    });

    const result = await generateDraft("hotel_description", "input text");
    expect(result.draft).toBe("Mocked LLM draft");
    expect(result.provider).toBe("groq");
    expect(result.usedFallback).toBe(false);
  });

  it("should retry on error (e.g. rate limit) and use fallback if all fail", async () => {
    // Mock the single provider failing
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => "Rate limit exceeded",
    });

    const result = await generateDraft("hotel_description", "test input");
    
    // It should fall back to the stub provider because only 1 target was in chain (groq)
    expect(result.provider).toBe("stub");
    expect(result.usedFallback).toBe(true);
    expect(result.draft).toContain("Test input");
  });
});
