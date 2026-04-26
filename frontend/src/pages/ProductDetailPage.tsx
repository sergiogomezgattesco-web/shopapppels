import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (id) api.get(`/products/${id}`).then(r => setProduct(r.data));
  }, [id]);

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Cargando...</div>
  );

  const inStock = (product.stock?.quantity ?? 0) > 0;

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/')}>← Volver al catálogo</button>

      <div style={styles.card}>
        <div style={styles.imgArea}>
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '5rem', opacity: 0.3 }}>📦</span>
          }
        </div>

        <div style={styles.info}>
          <span style={styles.categoryTag}>{product.category.name}</span>
          <h1 style={styles.title}>{product.name}</h1>
          <p style={styles.desc}>{product.description}</p>

          <div style={styles.priceRow}>
            <span style={styles.price}>${product.price.toFixed(2)}</span>
            <span style={{
              ...styles.stockBadge,
              ...(inStock
                ? { background: 'rgba(16,185,129,0.08)', color: '#059669', borderColor: 'rgba(16,185,129,0.2)' }
                : { background: 'rgba(239,68,68,0.07)', color: '#dc2626', borderColor: 'rgba(239,68,68,0.18)' }
              )
            }}>
              {inStock ? `${product.stock.quantity} en stock` : 'Sin stock'}
            </span>
          </div>

          <button
            style={{ ...styles.btnAdd, opacity: inStock ? 1 : 0.4, cursor: inStock ? 'pointer' : 'not-allowed' }}
            disabled={!inStock}
            onClick={() => { addItem({ productId: product.id, name: product.name, price: product.price }); navigate('/cart'); }}
          >
            Agregar al carrito →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' },
  backBtn: {
    background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
    fontSize: '0.88rem', padding: '0', marginBottom: '24px', fontFamily: 'Inter, sans-serif',
  },
  card: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px',
    background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  },
  imgArea: {
    height: '380px', background: '#f8faff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  info: { padding: '36px 36px 36px 0', display: 'flex', flexDirection: 'column' as const, gap: '14px' },
  categoryTag: {
    display: 'inline-block', fontSize: '0.72rem', fontWeight: '600',
    textTransform: 'uppercase' as const, letterSpacing: '0.08em',
    color: '#7c3aed', background: 'rgba(124,58,237,0.08)',
    padding: '4px 10px', borderRadius: '6px', width: 'fit-content',
  },
  title: {
    fontSize: '1.8rem', fontWeight: '700', color: '#1e293b',
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em',
  },
  desc: { color: '#64748b', fontSize: '0.95rem', lineHeight: '1.7' },
  priceRow: { display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' },
  price: {
    fontSize: '2rem', fontWeight: '700',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  stockBadge: {
    fontSize: '0.8rem', fontWeight: '600', padding: '4px 12px',
    borderRadius: '20px', border: '1px solid',
  },
  btnAdd: {
    marginTop: 'auto', padding: '14px 24px',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '1rem', fontWeight: '600', fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
  },
};
