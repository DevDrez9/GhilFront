// src/types/telas.ts
export class ParametrosFisicosResponseDto {
  id: number;
  anchoTela: number;
  tubular: boolean;
  notasTela?: string;
  telaId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateTelaDto {
  nombreComercial: string;
  tipoTela: string;
  composicion: string;
  gramaje: number;
  acabado?: string;
  rendimiento?: number;
  colores: string;
  nota?: string;
  estado: string;
  proveedorId: number;
  parametrosFisicosId?: number;
}

export class TelaResponseDto {
  id: number;
  nombreComercial: string;
  tipoTela: string;
  composicion: string;
  gramaje: number;
  acabado?: string;
  rendimiento?: number;
  colores: string;
  nota?: string;
  estado: string;
  proveedorId: number;
  createdAt: Date;
  updatedAt: Date;
  proveedor?: any;
  parametrosFisicos?: ParametrosFisicosResponseDto;
  inventarioTelas?: any[];
}

export class TelaFilters {
  page?: number;
  limit?: number;
  search?: string;
  proveedorId?: number;
  estado?: string;
  tipoTela?: string;
}