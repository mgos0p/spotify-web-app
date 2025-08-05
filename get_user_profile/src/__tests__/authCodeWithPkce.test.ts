import { generateCodeVerifier, generateCodeChallenge } from "../authCodeWithPkce";

beforeAll(() => {
  (global as any).window = { crypto: global.crypto };
});

describe("generateCodeVerifier", () => {
  it("returns a 128-character string of allowed characters", () => {
    const verifier = generateCodeVerifier(128);
    expect(verifier).toHaveLength(128);
    expect(/^[A-Za-z0-9]+$/.test(verifier)).toBe(true);
  });
});

describe("generateCodeChallenge", () => {
  it("produces expected SHA-256 base64url encoding for a known verifier", async () => {
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    const expected = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
    const challenge = await generateCodeChallenge(verifier);
    expect(challenge).toBe(expected);
  });
});
