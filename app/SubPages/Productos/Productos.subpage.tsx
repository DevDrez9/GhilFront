import Boton1 from "~/componentes/Boton1";
import "./Productos.style.css"; // Crea este archivo de estilos
import InputText1 from "~/componentes/InputText1";
import { useProductos } from "~/hooks/useProductos";
import { useState } from "react";
import type { ProductoResponseDto } from "~/models/producto.model";
import ProductosForm from "~/formularios/ProductosForm/Productos.form";
import ProductoEditForm from "~/formularios/ProductosForm/ProductosEdit.form";
import { CategoriaResponseDto } from "~/models/categoria";
import { categoriaService } from "~/services/categoriaService";
import { useCategorias } from "~/hooks/useCategorias";
import ProductoPerformanceCard from "~/reportes/ReportProducto/reporteProductos.reporte";


const Productos = () => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const {
    productos,
    total,
    isLoading,
    isError,
    error,
    deleteProducto,
    isDeleting,
  } = useProductos(debouncedSearch);

    const { 
          categorias, 
          isLoading: isLoadingCats // Usamos 'isLoading' del hook, que es tu 'categoriasQuery.isLoading'
      } = useCategorias(debouncedSearch); 

  

   
  
   const [mostrarForm, setMostrarForm] = useState(false);
   const [mostrarFormEdit, setMostrarFormEdit] = useState(false);
   const [productoEdit, setProductoEdit] = useState<ProductoResponseDto | null>(null);
   const [productoRerport, setProductoReporte] = useState(0);
    const [mostrarFormReporte, setMostrarFormReporte] = useState(false);

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
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteProducto(id);
        alert("Producto eliminado correctamente");
      } catch (error) {
        alert("Error al eliminar el producto");
      }
    }
  };

  // Puedes agregar una lógica para editar si necesitas
  const handleEdit = (producto: ProductoResponseDto) => {
    setProductoEdit(producto)
    setMostrarFormEdit(true);
    console.log("Editando producto:", producto);
    // Lógica para abrir un formulario de edición
  };
  const handleCloseEdit = () => {
    setMostrarFormEdit(false);
    setProductoEdit(null);
  };

const handleReporte = (idProducto: number) => {
    setProductoReporte(idProducto)
    setMostrarFormReporte(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Desplazamiento suave
    });
   
  };

  const handleCloseReporte = () => {
    setMostrarFormReporte(false);
    setProductoReporte(null);
  };


  if (isLoading) {
    return <p>Cargando productos...</p>;
  }

  if (isError) {
    return <p>Error al cargar los datos: {error?.message}</p>;
  }

    



   const handleNuevo = () => {
    setMostrarForm(!mostrarForm);
  };

  const asiganarCate=(idCate:String)=>{
    if (categorias && Array.isArray(categorias)) { 
      for(let cate of categorias){
          if(cate.id==idCate){
              return cate.nombre
          }
      
    }
  }}
  const asiganarSubCate=(idCate:String,idSubCate:String)=>{
    if (categorias && Array.isArray(categorias)) { 
      for(let cate of categorias){
        
          if(cate.id==idCate){
             for(let sub of cate.subcategorias){
              if(sub.id==idSubCate){
                return sub.nombre}
          }
      
    }
  }}}

  return (
    <>
      <div className="cuerpoProductos">
        {mostrarFormEdit && productoEdit && (
        <ProductoEditForm onClose={handleCloseEdit} visible={mostrarFormEdit} initialProductData={productoEdit} />)}
        <ProductosForm  onClose={handleNuevo} visible={mostrarForm}></ProductosForm>
        {mostrarFormReporte && productoRerport!=0 && <ProductoPerformanceCard visible={mostrarFormReporte} onClose={handleCloseReporte} productoId={productoRerport} tiendaId={1}/> }
        
       
        

        <div className="titulo">
          <p>Productos</p>
          <Boton1 variant="info" onClick={handleNuevo}>
            + Agregar
          </Boton1>
        </div>

        <div className="buscador">
          <InputText1
            value={searchTerm}
            onChange={()=>{handleSearch}}
            width="400px"
            label="Buscar Producto"
            placeholder="Nombre, SKU, etc."
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
          {productos.map((producto) => (
            <div
              key={producto.id}
              style={{
                padding: "20px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                display: "flex",
                gap: "20px"
              }}
            >
              <div style={{ flexShrink: 0 }}>
                {producto.imagenes.length > 0 ? (
                  <img
                    src={"http://localhost:3000/uploads/productos/"+producto.imagenes[0].url}
                    alt={producto.nombre}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "4px"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      color: "#999",
                      fontSize: "12px",
                      textAlign: "center"
                    }}
                  >
                    Sin Imagen
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 12px 0", color: "#333" }}>
                      {producto.nombre}
                      <span style={{ marginLeft: "10px", fontSize: "14px", fontWeight: "normal", color: "#666" }}>
                        ({producto.sku || 'N/A'})
                      </span>
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "8px",
                        fontSize: "14px"
                      }}
                    >
                      <div>
                        <strong>Precio:</strong> Bs{producto.precio}
                      </div>
                     {/* <div>
                        <strong>Stock:</strong> {producto.stock}
                      </div>*/}
                      <div>
                        <strong>Categoría:</strong> {asiganarCate(producto.categoriaId+"")}
                      </div>
                      {producto.subcategoriaId!=null ?
                      <div>
                        <strong>Sub Categoría:</strong> {asiganarSubCate(producto.categoriaId+"" , producto.subcategoriaId+"")}
                      </div>:null}
                      <div>
                        <strong>En Oferta:</strong> {producto.enOferta ? 'Sí' : 'No'}
                      </div>
                      <div>
                        <strong>Nuevo:</strong> {producto.esNuevo ? 'Sí' : 'No'}
                      </div>
                      <div>
                        <strong>Destacado:</strong> {producto.esDestacado ? 'Sí' : 'No'}
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
                      onClick={() => handleDelete(producto.id)}
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
                      onClick={() => handleEdit(producto)}
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

                     <button
                      onClick={() => handleReporte(producto.id)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f0ca4dff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Reporte
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
                    {new Date(producto.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    <strong>Actualizado:</strong>{" "}
                    {new Date(producto.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {productos.length === 0 && (
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
                <h3>No se encontraron productos</h3>
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
                  Ver todos los productos
                </button>
              </>
            ) : (
              <>
                <h3>No hay productos registrados</h3>
                <p>No se encontraron productos en el sistema</p>
              </>
            )}
          </div>
        )}

        {productos.length > 0 && (
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
            Mostrando {productos.length} de {total} productos
          </div>
        )}
      </div>
    </>
  );
};

export default Productos;