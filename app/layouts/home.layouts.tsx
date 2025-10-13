import { Outlet } from "react-router";
import SidebarMenu, { type MenuItem } from "~/componentes/SlideBarMenu";
import { useAuth } from "~/hooks/useAuth";

import HomePage from "~/Pages/HomePage/HomePage";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    getUserTiendas,
    getUserSucursales,
    userEmail,
    userName,
    userApellido,
    userRol,
    userActivo,
  } = useAuth();




  const menuItems: MenuItem[] = [
    { id: "Inicio", label: "Inicio", path: "/home" },
    {
      id: "Materia Prima",
      label: "MateriaPrima",
      children: [
        { id: "Proveedores", label: "Proveedores", path: "/proveedores" },
        {
          id: "Telas",
          label: "Telas",
          children: [
            { id: "Telas", label: "Telas", path: "/telas" },
            {
              id: "Presentacion",
              label: "Presentacion",
              path: "/presentacionTelas",
            },
          ],
        },
        {
          id: "ComprasTela",
          label: "Inventario Telas",
          path: "/inventarioTelas",
        },
      ],
    },

    {
      id: "produccion",
      label: "Produccion",
      icon: "🧵",
      children: [
        {
          id: "costurero",
          label: "Costurero",
          path: "/costureros",
        },
        {
          id: "parametros",
          label: "Parametros Tela",
          path: "/parametrosTela",
        },
        {
          id: "trabajos",
          label: "Trabajos",
          path: "/trabajos",
        },
         {
          id: "trabajosFinalizados",
          label: "Trabajos Finalizados",
          path: "/trabajosFinalizados",
        },
      ],
    },
    {
      id: "inventario",
      label: "Inventario",
      icon: "🧵",
      children: [
        {
          id: "producto",
          label: "Producto",
          path: "/productos",
        },
       
        {
          id: "inventarioTienda",
          label: "Almacen Central",
          path: "/inventarioTienda",
        },
        {
          id: "inventarioSucursal",
          label: "Inventario Sucursal",
          path: "/inventarioSucursal",
        },
       
         {
          id: "ventas",
          label: "Ventas ",
          path: "/ventas",
        },
       
      ],
    },

     {
      id: "Tienda",
      label: "tienda",
      icon: "🧵",
      children: [
        {
          id: "sucursales",
          label: "Sucursales",
          path: "/sucursales",
        },
        {
          id: "categorias",
          label: "Categorias",
          path: "/categorias",
        },
       
         {
          id: "carrito",
          label: "Pedidos",
          path: "/carrito",
        },
       
       
       
       
       
       
      ],
    },

    {
      id: "retportes",
      label: "Reportes",
      icon: "🧵",
      children: [
         {
          id: "reporteVentras",
          label: "Reporte Ventas",
          path: "/reporteVentas",
        },
        {
          id: "reporteTienda",
          label: "Reporte Tienda",
          path: "/reporteTienda",
        },
{
          id: "reporteInventarioSucursal",
          label: "Reporte Inventario Sucrusal",
          path: "/reporteInventarioSucursal",
        },
        {
          id: "ReporteTrabajos",
          label: "Reporte Trabajos",
          path: "/reporteTranajosFinlaizados",
        },


        
      
       
      ],
    },

     {
      id: "configuracion",
      label: "Configuracion",
      icon: "🧵",
      children: [
         {
          id: "usuarios",
          label: "Usuarios",
          path: "/usuarios",
        },
        
        {
          id: "configWeb",
          label: "Configuracion Web",
          path: "/configWeb",
        },
         {
          id: "tienda",
          label: "Tienda ",
          path: "/tienda",
          
        },
        
       
       
       
       
      ],
    },
     {
      id: "cerrarSesion",
      label: "Cerrar Sesion",
      icon: "🧵", path:"/",
      cerrarSesion:true
    
      
    }
  ];

  if (!user) {
    return <div>No hay usuario logueado</div>;
  }

  return (
    <div style={{ display: "flex" }}>
      <SidebarMenu menuItems={menuItems} />
      <main style={{ flex: 1, padding: "20px"}}>
        <Outlet /> {/* Aquí se renderiza HomePage */}
      </main>
    </div>
  );
}
