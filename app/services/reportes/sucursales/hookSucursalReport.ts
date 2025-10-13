// En ~/hooks/useSucursalEstadisticas.ts

import { useQuery } from '@tanstack/react-query';

import type { SucursalEstadisticasResponseDto, SucursalReporteOptions } from '~/models/sucursalReporte';
import { sucursalReporteService } from './sucursalReporte';

export const useSucursalEstadisticas = (options: SucursalReporteOptions) => {
    const { sucursalId } = options;
    
    // Solo ejecuta la consulta si sucursalId es un número válido y mayor a 0
    const enabled = !!sucursalId && sucursalId > 0; 

    return useQuery<SucursalEstadisticasResponseDto, Error>({
        queryKey: ['sucursalEstadisticas', sucursalId], 
        queryFn: () => sucursalReporteService.getEstadisticas(sucursalId),
        enabled: enabled,
        staleTime: 5 * 60 * 1000, 
    });
};