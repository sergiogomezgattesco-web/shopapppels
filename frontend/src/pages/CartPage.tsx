import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      const order = await api.post('/orders', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      });
      const { checkoutUrl } = (await api.post('/payments', { orderId: order.data.id })).data;
      clear();
      window.location.href = checkoutUrl;
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Error al procesar el pedido');
      setLoading(false);
    }
  };

  if (items.length === 0) return (
    <div style={styles.empty}>
      <span style={{ fontSize: '3rem' }}>🛒</span>
      <h2 style={{ color: '#1e293b', marginTop: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>Tu carrito está vacío</h2>
      <p style={{ color: '#94a3b8', margin: '8px 0 24px' }}>Agregá productos para continuar</p>
      <button style={styles.btnPrimary} onClick={() => navigate('/')}>Ver productos</button>
    </div>
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Tu carrito</h1>
      <div style={styles.layout}>
        <div style={styles.list}>
          {items.map(item => (
            <div key={item.productId} style={styles.item}>
              <div style={styles.itemIcon}>📦</div>
              <div style={styles.itemInfo}>
                <span style={styles.itemName}>{item.name}</span>
                <span style={styles.itemPrice}>${item.price.toFixed(2)} c/u</span>
              </div>
              <div style={styles.controls}>
                <button style={styles.qtyBtn} onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                <span style={styles.qty}>{item.quantity}</span>
                <button style={styles.qtyBtn} onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
              </div>
              <span style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</span>
              <button style={styles.removeBtn} onClick={() => removeItem(item.productId)}>✕</button>
            </div>
          ))}
        </div>

        <div style={styles.summary}>
          <h3 style={styles.summaryTitle}>Resumen del pedido</h3>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryRow}>
            <span style={{ color: '#94a3b8' }}>Subtotal</span>
            <span style={{ color: '#1e293b' }}>${total.toFixed(2)}</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={{ color: '#94a3b8' }}>Envío</span>
            <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: '600' }}>Gratis</span>
          </div>
          <div style={styles.summaryDivider} />
          <div style={{ ...styles.summaryRow, marginBottom: '20px' }}>
            <span style={{ color: '#1e293b', fontWeight: '700', fontSize: '1.05rem' }}>Total</span>
            <span style={styles.totalAmount}>${total.toFixed(2)}</span>
          </div>
          <button style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleCheckout} disabled={loading}>
            {loading ? 'Redirigiendo...' : 'Pagar con MercadoPago →'}
          </button>
          <div style={styles.mpBadge}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pagos procesados por</span>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#009ee3' }}>MercadoPago</span>
          </div>
          {!user && (
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center' as const, marginTop: '10px' }}>
              Necesitás iniciar sesión
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '48px 24px' },
  pageTitle: { fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '32px', fontFamily: "'Space Grotesk', sans-serif" },
  empty: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '100px 16px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '28px', alignItems: 'start' },
  list: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  item: { display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' },
  itemIcon: { fontSize: '1.6rem', width: '44px', height: '44px', background: '#f8faff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '3px' },
  itemName: { color: '#1e293b', fontWeight: '600', fontSize: '0.95rem', fontFamily: "'Space Grotesk', sans-serif" },
  itemPrice: { color: '#94a3b8', fontSize: '0.83rem' },
  controls: { display: 'flex', alignItems: 'center', gap: '8px', background: '#f8faff', borderRadius: '10px', padding: '4px 8px', border: '1px solid rgba(0,0,0,0.07)' },
  qtyBtn: { width: '26px', height: '26px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', fontWeight: '700', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' },
  qty: { minWidth: '22px', textAlign: 'center' as const, color: '#1e293b', fontWeight: '600', fontSize: '0.9rem' },
  itemTotal: { color: '#1e293b', fontWeight: '700', fontSize: '0.95rem', minWidth: '60px', textAlign: 'right' as const, fontFamily: "'Space Grotesk', sans-serif" },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.85rem', padding: '4px', borderRadius: '6px', fontFamily: 'Inter, sans-serif' },
  summary: { background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  summaryTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" },
  summaryDivider: { height: '1px', background: 'rgba(0,0,0,0.06)', margin: '12px 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.92rem' },
  totalAmount: { fontSize: '1.3rem', fontWeight: '700', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: "'Space Grotesk', sans-serif" },
  btnPrimary: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '0.98rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' },
  mpBadge: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '2px', marginTop: '12px' },
};
