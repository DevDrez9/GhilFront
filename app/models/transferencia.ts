// ~/models/transferencia.ts

// --- ENUMS ---
export enum EstadoTransferencia {
  PENDIENTE = 'PENDIENTE',
  EN_TRANSITO = 'EN_TRANSITO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

export enum TipoOrigenTransferencia {
  TIENDA = 'FABRICA',
  SUCURSAL = 'SUCURSAL', // 🎯 Origen Fijo (Fábrica)
}

export enum TipoDestinoTransferencia {
  TIENDA = 'FABRICA', // 🎯 Destino Fijo (Sucursal)
  SUCURSAL = 'SUCURSAL',
}

// --- DTO DE ENTRADA (Inventario del Almacén/Fábrica) ---
// El formulario recibe este objeto para precargar datos y validar stock.
export interface InventarioAlmacenResponseDto {
    id: number;
    productoId: number;
    almacenId: number; // ID del almacén (Fábrica) de origen
    stock: number;    // Stock disponible para transferir
    productoNombre: string; 
}

// --- DTO DE CREACIÓN (Para el Backend) ---
// El formulario construye este DTO para el servicio.
export class CreateTransferenciaInventarioDto {
  // Opcionales
  codigo?: string;
  estado?: EstadoTransferencia; 
  motivo?: string;

  // Fijos o Requeridos
  origenTipo!: TipoOrigenTransferencia; 
  origenId!: number; 
  destinoTipo!: TipoDestinoTransferencia;
  destinoId!: number; // ID de la sucursal (tienda)
  cantidad!: number;
  productoId!: number;
  usuarioId!: number;
}