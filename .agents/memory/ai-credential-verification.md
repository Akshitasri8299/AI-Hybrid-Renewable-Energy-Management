---
name: AI credential verification
description: Live verification and error handling for provider-backed AI features.
---

Provider credentials should be checked with a real endpoint request after confirming that the environment variable is present. An environment variable being populated only proves that the application can read a value; it does not prove that the provider accepts the credential.

**Why:** A configured OpenAI secret can return HTTP 401, and treating that as “not configured” hides the actual repair needed.

**How to apply:** Keep provider calls server-side, return a clear credential-specific error for 401/403 responses, and use a mocked provider response separately to verify prompt construction and response parsing.