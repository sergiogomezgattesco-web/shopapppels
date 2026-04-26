import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

interface Product {
  id: string; name: string; description: string; price: number;
  imageUrl?: string; category: { name: string }; stock: { quantity: number } | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    const params: any = {};
    if (categoryId) params.categoryId = categoryId;
    if (search) params.search = search;
    api.get('/products', { params }).then(r => setProducts(r.data));
  }, [categoryId, search]);

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Descubrí lo que{' '}
          <span style={styles.gradientText}>está de moda</span>
        </h1>
        <p style={styles.heroSub}>Los mejores productos, al mejor precio.</p>
      </div>

      <div style={styles.filtersBar}>
        <input
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          style={styles.select}
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={styles.grid}>
        {products.map(p => {
          const inStock = (p.stock?.quantity ?? 0) > 0;
          return (
            <div key={p.id} style={styles.card}>
              <div style={styles.imgArea}>
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={styles.imgIcon}>📦</span>
                }
                <span style={{
                  ...styles.stockBadge,
                  ...(inStock
                    ? { background: 'rgba(16,185,129,0.1)', color: '#059669', borderColor: 'rgba(16,185,129,0.25)' }
                    : { background: 'rgba(239,68,68,0.07)', color: '#dc2626', borderColor: 'rgba(239,68,68,0.2)' }
                  )
                }}>
                  {inStock ? `${p.stock!.quantity} en stock` : 'Sin stock'}
                </span>
              </div>
              <div style={styles.cardBody}>
                <span style={styles.categoryTag}>{p.category.name}</span>
                <h3 style={styles.productName}>{p.name}</h3>
                <p style={styles.desc}>{p.description}</p>
                <div style={styles.priceRow}>
                  <span style={styles.price}>${p.price.toFixed(2)}</span>
                </div>
                <div style={styles.actions}>
                  <button
                    style={styles.btnSecondary}
                    onClick={() => navigate(`/products/${p.id}`)}
                  >
                    Ver detalle
                  </button>
                  <button
                    style={{ ...styles.btnPrimary, opacity: inStock ? 1 : 0.4, cursor: inStock ? 'pointer' : 'not-allowed' }}
                    onClick={() => addItem({ productId: p.id, name: p.name, price: p.price })}
                    disabled={!inStock}
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div style={styles.empty}>
          <p style={{ fontSize: '2.5rem' }}>🔍</p>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px 60px',
  },
  hero: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  heroTitle: {
    fontSize: '2.8rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px',
    letterSpacing: '-0.03em',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  gradientText: {
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    color: '#94a3b8',
    fontSize: '1.05rem',
  },
  filtersBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '11px 16px',
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: '12px',
    color: '#1e293b',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  select: {
    padding: '11px 16px',
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: '12px',
    color: '#64748b',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    minWidth: '200px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  imgArea: {
    position: 'relative' as const,
    height: '180px',
    background: '#f8faff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imgIcon: {
    fontSize: '3.5rem',
    opacity: 0.4,
  },
  stockBadge: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '3px 9px',
    borderRadius: '20px',
    border: '1px solid',
  },
  cardBody: {
    padding: '16px',
  },
  categoryTag: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#7c3aed',
    background: 'rgba(124,58,237,0.08)',
    padding: '3px 8px',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  productName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '6px',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  desc: {
    fontSize: '0.83rem',
    color: '#94a3b8',
    lineHeight: '1.5',
    marginBottom: '12px',
    display: '-webkit-box' as any,
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as any,
    overflow: 'hidden',
  },
  priceRow: {
    marginBottom: '12px',
  },
  price: {
    fontSize: '1.3rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  btnPrimary: {
    flex: 1,
    padding: '9px 12px',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
  },
  btnSecondary: {
    flex: 1,
    padding: '9px 12px',
    background: '#f8faff',
    color: '#64748b',
    border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '60px 16px',
  },
};
