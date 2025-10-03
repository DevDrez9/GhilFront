import type { CompletarTrabajoDto, CreateTrabajoDto, TrabajoResponseDto } from "~/models/trabajo";


const API_BASE_URL = 'http://localhost:3000';

type TrabajoApiResponse = {
  trabajos: TrabajoResponseDto[];
  total: number;
};

export const trabajoService = {
  // Obtener todos los trabajos
  getTrabajos: async (search?: string): Promise<TrabajoApiResponse> => {
    let url = `${API_BASE_URL}/trabajos`;
    
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

  // Obtener un trabajo por ID
  getTrabajoById: async (id: number): Promise<TrabajoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/trabajos/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Eliminar un trabajo
  deleteTrabajo: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/trabajos/${id}`, {
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

  // Crear un nuevo trabajo
  createTrabajo: async (data: CreateTrabajoDto): Promise<TrabajoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/trabajos`, {
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

  // Actualizar un trabajo
  updateTrabajo: async (id: number, data: Partial<CreateTrabajoDto>): Promise<TrabajoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/trabajos/${id}`, {
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
  },

      completeTrabajo: async (trabajoId: number, data: CompletarTrabajoDto): Promise<TrabajoResponseDto> => {
    
    // **Importante:** Aquí, 'data' ya debe contener `cantidadProducida` y `tiendaId` como números, 
    // gracias a la conversión que hiciste en el `handleSubmit` del formulario.
    const response = await fetch(`${API_BASE_URL}/trabajos/${trabajoId}/completar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json(); 
  },

};