// En ~/models/categoriaReporte.ts

// Asumiendo que CategoriaResponseDto existe y tiene al menos id y nombre
interface CategoriaBaseDto {
    id: number;
    nombre: string;
    // totalProductos: number; // Ya incluido en la respuesta del backend
}

export interface EstadisticasCategoriaMetrics {
    totalProductos: number;
    totalSubcategorias: number;
    productosConStock: number;
    productosSinStock: number;
    productosDestacados: number;
    porcentajeConStock: number;
}

// DTO de respuesta final del endpoint
export interface CategoriaEstadisticasResponseDto {
    categoria: CategoriaBaseDto;
    estadisticas: EstadisticasCategoriaMetrics;
}

// Opciones de filtro
export interface CategoriaReporteOptions {
    categoriaId: number;
}