import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import type { User } from '~/models/auth';
import type { UsuarioResponseDto } from '~/models/usuario';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string; // Nueva propiedad para la ruta
  children?: MenuItem[];
  cerrarSesion?:boolean;
}

interface SidebarMenuProps {
  menuItems: MenuItem[];
  icono?:string;
  nombre?:string;
  usuario?:User
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ menuItems,icono,nombre, usuario }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

   const { logout } = useAuth();

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: MenuItem, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (item.children && item.children.length > 0) {
      toggleItem(item.id);
    }
    
    
   
    if (item.path && (!item.children || item.children.length === 0)) {
      if(item.cerrarSesion==true){
        logout();
      }else{
   navigate(item.path);
      }
   
    }
  };

  const MenuItemComponent: React.FC<{ 
    item: MenuItem; 
    level: number;
  }> = ({ item, level }) => {

    

    const isExpanded = expandedItems.has(item.id);
    const isHovered = hoveredItem === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path === location.pathname;


    const menuItemStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: isActive ? '#ffffff' : '#495057',
      paddingLeft: `${12 + level * 16}px`,
      backgroundColor: isActive ? '#4a90e2' : 
                     isExpanded ? '#e6f2ff' : 
                     isHovered ? '#e6f2ff' : 'transparent',
      fontWeight: level === 0 ? 600 : 400,
      borderBottom: '1px solid #f0f0f0'
    };

    const getBackgroundColor = (level: number): string => {
      const colors = ['#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6'];
      return colors[Math.min(level, colors.length - 1)];
    };

    return (
      <>
        <div
          style={menuItemStyle}
          onClick={(e) => handleItemClick(item, e)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {item.icon && <span style={{ marginRight: '8px', fontSize: '16px' }}>{item.icon}</span>}
          <span style={{ flex: 1 }}>{item.label}</span>
          {hasChildren && (
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: '12px', 
              color: isActive ? '#ffffff' : '#6c757d',
              transition: 'transform 0.2s ease',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
            }}>
              ▼
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div style={{ 
            backgroundColor: getBackgroundColor(level + 1),
          }}>
            {item.children!.map(child => (
              <MenuItemComponent 
                key={child.id} 
                item={child} 
                level={level + 1} 
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div style={{ 
      width: '280px', 
      backgroundColor: '#f8f9fa', 
      borderRight: '1px solid #dee2e6', 
      height: '100vh', 
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      overflowY: 'auto'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #dee2e6', 
        backgroundColor: '#e9ecef',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <img style={{height:"150px"}}  src={"http://localhost:3000/"+icono} />
        <h2 style={{ 
          margin: 0, 
          fontSize: '18px', 
          color: '#495057', 
          fontWeight: 600 
        }}>
          {nombre}
        </h2>

        <h4 style={{ 
          margin: 0, 
          fontSize: '15px', 
          color: '#495057', 
          fontWeight: 600 
        }}>{usuario.nombre+" "+usuario.apellido}</h4>
      <h4> <b>Rol: </b>{usuario.rol}</h4>
      </div>
      
      
      <div style={{ padding: '8px 0' }}>
        {menuItems.map(item => (
          <MenuItemComponent 
            key={item.id} 
            item={item} 
            level={0} 
          />
        ))}
      </div>
    </div>
  );
};

export default SidebarMenu;