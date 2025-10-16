import Boton1 from "~/componentes/Boton1";
import InputText1 from "~/componentes/InputText1";
import "./PresentacionTelas.subpage.css"
import { useState } from "react";
import { useParametrosFisicosTelas } from "~/hooks/useParametrosFisicosTelas";
import type { ParametrosFisicosTelaResponseDto } from "~/models/parametrosFisicosTela";
import ParametroFisicosTelaForm from "~/formularios/ParametrosFisicosTelaForm/ParametrosFisicosTelaForm.form";
import ParametroFisicosTelaUpDateForm from "~/formularios/ParametrosFisicosTelaForm/ParametrosFisicosTelaUpDate.form";

const PresentacionTelas = () => {

   const { 
    parametros, 
    isLoading, 
    isError, 
    error,
    deleteParametro,
    isDeleting 
  } = useParametrosFisicosTelas();

  const handleNuevo = () => {


    setMostrarForm(!mostrarForm);
  };
    const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarFormUpDate, setMostrarFormUpDate] = useState(false);

    const defaultParametro: ParametrosFisicosTelaResponseDto = {
       id:0,
       anchoTela:0,
       nombre:"",
       tubular:false,
       
        descripcion:"",
        notasTela:"",
        

     };

    
     const [parametroEdit, setParametroEdit] = useState(defaultParametro);
   
     const handleEditParametro = async (parametro: ParametrosFisicosTelaResponseDto ) => {
      await  setParametroEdit(parametro);
       setMostrarFormUpDate(true);
     };
     
      const handleCloseEdit = () => {
    setMostrarFormUpDate(!mostrarFormUpDate);
  };

 const [filters, setFilters] = useState({
    search: '',
    tubular: undefined as boolean | undefined,
  });

 

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleTubularFilter = (tubular: boolean | undefined) => {
    setFilters(prev => ({ ...prev, tubular }));
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el parámetro "${nombre}"?`)) {
      try {
        await deleteParametro(id);
        if(isDeleting){
          alert("Error al eliminar presentacion");
        }else{
 alert('Presentacion eliminada correctamente');
        }
       
      } catch (error) {
        alert('Error al eliminar parámetro');
      }
    }
  };

  if (isLoading) return <div>Cargando parámetros...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

     return (
    <>
      
      <div className="cuerpoParametrosTelas">

          <ParametroFisicosTelaForm onClose={handleNuevo} visible={mostrarForm}  ></ParametroFisicosTelaForm>
          <ParametroFisicosTelaUpDateForm
          visible={mostrarFormUpDate}
          onCloseUpDate={handleCloseEdit}
          parametro={parametroEdit}
        ></ParametroFisicosTelaUpDateForm>

         <div className="titulo">
          <p>Presentacion de Rollos</p>

          <Boton1 variant="info" onClick={()=>{handleNuevo()}}>+ Agregar</Boton1>
        </div>
{/*
        <div className="buscador">
          <InputText1
            value={""}
            onChange={function (value: string): void {
              throw new Error("Function not implemented.");
            }}
            width="400px"
            label="Buscar Parametro"
            placeholder="Nombre"
          />
          <Boton1
            variant="secondary"
            size="medium"
            style={{ height: 40, marginLeft: 10 }}
          >
            Buscar
          </Boton1>
        </div>*/}


        {/* Lista */}
      <div style={{ display: 'grid', gap: '15px', marginTop:"50px" }}>
        {parametros.map((parametro) => (
          <div key={parametro.id} style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{parametro.nombre}</h3>
                
                {parametro.descripcion && (
                  <p style={{ margin: '5px 0', color: '#666' }}>{parametro.descripcion}</p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div><strong>Ancho:</strong> {parametro.anchoTela} cm</div>
                  <div><strong>Tubular:</strong> {parametro.tubular ? 'Sí' : 'No'}</div>
                  
                  {parametro.tela && (
                    <div>
                      <strong>Tela:</strong> {parametro.tela.nombreComercial}
                      {parametro.tela.proveedor && ` (${parametro.tela.proveedor.nombre})`}
                    </div>
                  )}
                </div>

                {parametro.notasTela && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Notas:</strong> {parametro.notasTela}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => handleDelete(parametro.id, parametro.nombre)}
                  disabled={isDeleting}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: isDeleting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Eliminar
                </button>
                
                <button 
                  onClick={() => {handleEditParametro(parametro)}}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Editar
                </button>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <span>Creado: {new Date(parametro.createdAt).toLocaleDateString()}</span>
              <span style={{ marginLeft: '15px' }}>
                Actualizado: {new Date(parametro.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {parametros.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No se encontraron registros
        </div>
      )}
    </div>
      </>);
};

export default PresentacionTelas;
