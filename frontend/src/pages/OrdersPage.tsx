import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:   { label: 'Pendiente',  color: '#d97706', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  CONFIRMED: { label: 'Confirmado', color: '#059669', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)' },
  SHIPPED:   { label: 'Enviado',    color: '#2563eb', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)' },
  DELIVERED: { label: 'Entregado',  color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
  CANCELLED: { label: 'Cancelado',  color: '#dc2626', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.18)' },
};

type SortKey = 'date' | 'total' | 'status' | 'id';
type SortDir = 'asc' | 'desc';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.get('/orders');
      const list = res.data;
      setOrders(list);
      setLoading(false);

      const pending = list.filter((o: any) => !o.payment);
      if (pending.length > 0) {
        setRefreshing(true);
        await Promise.all(pending.map((o: any) =>
          api.post(`/payments/verify/${o.id}`).catch(() => null)
        ));
        const fresh = await api.get('/orders');
        setOrders(fresh.data);
        setRefreshing(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = orders.filter(o => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (term) {
        const idMatch = o.id.toLowerCase().includes(term);
        const productMatch = o.items?.some((i: any) =>
          i.product?.name?.toLowerCase().includes(term)
        );
        if (!idMatch && !productMatch) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortKey === 'total') cmp = a.total - b.total;
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortKey === 'id') cmp = a.id.localeCompare(b.id);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [orders, search, statusFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Cargando pedidos...</div>
  );

  if (orders.length === 0) return (
    <div style={{ textAlign: 'center', padding: '100px 16px' }}>
      <span style={{ fontSize: '3rem' }}>📋</span>
      <h2 style={{ color: '#1e293b', marginTop: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>Sin pedidos aún</h2>
      <p style={{ color: '#94a3b8', marginTop: '8px' }}>Cuando realices tu primera compra, aparecerá acá</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.pageTitle}>Mis Pedidos</h1>
        {refreshing && <span style={styles.refreshing}>● Actualizando estados...</span>}
      </div>

      <div style={styles.controls}>
        <input
          style={styles.searchInput}
          placeholder="🔍  Buscar por ID o producto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={styles.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        <span style={styles.count}>
          {filtered.length} de {orders.length} pedido{orders.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.thClick} onClick={() => handleSort('id')}>Pedido{sortIcon('id')}</th>
              <th style={styles.thClick} onClick={() => handleSort('date')}>Fecha{sortIcon('date')}</th>
              <th style={styles.th}>Items</th>
              <th style={styles.thClick} onClick={() => handleSort('status')}>Estado{sortIcon('status')}</th>
              <th style={{ ...styles.thClick, textAlign: 'right' }} onClick={() => handleSort('total')}>Total{sortIcon('total')}</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
              return (
                <tr key={order.id} style={styles.tr} onClick={() => navigate(`/orders/${order.id}`)}>
                  <td style={styles.tdId}>#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td style={styles.td}>
                    {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={styles.td}>{order.items.length}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td style={styles.tdTotal}>${order.total.toFixed(2)}</td>
                  <td style={styles.tdArrow}>→</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={styles.empty}>No se encontraron pedidos con esos filtros</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: "'Space Grotesk', sans-serif",
    margin: 0,
  },
  refreshing: {
    fontSize: '0.82rem',
    color: '#7c3aed',
    fontWeight: '500',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1 1 280px',
    padding: '10px 14px',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    background: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
  },
  select: {
    padding: '10px 14px',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    background: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    outline: 'none',
  },
  count: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    marginLeft: 'auto',
  },
  tableWrap: {
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontFamily: 'Inter, sans-serif',
  },
  th: {
    textAlign: 'left' as const,
    padding: '14px 18px',
    fontSize: '0.78rem',
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    background: '#fafbfd',
    userSelect: 'none' as const,
  },
  thClick: {
    textAlign: 'left' as const,
    padding: '14px 18px',
    fontSize: '0.78rem',
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    background: '#fafbfd',
    userSelect: 'none' as const,
    cursor: 'pointer',
  },
  tr: {
    cursor: 'pointer',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  td: {
    padding: '14px 18px',
    fontSize: '0.9rem',
    color: '#475569',
  },
  tdId: {
    padding: '14px 18px',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.05em',
  },
  tdTotal: {
    padding: '14px 18px',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: "'Space Grotesk', sans-serif",
    textAlign: 'right' as const,
  },
  tdArrow: {
    padding: '14px 18px',
    color: '#cbd5e1',
    fontSize: '1.05rem',
    width: '40px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '600',
    display: 'inline-block',
  },
  empty: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
};
