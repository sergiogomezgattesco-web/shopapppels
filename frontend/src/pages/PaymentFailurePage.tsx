import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PaymentFailurePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = params.get('external_reference');
    const paymentId = params.get('payment_id') ?? params.get('collection_id') ?? '';
    if (orderId) {
      api.post('/payments/confirm', { orderId, paymentId, status: 'rejected' }).catch(() => {});
    }
  }, []);

  const orderId = params.get('external_reference');

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>✕</div>
        <h1 style={styles.title}>Pago rechazado</h1>
        <p style={styles.sub}>No pudimos procesar tu pago. Podés intentarlo de nuevo.</p>
        <div style={styles.actions}>
          <button style={styles.btnPrimary} onClick={() => navigate('/cart')}>
            Reintentar pago
          </button>
          {orderId && (
            <button style={styles.btnSecondary} onClick={() => navigate(`/orders/${orderId}`)}>
              Ver detalle del pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 60px)', padding: '24px' },
  card: { background: '#ffffff', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '20px', padding: '48px 40px', maxWidth: '440px', width: '100%', textAlign: 'center' as const, boxShadow: '0 8px 40px rgba(0,0,0,0.08)' },
  iconWrap: { width: '64px', height: '64px', background: 'rgba(239,68,68,0.07)', border: '2px solid rgba(239,68,68,0.18)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#dc2626', margin: '0 auto 20px', fontWeight: '700' },
  title: { fontSize: '1.6rem', fontWeight: '700', color: '#1e293b', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '10px' },
  sub: { color: '#64748b', fontSize: '0.95rem', marginBottom: '28px' },
  actions: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  btnPrimary: { padding: '12px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', boxShadow: '0 3px 12px rgba(124,58,237,0.25)' },
  btnSecondary: { padding: '12px', background: '#f1f5f9', color: '#64748b', border: '1px solid rgba(0,0,0,0.09)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500', fontFamily: 'Inter, sans-serif' },
};
