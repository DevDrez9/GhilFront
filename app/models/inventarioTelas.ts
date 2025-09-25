// src/types/inventarioTelas.ts
export interface ProveedorInventario {
  id: number;
  nombre: string;
  contacto?: string;
}

export interface TelaInventario {
  id: number;
  nombreComercial: string;
  tipoTela: string;
  composicion: string;
}

export interface CreateInventarioTelaDto {
  proveedorId: number;
  telaId: number;
  cantidadRollos: number;
  presentacion: string;
  tipoTela: string;
  color: string;
  precioKG: number;
  pesoGrupo: number;
  importe?: number;
}

export interface InventarioTelaResponseDto {
  id: number;
  proveedorId: number;
  telaId: number;
  cantidadRollos: number;
  presentacion: string;
  tipoTela: string;
  color: string;
  precioKG: number;
  pesoGrupo: number;
  importe: number;
  createdAt: Date;
  updatedAt: Date;
  proveedor?: ProveedorInventario;
  tela?: TelaInventario;
}

export interface InventarioTelaFilters {
  page?: number;
  limit?: number;
  search?: string;
  proveedorId?: number;
  telaId?: number;
  tipoTela?: string;
  color?: string;
}