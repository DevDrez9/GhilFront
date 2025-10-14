import Boton1 from "~/componentes/Boton1";
import "./Trabajo.style.css"; // Create this style file
import InputText1 from "~/componentes/InputText1";
import { useTrabajos } from "~/hooks/useTrabajos";
import { useState } from "react";
import type { TrabajoResponseDto } from "~/models/trabajo";
import TrabajoForm from "~/formularios/TrabajosForm/TrabajosForm.form";
import TrabajosFinalizados from "../TrabajosFinalizados/TrabajosFinalizados.subpage";
import FinalizarTrabajoForm from "~/formularios/TrabajosForm/TrabajoFinForm.form";


const Trabajos = () => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const {
    trabajos,
    total,
    isLoading,
    isError,
    error,
    deleteTrabajo,
    isDeleting,
  } = useTrabajos(debouncedSearch);

  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
    const [mostrarFormFin, setMostrarFormFin] = useState(false);
  const [mostrarFormUpDate, setMostrarFormUpDate] = useState(false);
  const [trabajoEdit, setTrabajoEdit] = useState<TrabajoResponseDto | null>(null);

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
    if (window.confirm("¿Estás seguro de eliminar este trabajo?")) {
      try {
        await deleteTrabajo(id);
        alert("Trabajo eliminado correctamente");
      } catch (error) {
        alert("Error al eliminar el trabajo");
      }
    }
  };

  const handleNuevo = () => {
    setMostrarForm(!mostrarForm);
  };
  const handleFin = () => {
    setMostrarFormFin(!mostrarFormFin);
  };

  const handleCloseEdit = () => {
    setMostrarFormUpDate(false);
    setTrabajoEdit(null);
  };

  const handleFinCick = (trabajo: TrabajoResponseDto) => {
    setTrabajoEdit(trabajo);
    setMostrarFormFin(true);
  };

  if (isLoading) {
    return <p>Cargando trabajos...</p>;
  }

  if (isError) {
    return <p>Error al cargar los datos: {error?.message}</p>;
  }

  return (
    <>
      <div className="cuerpoTrabajos">
        <TrabajoForm onClose={handleNuevo} visible={mostrarForm}></TrabajoForm>
         {trabajoEdit && (
        <FinalizarTrabajoForm
            visible={!!trabajoEdit} // O tu prop de visibilidad
            onClose={handleCloseEdit}
            trabajo={trabajoEdit} // Solo se pasa si NO es null
        />
    )}
        <div className="titulo">
          <p>Trabajos</p>
          <Boton1 variant="info" onClick={() => handleNuevo()}>
            + Agregar
          </Boton1>
        </div>

        <div className="buscador">
          <InputText1
            value={searchTerm}
            onChange={()=>{handleSearch}}
            width="400px"
            label="Buscar Trabajo"
            placeholder="Código, Modelo, Costurero"
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
          {trabajos.map((trabajo) => (
            <div
              key={trabajo.id}
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
                    {trabajo.codigoTrabajo}
                    <span style={{ marginLeft: "10px", fontSize: "14px", fontWeight: "normal", color: "#666" }}>
                      ({trabajo.estado})
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
                      <strong>Modelo:</strong> {trabajo.parametrosTela?.nombreModelo}
                    </div>
                    <div>
                      <strong>Costurero:</strong> {trabajo.costurero ? `${trabajo.costurero.nombre} ${trabajo.costurero.apellido}` : 'Sin asignar'}
                    </div>
                    <div>
                      <strong>Cantidad:</strong> {trabajo.cantidad}
                    </div>
                     <div>
                      <strong>Peso Total Tela:</strong> {trabajo.pesoTotal+" kg"} 
                    </div>
                    {trabajo.trabajoFinalizado && (
                      <div>
                        <strong>Producción:</strong> {trabajo.trabajoFinalizado.cantidadProducida}
                      </div>
                    )}
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
                    onClick={() => handleDelete(trabajo.id)}
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
                  {trabajo.estado+"" !="COMPLETADO"?
                  <button
                    onClick={() => handleFinCick(trabajo)}
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
                    Finalizar
                  </button>:null}
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
                  {new Date(trabajo.createdAt).toLocaleDateString()}
                </span>
                <span>
                  <strong>Actualizado:</strong>{" "}
                  {new Date(trabajo.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {trabajos.length === 0 && (
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
                <h3>No se encontraron trabajos</h3>
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
                  Ver todos los trabajos
                </button>
              </>
            ) : (
              <>
                <h3>No hay trabajos registrados</h3>
                <p>No se encontraron trabajos en el sistema</p>
              </>
            )}
          </div>
        )}

        {trabajos.length > 0 && (
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
            Mostrando {trabajos.length} de {total} trabajos
          </div>
        )}
      </div>
    </>
  );
};

export default Trabajos;