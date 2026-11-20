import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service.js';
import { getErrorMessage } from '../utils/helpers.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [bootstrapped, setBootstrapped] = useState(false);

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await authService.me();
      } catch (error) {
        // Unauthenticated sessions are expected before login.
        if (error?.response?.status === 401) return null;
        throw error;
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (!meQuery.isLoading) setBootstrapped(true);
  }, [meQuery.isLoading]);

  useEffect(() => {
    const handleUnauthorized = () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'me'], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
    },
  });

  const login = useCallback(
    async (payload) => {
      try {
        return await loginMutation.mutateAsync(payload);
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Login failed'));
      }
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const value = useMemo(
    () => ({
      user: meQuery.data || null,
      loading: !bootstrapped,
      login,
      logout,
      loggingIn: loginMutation.isPending,
      loggingOut: logoutMutation.isPending,
      loginError: loginMutation.error?.message,
    }),
    [
      meQuery.data,
      bootstrapped,
      login,
      logout,
      loginMutation.isPending,
      logoutMutation.isPending,
      loginMutation.error,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
