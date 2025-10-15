// ~/models/tienda.ts

import type { ConfigWebResponseDto } from "./configWeb";

// --- DTO de Creación/Actualización (Input) ---
// Usamos una clase simple para el transporte de datos, excluyendo campos de solo lectura.
export class TiendaDto {
    nombre!: string;
    descripcion?: string;
    dominio!: string;
    activa?: boolean;
    esPrincipal?: boolean;
    
    // Si la tienda está ligada a la configuración web,
    // puedes incluir configWebId si se maneja desde el frontend.
    // configWebId?: number; 
}

// --- DTO de Respuesta (Output) ---
export class TiendaResponseDto {
    id: number;
    nombre: string;
    descripcion?: string;
    dominio: string;
    activa: boolean;
    esPrincipal: boolean;
    configWebId: number;
    createdAt: Date;
    updatedAt: Date;
    configWeb?:ConfigWebResponseDto;

    // Aquí se omite el constructor para simplificar el uso en TypeScript,
    // pero si lo necesitas para transformación, puedes incluirlo.
    // Usamos `interface` si no necesitas la lógica de la clase en el frontend.
}