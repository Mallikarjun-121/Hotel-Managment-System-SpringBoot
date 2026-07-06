import { useCallback, useMemo, useState, createContext } from 'react';
import { authApi } from '@/api/auth';
import { clearToken, extractErrorMessage, getToken, setToken } from '@/api/client';

const USER_KEY = 'meridian_user';

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken();
    const stored = localStorage.getItem(USER_KEY);
    if (token && stored) {
      try {
        return JSON.parse(stored);
      } catch {
        clearToken();
        localStorage.removeItem(USER_KEY);
      }
    }
    return null;
  });

  const login = useCallback(async (payload) => {
    try {
      const res = await authApi.login(payload);
      setToken(res.token);
      const current = {
        id: res.id,
        name: res.name,
        email: res.email,
        roles: res.roles,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(current));
      setUser(current);
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Invalid email or password.'), { cause: err });
    }
  }, []);

  const register = useCallback(
    async (payload) => {
      try {
        await authApi.register(payload);
      } catch (err) {
        throw new Error(extractErrorMessage(err, 'Could not create your account.'), { cause: err });
      }
      await login({ email: payload.email, password: payload.password });
    },
    [login]
  );

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: !!user?.roles?.includes('ADMIN'),
      loading: false,
      login,
      register,
      logout,
    }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
