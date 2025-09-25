// src/types/costureros.ts
export enum EstadoCosturero {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  VACACIONES = 'VACACIONES',
  LICENCIA = 'LICENCIA'
}


export class CostureroResponseDto {
  id: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  estado: EstadoCosturero;
  fechaInicio: Date;
  nota?: string;
  usuarioId?: number;
  tiendaId: number;
  usuario?: any;
  tienda?: any;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<any>) {
    this.id = partial.id;
    this.nombre = partial.nombre;
    this.apellido = partial.apellido;
    this.telefono = partial.telefono || undefined;
    this.email = partial.email || undefined;
    this.direccion = partial.direccion || undefined;
    this.estado = partial.estado;
    this.fechaInicio = partial.fechaInicio;
    this.nota = partial.nota || undefined;
    this.usuarioId = partial.usuarioId || undefined;
    this.tiendaId = partial.tiendaId;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;

    if (partial.tienda) {
      this.tienda = {
        id: partial.tienda.id,
        nombre: partial.tienda.nombre,
        dominio: partial.tienda.dominio
      };
    }

    if (partial.usuario) {
      this.usuario = {
        id: partial.usuario.id,
        nombre: partial.usuario.nombre,
        email: partial.usuario.email,
        rol: partial.usuario.rol
      };
    }
  }
}

export type CreateCostureroDto = Omit<CostureroResponseDto, 'id' | 'createdAt' | 'updatedAt' | 'usuario' | 'tienda'>;
export type CostureroFilters = {
  search?: string;
};