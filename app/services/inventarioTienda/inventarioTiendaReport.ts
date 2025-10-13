import { useQuery } from '@tanstack/react-query'; 
import type { 
    InventarioEstadisticasJson, InventarioMovimientosJson, 
    InventarioReporteOptions, MovimientoOptions 
} from '~/models/inventarioReporteTypes'; 

// 🚨 Define la URL base de tu API
const API_BASE_URL = 'http://localhost:3000'; 

// ----------------------------------------------------------------------
// CONSTANTE DE TIENDA FIJA
// ----------------------------------------------------------------------
const TIENDA_ID_REPORTE = 1;

// ----------------------------------------------------------------------
// FUNCIONES DE FETCH REALES (MODIFICADAS)
// ----------------------------------------------------------------------

// 1. Fetch para Estadísticas Generales de Inventario (TIENDA FIJA)
const fetchInventarioEstadisticas = async (): Promise<InventarioEstadisticasJson> => {
    
    // El parámetro tiendaId: 1 se pasa fijo
    const params = new URLSearchParams();
    params.append('tiendaId', TIENDA_ID_REPORTE.toString());
    
    const url = `${API_BASE_URL}/inventario-tienda/estadisticas?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al obtener estadísticas de inventario (Tienda ${TIENDA_ID_REPORTE}): ${errorData.message || response.statusText}`);
    }
    return response.json();
};

// 2. Fetch para Movimientos Específicos de Inventario (Sin cambios, ya que depende de inventarioId)
const fetchInventarioMovimientos = async (options: MovimientoOptions): Promise<InventarioMovimientosJson> => {
    const params = new URLSearchParams();
    params.append('page', options.page.toString());
    params.append('limit', options.limit.toString());
    
    const url = `${API_BASE_URL}/inventario/${options.inventarioId}/movimientos?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al obtener movimientos de inventario: ${errorData.message || response.statusText}`);
    }
    return response.json();
};
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------------
// HOOKS DE CONSUMO (InventarioReporteOptions ya no se usa, pero se mantiene la firma)
// ----------------------------------------------------------------------------

/**
 * Hook para obtener las estadísticas generales de inventario (Fijo Tienda 1).
 */
export const useInventarioEstadisticas = (options?: InventarioReporteOptions) => {
    // La queryKey no necesita las opciones si son fijas, pero la dejamos simple.
    return useQuery<InventarioEstadisticasJson, Error>({
        queryKey: ['inventarioEstadisticas'], // Simplificado
        queryFn: () => fetchInventarioEstadisticas(),
        enabled: true, 
    });
};

/**
 * Hook para obtener los movimientos detallados de un inventario específico.
 */
export const useInventarioMovimientos = (options: MovimientoOptions) => {
    return useQuery<InventarioMovimientosJson, Error>({
        queryKey: ['inventarioMovimientos', options],
        queryFn: () => fetchInventarioMovimientos(options),
        enabled: !!options.inventarioId, 
    });
};