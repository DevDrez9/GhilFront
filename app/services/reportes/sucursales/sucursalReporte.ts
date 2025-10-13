// En ~/services/sucursalReporteService.ts

import type { SucursalEstadisticasResponseDto } from '~/models/sucursalReporte';

const API_BASE_URL = 'http://localhost:3000/sucursales'; // Ajusta la URL base

export const sucursalReporteService = {
    getEstadisticas: async (sucursalId: number): Promise<SucursalEstadisticasResponseDto> => {
        const url = `${API_BASE_URL}/${sucursalId}/estadisticas`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al obtener estadísticas de la sucursal ${sucursalId}.`);
        }
        
        const data = await response.json();
        
        // El backend ya hace el mapeo, solo aseguramos que los números sean correctos
        return {
            sucursal: data.sucursal,
            estadisticas: {
                ...data.estadisticas,
                ventasMensuales: Number(data.estadisticas.ventasMensuales || 0),
                stockTotal: Number(data.estadisticas.stockTotal || 0),
            }
        };
    },
};