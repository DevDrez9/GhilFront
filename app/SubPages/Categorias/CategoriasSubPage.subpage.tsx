import Boton1 from "~/componentes/Boton1";
import InputText1 from "~/componentes/InputText1";
import { useCategorias } from "~/hooks/useCategorias";
import { useState } from "react";
// Importa el DTO con el nombre correcto si es 'categoria.model'
import type { CategoriaResponseDto, CreateSubcategoriaDto } from "~/models/categoria"; 
import "./CategoriasSubPage.style.css"
import CreateCategoriaForm from "~/formularios/CategoriasForm/CreateCategoriaForm.form";
// 👈 NUEVO: Importa el formulario de creación de categorías

// --- (Tu componente AddSubcategoriaForm debe estar aquí tal como lo enviaste,
// pero asegúrate de que use setNombre/setDescripcion directamente en onChange) ---

// 1. Define los tipos de las props para el formulario de subcategoría
interface AddSubcategoriaFormProps {
    categoriaId: number;
    // La función addSubcategoria recibe el objeto de mutación
    addSubcategoria: (variables: CreateSubcategoriaDto ) => void;
    isAddingSub: boolean;
    onClose: () => void;
}

// 2. Tipa correctamente el componente AddSubcategoriaForm
const AddSubcategoriaForm: React.FC<AddSubcategoriaFormProps> = ({ 
    categoriaId, 
    addSubcategoria, 
    isAddingSub, 
    onClose 
}) => {
    // ... el código interno del componente ...
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault();
        if (nombre) {
            // ✅ MODIFICADO: Construimos el DTO completo, incluyendo categoriaId
            const newSubcategoriaData: CreateSubcategoriaDto = {
                nombre: nombre,
                descripcion: descripcion || '', 
                categoriaId: categoriaId, // Incluimos el ID de la categoría aquí
            };
            
            addSubcategoria(newSubcategoriaData);
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '15px', marginTop: '10px', borderRadius: '4px' }}>
            <h4>Agregar Subcategoría</h4>
            <InputText1 
                label="Nombre" 
                value={nombre} 
                onChange={setNombre} // ✅ CORREGIDO: Pasa solo el valor (string)
                required 
            />
            <InputText1 
                label="Descripción (Opcional)" 
                value={descripcion} 
                onChange={setDescripcion} // ✅ CORREGIDO: Pasa solo el valor (string)
            />
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <Boton1 variant="success" type="submit" disabled={isAddingSub || !nombre}>
                    {isAddingSub ? 'Agregando...' : 'Guardar'}
                </Boton1>
                <Boton1 variant="secondary" onClick={onClose} type="button">
                    Cancelar
                </Boton1>
            </div>
        </form>
    );
};


