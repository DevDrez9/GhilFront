// ~/models/configWeb.ts



// --- DTO del Banner ---
export class CreateBannerDto {
    url!: string;
    orden?: number;
    titulo?: string;
    subtitulo?: string;
    enlace?: string;
}

// --- DTO de Configuración Web (Creación) ---
export class CreateConfigWebDto {
    nombreSitio!: string;
    logoUrl?: string; // URL del logo (o Base64 en el formulario)
    colorPrimario!: string;
    colorSecundario!: string;
    
  
    banners?: CreateBannerDto[];
}

// --- DTO de Respuesta (Lectura) ---
// El backend incluye el ID y un posible array de banners con sus IDs
export interface ConfigWebResponseDto extends CreateConfigWebDto {
    id: number;
    // Si la API devuelve los banners con ID:
    banners?: (CreateBannerDto & { id: number })[];
}

// --- DTO Temporal para la Lógica de Base64 ---
// Usaremos este DTO internamente en el Service y el Componente.
export interface UpdateConfigWebBase64Dto extends CreateConfigWebDto {
    // Si el logo se actualiza, mandamos la data en Base64
    logoUrl?: string;
}