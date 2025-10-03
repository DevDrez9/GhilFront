import React, { useState } from 'react';
import Boton1 from '~/componentes/Boton1';
import InputText1 from '~/componentes/InputText1';
import { useCategorias } from '~/hooks/useCategorias';

// --- (NOTA: Asegúrate de crear este archivo en src/componentes/CreateCategoriaForm.tsx) ---

interface CreateCategoriaFormProps {
    tiendaId: number; // Propiedad requerida para la creación
    onClose: () => void;
}

const CreateCategoriaForm: React.FC<CreateCategoriaFormProps> = ({ tiendaId, onClose }) => {
    // Es vital que useCategorias retorne isCreating y createCategoria
    const { createCategoria, isCreating } = useCategorias();
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre) {
            alert("El nombre de la categoría es obligatorio.");
            return;
        }

        const data = {
            nombre,
            // Aquí se usa el string vacío si no hay descripción, lo cual está permitido por el DTO
            descripcion: descripcion, 
            tiendaId,
        };

        createCategoria(data, {
            onSuccess: () => {
                alert(`Categoría "${nombre}" creada exitosamente.`);
                onClose(); // Cierra el formulario
            },
            onError: (error) => {
                // El error real viene de error.message si el hook lo maneja bien
                alert(`Error al crear la categoría: ${(error as Error).message || "Hubo un error desconocido"}`); 
            }
        });
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f0f8ff', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0056b3' }}>Nueva Categoría</h3>
            <form onSubmit={handleSubmit}>
                <InputText1 
                    label="Nombre" 
                    value={nombre} 
                    // FIX: InputText1 espera el valor (string) directamente
                    onChange={setNombre} 
                    required 
                    width="100%"
                />
                <InputText1 
                    label="Descripción (Opcional)" 
                    value={descripcion} 
                    // FIX: InputText1 espera el valor (string) directamente
                    onChange={setDescripcion} 
                    width="100%"
                />
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <Boton1 variant="success" type="submit" disabled={isCreating || !nombre}>
                        {isCreating ? 'Guardando...' : 'Guardar Categoría'}
                    </Boton1>
                    <Boton1 variant="secondary" onClick={onClose} type="button" disabled={isCreating}>
                        Cancelar
                    </Boton1>
                </div>
            </form>
        </div>
    );
};

export default CreateCategoriaForm;