const Categorias: React.FC = () => { // 👈 TIPADO: Usa React.FC
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const {
        categorias,
        total,
        isLoading,
        isError,
        error,
        deleteCategoria,
        addSubcategoria,
        removeSubcategoria,
        isDeleting,
        isAddingSub,
        isRemovingSub,
        // Necesitas isCreating para deshabilitar el botón de cancelar
        // isCreating lo retorna useCategorias si seguiste la respuesta anterior.
    } = useCategorias(debouncedSearch);

    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState<number | null>(null); 
    
    // 💡 NUEVO ESTADO para controlar la visibilidad del formulario de CATEGORÍA
    const [showCreateCategoriaForm, setShowCreateCategoriaForm] = useState(false); 

    // ID de la tienda, asume que se obtiene de alguna parte (contexto/prop)
    const TIENDA_ID = 1; 

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setTimeout(() => {
            setDebouncedSearch(value);
        }, 500);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("¿Estás seguro de eliminar esta categoría y todas sus subcategorías?")) {
            try {
                await deleteCategoria(id);
                alert("Categoría eliminada correctamente");
            } catch (error) {
                alert("Error al eliminar la categoría");
            }
        }
    };

    const handleRemoveSub = async (categoriaId: number, subcategoriaId: number) => {
        if (window.confirm("¿Estás seguro de eliminar esta subcategoría?")) {
            try {
                await removeSubcategoria({ categoriaId, subcategoriaId });
                alert("Subcategoría eliminada correctamente");
            } catch (error) {
                alert("Error al eliminar la subcategoría");
            }
        }
    };

    if (isLoading) {
        return <p>Cargando categorías...</p>;
    }

    if (isError) {
        return <p>Error al cargar los datos: {error?.message}</p>;
    }

    return (
        <>
            <div className="cuerpoCategorias">
                <div className="titulo">
                    <p>Categorías</p>
                    <Boton1 
                        variant="info" 
                        // 💡 Cambia el estado para MOSTRAR el formulario principal
                        onClick={() => setShowCreateCategoriaForm(true)}
                    >
                        + Agregar Categoría
                    </Boton1>
                </div>

                {/* 💡 RENDERIZADO CONDICIONAL DEL FORMULARIO PRINCIPAL */}
                {showCreateCategoriaForm && (
                    <CreateCategoriaForm
                        tiendaId={TIENDA_ID}
                        onClose={() => setShowCreateCategoriaForm(false)}
                    />
                )}

                <div className="buscador">
                    <InputText1
                        value={searchTerm}
                        // ✅ CORREGIDO: handleSearch es la función que debe pasarse al onChange
                        onChange={()=>handleSearch} 
                        width="400px"
                        label="Buscar Categoría"
                        placeholder="Nombre, descripción"
                    />
                </div>

                <div style={{ display: "grid", gap: "25px" }}>
                     {Array.isArray(categorias) && categorias.map((categoria) => (
                        <div
                            key={categoria.id}
                            style={{
                                padding: "20px",
                                border: "1px solid #007bff",
                                borderRadius: "8px",
                                backgroundColor: "#e7f3ff",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: "0 0 5px 0", color: "#007bff" }}>{categoria.nombre}</h3>
                                    <p style={{ margin: "0 0 15px 0", color: "#555", fontSize: "14px" }}>
                                        {categoria.descripcion || "Sin descripción"}
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <Boton1 variant="warning" onClick={() => {/* Lógica editar */}}>Editar</Boton1>
                                    <Boton1 variant="danger" onClick={() => handleDelete(categoria.id)} disabled={isDeleting}>
                                        {isDeleting ? "Eliminando..." : "Eliminar"}
                                    </Boton1>
                                </div>
                            </div>

                            <h4 style={{ borderTop: '1px solid #a8c8e8', paddingTop: '10px', marginTop: '10px', color: '#0056b3' }}>
                                Subcategorías ({categoria.subcategorias.length})
                            </h4>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                                {categoria.subcategorias.map((sub) => (
                                    <span 
                                        key={sub.id} 
                                        style={{ 
                                            padding: '5px 10px', 
                                            backgroundColor: '#ffffff', 
                                            borderRadius: '15px', 
                                            border: '1px solid #ccc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '13px'
                                        }}
                                    >
                                        {sub.nombre}
                                        <button 
                                            onClick={() => handleRemoveSub(categoria.id, sub.id)} 
                                            disabled={isRemovingSub}
                                            style={{ 
                                                marginLeft: '8px', 
                                                background: 'none', 
                                                border: 'none', 
                                                color: '#dc3545', 
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                            
                            {/* Lógica para mostrar el formulario de SUBcategoría */}
                            {showAddForm === categoria.id ? (
                                <AddSubcategoriaForm 
                                    categoriaId={categoria.id} 
                                    addSubcategoria={addSubcategoria} 
                                    isAddingSub={isAddingSub} 
                                    onClose={() => setShowAddForm(null)} 
                                />
                            ) : (
                                <Boton1 variant="secondary" size="small" onClick={() => setShowAddForm(categoria.id)}>
                                    + Agregar Subcategoría
                                </Boton1>
                            )}
                        </div>
                    ))}
                </div>

                  {Array.isArray(categorias) && categorias.length === 0 && (
                    <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>
                        <h3>No hay categorías registradas</h3>
                    </div>
                )}
            </div>
        </>
    );
};

export default Categorias;