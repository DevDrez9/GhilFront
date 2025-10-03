// DTO de Respuesta para Subcategoría (asumida para la respuesta API)
export class SubcategoriaResponseDto {
  id: number;
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: any) {
    this.id = partial.id;
    this.nombre = partial.nombre;
    this.descripcion = partial.descripcion;
    this.categoriaId = partial.categoriaId;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;
  }
}

// DTO de Respuesta para Categoría (incluye subcategorías)
export class CategoriaResponseDto {
  id: number;
  nombre: string;
  descripcion?: string;
  tiendaId: number;
  createdAt: Date;
  updatedAt: Date;
  subcategorias: SubcategoriaResponseDto[];

  constructor(partial: any) {
    this.id = partial.id;
    this.nombre = partial.nombre;
    this.descripcion = partial.descripcion;
    this.tiendaId = partial.tiendaId;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;
    this.subcategorias = partial.subcategorias ? partial.subcategorias.map((s: any) => new SubcategoriaResponseDto(s)) : [];
  }
}

// DTO para Crear Categoría (como lo proporcionaste, sin decoradores)
export class CreateCategoriaDto {
  nombre!: string;
  descripcion?: string;
  tiendaId!: number;
}

// DTO para Crear Subcategoría (como lo proporcionaste, pero usado para agregar)
export class CreateSubcategoriaDto {
  nombre!: string;
  descripcion?: string;
  categoriaId?: number; // Opcional si se usa en endpoint dedicado, obligatorio si es genérico
}