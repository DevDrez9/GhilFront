// En ~/models/carrito.ts


export enum CarritoEstado {
    NUEVO = 'nuevo',
    PENDIENTE = 'pendiente',
    TERMINADO = 'terminado',
     CANCELADO = 'cancelado',
    TODOS = 'todos' // Valor para indicar que no hay filtro de estado
}

export class CarritoItemResponseDto {
    id: number;
    cantidad: number;
    productoId: number;
    precio: number;
    productoNombre?: string; 
    talla?: string;

    constructor(item: any) {
        this.id = item.id;
        this.cantidad = item.cantidad;
        this.productoId = item.productoId;
        this.precio = item.precio || 0;
        this.talla=item.talla;
        this.productoNombre = item.producto?.nombre; // Asumiendo que el include trae el nombre del producto
    }
}

export class CarritoResponseDto {
    id: number;
    clienteId: number;
    tiendaId: number;
    estado: CarritoEstado;
    cliente?: string;
    telefono?: string;
    direccion?: string;
    notas?: string;
    precio: number;
    createdAt: Date;
    items: CarritoItemResponseDto[];
    usuario:UsuarioRes;

    constructor(carrito: any) {
        this.id = carrito.id;
        this.clienteId = carrito.clienteId;
        this.tiendaId = carrito.tiendaId;
        this.estado = carrito.estado as CarritoEstado;
        this.cliente = carrito.cliente;
        this.telefono = carrito.telefono;
        this.direccion = carrito.direccion;
        this.notas = carrito.notas;
        this.precio = carrito.precio || 0;
        this.usuario=carrito.usuario;

        // ⭐ CRÍTICO: Asegúrate de convertir la fecha si viene como string
        this.createdAt = new Date(carrito.createdAt); 
        this.items = carrito.items?.map(item => new CarritoItemResponseDto(item)) || [];
    }
}


// DTO de Respuesta (Output)
export class UsuarioRes {
    id: number;
    email: string;
    nombre: string;
    apellido?: string;
    
   
    telefono?: string; 
 
    constructor(usuario: any) {
        this.id = usuario.id;
        this.email = usuario.email;
        this.nombre = usuario.nombre;
        this.apellido = usuario.apellido;
        
        this.telefono = usuario.telefono;
       
    }
}