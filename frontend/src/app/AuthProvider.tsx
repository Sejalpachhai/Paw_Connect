"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginWithToken: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchMe(token: string): Promise<User | null> {
  try {
    const res = await fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Not authorized");
    }

    const data = await res.json();
    return data.user;
  } catch (err) {
    console.error("fetchMe error:", err);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, check if we already have a token
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      const me = await fetchMe(token);
      if (!me) {
        localStorage.removeItem("token");
      }
      setUser(me);
      setLoading(false);
    })();
  }, []);

  const loginWithToken = (token: string) => {
    localStorage.setItem("token", token);
    setLoading(true);

    (async () => {
      const me = await fetchMe(token);
      if (!me) {
        localStorage.removeItem("token");
      }
      setUser(me);
      setLoading(false);
    })();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider />");
  }
  return ctx;
}
