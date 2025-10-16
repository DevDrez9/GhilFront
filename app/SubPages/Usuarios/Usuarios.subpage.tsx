// En ~/componentes/Usuarios.tsx

import Boton1 from "~/componentes/Boton1";
import InputText1 from "~/componentes/InputText1";
import { useUsuarios } from "~/hooks/useUsuarios";
import { useState, useMemo } from "react";
import { Rol } from "~/models/usuario";
import type { UsuarioResponseDto } from "~/models/usuario";

// ✅ Importa el archivo CSS que contiene los estilos de lista (cuerpo, titulo, buscador)
import "./Usuarios.style.css"
import CrearUsuarioForm from "~/formularios/UsuariosForm/UsuariosForm.form";
import EditarUsuarioForm from "~/formularios/UsuariosForm/EditarUsuario.form";
// Asegúrate de que esta ruta sea correcta para tu proyecto (puede ser "./Usuarios.style.css" si lo tienes)


const Usuarios = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mostrarFormEdit, setMostrarFormEdit] = useState(false);
    const [usuario, setUsuario] = useState<UsuarioResponseDto | null>(null);
    
    // Opciones del hook que reflejan la paginación y búsqueda
    const options = useMemo(() => ({
        page: page,
        limit: 10,
        search: debouncedSearch,
    }), [page, debouncedSearch]);

    const {
        usuarios,
        total,
        isLoading,
        isError,
        error,
        deleteUsuario,
        deleteError,
        deleteUsuarioAsync,
        
    } = useUsuarios(options);


     

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setPage(1); 
        setTimeout(() => {
            setDebouncedSearch(value);
        }, 500);
    };

    const handleNuevo = () => {
        setMostrarForm(!mostrarForm);
    };
    
    const getRolStyle = (rol: Rol) => {
        const base = { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' };
        switch (rol) {
            case Rol.ADMIN: return { ...base, backgroundColor: '#dc3545', color: 'white' };
            case Rol.MANAGER: return { ...base, backgroundColor: '#ffc107', color: '#333' };
            case Rol.USER: return { ...base, backgroundColor: '#17a2b8', color: 'white' };
            default: return { ...base, backgroundColor: '#f0f0f0', color: '#666' };
        }
    };

    const handleEdit = (usuario: UsuarioResponseDto) => {
        setMostrarFormEdit(!mostrarFormEdit);
        setUsuario(usuario);

        console.log("Editar usuario:", usuario.id);
    };
    const handleCloseEdit = () => {
        setMostrarFormEdit(false);
        setUsuario(null);
    };


    const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteUsuario(id);
         
        alert("Producto eliminado correctamente");
        window.location.reload();
      } catch (error) {
        alert("Error al eliminar el producto");
      }
    }
  };


    if (isLoading) {
        return <p style={{ padding: '20px' }}>Cargando usuarios...</p>;
    }

    if (isError) {
        return <p style={{ padding: '20px', color: 'red' }}>Error al cargar los datos: {error?.message}</p>;
    }

    return (
        // ✅ APLICAR ESTILO DEL CUERPO
        <div className="cuerpoUsuario"> 

            {/* <UsuarioForm onClose={handleNuevo} visible={mostrarForm}></UsuarioForm> */}
            <EditarUsuarioForm initialData={usuario} onClose={handleCloseEdit} visible={mostrarFormEdit}/>
            <CrearUsuarioForm onClose={handleNuevo} visible={mostrarForm} />

            {/* ✅ APLICAR ESTILO DEL TÍTULO */}
            <div className="titulo"> 
                <p>Gestión de Usuarios</p>
                <Boton1 variant="info" onClick={handleNuevo}>
                    + Agregar Usuario
                </Boton1>
            </div>

            {/* ✅ APLICAR ESTILO DEL BUSCADOR 
            <div className="buscador"> 
                <InputText1
                    value={searchTerm}
                    onChange={()=>handleSearchChange} 
                    width="400px"
                    label="Buscar Usuario"
                    placeholder="Nombre, apellido o email"
                />
            </div>
            */}
            {/* Contenedor de la Lista (manteniendo el estilo de grid/gap) */}
            <div style={{ display: "grid", gap: "15px", marginTop:"50px" }}>
                {usuarios.map((usuario) => (
                    <div
                        key={usuario.id}
                        style={{
                            padding: "20px",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start"
                        }}
                    >
                        {/* Información Principal */}
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: "0 0 8px 0", color: "#333", display: 'flex', alignItems: 'center' }}>
                                {usuario.nombre} {usuario.apellido || ''}
                            </h3>
                            <div style={{ fontSize: "14px", color: "#666" }}>
                                <p style={{ margin: "4px 0" }}><strong>Email:</strong> {usuario.email}</p>
                                <p style={{ margin: "4px 0" }}><strong>Telefono:</strong> {usuario.telefono}</p>
                                <p style={{ margin: "4px 0" }}>
                                    <strong>Creado:</strong> {new Date(usuario.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Acciones y Rol */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", minWidth: '120px' }}>
                            <span style={getRolStyle(usuario.rol)}>
                                {usuario.rol}
                            </span>
                             <span style={{ fontWeight: 'bold', color: usuario.activo ? '#28a745' : '#dc3545', fontSize: '14px' }}>
                                {usuario.activo ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button 
                                    onClick={() => handleEdit(usuario)}
                                    style={{ padding: "8px 12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}>
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleDelete(usuario.id)}
                                    style={{ padding: "8px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Contador de Total --- */}
            {usuarios.length > 0 && (
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
                    Mostrando **{usuarios.length}** usuarios de **{total}**
                </div>
            )}
            
            {/* --- Lista vacía / No resultados --- */}
            {usuarios.length === 0 && !isLoading && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "8px", marginTop: "20px" }}>
                    {debouncedSearch ? (
                        <>
                            <h3>No se encontraron resultados</h3>
                            <p>No hay usuarios que coincidan con "{debouncedSearch}"</p>
                        </>
                    ) : (
                        <h3>No hay usuarios registrados</h3>
                    )}
                </div>
            )}
        </div>
    );
};

export default Usuarios;