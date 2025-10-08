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
import type { EstadisticasQueryOptions, EstadisticasVentaResponse } from '~/models/estadisticas';

// ✅ SIMPLIFICACIÓN: El hook solo acepta el objeto de opciones
// La interfaz GetVentasOptions es similar a VentaQueryOptions, podemos usar una sola.
interface UseVentasOptions extends VentaQueryOptions {
    enabled?: boolean; // Para control de habilitación de la query de React Query
}
// Opciones que permiten el filtrado para ambas funciones del backend
interface UseEstadisticasOptions extends EstadisticasQueryOptions {
    tiendaId?: number;
    sucursalId?: number;
    // Añadir 'enabled' para controlar la query si es necesario
    enabled?: boolean; 
}


// ✅ CAMBIO CLAVE: El hook ahora acepta el objeto options como único argumento para los filtros
export const useVentas = (options: UseEstadisticasOptions = {}) => {
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
        // La clave de consulta debe cambiar cuando cambian las opciones (filtros)
        queryKey: ['ventasEstadisticas', queryOptions],
        queryFn: () => ventaService.getEstadisticas(queryOptions),
        enabled: enabled,
        staleTime: 5 * 60 * 1000,
    });
    
    // --- Consulta 2: Ventas de los últimos 3 meses (para gráficos de tendencia) ---
    // ASUMIMOS que tu backend puede configurarse para devolver '3meses'
    const periodoQuery = useQuery<VentaResponseDto[], Error>({
        // La clave de consulta incluye el periodo y las opciones de filtro
        queryKey: ['ventasPeriodo', '3meses', queryOptions],
        // Llamamos al service con el periodo '3meses' y los filtros
        queryFn: () => ventaService.getVentasPorPeriodo('3meses', queryOptions),
        enabled: enabled,
        staleTime: 5 * 60 * 1000,
    });
    
    // 🛑 Consulta 3: Ventas por Periodo (12 meses)
    const ventasAnualesQuery = useQuery<VentaResponseDto[], Error>({
        queryKey: ['ventasPeriodo', '12meses', queryOptions],
        // Asumimos que podemos pedir 'año' o '12meses' para obtener data de 12 meses
        queryFn: () => ventaService.getVentasPorPeriodo('12meses', queryOptions),
        enabled: enabled,
        staleTime: 5 * 60 * 1000,
    });
    
    // Filtrado y procesamiento de los 3 meses (SE MANTIENE)
    // ...

    // 🛑 Ventas de los últimos 12 meses
    const ventasUltimos12Meses = ventasAnualesQuery.data?.filter(venta => {
        const doceMesesAtras = new Date();
        doceMesesAtras.setMonth(doceMesesAtras.getMonth() - 12);
        return venta.fechaVenta >= doceMesesAtras;
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
          estadisticas: estadisticasQuery.data,
           ventasUltimos3Meses: periodoQuery.data,
        data: estadisticasQuery.data,
        
        isError: estadisticasQuery.isError || periodoQuery.isError,
        error: estadisticasQuery.error || periodoQuery.error,
         refetchEstadisticas: estadisticasQuery.refetch,
        refetchPeriodo: periodoQuery.refetch,
        
        // Datos para gráficos
        ventasPorPeriodo: periodoQuery.data,

         ventasUltimos12Meses: ventasUltimos12Meses, // 👈 Nuevo retorno
        isLoading: estadisticasQuery.isLoading || periodoQuery.isLoading || ventasAnualesQuery.isLoading,
        // ...
        
      
    };
};