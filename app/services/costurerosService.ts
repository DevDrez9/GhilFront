// src/services/costurerosService.ts

import { CostureroResponseDto, EstadoCosturero, type CostureroFilters, type CreateCostureroDto } from "~/models/costureros";


const API_BASE_URL = 'http://localhost:3000';

export const costureroService = {
  // Obtener todos los costureros
    getCostureros: async (search?: string): Promise<CostureroResponseDto[]> => {
    let url = `${API_BASE_URL}/costureros`;

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

    const data = await response.json();
    // ✅ Aquí está el cambio clave: Devuelve data.costureros
    return data.costureros;
  },

  // Obtener un costurero por ID
  getCostureroById: async (id: number): Promise<CostureroResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/costureros/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Eliminar un costurero
  deleteCosturero: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/costureros/${id}`, {
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

  // Crear un costurero
  createCosturero: async (costureroData: CreateCostureroDto): Promise<CostureroResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/costureros`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(costureroData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Actualizar un costurero
  updateCosturero: async (id: number, costureroData: Partial<CreateCostureroDto>): Promise<CostureroResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/costureros/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(costureroData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
};