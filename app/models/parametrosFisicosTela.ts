// src/types/parametrosFisicosTela.ts
export class ProveedorTela {
  id?: number;
  nombre?: string;
  contacto?: string;
}

export class TelaRelacion {
  id?: number;
  nombreComercial?: string;
  tipoTela?: string;
  proveedor?: ProveedorTela;
}

export class CreateParametrosFisicosTelaDto {
  nombre: string;
  descripcion?: string;
  anchoTela: number;
  tubular?: boolean;
  notasTela?: string;
  
}

export class ParametrosFisicosTelaResponseDto {
  id: number;
  nombre: string;
  descripcion?: string;
  anchoTela: number;
  tubular: boolean;
  notasTela?: string;
  telaId?: number;
  tela?: TelaRelacion;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ParametrosFisicosTelaFilters {
  page?: number;
  limit?: number;
  search?: string;
  telaId?: number;
  tubular?: boolean;
}