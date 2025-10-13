// En ~/hooks/useProductoPerformance.ts

import { useQuery } from '@tanstack/react-query';
import { productoReporteService } from '~/services/productoReporteService';
import type { ProductoPerformance, ProductoReporteOptions } from '~/models/productoReporte';

export const useProductoPerformance = (options: ProductoReporteOptions) => {
    const { productoId, tiendaId } = options;
    
    // El 'enabled' es vital para no ejecutar la consulta sin el productoId
    const enabled = !!productoId;

    return useQuery<ProductoPerformance, Error>({
        // La clave incluye todos los filtros que pueden cambiar el resultado
        queryKey: ['productoPerformance', productoId, tiendaId], 
        
        queryFn: async () => {
            // Ejecuta ambas llamadas en paralelo
            const [dataProduccion, dataVentas] = await Promise.all([
                productoReporteService.getAgregadoPorProducto(options),
                productoReporteService.getVentasGlobalesPorProducto(options),
            ]);

            // ⭐ LÓGICA DE CÁLCULO Y CONSOLIDACIÓN
            const totalCosto = dataProduccion.totalCosto;
            const totalIngresos = dataVentas.totalIngresos;
            
            return {
                productoId: productoId,
                nombreProducto: dataProduccion.nombreProducto || dataVentas.nombreProducto,
                totalCantidadProducida: dataProduccion.totalCantidadProducida,
                totalCosto: totalCosto,
                totalUnidadesVendidas: dataVentas.totalUnidadesVendidas,
                totalIngresos: totalIngresos,
                
                // Métrica: ¿El inventario aumentó o disminuyó?
                diferenciaStock: dataProduccion.totalCantidadProducida - dataVentas.totalUnidadesVendidas,
                
                // Métrica simple de beneficio (Ingresos - Costos de Producción)
                ingresoNetoEstimado: totalIngresos - totalCosto,
            };
        },
        
        enabled: enabled,
        staleTime: 5 * 60 * 1000,
    });
};