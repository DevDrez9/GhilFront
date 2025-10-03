import type { SucursalResponseDto, CreateSucursalDto } from "~/models/sucursal";

const API_BASE_URL = 'http://localhost:3000';



export const sucursalService = {
  // Obtener todas las sucursales
  getSucursales: async (search?: string): Promise<SucursalResponseDto[]> => {
    let url = `${API_BASE_URL}/sucursales`;

    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    console.log(response)    
    
  
    return response.json();
  },

  // Obtener una sucursal por ID
  getSucursalById: async (id: number): Promise<SucursalResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/sucursales/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
       console.log("sucursa 3"+response)    

    return response.json();
  },

  // Eliminar una sucursal
  deleteSucursal: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/sucursales/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
  },

  // Crear una nueva sucursal
  createSucursal: async (data: CreateSucursalDto): Promise<SucursalResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/sucursales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Actualizar una sucursal
  updateSucursal: async (id: number, data: Partial<CreateSucursalDto>): Promise<SucursalResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/sucursales/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
};