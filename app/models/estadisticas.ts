// En ~/models/estadisticas.ts

import { EstadoVenta, MetodoPago } from './ventas'; // Asumo que estos enums están en venta.ts

// Tipos para los resultados de agrupamiento de Prisma
interface VentaGroupCount {
    _all: number;
}
interface VentaGroupSum {
    total: number | null;
}

export interface VentasPorEstadoItem {
    estado: EstadoVenta;
    _count: VentaGroupCount;
}

export interface VentasPorMetodoPagoItem {
    metodoPago: MetodoPago;
    _count: VentaGroupCount;
    _sum: VentaGroupSum;
}

// DTO de Respuesta de getEstadisticas
export interface EstadisticasVentaResponse {
    totalVentas: number;
    ventasHoy: number;
    ventasEsteMes: number;
    totalIngresos: number;
    ingresosEsteMes: number;
    ventasPorEstado: VentasPorEstadoItem[];
    ventasPorMetodoPago: VentasPorMetodoPagoItem[];
}

// Opciones de consulta (filtros)
export interface EstadisticasQueryOptions {
    tiendaId?: number;
    sucursalId?: number;
}

export { EstadoVenta };
