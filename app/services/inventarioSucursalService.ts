import type { CreateInventarioSucursalDto, InventarioSucursalResponseDto } from "~/models/inventarioSucursal";

const API_BASE_URL = 'http://localhost:3000';

type InventarioSucursalApiResponse = {
  inventario: InventarioSucursalResponseDto[];
  total: number;
};

export const inventarioSucursalService = {
  // Obtener todos los items de inventario de sucursal
  getInventarioSucursal: async (search?: string): Promise<InventarioSucursalApiResponse> => {
    let url = `${API_BASE_URL}/inventario-sucursal`;

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

  // Obtener un item de inventario de sucursal por ID
  getInventarioSucursalById: async (id: number): Promise<InventarioSucursalResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/inventario-sucursal/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Eliminar un item de inventario de sucursal
  deleteInventarioSucursal: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/inventario-sucursal/${id}`, {
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

  // Crear un nuevo item de inventario de sucursal
  createInventarioSucursal: async (data: CreateInventarioSucursalDto): Promise<InventarioSucursalResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/inventario-sucursal`, {
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

  // Actualizar un item de inventario de sucursal
  updateInventarioSucursal: async (id: number, data: Partial<CreateInventarioSucursalDto>): Promise<InventarioSucursalResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/inventario-sucursal/${id}`, {
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