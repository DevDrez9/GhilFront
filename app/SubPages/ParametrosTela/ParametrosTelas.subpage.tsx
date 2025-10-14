import Boton1 from "~/componentes/Boton1";
import "./ParametrosTelas.style.css"; // Asegúrate de crear este archivo de estilos
import InputText1 from "~/componentes/InputText1";
import { useParametrosTela } from "~/hooks/useParametrosTela";
import { useState } from "react";
import type { ParametrosTelaResponseDto } from "~/models/ParametrosTela";
import ParametrosTelaForm from "~/formularios/ParametrosTela/ParametrosTela.form";
// Asegúrate de crear los formularios correspondientes si los necesitas
// import ParametroTelaForm from "~/formularios/ParametroTelaForm/ParametroTela.form";
// import ParametroTelaUpdateForm from "~/formularios/ParametroTelaForm/ParametroTelaUpdate.form";

const ParametrosTela = () => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const {
    parametros,
    total,
    isLoading,
    isError,
    error,
    deleteParametroTela,
    isDeleting,
    deleteError,
  } = useParametrosTela(debouncedSearch);

  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarFormUpDate, setMostrarFormUpDate] = useState(false);
  const [parametroEdit, setParametroEdit] = useState<ParametrosTelaResponseDto | null>(null);

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
    if (window.confirm("¿Estás seguro de eliminar este parámetro de tela?")) {
      try {
        await deleteParametroTela(id);
        alert("Parámetro de tela eliminado correctamente");
      } catch (error) {
        alert("Error al eliminar el parámetro de tela");
      }
    }
  };

  const handleNuevo = () => {
    setMostrarForm(!mostrarForm);
  };

  const handleCloseEdit = () => {
    setMostrarFormUpDate(false);
    setParametroEdit(null);
  };

  const handleEdit = (parametro: ParametrosTelaResponseDto) => {
    setParametroEdit(parametro);
    setMostrarFormUpDate(true);
  };

  if (isLoading) {
    return <p>Cargando parámetros de tela...</p>;
  }

  if (isError) {
    return <p>Error al cargar los datos: {error?.message}</p>;
  }

  const convertirJSON=(datos:string)=>{
    datos=datos.replaceAll('"','').replaceAll(":","=").replaceAll("{","").replaceAll("}","");
    return datos;
  }

  return (
    <>


      <div className="cuerpoParametrosTela">

        <ParametrosTelaForm  onClose={handleNuevo} visible={mostrarForm} ></ParametrosTelaForm>

        {/* Aquí puedes usar tus componentes de formulario */}
        <div className="titulo">
          <p>Parámetros de Prenda</p>
          <Boton1 variant="info" onClick={() => handleNuevo()}>
            + Agregar
          </Boton1>
        </div>

        <div className="buscador">
          <InputText1
            value={searchTerm}
            onChange={()=>{handleSearch}}
            width="400px"
            label="Buscar Parámetro de Prenda"
            placeholder="Código, Modelo, Tela"
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
          {parametros.map((parametro) => (
            <div
              key={parametro.id}
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
                    {parametro.nombreModelo} ({parametro.codigoReferencia})
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <strong>Tela recomendada:</strong> {parametro.tela?.tela?.nombreComercial +" "+parametro.tela?.color}
                    </div>
                    <div>
                      <strong>Consumo por talla:</strong> {convertirJSON(parametro.consumoTelaPorTalla)}
                    </div>
                    <div>
                      <strong>Tallas disponibles:</strong> {parametro.tallasDisponibles}
                    </div>
                    <div>
                      <strong>Estado de la prenda:</strong> {parametro.estadoPrenda}
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
                    onClick={() => handleDelete(parametro.id)}
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
                {/*  <button
                    onClick={() => handleEdit(parametro)}
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
                  </button>*/}
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
                  {new Date(parametro.createdAt).toLocaleDateString()}
                </span>
                <span>
                  <strong>Actualizado:</strong>{" "}
                  {new Date(parametro.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {parametros.length === 0 && (
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
                <h3>No se encontraron parámetros de tela</h3>
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
                  Ver todos los parámetros
                </button>
              </>
            ) : (
              <>
                <h3>No hay parámetros de tela registrados</h3>
                <p>No se encontraron parámetros de tela en el sistema</p>
              </>
            )}
          </div>
        )}

        {parametros.length > 0 && (
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
            Mostrando {parametros.length} de {total} parámetros de tela
          </div>
        )}
      </div>
    </>
  );
};

export default ParametrosTela;