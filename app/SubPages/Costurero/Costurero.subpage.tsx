import Boton1 from "~/componentes/Boton1";
import "./Costurero.subpage.css"
import InputText1 from "~/componentes/InputText1";
import { useState } from "react";
import { CostureroResponseDto, EstadoCosturero } from "~/models/costureros";
import { useCostureros } from "~/hooks/useCostureros";
import CostureroForm from "~/formularios/CosturerosForm/CosturerosForm.form";

const Costurero = () => {
    const [debouncedSearch, setDebouncedSearch] = useState("");
  const {
    costureros,
    isLoading,
    isError,
    error,
    deleteCosturero,
    isDeleting,
    deleteError,
  } = useCostureros(debouncedSearch);

  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarFormUpDate, setMostrarFormUpDate] = useState(false);
  const [costureroEdit, setCostureroEdit] = useState<CostureroResponseDto | null>(null);

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
    if (window.confirm("¿Estás seguro de eliminar este costurero?")) {
      try {
        await deleteCosturero(id);
        alert("Costurero eliminado correctamente");
      } catch (error) {
        alert("Error al eliminar costurero");
      }
    }
  };

  const handleNuevo = () => {
    setMostrarForm(!mostrarForm);
  };

  const handleCloseEdit = () => {
    setMostrarFormUpDate(false);
    setCostureroEdit(null);
  };

  const handleEdit = (costurero: CostureroResponseDto) => {
    setCostureroEdit(costurero);
    setMostrarFormUpDate(true);
  };

  if (isLoading) {
    return <p>Cargando costureros...</p>;
  }

  if (isError) {
    return <p>Error al cargar los datos: {error?.message}</p>;
  }

    return(
        <>
        
         <div className="cuerpoParametroTelas">

            <CostureroForm onClose={handleNuevo} visible={mostrarForm} ></CostureroForm>

                <div className="titulo">
          <p>Costureros</p>

          <Boton1 variant="info" onClick={() => handleNuevo()}>
            + Agregar
          </Boton1>
        </div>

        <div className="buscador">
          <InputText1
            value={""}
            onChange={function (value: string): void {
              throw new Error("Function not implemented.");
            }}
            width="400px"
            label="Buscar Proveedor"
            placeholder="Nombre, Ruc, Celular"
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
          {costureros.map((costurero) => (
            <div
              key={costurero.id}
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
                    {costurero.nombre} {costurero.apellido}
                    {costurero.estado === 'INACTIVO' && (
                      <span
                        style={{
                          color: "#dc3545",
                          marginLeft: "10px",
                          fontSize: "14px",
                          fontWeight: "normal",
                        }}
                      >
                        (Inactivo)
                      </span>
                    )}
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {costurero.telefono && (
                      <div>
                        <strong>Teléfono:</strong> {costurero.telefono}
                      </div>
                    )}
                    {costurero.email && (
                      <div>
                        <strong>Email:</strong> {costurero.email}
                      </div>
                    )}
                    <div>
                      <strong>Estado:</strong> {costurero.estado}
                    </div>
                  </div>

                  {costurero.direccion && (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Dirección:</strong> {costurero.direccion}
                    </div>
                  )}
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
                    onClick={() => handleDelete(costurero.id)}
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
                    onClick={() => handleEdit(costurero)}
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
                  {new Date(costurero.createdAt).toLocaleDateString()}
                </span>
                <span>
                  <strong>Actualizado:</strong>{" "}
                  {new Date(costurero.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {costureros.length === 0 && (
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
                <h3>No se encontraron costureros</h3>
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
                  Ver todos los costureros
                </button>
              </>
            ) : (
              <>
                <h3>No hay costureros registrados</h3>
                <p>No se encontraron costureros en el sistema</p>
              </>
            )}
          </div>
        )}

        {costureros.length > 0 && !debouncedSearch && (
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
            Mostrando {costureros.length} costureros
          </div>
        )}
      </div>


        </>
    )
}

export default Costurero;