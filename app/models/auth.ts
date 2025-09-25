// src/types/auth.ts
export interface Tienda {
  id: number;
  nombre: string;
  dominio?: string;
  activa:boolean
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion?: string;
  tiendaId: number;
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  activo: boolean;
  tiendas: Tienda[];
  sucursales: Sucursal[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}