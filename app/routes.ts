import { type RouteConfig, index, layout, route  } from "@react-router/dev/routes";


export default [
    layout("./layouts/login.layouts.tsx", [
        index( "./Pages/Login/LoginPage.tsx"),
    ]),
    layout("./layouts/home.layouts.tsx", [
      
        route("home","./Pages/HomePage/HomePage.tsx"),
        route("proveedores","./SubPages/ProveedoresSubPage/Proveedores.subpages.tsx"),
        route("presentacionTelas","./SubPages/PresentacionTelas/PresentacionTelas.subpage.tsx"),
        route("telas","./SubPages/TelasSubPage/TelasSubPage.subpage.tsx"),
        route("inventarioTelas","./SubPages/CompraTelas/CompraTelasSubPage.subpage.tsx"),
        route("costureros","./SubPages/Costurero/Costurero.subpage.tsx"),
        route("parametrosTela","./SubPages/ParametrosTela/ParametrosTelas.subpage.tsx"),
        route("trabajos","./SubPages/Trabajos/Trabajo.subpage.tsx"),
        route("trabajosFinalizados","./SubPages/TrabajosFinalizados/TrabajosFinalizados.subpage.tsx"),
         route("productos","./SubPages/Productos/Productos.subpage.tsx"),
         route("inventarioTienda","./SubPages/InventarioTienda/InventarioTienda.subpage.tsx"),
         route("inventarioSucursal","./SubPages/InventarioSucursal/InventarioSucursal.subpage.tsx"),
         route("sucursales","./SubPages/Sucursales/Sucursales.subpage.tsx"),
        
    ]),

    route(
    "/.well-known/appspecific/com.chrome.devtools.json",
    "Pages/NotFound/debug-null.tsx",
  ),
    
     
  
] satisfies RouteConfig;