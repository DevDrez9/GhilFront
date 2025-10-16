// src/services/proveedorService.ts

import type { CreateProveedorDto, ProveedorResponseDto } from "~/models/proveedor.model";


const API_BASE_URL = 'http://localhost:3000';

export const proveedorService = {
  // Obtener todos los proveedores
  getProveedores: async (search?: string): Promise<ProveedorResponseDto[]> => {
    let url = `${API_BASE_URL}/proveedores`;
    
    if (search) {
      url += `?${encodeURIComponent(search)}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Obtener un proveedor por ID
  getProveedorById: async (id: number): Promise<ProveedorResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // ✅ AÑADIR FUNCIÓN DELETE
  deleteProveedor: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
      method: 'DELETE',
      headers: {
       
      },
    });
    console.log(response)

    if (!response.ok) {
    
    const errorData = await response.json().catch(() => ({}));
    
    
    const errorMessage = errorData.message || `Error ${response.status}: Ha ocurrido un error desconocido en el servidor.`;

    console.error(errorMessage);

    throw new Error(errorMessage.toString());
}
  },

  // ✅ OPCIONAL: Añadir funciones adicionales que podrías necesitar
  createProveedor: async (proveedorData: CreateProveedorDto): Promise<ProveedorResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/proveedores`, {
      method: 'POST',
      headers: {
       
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proveedorData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  updateProveedor: async (id: number, proveedorData: Partial<CreateProveedorDto>): Promise<ProveedorResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
      method: 'PATCH',
      headers: {
        
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proveedorData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  

};