// ===============================================
// TIPOS DE LA RESPUESTA DE LA API (JSON RAW)
// ===============================================

/**
 * Respuesta del endpoint GET /inventario/estadisticas
 */
export interface InventarioEstadisticasJson {
    totalProductos: number;
    productosConStock: number;
    productosSinStock: number;
    productosBajoStock: number;
    valorTotalInventario: number; 
    porcentajeConStock: number;
    porcentajeBajoStock: number;
}

// Tipos para los movimientos detallados (sin cambios)
export interface MovimientoInventarioDetalle {
    id: number;
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    cantidad: number;
    referencia: string;
    createdAt: string;
    
    usuario: { id: number; nombre: string; email: string };
    
    venta: { id: number; numeroVenta: string } | null;
    compra: { id: number; numeroCompra: string } | null;
    transferencia: { id: number; codigo: string } | null;
}

export interface InventarioMovimientosJson {
    inventario: {
        id: number;
        stock: number;
        productoNombre: string; 
    };
    movimientos: MovimientoInventarioDetalle[];
    total: number;
    page: number;
    limit: number;
}


// ===============================================
// TIPOS DE DATOS PROCESADOS / OPCIONES
// ===============================================

// Opciones de estadísticas: Ahora solo un placeholder, el ID se fija en el hook.
export interface InventarioReporteOptions {
    // Si bien el hook internamente usará tiendaId: 1, la interfaz puede ser vacía o simple.
}

export interface MovimientoOptions {
    inventarioId: number; 
    page: number;
    limit: number;
}