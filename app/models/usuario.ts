// En ~/models/usuario.ts



// --- ENUMS ---
export enum Rol {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    USER = 'USER',
    CLIENTE = 'CLIENTE',
}

// --- DTOs ---

export class CreateUsuarioDto {
    
    email!: string;

    
    password!: string;

    
    nombre!: string;

    
   
    apellido?: string;
    telefono?: string; 


   
    rol?: Rol;

 
    activo?: boolean;
}

export class UpdateUsuarioDto {
    
    email!: string;

    

    
    nombre!: string;

    
   
    apellido?: string;
    telefono?: string; 


   
    rol?: Rol;

 
    activo?: boolean;
}

// DTO de Respuesta (Output)
export class UsuarioResponseDto {
    id: number;
    email: string;
    nombre: string;
    apellido?: string;
    rol: Rol;
    activo: boolean;
    telefono?: string; 
    createdAt: Date;
    updatedAt: Date;
    tiendas: any[]; // ✅ Nueva propiedad para el array de tiendas

    constructor(usuario: any) {
        this.id = usuario.id;
        this.email = usuario.email;
        this.nombre = usuario.nombre;
        this.apellido = usuario.apellido;
        this.rol = usuario.rol;
        this.activo = usuario.activo;
        this.telefono = usuario.telefono;
        // Conversión de fechas
        this.createdAt = new Date(usuario.createdAt); 
        this.updatedAt = new Date(usuario.updatedAt);
        this.tiendas = usuario.tiendas || []; // ✅ Asignar la propiedad (usando [] por si acaso es undefined)
    }
}
// --- Tipos de Paginación y Consulta ---

export interface UsuarioQueryOptions {
    page?: number;
    limit?: number;
    search?: string;
    rol?: Rol; // Opcional: filtro por rol
}


export type UsuarioApiResponse = UsuarioResponseDto[];

export interface UsuarioQueryOptions {
    // Si la API no maneja paginación ni búsqueda con estos parámetros,
    // puedes simplificarlo, pero los mantendremos por si filtras en el frontend o el service.
    search?: string; 
    rol?: Rol; 
}