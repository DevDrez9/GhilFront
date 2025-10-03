// ~/models/productos.ts

/**
 * Define la estructura de un objeto de imagen para la creación de productos.
 * Utilizado para tipificar el array 'imagenes' en CreateProductoDto.
 */
export class CreateImagenProductoDto {
  url!: string;
  orden?: number; // Opcional
}

/**
 * Define la estructura de los datos que se envían a la API
 * para crear un nuevo producto.
 */
export class CreateProductoDto {
  nombre!: string;
  descripcion?: string; // Opcional
  precio!: number;
  precioOferta?: number; // Opcional
  enOferta?: boolean; // Opcional
  esNuevo?: boolean; // Opcional
  esDestacado?: boolean; // Opcional
  stock?: number; // Opcional
  stockMinimo?: number; // Opcional
  sku?: string; // Opcional
  imagenUrl?: string; // Opcional
  categoriaId!: number;
  subcategoriaId?: number; // Opcional
  tiendaId!: number;
  proveedorId?: number; // Opcional
  
  // Array de objetos anidados
  imagenes?: CreateImagenProductoDto[]; // Opcional
}

/**
 * Define la estructura de respuesta completa que se recibe de la API
 * (opcional, pero buena práctica).
 */
export interface ProductoResponseDto extends CreateProductoDto {
    id: number;
    createdAt: string;
    updatedAt: string;
}