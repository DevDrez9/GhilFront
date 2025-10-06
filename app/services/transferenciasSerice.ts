// ~/services/transferenciaService.ts

import { CreateTransferenciaInventarioDto } from '~/models/transferencia';

// DTO de respuesta asumido
export interface TransferenciaResponseDto extends CreateTransferenciaInventarioDto {
    id: number;
    fechaCreacion: string;
}

// Define la URL base de tu API (¡ACTUALIZA ESTO!)
const API_BASE_URL = 'http://localhost:3000'; 

export const transferenciaService = {

  /**
   * Crea una nueva transferencia de inventario.
   */
  createTransferencia: async (data: CreateTransferenciaInventarioDto): Promise<TransferenciaResponseDto> => {
    
    // Simulación de llamada a API
    const response = await fetch(`${API_BASE_URL}/transferencias-inventario`, {
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
};