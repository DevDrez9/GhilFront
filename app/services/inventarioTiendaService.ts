import type { CreateInventarioTiendaDto, InventarioTiendaResponseDto } from "~/models/inventarioTienda";


const API_BASE_URL = 'http://localhost:3000';

type InventarioTiendaApiResponse = {
  inventario: InventarioTiendaResponseDto[];
  total: number;
};

export const inventarioTiendaService = {
  // Obtener todos los items de inventario de tienda
  getInventarioTienda: async (search?: string): Promise<InventarioTiendaApiResponse> => {
    let url = `${API_BASE_URL}/inventario-tienda`;

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

    return response.json();
  },

  // Obtener un item de inventario de tienda por ID
  getInventarioTiendaById: async (id: number): Promise<InventarioTiendaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/inventario-tienda/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Eliminar un item de inventario de tienda
  deleteInventarioTienda: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/inventario-tienda/${id}`, {
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

  // Crear un nuevo item de inventario de tienda
  createInventarioTienda: async (data: CreateInventarioTiendaDto): Promise<InventarioTiendaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/inventario-tienda`, {
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

  // Actualizar un item de inventario de tienda
  updateInventarioTienda: async (id: number, data: Partial<CreateInventarioTiendaDto>): Promise<InventarioTiendaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/inventario-tienda/${id}`, {
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