// src/services/telasService.ts

import type { CreateTelaDto, TelaFilters, TelaResponseDto } from "~/models/telas.model";


const API_BASE_URL = 'http://localhost:3000';

export const telasService = {
  // GET - Obtener todas las telas
  getTelas: async (filters?: TelaFilters): Promise<TelaResponseDto[]> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.proveedorId) params.append('proveedorId', filters.proveedorId.toString());
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipoTela) params.append('tipoTela', filters.tipoTela);

    const url = `${API_BASE_URL}/telas?${params.toString()}`;
    
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

  // GET - Obtener una tela por ID
  getTelaById: async (id: number): Promise<TelaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/telas/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // POST - Crear nueva tela
  createTela: async (data: CreateTelaDto): Promise<TelaResponseDto> => {
    // ✅ Validar y convertir datos numéricos
    const validatedData = {
      nombreComercial: data.nombreComercial.trim(),
      tipoTela: data.tipoTela.trim(),
      composicion: data.composicion.trim(),
      gramaje: Number(data.gramaje) || 0,
      acabado: data.acabado?.trim(),
      rendimiento: data.rendimiento ? Number(data.rendimiento) : undefined,
      colores: data.colores.trim(),
      nota: data.nota?.trim(),
      estado: data.estado,
      proveedorId: Number(data.proveedorId),
      parametrosFisicosId: data.parametrosFisicosId ? Number(data.parametrosFisicosId) : undefined,
    };

    // ✅ Validaciones adicionales
    if (validatedData.gramaje <= 0) {
      throw new Error('El gramaje debe ser mayor a 0');
    }

    if (validatedData.rendimiento && validatedData.rendimiento < 0) {
      throw new Error('El rendimiento no puede ser negativo');
    }

    const response = await fetch(`${API_BASE_URL}/telas`, {
      method: 'POST',
      headers: {
        
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // PUT - Actualizar tela
  updateTela: async (id: number, data: Partial<CreateTelaDto>): Promise<TelaResponseDto> => {
    // ✅ Validar y convertir datos numéricos
    const validatedData: any = {};
    
    if (data.nombreComercial !== undefined) validatedData.nombreComercial = data.nombreComercial.trim();
    if (data.tipoTela !== undefined) validatedData.tipoTela = data.tipoTela.trim();
    if (data.composicion !== undefined) validatedData.composicion = data.composicion.trim();
    if (data.gramaje !== undefined) validatedData.gramaje = Number(data.gramaje);
    if (data.acabado !== undefined) validatedData.acabado = data.acabado?.trim();
    if (data.rendimiento !== undefined) validatedData.rendimiento = data.rendimiento ? Number(data.rendimiento) : undefined;
    if (data.colores !== undefined) validatedData.colores = data.colores.trim();
    if (data.nota !== undefined) validatedData.nota = data.nota?.trim();
    if (data.estado !== undefined) validatedData.estado = data.estado;
    if (data.proveedorId !== undefined) validatedData.proveedorId = Number(data.proveedorId);
    if (data.parametrosFisicosId !== undefined) {
      validatedData.parametrosFisicosId = data.parametrosFisicosId ? Number(data.parametrosFisicosId) : undefined;
    }

    const response = await fetch(`${API_BASE_URL}/telas/${id}`, {
      method: 'PATCH',
      headers: {
       'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // DELETE - Eliminar tela
  deleteTela: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/telas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
  }
};