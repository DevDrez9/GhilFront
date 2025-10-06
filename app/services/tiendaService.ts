// ~/services/tiendaService.ts

import { TiendaDto, TiendaResponseDto } from '~/models/tienda';

// Define la URL base de tu API (¡ACTUALIZA ESTO!)
const API_BASE_URL = 'http://localhost:3000'; 

export const tiendaService = {

    /**
     * 1. Obtiene la configuración de la tienda existente.
     * Asumimos que hay un endpoint para obtener la tienda principal.
     */
    getTienda: async (): Promise<TiendaResponseDto | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/tiendas/1`);
            
            if (response.status === 404 || response.status === 204) {
                // Si no existe, devuelve null para iniciar el modo creación.
                return null; 
            }
            if (!response.ok) {
                throw new Error(`Error al cargar la tienda: ${response.statusText}`);
            }
            return response.json(); 
        } catch (error) {
            console.error("Error fetching tienda config:", error);
            throw error;
        }
    },

    /**
     * 2. Crea la tienda principal (POST).
     */
    createTienda: async (data: TiendaDto): Promise<TiendaResponseDto> => {
        
        const response = await fetch(`${API_BASE_URL}/tiendas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: No se pudo crear la tienda.`);
        }
        return response.json(); 
    },
    
    /**
     * 3. Actualiza la tienda existente (PUT).
     */
    updateTienda: async (id: number, data: TiendaDto): Promise<TiendaResponseDto> => {
        
        const response = await fetch(`${API_BASE_URL}/tiendas/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: No se pudo actualizar la tienda.`);
        }
        return response.json(); 
    }
};