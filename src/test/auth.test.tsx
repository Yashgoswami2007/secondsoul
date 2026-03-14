import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import * as sonner from "sonner";

// Create proper mocks
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
  });

  describe("OAuth Flow", () => {
    it("should handle successful Google OAuth sign in", async () => {
      const mockSession = {
        user: { id: "123", email: "test@example.com" },
      };

      let authCallback: ((event: string, session: any) => void) | null = null;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
        authCallback = callback;
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const TestComponent = () => {
        const { user, loading } = useAuth();
        
        return (
          <div>
            <div data-testid="loading">{loading ? "Loading..." : "Loaded"}</div>
            <div data-testid="user-email">{user?.email || "No user"}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initially loading
      expect(screen.getByTestId("loading")).toHaveTextContent("Loading...");
      expect(screen.getByTestId("user-email")).toHaveTextContent("No user");

      // Simulate SIGNED_IN event after OAuth
      if (authCallback) {
        authCallback("SIGNED_IN", mockSession);
      }

      // Wait for auth to complete
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("Loaded");
        expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com");
      });
    });

    it("should remain loading during INITIAL_SESSION with null session", async () => {
      let authCallback: ((event: string, session: any) => void) | null = null;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
        authCallback = callback;
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const TestComponent = () => {
        const { loading } = useAuth();
        return <div data-testid="loading">{loading ? "Loading..." : "Loaded"}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate INITIAL_SESSION event (null session)
      if (authCallback) {
        authCallback("INITIAL_SESSION", null);
      }

      // Should still be loading because loading=false only happens for SIGNED_IN/SIGNED_OUT
      expect(screen.getByTestId("loading")).toHaveTextContent("Loading...");
    });
  });

  describe("Session Persistence", () => {
    it("should load existing session on mount", async () => {
      const mockSession = {
        user: { id: "123", email: "test@example.com" },
      };

      let authCallback: ((event: string, session: any) => void) | null = null;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
        authCallback = callback;
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const TestComponent = () => {
        const { user, loading } = useAuth();
        return (
          <div>
            <div data-testid="loading">{loading ? "Loading..." : "Loaded"}</div>
            <div data-testid="user-email">{user?.email || "No user"}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com");
      });
    });
  });
});