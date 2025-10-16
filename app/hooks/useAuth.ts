// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

import type { LoginCredentials, Sucursal, Tienda, User } from '~/models/auth';

const AUTH_KEYS = {
  USER: 'auth_user_data',
  TIMESTAMP: 'auth_timestamp',
  SESSION: 'auth_session_status'
};

export const useAuth = () => {
  const queryClient = useQueryClient();

  const getPersistedUser = (): User | null => {
    try {
      const userData = localStorage.getItem(AUTH_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: api.login,
    onSuccess: (userData) => {
      // Guardar todos los datos del usuario
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(AUTH_KEYS.TIMESTAMP, Date.now().toString());
      localStorage.setItem(AUTH_KEYS.SESSION, 'authenticated');
      
      queryClient.setQueryData(['auth', 'user'], userData);
      
      console.log('✅ Usuario guardado en cache:', userData);
    },
    onError: (error) => {
      localStorage.removeItem(AUTH_KEYS.USER);
      localStorage.removeItem(AUTH_KEYS.TIMESTAMP);
      localStorage.setItem(AUTH_KEYS.SESSION, 'unauthenticated');
      console.error('❌ Error en login:', error);
    },
  });

  const { data: user, isLoading: isCheckingAuth, error } = useQuery<User, Error>({
    queryKey: ['auth', 'user'],
    queryFn: api.verifySession,
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    initialData: getPersistedUser,
  });

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const user=await loginMutation.mutateAsync(credentials);
      console.log(user)
      if(user.rol=="CLIENTE"){
        alert("Usuario no autorizado");
        return null;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = (): void => {
    localStorage.removeItem(AUTH_KEYS.USER);
    localStorage.removeItem(AUTH_KEYS.TIMESTAMP);
    localStorage.removeItem(AUTH_KEYS.SESSION);
    queryClient.removeQueries({ queryKey: ['auth', 'user'] });
    queryClient.clear();
    window.location.href = '/';
  };

  const refreshUser = async (): Promise<User> => {
    try {
      // En una app real, aquí llamarías a la API para obtener datos frescos
      const currentUser = getPersistedUser();
      if (!currentUser) {
          window.location.href = '/';
       // throw new Error('No hay usuario logueado');
      

      }
      return currentUser;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Helper functions para acceder a datos específicos
  const getUserTiendas = (): Tienda[] => {
    return user?.tiendas || [];
  };

  const getUserSucursales = (): Sucursal[] => {
    return user?.sucursales || [];
  };

  const hasTiendaAccess = (tiendaId: number): boolean => {
    return user?.tiendas.some(t => t.id === tiendaId) || false;
  };

  const hasSucursalAccess = (sucursalId: number): boolean => {
    return user?.sucursales.some(s => s.id === sucursalId) || false;
  };

  return {
    // Login/logout
    login,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
    
    // User data
    user,
    isAuthenticated: !!user && !error,
    isCheckingAuth,
    authError: error,
    
    // Refresh
    refreshUser,
    
    // Helper functions
    getUserTiendas,
    getUserSucursales,
    hasTiendaAccess,
    hasSucursalAccess,
    
    // User properties directas
    userEmail: user?.email,
    userName: user?.nombre,
    userApellido: user?.apellido,
    userRol: user?.rol,
    userActivo: user?.activo,
  };
};