import { useState, useEffect, useCallback, useRef } from 'react';

export const TOKEN_KEY = 'pachamama_admin_token';
export const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutos de inactividad
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [logoutReason, setLogoutReason] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const login = useCallback((newToken: string) => {
    const clean = newToken.trim();
    sessionStorage.setItem(TOKEN_KEY, clean);
    setLogoutReason(null);
    setToken(clean);
  }, []);

  const logout = useCallback((reason?: string) => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setLogoutReason(reason ?? null);
  }, []);

  useEffect(() => {
    if (!token) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        logout('Sesión cerrada automáticamente por inactividad.');
      }, INACTIVITY_LIMIT_MS);
    };

    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [token, logout]);

  return { token, login, logout, logoutReason, clearLogoutReason: () => setLogoutReason(null) };
}
