import { Outlet, useNavigate } from "react-router";
import SidebarMenu, { type MenuItem } from "~/componentes/SlideBarMenu";
import { useAuth } from "~/hooks/useAuth";
import { useTienda } from "~/hooks/useTienda";

import HomePage from "~/Pages/HomePage/HomePage";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    // ... otros datos de useAuth
    isLoggingIn, // <-- Asume que useAuth provee este estado
  } = useAuth();

  const {
    tienda,
    // ... otros datos de useTienda
    isLoading: isTiendaLoading,
  } = useTienda();

  // 🚨 COMBINAR ESTADOS DE CARGA
  const isDataLoading = isLoggingIn || isTiendaLoading;

  // 🚨 Datos a pasar: Solo pasan si existen.
  const datosLayout = {
    // Si user es null, pasamos null, no un objeto incompleto.
    user: user,
    tienda: tienda,
  };

 
   const menuItemsADMIN: MenuItem[] = [
      { id: "Inicio", label: "Inicio", path: "/home", icon:"🏠" },

      {
        id: "Materia Prima",
        icon: "🧵",
        label: "Materia Prima",
        children: [
          { id: "Proveedores", label: "Proveedores", path: "/proveedores" },
          {
            id: "Telas",
            label: "Telas",
            children: [
              { id: "Telas", label: "Tipo de Telas", path: "/telas" },
              {
                id: "Presentacion",
                label: "Presentacion de Rollos",
                path: "/presentacionTelas",
              },
            ],
          },
          {
            id: "ComprasTela",
            label: "Almacen Telas",
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
            label: "Parametros de las Prendas",
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
            label: "Almacen de Productos Terminados",
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
            label: "Reporte Alamacem",
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
        icon: "🧵",
        path: "/",
        cerrarSesion: true,
      },
    ];
   
   const menuItemsMANAGER: MenuItem[]= [
      { id: "Inicio", label: "Inicio", path: "/home" },

     
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
           label: "Almacen de Productos Terminados",
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
            label: "Reporte Alamacem",
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
        icon: "🧵",
        path: "/",
        cerrarSesion: true,
      },
    ];
    
     const menuItemsUser: MenuItem[]= [
       { id: "Inicio", label: "Inicio", path: "/home", icon:"🏠" },

     
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
           label: "Almacen de Productos Terminados",
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
            id: "carrito",
            label: "Pedidos",
            path: "/carrito",
          },
        ],
      },

      

     
      {
        id: "cerrarSesion",
        label: "Cerrar Sesion",
        icon: "🧵",
        path: "/",
        cerrarSesion: true,
      },
    ];

  if (!user) {
    return <div>No hay usuario logueado</div>;
  }
  let menuItems:MenuItem[]=[]
   const navigate = useNavigate();
  
    if(user.rol==="ADMIN"){
      menuItems=menuItemsADMIN
    }
    else if(user.rol==="USER"){  
      menuItems=menuItemsUser;
    }
 
  

  return (
    <div style={{ display: "flex" }}>
      {isDataLoading ? (
        <div style={{ padding: "50px", textAlign: "center" }}>
          Cargando datos de sesión y tienda...
        </div>
      ) : (
        

          <SidebarMenu
          nombre={tienda.nombre}
          icono={tienda.configWeb.logoUrl}

          menuItems={menuItems}
          usuario={user}
        />

        
      )}
      <main style={{ flex: 1, padding: "20px" }}>
        {isDataLoading ? (
          <div style={{ padding: "50px", textAlign: "center" }}>
            Cargando datos de sesión y tienda...
          </div>
        ) : (
          // 🚨 2. Renderizar el Outlet solo cuando los datos estén listos
          <Outlet context={datosLayout} />
        )}
      </main>
    </div>
  );
}
