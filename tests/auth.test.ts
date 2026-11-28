import { describe, expect, it, mock } from "bun:test";
import { SignJWT } from "jose";

process.env.ADMIN_SESSION_SECRET =
  "this_is_a_secure_test_admin_session_secret_12345";
// Mock Supabase admin DB
const mockSessions = new Map<
  string,
  { id: string; expires_at: string; ip_address: string | null }
>();
mock.module("@/lib/db/supabase-admin", () => ({
  getAdminDb: () => ({
    from: (table: string) => {
      if (table !== "admin_sessions") throw new Error("Unexpected table");
      return {
        insert: (row: {
          expires_at: string;
          ip_address?: string | null;
          user_agent?: string | null;
        }) => {
          const id = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
          mockSessions.set(id, {
            id,
            expires_at: row.expires_at,
            ip_address: row.ip_address || null,
          });
          return {
            select: () => ({
              single: async () => ({
                data: { id },
                error: null,
              }),
            }),
          };
        },
        select: () => ({
          eq: (_col: string, val: string) => ({
            gt: (_expCol: string, expVal: string) => ({
              maybeSingle: async () => {
                const s = mockSessions.get(val);
                if (s && s.expires_at > expVal) {
                  return { data: s, error: null };
                }
                return { data: null, error: null };
              },
            }),
          }),
        }),
        delete: () => ({
          eq: async (_: string, val: string) => {
            mockSessions.delete(val);
            return { error: null };
          },
          lt: async (_: string, cutoff: string) => {
            for (const [id, session] of mockSessions.entries()) {
              if (session.expires_at < cutoff) mockSessions.delete(id);
            }
            return { error: null };
          },
          not: async () => {
            mockSessions.clear();
            return { error: null };
          },
        }),
      };
    },
  }),
}));
const {
  createAdminSession,
  parseAdminToken,
  isValidAdminToken,
  invalidateAdminSession,
  invalidateAllAdminSessions,
} = await import("@/lib/auth/auth");
describe("Database-Backed Admin Session Management", () => {
  it("creates a stateful session and signs a valid JWT", async () => {
    const token = await createAdminSession({ ip: "192.168.1.1" });
    expect(typeof token).toBe("string");
    const parsed = await parseAdminToken(token);
    expect(parsed).not.toBeNull();
    expect(parsed?.sessionId).toBeDefined();
    const isValid = await isValidAdminToken(token);
    expect(isValid).toBe(true);
  });
  it("defends against leaked ADMIN_SESSION_SECRET: forged JWT without DB session is rejected", async () => {
    // Attacker has ADMIN_SESSION_SECRET and generates a valid JWT signature
    const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET);
    const forgedToken = await new SignJWT({
      admin: true,
      sessionId: "00000000-0000-0000-0000-000000000000",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("momented")
      .setAudience("momented-admin")
      .setIssuedAt()
      .setExpirationTime("100y")
      .sign(secret);
    // Cryptographic signature is valid
    const parsed = await parseAdminToken(forgedToken);
    expect(parsed?.sessionId).toBe("00000000-0000-0000-0000-000000000000");
    // BUT authoritative database verification REJECTS it because session was not created via password login
    const isValid = await isValidAdminToken(forgedToken);
    expect(isValid).toBe(false);
  });
  it("rejects legacy stateless tokens lacking sessionId", async () => {
    const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET);
    const legacyToken = await new SignJWT({ admin: true })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("momented")
      .setAudience("momented-admin")
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);
    const parsed = await parseAdminToken(legacyToken);
    expect(parsed).toBeNull();
    const isValid = await isValidAdminToken(legacyToken);
    expect(isValid).toBe(false);
  });
  it("invalidates a specific session upon single-device logout", async () => {
    const token = await createAdminSession({ ip: "10.0.0.1" });
    const parsed = await parseAdminToken(token);
    expect(parsed?.sessionId).toBeDefined();
    if (!parsed?.sessionId)
      throw new Error("Parsed token sessionId is undefined");
    const isValidBefore = await isValidAdminToken(token);
    expect(isValidBefore).toBe(true);
    // Logout
    await invalidateAdminSession(parsed.sessionId);
    // Immediately revoked
    const isValidAfter = await isValidAdminToken(token);
    expect(isValidAfter).toBe(false);
  });
  it("invalidates all sessions upon global logout ('Logout from all devices')", async () => {
    const phoneToken = await createAdminSession({ ip: "phone-ip" });
    const laptopToken = await createAdminSession({ ip: "laptop-ip" });
    expect(await isValidAdminToken(phoneToken)).toBe(true);
    expect(await isValidAdminToken(laptopToken)).toBe(true);
    // Global logout
    await invalidateAllAdminSessions();
    // Both are revoked immediately
    expect(await isValidAdminToken(phoneToken)).toBe(false);
    expect(await isValidAdminToken(laptopToken)).toBe(false);
  });
  it("rejects expired database sessions", async () => {
    const expiredId = "expired-session-id";
    mockSessions.set(expiredId, {
      id: expiredId,
      expires_at: new Date(Date.now() - 1000).toISOString(), // expired 1s ago
      ip_address: null,
    });
    const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET);
    const token = await new SignJWT({ admin: true, sessionId: expiredId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("momented")
      .setAudience("momented-admin")
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);
    const isValid = await isValidAdminToken(token);
    expect(isValid).toBe(false);
  });
});
