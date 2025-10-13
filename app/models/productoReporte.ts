// En ~/models/productoReporte.ts

// DTO de Producción (Trabajo Finalizado)
export interface TrabajoAgregadoResponseDto {
    productoId: number;
    nombreProducto: string;
    totalCosto: number;
    totalCantidadProducida: number; // Cantidad CREADA
}

// DTO de Ventas
export interface VentaAgregadaResponseDto {
    productoId: number;
    nombreProducto: string;
    totalUnidadesVendidas: number; // Cantidad VENDIDA
    totalIngresos: number;
}

// DTO combinado para el componente Frontend
export interface ProductoPerformance {
    productoId: number;
    nombreProducto: string;
    totalCantidadProducida: number;
    totalCosto: number;
    totalUnidadesVendidas: number;
    totalIngresos: number;
    // Métrica clave: ¿Cuánto se vendió vs. cuánto se produjo?
    diferenciaStock: number; 
    ingresoNetoEstimado: number; // totalIngresos - totalCosto (simplificado)
}

// Opciones de filtro
export interface ProductoReporteOptions {
    productoId: number;
    tiendaId?: number;
}