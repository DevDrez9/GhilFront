import Boton1 from "~/componentes/Boton1";
import "./Proveedores.style.css";
import InputText1 from "~/componentes/InputText1";
import {
  ProveedorResponseDto,
  type ProveedorFilters,
} from "~/models/proveedor.model";
import { useProveedores } from "~/hooks/useProveedores";
import { useState } from "react";
import ProveedorForm from "~/formularios/ProveedorForm/Proveedor.form";
import ProveedorUpDatepForm from "~/formularios/ProveedorForm/ProveedorUpdate.form";

const Proveedores = () => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const {
    proveedores,
    isLoading,
    isError,
    error,
    deleteProveedor,
    deleteProveedorAsync, // ✅ Función async disponible
    isDeleting,
    deleteError, // ✅ Manejo de errores de delete
  } = useProveedores(debouncedSearch);

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Debounce de 500ms
    setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
  };

  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarFormUpDate, setMostrarFormUpDate] = useState(false);

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este proveedor?")) {
      try {
        await deleteProveedor(id);
        if(deleteError){
          alert(deleteError.message)
        }
        if(isDeleting){
          alert("Proveedor eliminado correctamente")
        }
      } catch (error) {
        alert("Error al eliminar proveedor");
      }
    }
  };

  const handleNuevo = () => {
    setMostrarForm(!mostrarForm);
  };

  const handleCloseEdit = () => {
    setMostrarFormUpDate(!mostrarFormUpDate);
  };

  const defaultProveedor: ProveedorResponseDto = {
    id: 0,
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    ruc: "",
    activo: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    tiendas: [],
    totalProductos: 0,
  };

  
  const [proveedorEdit, setProveedorEdit] = useState(defaultProveedor);

  const handleEdit = (proveedor: ProveedorResponseDto) => {
    setProveedorEdit(proveedor);
    setMostrarFormUpDate(true);
  };

  return (
    <>
      <div className="cuerpoProveedores">
        <ProveedorForm
          visible={mostrarForm}
          onClose={handleNuevo}
        ></ProveedorForm>
        <ProveedorUpDatepForm
          visible={mostrarFormUpDate}
          onCloseUpDate={handleCloseEdit}
          proveedor={proveedorEdit}
        ></ProveedorUpDatepForm>
        <div className="titulo">
          <p>Proveedores</p>

          <Boton1 variant="info" onClick={() => handleNuevo()}>
            + Agregar
          </Boton1>
        </div>
    {/*
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
        </div>*/}

        {/* Lista de proveedores */}
        <div style={{ display: "grid", gap: "15px", marginTop:"50px"  }}>
          {proveedores.map((proveedor) => (
            <div
              key={proveedor.id}
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
                    {proveedor.nombre}
                    {!proveedor.activo && (
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
                    {proveedor.contacto && (
                      <div>
                        <strong>Contacto:</strong> {proveedor.contacto}
                      </div>
                    )}

                    {proveedor.telefono && (
                      <div>
                        <strong>Teléfono:</strong> {proveedor.telefono}
                      </div>
                    )}

                    {proveedor.email && (
                      <div>
                        <strong>Email:</strong> {proveedor.email}
                      </div>
                    )}
 {/*
                    {proveedor.ruc && (
                      <div>
                        <strong>RUC:</strong> {proveedor.ruc}
                      </div>
                    )}

                   <div>
                      <strong>Productos:</strong> {proveedor.totalProductos}
                    </div>*/}

                    <div>
                      <strong>Nit:</strong> {proveedor.ruc}
                    </div>
                    
                    <div>
                      <strong>Estado:</strong> {proveedor.activo?"Activo":"Inactivo"}
                    </div>
                  </div>

                  {proveedor.direccion && (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Dirección:</strong> {proveedor.direccion}
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
                    onClick={() => handleDelete(proveedor.id)}
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
                    onClick={() => handleEdit(proveedor)}
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
                  {new Date(proveedor.createdAt).toLocaleDateString()}
                </span>
                <span>
                  <strong>Actualizado:</strong>{" "}
                  {new Date(proveedor.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {proveedores.length === 0 && (
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
                <h3>No se encontraron proveedores</h3>
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
                  Ver todos los proveedores
                </button>
              </>
            ) : (
              <>
                <h3>No hay proveedores registrados</h3>
                <p>No se encontraron proveedores en el sistema</p>
              </>
            )}
          </div>
        )}

        {proveedores.length > 0 && !debouncedSearch && (
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
            Mostrando {proveedores.length} proveedores
          </div>
        )}
      </div>
    </>
  );
};

export default Proveedores;
