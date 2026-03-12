// hooks/useHistorialComprasTela.ts
import { useState, useEffect } from 'react';

// Esta es la interfaz que coincide con tu JSON de respuesta
export interface HistorialItemDto {
    id: number;
    cantidad: number;
    precioKG: string; // Es string en tu JSON
    telaId: number;
    compraId: number | null;
    createdAt: string;
    updatedAt: string;
    tela: {
        id: number;
        nombreComercial: string;
        tipoTela: string;
        colores: string;
    };
    compra: any | null; // Puedes tipar esto mejor si lo necesitas
    importeTotal: number;
}

const API_URL = (import.meta.env.VITE_API_URL + '/compra-tela-items');

export const useHistorialComprasTela = () => {
  const [historial, setHistorial] = useState<HistorialItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Error al cargar el historial de compras');
        }
        const data = await response.json();
        setHistorial(data);
      } catch (err: any) {
        setIsError(true);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistorial();
  }, []); // Se carga solo una vez

  return { historial, isLoading, isError, error };
};