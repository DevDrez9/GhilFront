// ~/models/venta.ts


// --- ENUMS ---
export enum EstadoVenta {
    PENDIENTE = 'PENDIENTE',
    CONFIRMADA = 'CONFIRMADA',
    EN_PROCESO = 'EN_PROCESO',
    ENVIADA = 'ENVIADA',
    ENTREGADA = 'ENTREGADA',
    CANCELADA = 'CANCELADA',
}

export enum MetodoPago {
    EFECTIVO = 'EFECTIVO',
    TARJETA = 'TARJETA',
    TRANSFERENCIA = 'TRANSFERENCIA',
}

// --- DTO de Entrada (Inventario de la Sucursal para el ComboBox) ---
export interface InventarioSucursalResponseDto {
    id: number;
    productoId: number;
    productoNombre: string;
    stock: number; 
    precioUnitario: number; 
}

// --- DTO del ÍTEM de Venta (Para la creación) ---
export class CreateVentaItemDto {
    productoId!: number;
    cantidad!: number;
    precio!: number; 
}

// --- DTO PRINCIPAL de Creación (Input) ---
export class CreateVentaDto {
    cliente!: string;
    telefono?: string;
    direccion?: string;
    estado?: EstadoVenta;
    total!: number;
    subtotal!: number;
    impuestos?: number;
    metodoPago?: MetodoPago;
    tiendaId!: number;
    sucursalId?: number; 

    items!: CreateVentaItemDto[];
}

// --- DTO de Respuesta de Venta (Para mostrar en la Tabla) ---
// Incluye todos los datos de CreateVentaDto más los campos del backend.
// En ~/models/venta.ts
export class VentaResponseDto {
    id: number;
    cliente: string;
    total: number;
    tiendaId: number;
    metodoPago: MetodoPago;
    estado: EstadoVenta;
    fechaVenta: Date; // ✅ Cambiado a Date
    items: VentaItemResponseDto[]; // ✅ Usará instancias de la Clase

    // ... otros campos (telefono, direccion, subtotal, etc.)

    constructor(venta: any) {
        this.id = venta.id;
        this.cliente = venta.cliente;
        this.total = venta.total;
        this.tiendaId = venta.tiendaId;
        this.metodoPago = venta.metodoPago;
        this.estado = venta.estado;
        
        // ✅ Conversión de la fecha
        this.fechaVenta = new Date(venta.fechaVenta); 

        // ✅ Mapeo recursivo de los ítems para que también sean Clases
        this.items = venta.items 
            ? venta.items.map((item: any) => new VentaItemResponseDto(item)) 
            : [];
        
        // ... inicializar otros campos
    }
}
// DTO para los ítems de la respuesta (opcional, si el backend lo devuelve más detallado)
export class VentaItemResponseDto {
    id: number;
    ventaId: number;
    productoId: number;
    productoNombre: string; 
    cantidad: number;
    precio: number;
    // Si el backend devuelve fechas para el ítem, añádelas aquí:
    // createdAt: Date; 
    
    constructor(item: any) {
        this.id = item.id;
        this.ventaId = item.ventaId;
        this.productoId = item.productoId;
        this.productoNombre = item.productoNombre;
        this.cantidad = item.cantidad;
        this.precio = item.precio;
        // Si hay fechas en el item, haz la conversión:
        // this.createdAt = new Date(item.createdAt);
    }
}

// DTO para la Paginación (si aplica)
export interface PaginatedVentasDto {
    data: VentaResponseDto[];
    total: number;
    page: number;
    limit: number;
}

export type VentaApiResponse = {
    ventas: VentaResponseDto[]; // El array se llama 'ventas'
    total: number;
};
export interface VentaQueryOptions {
    page?: number;
    limit?: number;
    tiendaId?: number;
    search?: string;
    // Añade otros filtros que necesites (ej. estado, fecha, etc.)
}