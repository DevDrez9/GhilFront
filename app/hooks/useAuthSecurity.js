// src/hooks/useAuthSecurity.js
import { useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAuthSecurity = () => {
  const { user, logout, refreshUser } = useAuth();

  useEffect(() => {
    // Verificar periodicamente la validez de la sesión
    const checkSessionValidity = async () => {
      if (user) {
        try {
          await refreshUser();
        } catch (error) {
          console.warn('Session validation failed:', error);
          logout();
        }
      }
    };

    // Verificar cada 5 minutos
    const interval = setInterval(checkSessionValidity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, refreshUser, logout]);

  // Limpiar cache muy viejo al cargar la app
  useEffect(() => {
    const cleanupOldCache = () => {
      const timestamp = localStorage.getItem('auth_timestamp');
      if (timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp);
        if (cacheAge > 7 * 24 * 60 * 60 * 1000) { // 7 días
          localStorage.removeItem('auth_user_data');
          localStorage.removeItem('auth_timestamp');
        }
      }
    };

    cleanupOldCache();
  }, []);
};