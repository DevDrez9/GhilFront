// En ~/services/productoReporteService.ts

import type { TrabajoAgregadoResponseDto, VentaAgregadaResponseDto, ProductoReporteOptions } from '~/models/productoReporte';

const API_BASE_URL = 'http://localhost:3000'; // Reemplaza con tu URL base de API

export const productoReporteService = {
    // 1. Obtiene la data de Producción (Trabajos Finalizados)
    getAgregadoPorProducto: async (options: ProductoReporteOptions): Promise<TrabajoAgregadoResponseDto> => {
        const { productoId, tiendaId } = options;
        // Asume que FilterProductoTrabajoDto se traduce a query params
        const url = `${API_BASE_URL}/trabajos-finalizados/agregado/producto/${productoId}?tiendaId=${tiendaId || ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener datos de producción.");
        return response.json();
    },

    // 2. Obtiene la data de Ventas Globales
    getVentasGlobalesPorProducto: async (options: ProductoReporteOptions): Promise<VentaAgregadaResponseDto> => {
        const { productoId, tiendaId } = options;
        const url = `${API_BASE_URL}/ventas/producto/${productoId}/tienda/${tiendaId || 1}`; // Asume 0 si no hay tiendaId
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener datos de ventas.");
        return response.json();
    }
};