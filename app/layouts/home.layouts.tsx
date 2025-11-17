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
  { 
    id: "Inicio", 
    label: "Inicio", 
    path: "/home", 
    icon: "🏠" 
  },
  {
    id: "Materia Prima",
    icon: "🧶", // Hilo/Lana para materia prima
    label: "Materia Prima",
    children: [
      { 
        id: "Proveedores", 
        label: "Proveedores", 
        path: "/proveedores", 
        icon: "🚚" // Camión de reparto
      },
      {
        id: "Telas",
        label: "Telas",
        icon: "🧵", // Carrete de hilo
        children: [
          { 
            id: "Telas", 
            label: "Tipo de Telas", 
            path: "/telas", 
            icon: "🎨" // Paleta (variedad de tipos)
          },
          {
            id: "Presentacion",
            label: "Presentacion de Rollos",
            path: "/presentacionTelas",
            icon: "📜" // Rollo
          },
        ],
      },
       {
        id: "HistorialCompraTelas",
        label: "Historial Compra Telas",
        path: "/hitorialCompraTelas",
        icon: "📦" // Fábrica/Almacén
      },
      {
        id: "ComprasTela",
        label: "Almacen Telas",
        path: "/inventarioTelas",
        icon: "🏭" // Fábrica/Almacén
      },
    ],
  },
  {
    id: "produccion",
    label: "Produccion",
    icon: "🪡", // Aguja de coser
    children: [
      {
        id: "costurero",
        label: "Costurero",
        path: "/costureros",
        icon: "✂️" // Tijeras
      },
      {
        id: "parametros",
        label: "Parametros de las Prendas",
        path: "/parametrosTela",
        icon: "📏" // Regla de medir
      },
      {
        id: "trabajos",
        label: "Trabajos",
        path: "/trabajos",
        icon: "📋" // Portapapeles de tareas
      },
      {
        id: "trabajosFinalizados",
        label: "Trabajos Finalizados",
        path: "/trabajosFinalizados",
        icon: "✅" // Check de completado
      },
    ],
  },
  {
    id: "inventario",
    label: "Inventario",
    icon: "📦", // Caja de inventario
    children: [
      {
        id: "producto",
        label: "Producto",
        path: "/productos",
        icon: "👕" // Camiseta/Producto
      },
      {
        id: "inventarioTienda",
        label: "Almacen de Productos Terminados",
        path: "/inventarioTienda",
        icon: "🧥" // Abrigo/Prenda terminada
      },
      {
        id: "inventarioSucursal",
        label: "Inventario Sucursal",
        path: "/inventarioSucursal",
        icon: "🏢" // Edificio sucursal
      },
      {
        id: "ventas",
        label: "Ventas ",
        path: "/ventas",
        icon: "💰" // Bolsa de dinero
      },
    ],
  },
  {
    id: "Tienda",
    label: "tienda",
    icon: "🏪", // Tienda física
    children: [
      {
        id: "sucursales",
        label: "Sucursales",
        path: "/sucursales",
        icon: "📍" // Pin de ubicación
      },
      {
        id: "categorias",
        label: "Categorias",
        path: "/categorias",
        icon: "🏷️" // Etiqueta
      },
      {
        id: "carrito",
        label: "Pedidos",
        path: "/carrito",
        icon: "🛒" // Carrito de compras
      },
    ],
  },
  {
    id: "retportes",
    label: "Reportes",
    icon: "📈", // Gráfico ascendente
    children: [
      {
        id: "reporteVentras",
        label: "Reporte Ventas",
        path: "/reporteVentas",
        icon: "💲" // Signo de dólar
      },
      {
        id: "reporteTienda",
        label: "Reporte Alamacem",
        path: "/reporteTienda",
        icon: "📊" // Gráfico de barras
      },
      {
        id: "reporteInventarioSucursal",
        label: "Reporte Inventario Sucrusal",
        path: "/reporteInventarioSucursal",
        icon: "📉" // Gráfico
      },
      {
        id: "ReporteTrabajos",
        label: "Reporte Trabajos",
        path: "/reporteTranajosFinlaizados",
        icon: "📝" // Nota/Reporte escrito
      },
      {
        id: "ReporteWeb",
        label: "Reporte Uso Web",
        path: "/reporteWeb",
        icon: "🌐" // Mundo/Web
      },
    ],
  },
  {
    id: "configuracion",
    label: "Configuracion",
    icon: "⚙️", // Engranaje
    children: [
      {
        id: "usuarios",
        label: "Usuarios",
        path: "/usuarios",
        icon: "👥" // Usuarios
      },
      {
        id: "configWeb",
        label: "Configuracion Web",
        path: "/configWeb",
        icon: "💻" // Laptop
      },
      {
        id: "tienda",
        label: "Tienda ",
        path: "/tienda",
        icon: "🛍️" // Bolsas de compra
      },
    ],
  },
  {
    id: "cerrarSesion",
    label: "Cerrar Sesion",
    icon: "🚪", // Puerta (Salir)
    path: "/",
    cerrarSesion: true,
  },
];

