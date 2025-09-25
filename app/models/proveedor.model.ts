
export class ProveedorResponseDto {
  id: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  nit?: string;
  direccion?: string;
  ruc?: string;
  pais?: string;
  ciudad?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  tiendas: ProveedorTiendaResponseDto[];
  totalProductos: number;
}
export class ProveedorTiendaResponseDto {
  id: number;
  proveedorId: number;
  tiendaId: number;
  createdAt: Date;
  updatedAt: Date;
  tienda?: any;}

  export interface ProveedorFilters {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
  tiendaId?: number;
}

export class CreateProveedorDto {

  nombre: string;
  ruc?: string;
  pais?: string;
  ciudad?: string;
  contacto?: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}