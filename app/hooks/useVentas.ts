// En ~/hooks/useVentas.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ventaService } from '~/services/ventaService';
import { 
    CreateVentaDto, 
    VentaResponseDto, 
    type VentaApiResponse, 
    // Asumo que esta es la interfaz para las opciones que usa el service
    type VentaQueryOptions // 👈 Asegúrate de importar la interfaz del service
} from '~/models/ventas';
import type { EstadisticasVentaResponse } from '~/models/estadisticas';

// ✅ SIMPLIFICACIÓN: El hook solo acepta el objeto de opciones
// La interfaz GetVentasOptions es similar a VentaQueryOptions, podemos usar una sola.
interface UseVentasOptions extends VentaQueryOptions {
    enabled?: boolean; // Para control de habilitación de la query de React Query
}

// ✅ CAMBIO CLAVE: El hook ahora acepta el objeto options como único argumento para los filtros
export const useVentas = (options: UseVentasOptions = {}) => {
    const queryClient = useQueryClient();
    
    // Extraemos la propiedad `enabled` y dejamos el resto para la query key y query fn
    const { enabled = true, ...queryOptions } = options;

    // --- MUTACIÓN: Creación de Venta ---
    const createVentaMutation = useMutation<VentaResponseDto, Error, CreateVentaDto>({
        mutationFn: (data) => ventaService.createVenta(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ventas'] }); 
            queryClient.invalidateQueries({ queryKey: ['inventarioSucursal'] });
        },
    });
    
    // --- CONSULTA: Obtener Ventas ---
    const ventasQuery = useQuery<VentaApiResponse, Error>({
        // ✅ CORRECCIÓN 1: La queryKey debe reflejar TODAS las opciones para re-fetch automático
        // Usamos JSON.stringify para que el objeto sea una clave estable
        queryKey: ['ventas', JSON.stringify(queryOptions)], 
        
        // ✅ CORRECCIÓN 2: La queryFn llama al service pasándole el objeto de opciones
        queryFn: () => ventaService.getVentas(queryOptions),
        
        // ✅ CORRECCIÓN 3: Usa la propiedad 'enabled' para controlar la query
        enabled: enabled, 
        
        select: (data) => ({
            // Asegúrate de que el constructor maneje la conversión de fechas correctamente
            ventas: data.ventas.map(venta => new VentaResponseDto(venta)),
            total: data.total,
        }),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const estadisticasQuery = useQuery<EstadisticasVentaResponse, Error>({
        queryKey: ['ventasEstadisticas', options],
        queryFn: () => ventaService.getEstadisticas(options),
        staleTime: 5 * 60 * 1000,
    });
    
    // Consulta 2: Ventas por día/semana/mes para gráficos de tendencia (ej: las últimas 4 semanas)
    // Aquí solo consultaremos el último mes como ejemplo.
    const periodoQuery = useQuery<VentaResponseDto[], Error>({
        queryKey: ['ventasPeriodo', 'mes', options],
        queryFn: () => ventaService.getVentasPorPeriodo('mes', options),
        staleTime: 5 * 60 * 1000,
    });

    return {
        // ... (Mutación)
        createVenta: createVentaMutation.mutateAsync,
        isCreating: createVentaMutation.isPending,
        createError: createVentaMutation.error,
        
        // ... (Consulta)
        ventas: ventasQuery.data?.ventas || [],
        total: ventasQuery.data?.total || 0,
        isLoadingVentas: ventasQuery.isLoading,
        isErrorVentas: ventasQuery.isError,
        errorVentas: ventasQuery.error,
        refetchVentas: ventasQuery.refetch,


         // Data general
        data: estadisticasQuery.data,
        isLoading: estadisticasQuery.isLoading || periodoQuery.isLoading,
        isError: estadisticasQuery.isError || periodoQuery.isError,
        error: estadisticasQuery.error || periodoQuery.error,
        
        // Datos para gráficos
        ventasPorPeriodo: periodoQuery.data,
        
        // Mutaciones para filtros (si cambian options)
        refetchEstadisticas: estadisticasQuery.refetch,
    };
};