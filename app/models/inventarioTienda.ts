export class InventarioTiendaResponseDto {
  id: number;
  productoId: number;
  tiendaId: number;
  stock: number;
  stockMinimo: number;
  createdAt: Date;
  updatedAt: Date;
  producto?: any;
  tienda?: any;

  constructor(inventario: any) {
    this.id = inventario.id;
    this.productoId = inventario.productoId;
    this.tiendaId = inventario.tiendaId;
    this.stock = inventario.stock;
    this.stockMinimo = inventario.stockMinimo;
    this.createdAt = inventario.createdAt;
    this.updatedAt = inventario.updatedAt;
    this.producto = inventario.producto;
    this.tienda = inventario.tienda;
  }
}

// **Define el tipo de respuesta de la API aquí, incluyendo la corrección anterior**
export type InventarioTiendaApiResponse = {
  inventarios: InventarioTiendaResponseDto[]; // Usando 'inventarios' como en tu JSON
  total: number;
};

export type CreateInventarioTiendaDto = Omit<InventarioTiendaResponseDto, 'id' | 'createdAt' | 'updatedAt' | 'producto' | 'tienda'>;

// Tipo de estado local para el formulario (usa strings para inputs)
interface InventarioTiendaFormState {
    productoId: string; 
    tiendaId: string;   
    stock: string;      
    stockMinimo: string;
}