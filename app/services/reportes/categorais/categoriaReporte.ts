// En ~/services/categoriaReporteService.ts

import type { CategoriaEstadisticasResponseDto } from "~/models/categoriaReporte";




const API_BASE_URL = 'http://localhost:3000/categorias'; // Ajusta la URL base

export const categoriaReporteService = {
    getEstadisticas: async (categoriaId: number): Promise<CategoriaEstadisticasResponseDto> => {
        const url = `${API_BASE_URL}/${categoriaId}/estadisticas`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al obtener estadísticas de la categoría ${categoriaId}.`);
        }
        
        const data = await response.json();
        
        // Aseguramos que los números sean correctos (especialmente el porcentaje)
        return {
            categoria: data.categoria,
            estadisticas: {
                ...data.estadisticas,
                porcentajeConStock: Number(data.estadisticas.porcentajeConStock || 0),
            }
        };
    },
};