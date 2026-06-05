import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ============================================================================
// Auth - simple mock auth for the demo
// Persists across reloads via localStorage.
// In production this is a real OAuth/session flow.
// ============================================================================

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "service-advisor" | "tech" | "office";
  shopId: string;
  shopName: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => void;
  /** While the auth context is hydrating from localStorage on first mount */
  hydrating: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "andys-os-auth-v1";

// ----------------------------------------------------------------------------
// Demo user database - any email works, but these get special role mapping
// ----------------------------------------------------------------------------

const KNOWN_USERS: Record<string, Omit<AuthUser, "id" | "shopId" | "shopName">> = {
  "andy@andysauto.com": {
    name: "Andy Mills",
    email: "andy@andysauto.com",
    role: "owner",
  },
  "cameron@andysauto.com": {
    name: "Cameron Mills",
    email: "cameron@andysauto.com",
    role: "service-advisor",
  },
  "marcus@andysauto.com": {
    name: "Marcus Reeves",
    email: "marcus@andysauto.com",
    role: "tech",
  },
};

function buildUser(email: string): AuthUser {
  const known = KNOWN_USERS[email.toLowerCase()];
  if (known) {
    return {
      id: `user-${email}`,
      shopId: "shop-andys",
      shopName: "Andy's Automotive",
      ...known,
    };
  }
  // Any other email logs in as a service advisor by default
  const namePart = email.split("@")[0].replace(/[._-]/g, " ");
  const name = namePart
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ");
  return {
    id: `user-${email}`,
    name: name || "Demo User",
    email,
    role: "service-advisor",
    shopId: "shop-andys",
    shopName: "Andy's Automotive",
  };
}

// ----------------------------------------------------------------------------
// Provider
// ----------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrating, setHydrating] = useState(true);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
      }
    } catch {
      // ignore - corrupted storage
    }
    setHydrating(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Mock auth - simulate a brief network call
    await new Promise((r) => setTimeout(r, 700));
    // For the demo, any non-empty email + password "works"
    if (!email.trim() || !password.trim()) {
      throw new Error("Email and password required");
    }
    const nextUser = buildUser(email.trim());
    setUser(nextUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } catch {
      // ignore - storage may be disabled
    }
    return nextUser;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      signIn,
      signOut,
      hydrating,
    }),
    [user, signIn, signOut, hydrating],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ----------------------------------------------------------------------------
// Hooks
// ----------------------------------------------------------------------------

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
