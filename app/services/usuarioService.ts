// En ~/services/usuarioService.ts

import {type UsuarioApiResponse,type UsuarioQueryOptions, UsuarioResponseDto, CreateUsuarioDto } from '~/models/usuario'; 

const API_BASE_URL = 'http://localhost:3000'; 

export const usuarioService = {

    getUsuarios: async (options: UsuarioQueryOptions = {}): Promise<UsuarioApiResponse> => {
        
        // Asumiendo que AÚN puedes enviar parámetros de búsqueda/filtrado
        const params = new URLSearchParams({
            ...(options.search && { search: options.search }),
            ...(options.rol && { rol: options.rol }),
            // Si no hay paginación, eliminamos 'page' y 'limit'
        });
        
        const url = `${API_BASE_URL}/usuarios?${params.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        // ✅ Devuelve el array directamente
        return response.json();
    },

     createUsuario: async (data: CreateUsuarioDto): Promise<UsuarioResponseDto> => {
    
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Muestra un error más específico si la API lo proporciona
      throw new Error(errorData.message || `Error ${response.status}: No se pudo crear el usuario.`);
    }

    return response.json(); 
  },
    
    // Puedes añadir deleteUsuario, updateUsuario, getUsuarioById, etc. aquí
};