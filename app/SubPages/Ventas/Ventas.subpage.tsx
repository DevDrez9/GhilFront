// En src/componentes/Ventas.tsx

import Boton1 from "~/componentes/Boton1";
// import "./Ventas.style.css"; // Descomenta si tienes un archivo CSS específico
import InputText1 from "~/componentes/InputText1";
import { useVentas } from "~/hooks/useVentas";
import { useState } from "react";
import type { VentaResponseDto } from "~/models/ventas";
import "./Ventas.style.css"
import CrearVentaForm from "~/formularios/VentasForm/VentasForm.form";

const Ventas = () => {
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
      const [mostrarForm, setMostrarForm] = useState(false);

    const {
        ventas,
        total,
        isLoadingVentas,
        isErrorVentas,
        errorVentas,
        // deleteVenta, // Descomentar si implementas la mutación
    } = useVentas();

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
    };
    
    // Función de ayuda para formatear el estado de la venta
    const getEstadoStyle = (estado: string) => {
        const baseStyle = {
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '12px',
            whiteSpace: 'nowrap' as 'nowrap',
            marginLeft: '10px'
        };
        switch (estado) {
            case 'PENDIENTE': return { ...baseStyle, backgroundColor: '#ffc107', color: '#333' };
            case 'COMPLETADA': return { ...baseStyle, backgroundColor: '#28a745', color: 'white' };
            case 'CANCELADA': return { ...baseStyle, backgroundColor: '#dc3545', color: 'white' };
            default: return baseStyle;
        }
    };

    if (isLoadingVentas) {
        return <p>Cargando ventas...</p>;
    }

    if (isErrorVentas) {
        return <p>Error al cargar los datos: {errorVentas?.message}</p>;
    }
     const handleNuevo = () => {
    setMostrarForm(!mostrarForm);
  };

    return (
        <>
            <div className="cuerpoVentas" style={{ padding: '20px' }}>
                <CrearVentaForm onClose={handleNuevo} visible={mostrarForm} />


                <div className="titulo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <p style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>Ventas</p>
                    <Boton1 variant="info" onClick={() => handleNuevo()}>
            + Venta
          </Boton1>
                    {/* Botón de "Agregar" omitido ya que las ventas se crean en otro flujo (ej. checkout) */}
                </div>

                <div className="buscador" style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                    <InputText1
                        value={searchTerm}
                        onChange={()=>handleSearch} // ✅ CORREGIDO: Pasar la función directamente
                        width="400px"
                        label="Buscar Venta"
                        placeholder="Número de venta o nombre del cliente"
                    />
                    <Boton1
                        variant="secondary"
                        size="medium"
                        style={{ height: 40, marginLeft: 10 }}
                        onClick={() => { /* Lógica de búsqueda manual si es necesario */ }}
                    >
                        Buscar
                    </Boton1>
                </div>

                {/* --- Lista de Ventas --- */}
                <div style={{ display: "grid", gap: "20px" }}>
                    {ventas.map((venta) => (
                        <div
                            key={venta.id}
                            style={{
                                padding: "20px",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
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
                                    <h3 style={{ margin: "0 0 10px 0", color: "#333", display: 'flex', alignItems: 'center' }}>
                                        Venta N° {venta.fechaVenta+""}
                                        <span style={getEstadoStyle(venta.estado)}>{venta.estado}</span>
                                    </h3>
                                    <p style={{ margin: "0 0 10px 0", color: "#007bff", fontSize: "1.5em", fontWeight: "bold" }}>
                                        Total: ${venta.total}
                                    </p>
                                    <div style={{ fontSize: "14px", color: "#666" }}>
                                        <p style={{ margin: "4px 0" }}><strong>Cliente:</strong> {venta.cliente}</p>
                                        <p style={{ margin: "4px 0" }}><strong>Pago:</strong> {venta.metodoPago || 'N/A'}</p>
                                        <p style={{ margin: "4px 0" }}><strong>Items:</strong> {venta.items.length}</p>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        minWidth: "120px",
                                    }}
                                >
                                    <Boton1 
                                        variant="primary" 
                                        size="medium"
                                        // Aquí puedes pasar un handler para ver detalles
                                        onClick={() => console.log("Ver detalles de venta", venta.id)}
                                    >
                                        Ver Detalles
                                    </Boton1>
                                    {/* Botones de acción como "Cambiar Estado" o "Facturar" irían aquí */}
                                </div>
                            </div>
                            
                            <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #eee", fontSize: "12px", color: "#999" }}>
                                Creada: {new Date(venta.fechaVenta).toLocaleDateString()} a las {new Date(venta.fechaVenta).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Manejo de lista vacía --- */}
                {ventas.length === 0 && (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "8px", marginTop: "20px" }}>
                        <h3>{debouncedSearch ? "No se encontraron ventas" : "No hay ventas registradas"}</h3>
                        {debouncedSearch && <p>No hay resultados para "{debouncedSearch}"</p>}
                        {debouncedSearch && (
                             <button
                                onClick={clearSearch}
                                style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "10px" }}
                            >
                                Ver todas las ventas
                            </button>
                        )}
                    </div>
                )}
                
                {/* --- Contador de Total --- */}
                {ventas.length > 0 && (
                    <div style={{ textAlign: "center", marginTop: "20px", padding: "15px", backgroundColor: "#e7f3ff", borderRadius: "8px", color: "#0066cc" }}>
                        Mostrando **{ventas.length}** de **{total}** ventas
                    </div>
                )}
            </div>
        </>
    );
};

export default Ventas;