"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/games";

const STORAGE_KEY = "av_user";

type SessionContextValue = {
  user: SessionUser | null;
  login: (user: SessionUser | null) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredUser(): SessionUser | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  // El primer render es siempre invitado: leer localStorage durante el render rompe la hidratación.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(readStoredUser());
  }, []);

  const login = useCallback((next: SessionUser | null) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const signOut = useCallback(() => login(null), [login]);

  const value = useMemo(() => ({ user, login, signOut }), [user, login, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
