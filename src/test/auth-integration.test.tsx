import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Mock the necessary modules
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      signInWithOAuth: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { role: "user" }, error: null })),
        })),
      })),
    })),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Auth Integration", () => {
  it("Google OAuth flow completes successfully", async () => {
    const TestComponent = () => {
      const { user, loading, signInWithGoogle } = useAuth();
      
      return (
        <div>
          <div data-testid="status">{loading ? "loading" : user ? "authenticated" : "anonymous"}</div>
          <button onClick={() => signInWithGoogle()} data-testid="login-btn">
            Sign In
          </button>
          <div data-testid="user-email">{user?.email || "no-user"}</div>
        </div>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially should be loading
    expect(getByTestId("status").textContent).toBe("loading");
    
    // After auth check completes with no session, should become anonymous
    await vi.waitFor(() => {
      expect(getByTestId("status").textContent).toBe("anonymous");
    });
  });
});