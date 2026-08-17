/** Mock config for tests — avoids process.exit() on missing env vars */
export const config = {
  env: "test",
  port: 5001,
  frontendUrl: "http://localhost:5174",
  backendUrl: "http://localhost:5001",
  mongo: {
    uri: "mongodb://localhost:27017/test",
  },
  jwt: {
    secret: "test-jwt-secret-key-for-unit-tests",
  },
  stripe: {
    secretKey: "sk_test_fake",
  },
  google: {
    clientId: "test-google-client-id",
    clientSecret: "test-google-client-secret",
  },
  ai: {
    assistEnabled: false,
    groqApiKey: undefined,
    groqModel: undefined,
    openaiApiKey: undefined,
    openaiModel: undefined,
    openrouterApiKey: undefined,
    openrouterModel: undefined,
  },
} as const;
