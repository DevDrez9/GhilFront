// ~/services/ventaService.ts

import type { EstadisticasQueryOptions, EstadisticasVentaResponse } from '~/models/estadisticas';
import { CreateVentaDto, VentaResponseDto, type PaginatedVentasDto, type VentaApiResponse } from '~/models/ventas';

// Define la URL base de tu API (¡ACTUALIZA ESTO!)
const API_BASE_URL = 'http://localhost:3000'; 

// Opciones de búsqueda y paginación para la tabla
interface VentaQueryOptions {
    page?: number;
    limit?: number;
    tiendaId?: number;
    search?: string; // Para buscar por cliente, etc.
}
type PeriodoVentas = 'dia' | 'semana' | 'mes' | '3meses' | '12meses'; 
export const ventaService = {

    /**
     * 1. Crea una nueva venta.
     */
    createVenta: async (data: CreateVentaDto): Promise<VentaResponseDto> => {
        
        const response = await fetch(`${API_BASE_URL}/ventas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        return response.json(); 
    },
    
    /**
     * 2. Obtiene una lista paginada de ventas. (Para la tabla)
     */
    getVentas: async (options: VentaQueryOptions = {}): Promise<VentaApiResponse> => {
        // 1. Construye la cadena de consulta (query string) con los parámetros
        const params = new URLSearchParams({
            page: String(options.page || 1),
            limit: String(options.limit || 10),
            // Asegura que solo se añaden los parámetros si existen
            ...(options.tiendaId && { tiendaId: String(options.tiendaId) }),
            ...(options.search && { search: options.search }),
        });
        
        const url = `${API_BASE_URL}/ventas?${params.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
            // Manejo robusto de errores, intentando extraer el mensaje del backend
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        // 2. Devuelve el objeto JSON completo (ej: { ventas: [...], total: 0 })
        return response.json();
    },

     getEstadisticas: async (options: EstadisticasQueryOptions = {}): Promise<EstadisticasVentaResponse> => {
        const params = new URLSearchParams({
            ...(options.tiendaId && { tiendaId: String(options.tiendaId) }),
            ...(options.sucursalId && { sucursalId: String(options.sucursalId) }),
        });
        
        // Endpoint: /ventas/estadisticas
        const url = `${API_BASE_URL}/ventas/estadisticas?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        return response.json();
    },

    /**
     * Obtiene todas las ventas de un periodo específico para gráficos de tendencia.
     */
    getVentasPorPeriodo: async (periodo: PeriodoVentas, options: EstadisticasQueryOptions = {}): Promise<VentaResponseDto[]> => {
        const params = new URLSearchParams({
            ...(options.tiendaId && { tiendaId: String(options.tiendaId) }),
            ...(options.sucursalId && { sucursalId: String(options.sucursalId) }),
        });
        
        // Endpoint: /ventas/periodo/:periodo
        const url = `${API_BASE_URL}/ventas/periodo/${periodo}?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Mapeamos los resultados para asegurar que las fechas y anidamientos
        // se conviertan a instancias de VentaResponseDto si es necesario.
        return data.map((venta: any) => new VentaResponseDto(venta));
    }

};

