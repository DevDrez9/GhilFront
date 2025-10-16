import Boton1 from "~/componentes/Boton1";
import "./InventarioSucursal.style.css"
import InputText1 from "~/componentes/InputText1";
// Asegúrate de que este hook acepte un objeto de opciones: { searchTerm: string, sucursalId: number }
import { useInventarioSucursal } from "~/hooks/useInventarioSucursal"; 
import { useMemo, useState } from "react";
import type { InventarioSucursalResponseDto } from "~/models/inventarioSucursal";
import ComboBox1 from "~/componentes/ComboBox1";
import { useSucursales } from "~/hooks/useSucursales";

// Definición de la interfaz de opciones de consulta para el hook
interface InventarioQueryOptions {
    searchTerm?: string;
    sucursalId?: number;
}

const InventarioSucursal = () => {
    // --- ESTADOS DE FILTRO ---
   // --- ESTADOS DE FILTRO ---
    // El searchTerm maneja el texto del input
    const [searchTerm, setSearchTerm] = useState("");
    // El debouncedSearch se usa para la llamada a la API con retardo
    const [debouncedSearch, setDebouncedSearch] = useState("");
    // El selectedSucursalId maneja el filtro del ComboBox
    const [selectedSucursalId, setSelectedSucursalId] = useState<number | undefined>(undefined);

    // --- HOOKS DE DATOS ---
    const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales(""); 
    
    // 🛑 1. CONSTRUIMOS EL OBJETO DE OPCIONES UNIFICADO PARA EL HOOK
    const queryOptions = useMemo(() => ({
        searchTerm: debouncedSearch,
        sucursalId: selectedSucursalId,
    }), [debouncedSearch, selectedSucursalId]);

    // 🛑 2. LLAMAMOS AL HOOK CON EL OBJETO DE OPCIONES
    const {
        inventario,
        total,
        isLoading,
        isError,
        error,
        deleteInventarioSucursalAsync, // Usamos la versión Async para el handler
        isDeleting,
        // useInventarioIdSucursal, // No se usa directamente en el renderizado de la lista
    } = useInventarioSucursal(queryOptions); 
    
    // --- HANDLERS DE BÚSQUEDA ---
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setTimeout(() => {
            setDebouncedSearch(value);
        }, 500);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setDebouncedSearch("");
        // Opcionalmente, puedes limpiar también el filtro de sucursal aquí:
        // setSelectedSucursalId(undefined); 
    };

    // --- HANDLERS DE ACCIONES ---
    const handleDelete = async (id: number) => {
        if (window.confirm("¿Estás seguro de eliminar este item de inventario?")) {
            try {
                // Usamos la versión Async para esperar la confirmación
                await deleteInventarioSucursalAsync(id); 
                alert("Item de inventario eliminado correctamente");
            } catch (error) {
                alert("Error al eliminar el item de inventario");
            }
        }
    };

    const handleEdit = (item: InventarioSucursalResponseDto) => {
        console.log("Editando item de inventario:", item);
        // Lógica para abrir un formulario de edición
    };

    // --- LÓGICA DEL COMBOBOX (SUCURSALES) ---

    const SUCRURSAL_TODAS_OPTION = { value: '0', label: 'Todas las Sucursales' }; 
    const sucursalComboBoxOptions = useMemo(() => {
        const sucursalesMapped = sucursales.map(s => ({
            value: String(s.id), 
            label: s.nombre
        }));
        
        return [
            SUCRURSAL_TODAS_OPTION,
            ...sucursalesMapped
        ];
    }, [sucursales]);
    
    // HANDLER DE CAMBIO DE SUCURSAL
    const handleSucursalChange = (valueString: string) => {
        const id = valueString ? Number(valueString) : undefined;
        // Si el valor es '0' (Todas) o inválido, el filtro es undefined
        setSelectedSucursalId((id === 0 || id == null || isNaN(id)) ? undefined : id);
        console.log(id)
    };
    
    const currentSucursalValue = selectedSucursalId === undefined ? SUCRURSAL_TODAS_OPTION.value : String(selectedSucursalId);

    // --- RENDERIZADO CONDICIONAL ---
    if (isLoading) {
        return <p>Cargando inventario de sucursal...</p>;
    }

    if (isError) {
        return <p>Error al cargar los datos: {error?.message}</p>;
    }

    return (
        <>
            <div className="cuerpoInventarioSucursal">
                <div className="titulo">
                    <p>Inventario de Sucursal</p>
                    {/* <Boton1 variant="info" onClick={() => }>+ Registrar</Boton1>*/}
                </div>
                
                {/* --- FILTROS Y BÚSQUEDA --- */}
                <div className="filtros-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-end' }}>
                    
                    {/* Selector de Sucursal */}
                    <div style={{ width: '300px' }}>
                        <ComboBox1 
                            label="Filtrar Sucursal" 
                            options={sucursalComboBoxOptions} 
                            value={currentSucursalValue} 
                            onChange={handleSucursalChange} 
                            placeholder="Seleccione la sucursal" 
                            width="100%" 
                            disabled={isLoadingSucursales} 
                        />
                    </div>
                    
                    {/* Buscador de Texto 
                    <div className="buscador" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <InputText1
                            value={searchTerm}
                            onChange={()=>handleSearch}
                            width="400px"
                            label="Buscar en inventario"
                            placeholder="Nombre de producto, SKU, etc."
                        />
                        <Boton1
                            variant="secondary"
                            size="medium"
                            onClick={clearSearch} 
                            style={{ height: 40, marginLeft: 10 }}
                        >
                            Limpiar
                        </Boton1>
                    </div>
                    */}
                </div>

                {/* --- LISTA DE INVENTARIO --- */}
                <div style={{ display: "grid", gap: "15px" }}>
                    {inventario.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                padding: "20px",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: "0 0 12px 0", color: "#333" }}>
                                        {item.producto?.nombre}
                                        <span style={{ marginLeft: "10px", fontSize: "14px", fontWeight: "normal", color: "#666" }}>
                                            ({item.producto?.sku || 'N/A'})
                                        </span>
                                    </h3>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                            gap: "8px",
                                        }}
                                    >
                                        <div>
                                            <strong>Sucursal:</strong> {item.sucursal?.nombre || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Stock Actual:</strong> {item.stock}
                                        </div>
                                        <div>
                                            <strong>Stock Mínimo:</strong> {item.stockMinimo}
                                        </div>
                                    </div>
                                </div>
                                 {/*               
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        minWidth: "100px",
                                    }}
                                >
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        disabled={isDeleting}
                                        style={{
                                            padding: "8px 12px",
                                            backgroundColor: "#dc3545",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: isDeleting ? "not-allowed" : "pointer",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {isDeleting ? "Eliminando..." : "Eliminar"}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        style={{
                                            padding: "8px 12px",
                                            backgroundColor: "#007bff",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Editar
                                    </button>
                                </div>*/}
                            </div>

                            <div
                                style={{
                                    marginTop: "12px",
                                    paddingTop: "12px",
                                    borderTop: "1px solid #eee",
                                    fontSize: "12px",
                                    color: "#666",
                                    display: "flex",
                                    gap: "15px",
                                }}
                            >
                                <span>
                                    <strong>Creado:</strong>{" "}
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                                <span>
                                    <strong>Actualizado:</strong>{" "}
                                    {new Date(item.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- MENSAJES DE ESTADO --- */}
                {inventario.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#666",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "8px",
                            marginTop: "20px",
                        }}
                    >
                        {debouncedSearch || selectedSucursalId !== undefined ? (
                            <>
                                <h3>No se encontraron items en el inventario</h3>
                                <p>Ajusta tu búsqueda o el filtro de sucursal.</p>
                                <button
                                    onClick={() => { clearSearch(); setSelectedSucursalId(undefined); }}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        marginTop: "10px",
                                    }}
                                >
                                    Ver todo el inventario
                                </button>
                            </>
                        ) : (
                            <>
                                <h3>No hay items en el inventario de sucursal</h3>
                                <p>No se encontraron items de inventario en el sistema.</p>
                            </>
                        )}
                    </div>
                )}

                {inventario.length > 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                            padding: "15px",
                            backgroundColor: "#e7f3ff",
                            borderRadius: "8px",
                            color: "#0066cc",
                        }}
                    >
                        Mostrando {inventario.length} de {total} items de inventario
                    </div>
                )}
            </div>
        </>
    );
};

export default InventarioSucursal;