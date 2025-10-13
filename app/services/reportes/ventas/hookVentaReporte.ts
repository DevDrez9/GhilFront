import { useQuery } from '@tanstack/react-query'; 
import { useMemo } from 'react';
import type { 
    VentaEstadisticasJson, VentaPeriodoJson, 
    VentaEstadisticasMetrics, VentaTendenciaItem, 
    VentaReporteOptions 
} from '~/models/ventaReporte'; 

// 🚨 IMPORTANTE: Define la URL base de tu API
const API_BASE_URL = 'http://localhost:3000'; // Reemplaza con tu URL real

// ----------------------------------------------------------------------
// FUNCIONES DE FETCH REALES (Usando las respuestas JSON que proporcionaste)
// ----------------------------------------------------------------------

// 1. Fetch para las métricas de estadísticas
const fetchVentaEstadisticas = async (options: VentaReporteOptions): Promise<VentaEstadisticasJson> => {
    // Construir los query parameters basados en las opciones de filtro
    const params = new URLSearchParams();
    if (options.tiendaId !== undefined) {
        params.append('tiendaId', options.tiendaId.toString());
    }
    if (options.sucursalId !== undefined) {
        params.append('sucursalId', options.sucursalId.toString());
    }
    // Puedes añadir el periodoTendencia si tu backend lo necesita para el cálculo
    // params.append('periodo', options.periodoTendencia); 

    const url = `${API_BASE_URL}/ventas/estadisticas?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al obtener estadísticas: ${errorData.message || response.statusText}`);
    }
    return response.json(); // La respuesta debe coincidir con VentaEstadisticasJson
};

// 2. Fetch para los datos detallados del período (tendencia/tabla)
const fetchVentaTendencia = async (options: VentaReporteOptions): Promise<VentaPeriodoJson[]> => {
    const params = new URLSearchParams();
    if (options.tiendaId !== undefined) {
        params.append('tiendaId', options.tiendaId.toString());
    }
    if (options.sucursalId !== undefined) {
        params.append('sucursalId', options.sucursalId.toString());
    }
    // El backend puede usar este filtro para determinar el rango de fechas
    params.append('periodo', options.periodoTendencia); 

    const url = `${API_BASE_URL}/ventas/periodo/${options.periodoTendencia}?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al obtener datos de período: ${errorData.message || response.statusText}`);
    }
    return response.json(); // La respuesta debe coincidir con VentaPeriodoJson[]
};
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------------
// HOOK A: Obtiene los datos crudos del PERÍODO (Ventas detalladas)
// ----------------------------------------------------------------------------
export const useVentaPeriodoRaw = (options: VentaReporteOptions) => {
    return useQuery({
        queryKey: ['ventaPeriodoRaw', options],
        queryFn: () => fetchVentaTendencia(options), 
        // Solo se habilita si hay un filtro (tienda o sucursal)
        enabled: !!(options.tiendaId || options.sucursalId),
    });
};

// ----------------------------------------------------------------------------
// HOOK B: CALCULA Y MAPEA LAS ESTADÍSTICAS CLAVE (Usa los datos RAW)
// ----------------------------------------------------------------------------
export const useVentaEstadisticas = (options: VentaReporteOptions) => {
    
    // Obtenemos los datos RAW para poder calcular 'productosVendidos'
    const { data: rawPeriodo } = useVentaPeriodoRaw(options); 

    const { data: rawStats, isLoading, isError, error } = useQuery({
        queryKey: ['ventaEstadisticas', options],
        queryFn: () => fetchVentaEstadisticas(options),
        enabled: !!(options.tiendaId || options.sucursalId),
    });

    const data: VentaEstadisticasMetrics | undefined = useMemo(() => {
        if (!rawStats) return undefined;

        const totalVentas = Number(rawStats.totalVentas || 0);
        // Conversión CLAVE de string a number para campos monetarios
        const ingresoTotal = Number(rawStats.totalIngresos || 0);
        const ingresoHoy = Number(rawStats.ventasHoy || 0); 
        
        const promedioVenta = totalVentas > 0 ? ingresoTotal / totalVentas : 0;
        
        let productosVendidos = 0;
        if (rawPeriodo) {
            // Se calcula sumando la cantidad de todos los ítems de todas las ventas
            productosVendidos = rawPeriodo.reduce((sum, venta) => {
                return sum + venta.items.reduce((itemSum, item) => itemSum + Number(item.cantidad), 0);
            }, 0);
        }

        return {
            ingresoTotal: ingresoTotal,
            totalVentas: totalVentas,
            promedioVenta: promedioVenta,
            ingresoHoy: ingresoHoy, 
            productosVendidos: productosVendidos,
        };

    }, [rawStats, rawPeriodo]); 

    return { data, isLoading, isError, error: error as Error | null };
};

// ----------------------------------------------------------------------------
// HOOK C: PROCESA LOS DATOS DE TENDENCIA (Agregación temporal)
// ----------------------------------------------------------------------------
export const useVentaTendencia = (options: VentaReporteOptions) => {
    
    // Usamos el hook RAW para obtener los datos detallados
    const { data: rawPeriodo, isLoading, isError, error } = useVentaPeriodoRaw(options); 

    const data: VentaTendenciaItem[] = useMemo(() => {
        if (!rawPeriodo || rawPeriodo.length === 0) return [];
        
        const tendenciaMap = new Map<string, number>();

        const formatters = {
            'dia': (date: Date) => date.toISOString().split('T')[0], // YYYY-MM-DD
            'semana': (date: Date) => {
                const d = new Date(date);
                // Calcula el Lunes de la semana actual
                d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
                return d.toISOString().split('T')[0] + ' (Semana)';
            },
            'mes': (date: Date) => date.toISOString().substring(0, 7), // YYYY-MM
        };
        
        const formatter = formatters[options.periodoTendencia];
        
        rawPeriodo.forEach(venta => {
            const date = new Date(venta.createdAt);
            const key = formatter(date);
            // Conversión CLAVE de string a number
            const total = Number(venta.total); 
            
            tendenciaMap.set(key, (tendenciaMap.get(key) || 0) + total);
        });

        const tendencia = Array.from(tendenciaMap.entries())
            .map(([fecha, total]) => ({
                fecha: fecha,
                total: total
            }))
            .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

        return tendencia;

    }, [rawPeriodo, options.periodoTendencia]);

    return { data, isLoading, isError, error: error as Error | null };
};