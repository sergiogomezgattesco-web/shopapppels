import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>◈</span>
          <span style={styles.brandText}>ShopApp</span>
        </Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Productos</Link>
          {user && <Link to="/orders" style={styles.link}>Mis Pedidos</Link>}
          <Link to="/cart" style={styles.cartLink}>
            <span>Carrito</span>
            {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
          </Link>
          {user ? (
            <div style={styles.userArea}>
              <span style={styles.userName}>{user.name}</span>
              {user.role === 'ADMIN' && (
                <Link to="/admin" style={styles.linkAdmin}>Admin</Link>
              )}
              <button onClick={handleLogout} style={styles.logoutBtn}>Salir</button>
            </div>
          ) : (
            <Link to="/login" style={styles.loginBtn}>Ingresar</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 12px rgba(0,0,0,0.05)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  brandIcon: {
    fontSize: '1.4rem',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  brandText: {
    fontSize: '1.1rem',
    fontWeight: '700',
    fontFamily: "'Space Grotesk', sans-serif",
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.02em',
  },
  links: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  link: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    padding: '6px 12px',
    borderRadius: '8px',
  },
  linkAdmin: {
    color: '#d97706',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.2)',
  },
  cartLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    padding: '6px 12px',
    borderRadius: '8px',
  },
  badge: {
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: 'white',
    borderRadius: '20px',
    padding: '1px 7px',
    fontSize: '0.72rem',
    fontWeight: '700',
    minWidth: '20px',
    textAlign: 'center' as const,
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginLeft: '8px',
  },
  userName: {
    fontSize: '0.88rem',
    color: '#475569',
    fontWeight: '500',
  },
  logoutBtn: {
    background: 'rgba(239,68,68,0.07)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#ef4444',
    padding: '5px 12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  loginBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '600',
    textDecoration: 'none',
    marginLeft: '8px',
    boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
  },
};
