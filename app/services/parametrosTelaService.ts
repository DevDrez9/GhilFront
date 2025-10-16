import { ParametrosTelaResponseDto, type CreateParametrosTelaDto } from "~/models/ParametrosTela";




const API_BASE_URL = 'http://localhost:3000';

type ParametrosTelaApiResponse = {
  parametros: ParametrosTelaResponseDto[];
  total: number;
};

export const parametrosTelaService = {
  // Obtener todos los parámetros de tela con paginación y búsqueda
  getParametrosTela: async (search?: string): Promise<ParametrosTelaApiResponse> => {
    let url = `${API_BASE_URL}/parametros-tela`;
    
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

  // Obtener un parámetro de tela por ID
  getParametroTelaById: async (id: number): Promise<ParametrosTelaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/parametros-tela/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Eliminar un parámetro de tela
  deleteParametroTela: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/parametros-tela/${id}`, {
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

  // Crear un nuevo parámetro de tela
  createParametroTela: async (data: CreateParametrosTelaDto): Promise<ParametrosTelaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/parametros-tela`, {
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

  // Actualizar un parámetro de tela
  updateParametroTela: async (id: number, data: Partial<CreateParametrosTelaDto>): Promise<ParametrosTelaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/parametros-tela/${id}`, {
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