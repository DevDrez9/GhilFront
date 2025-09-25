// src/hooks/useCachedAuth.js
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const USER_CACHE_KEY = 'user_cache';
const CACHE_TIMESTAMP_KEY = 'user_cache_timestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export const useCachedAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar desde cache
  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && timestamp) {
        const isCacheValid = Date.now() - parseInt(timestamp) < CACHE_DURATION;
        if (isCacheValid) {
          return JSON.parse(cached);
        }
      }
    } catch (e) {
      console.warn('Error loading cache:', e);
    }
    return null;
  }, []);

  // Guardar en cache
  const saveToCache = useCallback((userData) => {
    try {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Error saving cache:', e);
    }
  }, []);

  // Cargar usuario al iniciar
  useEffect(() => {
    const cachedUser = loadFromCache();
    if (cachedUser) {
      setUser(cachedUser);
    }
  }, [loadFromCache]);

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await api.login(credentials);
      setUser(userData);
      saveToCache(userData);
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    window.location.href = '/login';
  };

  // Refrescar datos (opcional)
  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const freshData = await api.verifySession();
      setUser(freshData);
      saveToCache(freshData);
    } catch (err) {
      console.warn('Error refreshing user:', err);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };
};