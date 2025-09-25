// src/services/api.ts

import type { LoginCredentials, User } from "~/models/auth";


export const API_BASE_URL = 'http://localhost:3000';

export const api = {
  // Login con tipos
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/validate-login`, {
       method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el login');
    }

    const userData: User = await response.json();
    return userData;
  },

  verifySession: async (): Promise<User> => {
    try {
      const user = localStorage.getItem('auth_user_data');
      if (!user) {
        throw new Error('No hay sesión activa');
      }
      
      return JSON.parse(user) as User;
    } catch (error) {
      throw new Error('Error verificando sesión');
    }
  },
};