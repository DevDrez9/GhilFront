// ~/models/transferencia.ts

// --- ENUMS ---
export enum EstadoTransferencia {
  PENDIENTE = 'PENDIENTE',
  EN_TRANSITO = 'EN_TRANSITO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

export enum TipoOrigenTransferencia {
  FABRICA = 'FABRICA',
 
}

export enum TipoDestinoTransferencia {

  SUCURSAL = 'SUCURSAL',
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