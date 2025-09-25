// src/services/inventarioTelasService.ts

import type { CreateInventarioTelaDto, InventarioTelaFilters, InventarioTelaResponseDto } from "~/models/inventarioTelas";


const API_BASE_URL = 'http://localhost:3000';

export const inventarioTelasService = {
  // GET - Obtener todo el inventario
  getInventarioTelas: async (
    filters?: InventarioTelaFilters
  ): Promise<InventarioTelaResponseDto[]> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.proveedorId) params.append('proveedorId', filters.proveedorId.toString());
    if (filters?.telaId) params.append('telaId', filters.telaId.toString());
    if (filters?.tipoTela) params.append('tipoTela', filters.tipoTela);
    if (filters?.color) params.append('color', filters.color);

    const url = `${API_BASE_URL}/inventario-telas?${params.toString()}`;
    
    const response = await fetch(url, {
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

  // GET - Obtener un item del inventario por ID
  getInventarioTelaById: async (
    id: number
  ): Promise<InventarioTelaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/inventario-telas/${id}`, {
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

  // POST - Crear nuevo item en el inventario
  createInventarioTela: async (
    data: CreateInventarioTelaDto
  ): Promise<InventarioTelaResponseDto> => {
    // ✅ Validar y convertir datos numéricos
    const validatedData = {
      proveedorId: Number(data.proveedorId),
      telaId: Number(data.telaId),
      cantidadRollos: Number(data.cantidadRollos),
      presentacion: data.presentacion.trim(),
      tipoTela: data.tipoTela.trim(),
      color: data.color.trim(),
      precioKG: Number(data.precioKG),
      pesoGrupo: Number(data.pesoGrupo),
      importe: data.importe ? Number(data.importe) : undefined,
    };

    // ✅ Validaciones adicionales
    if (validatedData.cantidadRollos < 0) {
      throw new Error('La cantidad de rollos no puede ser negativa');
    }

    if (validatedData.precioKG < 0) {
      throw new Error('El precio por KG no puede ser negativo');
    }

    if (validatedData.pesoGrupo <= 0) {
      throw new Error('El peso del grupo debe ser mayor a 0');
    }

    // ✅ Calcular importe si no se proporciona
    if (validatedData.importe === undefined) {
      validatedData.importe = validatedData.precioKG * validatedData.pesoGrupo;
    }

    const response = await fetch(`${API_BASE_URL}/inventario-telas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
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

  // PUT - Actualizar item del inventario
  updateInventarioTela: async (
    id: number, 
    data: Partial<CreateInventarioTelaDto>
  ): Promise<InventarioTelaResponseDto> => {
    // ✅ Validar y convertir datos numéricos
    const validatedData: any = {};
    
    if (data.proveedorId !== undefined) validatedData.proveedorId = Number(data.proveedorId);
    if (data.telaId !== undefined) validatedData.telaId = Number(data.telaId);
    if (data.cantidadRollos !== undefined) validatedData.cantidadRollos = Number(data.cantidadRollos);
    if (data.presentacion !== undefined) validatedData.presentacion = data.presentacion.trim();
    if (data.tipoTela !== undefined) validatedData.tipoTela = data.tipoTela.trim();
    if (data.color !== undefined) validatedData.color = data.color.trim();
    if (data.precioKG !== undefined) validatedData.precioKG = Number(data.precioKG);
    if (data.pesoGrupo !== undefined) validatedData.pesoGrupo = Number(data.pesoGrupo);
    if (data.importe !== undefined) validatedData.importe = data.importe ? Number(data.importe) : undefined;

    const response = await fetch(`${API_BASE_URL}/inventario-telas/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
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

  // DELETE - Eliminar item del inventario
  deleteInventarioTela: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/inventario-telas/${id}`, {
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

  // GET - Obtener estadísticas del inventario
  getInventarioStats: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/inventario-telas/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
};