// ~/services/configWebService.ts

import { CreateConfigWebDto,type ConfigWebResponseDto,type UpdateConfigWebBase64Dto } from '~/models/configWeb';

// Define la URL base de tu API (¡ACTUALIZA ESTO!)
const API_BASE_URL = 'http://localhost:3000'; 

export const configWebService = {

  /**
   * 1. Obtiene la configuración web existente.
   * Asumimos que siempre es un registro y el endpoint es fijo.
   */
  getConfiguracion: async (): Promise<ConfigWebResponseDto | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/config-web/1`);
        
        if (response.status === 404 || response.status === 204) {
            // Si no existe, devuelve null para iniciar el modo creación.
            return null; 
        }
        if (!response.ok) {
            throw new Error(`Error al cargar la configuración: ${response.statusText}`);
        }
        return response.json(); 
    } catch (error) {
        console.error("Error fetching config:", error);
        throw error;
    }
  },

  /**
   * 2. Crea la primera configuración web.
   */
  createConfiguracion: async (data: UpdateConfigWebBase64Dto): Promise<ConfigWebResponseDto> => {
    
    // El backend debe manejar el Base64 en el campo logoBase64
    const response = await fetch(`${API_BASE_URL}/config-web`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo crear la configuración.`);
    }
    return response.json(); 
  },
  
  /**
   * 3. Actualiza la configuración web existente.
   */
  updateConfiguracion: async (id: number, data: UpdateConfigWebBase64Dto): Promise<ConfigWebResponseDto> => {
    
    // El backend debe manejar el Base64 en el campo logoBase64
    const response = await fetch(`${API_BASE_URL}/config-web/${id}`, {
      method: 'PATCH', // Usamos PUT para actualizar el registro completo
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  
    console.log(data)
   

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
         console.log(errorData)
        throw new Error( `Error server ${errorData.message} `|| `Error ${response.status}: No se pudo actualizar la configuración.`);
    }
    return response.json(); 
  }
};