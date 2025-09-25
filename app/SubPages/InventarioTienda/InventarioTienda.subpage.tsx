import Boton1 from "~/componentes/Boton1";
import "./InventarioTienda.style.css"
import InputText1 from "~/componentes/InputText1";
import { useInventarioTienda } from "~/hooks/useInventarioTienda";
import { useState } from "react";
import type { InventarioTiendaResponseDto } from "~/models/inventarioTienda";

const InventarioTienda = () => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const {
    inventario,
    total,
    isLoading,
    isError,
    error,
    deleteInventarioTienda,
    isDeleting,
  } = useInventarioTienda(debouncedSearch);

  const [searchTerm, setSearchTerm] = useState("");

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

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este item de inventario?")) {
      try {
        await deleteInventarioTienda(id);
        alert("Item de inventario eliminado correctamente");
      } catch (error) {
        alert("Error al eliminar el item de inventario");
      }
    }
  };

  const handleEdit = (item: InventarioTiendaResponseDto) => {
    console.log("Editando item de inventario:", item);
    // Lógica para abrir un formulario de edición
  };

  if (isLoading) {
    return <p>Cargando inventario de tienda...</p>;
  }

  if (isError) {
    return <p>Error al cargar los datos: {error?.message}</p>;
  }

  return (
    <>
      <div className="cuerpoInventarioTienda">
        <div className="titulo">
          <p>Inventario de Tienda</p>
          <Boton1 variant="info" onClick={() => {/* Lógica para agregar */}}>
            + Registrar
          </Boton1>
        </div>

        <div className="buscador">
          <InputText1
            value={searchTerm}
            onChange={()=>{handleSearch}}
            width="400px"
            label="Buscar en inventario"
            placeholder="Nombre de producto, SKU, etc."
          />
          <Boton1
            variant="secondary"
            size="medium"
            style={{ height: 40, marginLeft: 10 }}
          >
            Buscar
          </Boton1>
        </div>

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
                      <strong>Tienda:</strong> {item.tienda?.nombre || 'N/A'}
                    </div>
                    <div>
                      <strong>Stock Actual:</strong> {item.stock}
                    </div>
                    <div>
                      <strong>Stock Mínimo:</strong> {item.stockMinimo}
                    </div>
                  </div>
                </div>

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
                </div>
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
            {debouncedSearch ? (
              <>
                <h3>No se encontraron items en el inventario</h3>
                <p>No hay resultados para "{debouncedSearch}"</p>
                <button
                  onClick={clearSearch}
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
                <h3>No hay items en el inventario</h3>
                <p>No se encontraron items de inventario en el sistema</p>
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

export default InventarioTienda;