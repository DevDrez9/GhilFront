// En ~/services/reportes/categorias/hookCategoriaReport.ts (siguiendo tu convención)

import { useQuery } from '@tanstack/react-query';
import { categoriaReporteService } from './categoriaReporte';
import type { CategoriaEstadisticasResponseDto, CategoriaReporteOptions } from '~/models/categoriaReporte';


export const useCategoriaEstadisticas = (options: CategoriaReporteOptions) => {
    const { categoriaId } = options;
    
    // Solo ejecuta la consulta si categoriaId es un número válido y mayor a 0
    const enabled = !!categoriaId && categoriaId > 0; 

    return useQuery<CategoriaEstadisticasResponseDto, Error>({
        queryKey: ['categoriaEstadisticas', categoriaId], 
        queryFn: () => categoriaReporteService.getEstadisticas(categoriaId),
        enabled: enabled,
        staleTime: 5 * 60 * 1000, 
    });
};