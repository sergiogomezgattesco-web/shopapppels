import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:   { label: 'Pendiente',  color: '#d97706', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  CONFIRMED: { label: 'Confirmado', color: '#059669', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)' },
  SHIPPED:   { label: 'Enviado',    color: '#2563eb', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)' },
  DELIVERED: { label: 'Entregado',  color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
  CANCELLED: { label: 'Cancelado',  color: '#dc2626', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.18)' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => { api.get('/orders').then(r => setOrders(r.data)); }, []);

  if (orders.length === 0) return (
    <div style={{ textAlign: 'center', padding: '100px 16px' }}>
      <span style={{ fontSize: '3rem' }}>📋</span>
      <h2 style={{ color: '#1e293b', marginTop: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>Sin pedidos aún</h2>
      <p style={{ color: '#94a3b8', marginTop: '8px' }}>Cuando realices tu primera compra, aparecerá acá</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Mis Pedidos</h1>
      <div style={styles.list}>
        {orders.map(order => {
          const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
          return (
            <div key={order.id} style={styles.card} onClick={() => navigate(`/orders/${order.id}`)}>
              <div style={styles.cardLeft}>
                <div style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</div>
                <div style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div style={styles.orderItems}>{order.items.length} producto{order.items.length !== 1 ? 's' : ''}</div>
              </div>
              <div style={styles.cardRight}>
                <span style={{ ...styles.badge, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  {cfg.label}
                </span>
                <span style={styles.total}>${order.total.toFixed(2)}</span>
                <span style={styles.arrow}>→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '760px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '32px',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 22px',
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '14px',
    cursor: 'pointer',
    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s',
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  orderId: {
    fontFamily: 'monospace',
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.06em',
  },
  orderDate: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  orderItems: {
    fontSize: '0.82rem',
    color: '#cbd5e1',
  },
  cardRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  total: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  arrow: {
    color: '#cbd5e1',
    fontSize: '1.1rem',
  },
};
