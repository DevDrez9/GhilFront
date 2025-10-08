import Boton1 from "~/componentes/Boton1";
import "./Sucursales.style.css"
import InputText1 from "~/componentes/InputText1";
import { useSucursales } from "~/hooks/useSucursales";
import { useState } from "react";
import type { SucursalResponseDto } from "~/models/sucursal";
import SucursalForm from "~/formularios/SucursalesForm/Sucursales.form";
import SucursalEditForm from "~/formularios/SucursalesForm/SucursalEdit.form";

const Sucursales = () => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const {
    sucursales,
    total,
    isLoading,
    isError,
    error,
    deleteSucursal,
    isDeleting,
  } = useSucursales(debouncedSearch);
  const [mostrarForm, setMostrarForm] = useState(false);
   const [mostrarFormEdit, setMostrarFormEdit] = useState(false);

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
    if (window.confirm("¿Estás seguro de eliminar esta sucursal?")) {
      try {
        await deleteSucursal(id);
        alert("Sucursal eliminada correctamente");
      } catch (error) {
        alert("Error al eliminar la sucursal");
      }
    }
  };
  
    const defaultSucursal: SucursalResponseDto = {
      id: 0,
      nombre: "",  
      telefono: "",
      email: "",
      direccion: "", 
      activa:false,
      tiendaId:1,

      createdAt: new Date(),
      updatedAt: new Date(),

    };
  

  const [sucursalEdit, setSucursal] = useState(defaultSucursal);

  const handleEdit = (sucursal: SucursalResponseDto) => {
    setSucursal(sucursal)
      setMostrarFormEdit(true);

  };
  const handleCloseEdit=()=>{
    setMostrarFormEdit(false);
  }

  if (isLoading) {
    return <p>Cargando sucursales...</p>;
  }

  if (isError) {
    return <p>Error al cargar los datos: {error?.message}</p>;
  }

  
    
  
  const handleNuevo = () => {
    setMostrarForm(!mostrarForm);
  };
  

  return (
    <>
      <div className="cuerpoSucursales">

        <SucursalForm onClose={handleNuevo} visible={mostrarForm}></SucursalForm>
        <SucursalEditForm initialData={sucursalEdit} onClose={handleCloseEdit} visible={mostrarFormEdit}/>

        <div className="titulo">
          <p>Sucursales</p>
          <Boton1 variant="info" onClick={() => {handleNuevo()}}>
            + Agregar
          </Boton1>
        </div>

        <div className="buscador">
          <InputText1
            value={searchTerm}
            onChange={()=>handleSearch}
            width="400px"
            label="Buscar Sucursal"
            placeholder="Nombre, dirección, responsable"
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
          {sucursales.map((sucursal) => (
            <div
              key={sucursal.id}
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
                    {sucursal.nombre}
                    <span style={{ marginLeft: "10px", fontSize: "14px", fontWeight: "normal", color: "#666" }}>
                      ({sucursal.activa ? 'Activa' : 'Inactiva'})
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
                      <strong>Dirección:</strong> {sucursal.direccion}
                    </div>
                    <div>
                      <strong>Responsable:</strong> {sucursal.responsable || 'N/A'}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {sucursal.telefono || 'N/A'}
                    </div>
                    <div>
                      <strong>Email:</strong> {sucursal.email || 'N/A'}
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
                    onClick={() => handleDelete(sucursal.id)}
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
                    onClick={() => handleEdit(sucursal)}
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
                  <strong>Creada:</strong>{" "}
                  {new Date(sucursal.createdAt).toLocaleDateString()}
                </span>
                <span>
                  <strong>Actualizada:</strong>{" "}
                  {new Date(sucursal.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {sucursales.length === 0 && (
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
                <h3>No se encontraron sucursales</h3>
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
                  Ver todas las sucursales
                </button>
              </>
            ) : (
              <>
                <h3>No hay sucursales registradas</h3>
                <p>No se encontraron sucursales en el sistema</p>
              </>
            )}
          </div>
        )}

        {sucursales.length > 0 && (
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
            Mostrando {sucursales.length} de {total} sucursales
          </div>
        )}
      </div>
    </>
  );
};

export default Sucursales;