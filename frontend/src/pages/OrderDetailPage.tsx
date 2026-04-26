import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:   { label: 'Pendiente',  color: '#d97706', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  CONFIRMED: { label: 'Confirmado', color: '#059669', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)' },
  SHIPPED:   { label: 'Enviado',    color: '#2563eb', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)' },
  DELIVERED: { label: 'Entregado',  color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
  CANCELLED: { label: 'Cancelado',  color: '#dc2626', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.18)' },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');
  const payment = location.state?.payment;

  const handlePay = async () => {
    setVerifying(true);
    try {
      const { data } = await api.post('/payments', { orderId: id });
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Error al iniciar el pago');
      setVerifying(false);
    }
  };

  const loadOrder = async () => {
    if (!id) return;
    const res = await api.get(`/orders/${id}`);
    const o = res.data;
    setOrder(o);
    if (!o.payment) {
      setVerifying(true);
      try {
        await api.post(`/payments/verify/${id}`);
        const updated = await api.get(`/orders/${id}`);
        setOrder(updated.data);
      } catch {
        // pago aún no procesado, no hacer nada
      }
      setVerifying(false);
    }
  };

  useEffect(() => { loadOrder(); }, [id]);

  if (!order) return (
    <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Cargando...</div>
  );

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const paymentData = payment ?? order.payment;
  const approved = paymentData?.status === 'APPROVED';

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/orders')}>← Mis pedidos</button>

      <div style={styles.header}>
        <div>
          <p style={styles.orderRef}>Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
          <p style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span style={{ ...styles.statusBadge, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          {cfg.label}
        </span>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Productos</h3>
          <div style={styles.itemList}>
            {order.items.map((item: any) => (
              <div key={item.id} style={styles.item}>
                <div style={styles.itemLeft}>
                  <span style={styles.itemName}>{item.product.name}</span>
                  <span style={styles.itemQty}>{item.quantity} × ${item.unitPrice.toFixed(2)}</span>
                </div>
                <span style={styles.itemSubtotal}>${(item.quantity * item.unitPrice).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={styles.totalRow}>
            <span style={{ color: '#94a3b8' }}>Total</span>
            <span style={styles.totalAmount}>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div style={styles.sideCol}>
          {!paymentData && verifying && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Pago</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Verificando estado del pago...</p>
            </div>
          )}
          {paymentData && (
            <div style={{ ...styles.card, border: `1px solid ${approved ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <h3 style={styles.cardTitle}>Pago</h3>
              <div style={styles.paymentStatus}>
                <span style={approved ? styles.payApproved : styles.payRejected}>
                  {approved ? '✓ Aprobado' : '✕ Rechazado'}
                </span>
              </div>
              {paymentData.transactionId && (
                <p style={styles.txId}>ID: {paymentData.transactionId}</p>
              )}
            </div>
          )}
          {!approved && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Acción</h3>
              <button
                style={{ ...styles.btnVerify, opacity: verifying ? 0.7 : 1 }}
                onClick={handlePay}
                disabled={verifying}
              >
                {verifying ? 'Redirigiendo...' : 'Pagar con MercadoPago'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.88rem',
    padding: '0',
    marginBottom: '24px',
    fontFamily: 'Inter, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },
  orderRef: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '4px',
  },
  orderDate: {
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  statusBadge: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 240px',
    gap: '20px',
    alignItems: 'start',
  },
  card: {
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '16px',
    padding: '22px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  cardTitle: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    marginBottom: '16px',
    fontFamily: 'Inter, sans-serif',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  itemLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  itemName: {
    color: '#1e293b',
    fontSize: '0.93rem',
    fontWeight: '500',
  },
  itemQty: {
    color: '#94a3b8',
    fontSize: '0.82rem',
  },
  itemSubtotal: {
    color: '#475569',
    fontWeight: '600',
    fontSize: '0.93rem',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '14px',
    marginTop: '4px',
  },
  totalAmount: {
    fontSize: '1.3rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  paymentStatus: {
    marginBottom: '12px',
  },
  payApproved: {
    display: 'inline-block',
    padding: '6px 14px',
    background: 'rgba(16,185,129,0.08)',
    color: '#059669',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '20px',
    fontSize: '0.88rem',
    fontWeight: '600',
  },
  payRejected: {
    display: 'inline-block',
    padding: '6px 14px',
    background: 'rgba(239,68,68,0.07)',
    color: '#dc2626',
    border: '1px solid rgba(239,68,68,0.18)',
    borderRadius: '20px',
    fontSize: '0.88rem',
    fontWeight: '600',
  },
  btnVerify: {
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
  },
  txId: {
    fontFamily: 'monospace',
    fontSize: '0.78rem',
    color: '#94a3b8',
    marginTop: '8px',
    wordBreak: 'break-all' as const,
  },
};
