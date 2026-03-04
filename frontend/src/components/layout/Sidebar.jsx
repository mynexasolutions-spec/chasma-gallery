import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin',            icon: 'bi-speedometer2',       label: 'Dashboard'  },
  { to: '/admin/products',   icon: 'bi-box-seam',           label: 'Products'   },
  { to: '/admin/categories', icon: 'bi-tags',               label: 'Categories' },
  { to: '/admin/brands',     icon: 'bi-bookmark',           label: 'Brands'     },
  { to: '/admin/attributes', icon: 'bi-palette2',           label: 'Attributes' },
  { to: '/admin/orders',     icon: 'bi-receipt',            label: 'Orders'     },
  { to: '/admin/users',      icon: 'bi-people',             label: 'Users'      },
  { to: '/admin/coupons',    icon: 'bi-ticket-perforated',  label: 'Coupons',   adminOnly: true },
  { to: '/admin/reviews',    icon: 'bi-star',               label: 'Reviews'    },
  { to: '/admin/settings',   icon: 'bi-gear',               label: 'Settings',  adminOnly: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <nav className="d-flex flex-column bg-dark text-white vh-100 position-sticky top-0"
         style={{ width: 240, minWidth: 240 }}>

      {/* Brand */}
      <div className="px-3 py-4 border-bottom border-secondary">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-shop fs-4 text-primary"></i>
          <span className="fw-bold fs-6">StoreAdmin</span>
        </div>
      </div>

      {/* Nav links */}
      <ul className="nav flex-column px-2 py-3 flex-grow-1">
        {navItems.filter(item => !item.adminOnly || user?.role === 'admin').map(({ to, icon, label }) => (
          <li key={to} className="nav-item mb-1">
            <NavLink
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 rounded px-3 py-2 text-white
                 ${isActive ? 'bg-primary' : 'hover-bg'}`
              }
            >
              <i className={`bi ${icon}`}></i>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* User info + logout */}
      <div className="px-3 py-3 border-top border-secondary">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
               style={{ width: 32, height: 32, fontSize: 14 }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <div className="small fw-semibold">{user?.first_name} {user?.last_name}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm w-100">
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </nav>
  );
}
