// ===============================================
// TIPOS DE LA RESPUESTA DE LA API (JSON RAW)
// ===============================================

export interface VentaEstadisticasJson {
    totalVentas: number;
    ventasHoy: number;
    ventasEsteMes: number;
    totalIngresos: string; // Viene como string
    ingresosEsteMes: string;
    ventasPorEstado: any[]; // Usaremos 'any' ya que no se procesa
    ventasPorMetodoPago: any[]; // Usaremos 'any' ya que no se procesa
}

export interface VentaItemJson {
    id: number;
    cantidad: number;
    precio: string;
    productoId: number;
    ventaId: number;
    producto: {
        id: number;
        nombre: string;
        // ... otros
    };
}

export interface VentaPeriodoJson {
    id: number;
    numeroVenta: string;
    estado: string;
    total: string; // Viene como string
    sucursalId: number;
    createdAt: string; // Clave para la agrupación de tendencia
    items: VentaItemJson[];
    // ... otros
}

// ===============================================
// TIPOS DE DATOS PROCESADOS (ESPERADOS POR EL FRONTEND)
// ===============================================

export type PeriodoVenta = 'dia' | 'semana' | 'mes';

export interface VentaReporteOptions {
    tiendaId: number | undefined;
    sucursalId: number | undefined;
    periodoTendencia: PeriodoVenta;
}

export interface VentaEstadisticasMetrics {
    ingresoTotal: number;
    totalVentas: number;
    promedioVenta: number;
    ingresoHoy: number;
    productosVendidos: number;
}

export interface VentaTendenciaItem {
    fecha: string;
    total: number;
}