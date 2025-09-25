import React, { useState, useRef, useEffect } from 'react';

interface ActionItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
}

interface ActionMenuProps {
  actions: ActionItem[];
  position?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
}

const Boton3Puntos: React.FC<ActionMenuProps> = ({
  actions,
  position = 'right',
  size = 'medium'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: ActionItem) => {
    action.onClick();
    setIsOpen(false);
  };

  // Tamaños del botón
  const sizeStyles = {
    small: {
      buttonSize: 28,
      iconSize: 16,
      fontSize: '12px'
    },
    medium: {
      buttonSize: 36,
      iconSize: 20,
      fontSize: '14px'
    },
    large: {
      buttonSize: 44,
      iconSize: 24,
      fontSize: '16px'
    }
  };

  const buttonStyle = {
    ...styles.button,
    width: sizeStyles[size].buttonSize,
    height: sizeStyles[size].buttonSize,
    fontSize: sizeStyles[size].iconSize,
    backgroundColor: isHovered ? '#f5f5f5' : 'white',
    borderColor: isHovered ? '#ccc' : '#ddd'
  };

  return (
    <div style={styles.container} ref={menuRef}>
      <button
        style={buttonStyle}
        onClick={toggleMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Menú de acciones"
      >
        ⋮
      </button>
      
      {isOpen && (
        <div style={{
          ...styles.menu,
          [position]: 0,
          minWidth: size === 'small' ? '120px' : size === 'medium' ? '140px' : '160px'
        }}>
          {actions.map((action) => (
            <ActionMenuItem
              key={action.id}
              action={action}
              size={sizeStyles[size].fontSize}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente separado para los ítems del menú con manejo de hover
const ActionMenuItem: React.FC<{ action: ActionItem; size: string }> = ({ action, size }) => {
  const [isHovered, setIsHovered] = useState(false);

  const menuItemStyle = {
    ...styles.menuItem,
    fontSize: size,
    color: action.danger ? '#d32f2f' : '#333',
    backgroundColor: isHovered ? '#f5f5f5' : 'transparent'
  };

  return (
    <button
      style={menuItemStyle}
      onClick={action.onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {action.icon && <span style={styles.icon}>{action.icon}</span>}
      {action.label}
    </button>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    display: 'inline-block'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: 0,
    transform: 'rotate(90deg)',
    fontWeight: 'bold'
  },
  menu: {
    position: 'absolute',
    top: '100%',
    marginTop: '4px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    padding: '4px 0',
    display: 'flex',
    flexDirection: 'column'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s ease'
  },
  icon: {
    fontSize: '16px',
    width: '16px',
    textAlign: 'center'
  }
};

export default Boton3Puntos;