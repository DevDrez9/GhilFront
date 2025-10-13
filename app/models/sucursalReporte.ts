// En ~/models/sucursalReporte.ts

// Asumiendo que SucursalResponseDto existe y tiene al menos nombre y dirección
interface SucursalBaseDto {
    id: number;
    nombre: string;
    direccion: string;
}

export interface EstadisticasSucursalMetrics {
    totalProductos: number;
    totalVentas: number;
    totalUsuarios: number;
    ventasMensuales: number; // Suma total de ventas en los últimos 30 días
    stockTotal: number;      // Suma total del stock de todos los productos
}

// DTO de respuesta final del endpoint
export interface SucursalEstadisticasResponseDto {
    sucursal: SucursalBaseDto;
    estadisticas: EstadisticasSucursalMetrics;
}

// Opciones de filtro
export interface SucursalReporteOptions {
    sucursalId: number;
}