const menuItemsMANAGER: MenuItem[] = [
  { 
    id: "Inicio", 
    label: "Inicio", 
    path: "/home", 
    icon: "🏠" 
  },
  {
    id: "inventario",
    label: "Inventario",
    icon: "📦",
    children: [
      {
        id: "producto",
        label: "Producto",
        path: "/productos",
        icon: "👕"
      },
      {
        id: "inventarioTienda",
        label: "Almacen de Productos Terminados",
        path: "/inventarioTienda",
        icon: "🧥"
      },
      {
        id: "inventarioSucursal",
        label: "Inventario Sucursal",
        path: "/inventarioSucursal",
        icon: "🏢"
      },
      {
        id: "ventas",
        label: "Ventas ",
        path: "/ventas",
        icon: "💰"
      },
    ],
  },
  {
    id: "Tienda",
    label: "tienda",
    icon: "🏪",
    children: [
      {
        id: "sucursales",
        label: "Sucursales",
        path: "/sucursales",
        icon: "📍"
      },
      {
        id: "categorias",
        label: "Categorias",
        path: "/categorias",
        icon: "🏷️"
      },
      {
        id: "carrito",
        label: "Pedidos",
        path: "/carrito",
        icon: "🛒"
      },
    ],
  },
  {
    id: "retportes",
    label: "Reportes",
    icon: "📈",
    children: [
      {
        id: "reporteVentras",
        label: "Reporte Ventas",
        path: "/reporteVentas",
        icon: "💲"
      },
      {
        id: "reporteTienda",
        label: "Reporte Alamacem",
        path: "/reporteTienda",
        icon: "📊"
      },
      {
        id: "reporteInventarioSucursal",
        label: "Reporte Inventario Sucrusal",
        path: "/reporteInventarioSucursal",
        icon: "📉"
      },
      {
        id: "ReporteTrabajos",
        label: "Reporte Trabajos",
        path: "/reporteTranajosFinlaizados",
        icon: "📝"
      },
    ],
  },
  {
    id: "configuracion",
    label: "Configuracion",
    icon: "⚙️",
    children: [
      {
        id: "usuarios",
        label: "Usuarios",
        path: "/usuarios",
        icon: "👥"
      },
      {
        id: "configWeb",
        label: "Configuracion Web",
        path: "/configWeb",
        icon: "💻"
      },
      {
        id: "tienda",
        label: "Tienda ",
        path: "/tienda",
        icon: "🛍️"
      },
    ],
  },
  {
    id: "cerrarSesion",
    label: "Cerrar Sesion",
    icon: "🚪",
    path: "/",
    cerrarSesion: true,
  },
];

const menuItemsUser: MenuItem[] = [
  { 
    id: "Inicio", 
    label: "Inicio", 
    path: "/home", 
    icon: "🏠" 
  },
  {
    id: "inventario",
    label: "Inventario",
    icon: "📦",
    children: [
      {
        id: "producto",
        label: "Producto",
        path: "/productos",
        icon: "👕"
      },
      {
        id: "inventarioTienda",
        label: "Almacen de Productos Terminados",
        path: "/inventarioTienda",
        icon: "🧥"
      },
      {
        id: "inventarioSucursal",
        label: "Inventario Sucursal",
        path: "/inventarioSucursal",
        icon: "🏢"
      },
      {
        id: "ventas",
        label: "Ventas ",
        path: "/ventas",
        icon: "💰"
      },
    ],
  },
  {
    id: "Tienda",
    label: "tienda",
    icon: "🏪",
    children: [
      {
        id: "carrito",
        label: "Pedidos",
        path: "/carrito",
        icon: "🛒"
      },
    ],
  },
  {
    id: "cerrarSesion",
    label: "Cerrar Sesion",
    icon: "🚪",
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
