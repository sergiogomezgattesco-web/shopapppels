import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmado', SHIPPED: 'Enviado',
  DELIVERED: 'Entregado', CANCELLED: 'Cancelado'
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#d97706', CONFIRMED: '#059669', SHIPPED: '#2563eb',
  DELIVERED: '#7c3aed', CANCELLED: '#dc2626'
};

const mf: Record<string, React.CSSProperties> = {
  field: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' },
  label: { fontSize: '0.82rem', fontWeight: '500', color: '#64748b', fontFamily: 'Inter, sans-serif' },
  input: {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    background: '#f8faff', border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: '10px', color: '#1e293b', fontSize: '0.92rem',
    outline: 'none', fontFamily: 'Inter, sans-serif',
  },
  actions: {
    display: 'flex', gap: '10px', marginTop: '20px',
    paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.06)',
  },
  btnCancel: {
    flex: 1, padding: '11px', background: '#f1f5f9', color: '#64748b',
    border: '1px solid rgba(0,0,0,0.09)', borderRadius: '10px',
    cursor: 'pointer', fontSize: '0.92rem', fontWeight: '500', fontFamily: 'Inter, sans-serif',
  },
  btnSave: {
    flex: 2, padding: '11px',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: 'white', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontSize: '0.92rem', fontWeight: '600',
    fontFamily: 'Inter, sans-serif', boxShadow: '0 3px 12px rgba(124,58,237,0.3)',
  },
};

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState<'products' | 'orders' | 'categories' | 'users'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', initialStock: '' });
  const [stockForm, setStockForm] = useState<Record<string, { quantity: string; reason: string }>>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryMsg, setCategoryMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const [userMsg, setUserMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  const loadCategories = () => api.get('/products/categories').then(r => setCategories(r.data));

  const loadUsers = () => api.get('/users').then(r => setUsers(r.data));

  const loadData = () => {
    loadCategories();
    api.get('/products').then(r => setProducts(r.data));
    api.get('/orders').then(r => setOrders(r.data));
    loadUsers();
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/products', { ...form, price: parseFloat(form.price), initialStock: parseInt(form.initialStock) });
    setForm({ name: '', description: '', price: '', categoryId: '', initialStock: '' });
    api.get('/products').then(r => setProducts(r.data));
  };

  const handleAdjustStock = async (productId: string) => {
    const sf = stockForm[productId];
    if (!sf) return;
    await api.patch(`/products/${productId}/stock`, { quantity: parseInt(sf.quantity), reason: sf.reason });
    api.get('/products').then(r => setProducts(r.data));
    setStockForm(prev => ({ ...prev, [productId]: { quantity: '', reason: '' } }));
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await api.patch(`/orders/${orderId}/status`, { status });
    api.get('/orders').then(r => setOrders(r.data));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      await api.post('/products/categories', { name });
      setNewCategoryName('');
      await loadCategories();
      setCategoryMsg({ text: `Categoría "${name}" creada correctamente`, ok: true });
    } catch (err: any) {
      setCategoryMsg({ text: err.response?.data?.message ?? 'Error al crear categoría', ok: false });
    }
    setTimeout(() => setCategoryMsg(null), 3000);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id, name, description, price, categoryId, imageUrl } = editProduct;
    await api.put(`/products/${id}`, { name, description, price: parseFloat(price), categoryId, imageUrl });
    setEditProduct(null);
    api.get('/products').then(r => setProducts(r.data));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editUser.id}`, { role: editUser.role, active: editUser.active });
      setEditUser(null);
      await loadUsers();
      setUserMsg({ text: 'Usuario actualizado correctamente', ok: true });
    } catch (err: any) {
      setUserMsg({ text: err.response?.data?.message ?? 'Error al actualizar usuario', ok: false });
    }
    setTimeout(() => setUserMsg(null), 3000);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    try {
      await api.delete(`/products/categories/${id}`);
      await loadCategories();
      setCategoryMsg({ text: `Categoría "${name}" eliminada`, ok: true });
    } catch (err: any) {
      setCategoryMsg({ text: err.response?.data?.message ?? 'Error al eliminar', ok: false });
    }
    setTimeout(() => setCategoryMsg(null), 3000);
  };

  const TABS = [
    { key: 'products', label: 'Productos' },
    { key: 'categories', label: 'Categorías' },
    { key: 'orders', label: 'Pedidos' },
    { key: 'users', label: 'Usuarios' },
  ] as const;

  const filteredUsers = users.filter(u => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (userSearch) {
      const t = userSearch.toLowerCase();
      if (!u.name.toLowerCase().includes(t) && !u.email.toLowerCase().includes(t)) return false;
    }
    return true;
  });

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Panel de Administración</h1>
        <p style={styles.pageSub}>Gestioná productos, categorías, pedidos y usuarios</p>
      </div>

      <div style={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={{ ...styles.tab, ...(tab === t.key ? styles.activeTab : {}) }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Nuevo producto</h2>
            <form onSubmit={handleCreateProduct} style={styles.form}>
              <input style={styles.input} placeholder="Nombre del producto" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input style={styles.input} placeholder="Descripción" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} required />
              <input style={styles.input} type="number" placeholder="Precio" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} required />
              <input style={styles.input} type="number" placeholder="Stock inicial" value={form.initialStock}
                onChange={e => setForm({ ...form, initialStock: e.target.value })} required />
              <select style={styles.input} value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Seleccionar categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="submit" style={styles.btnCreate}>+ Crear producto</button>
            </form>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Productos ({products.length})</h2>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Producto', 'Categoría', 'Precio', 'Stock', 'Ajustar stock', ''].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#fafbff' }}>
                      <td style={styles.td}><span style={styles.productName}>{p.name}</span></td>
                      <td style={styles.td}><span style={styles.categoryTag}>{p.category.name}</span></td>
                      <td style={styles.td}><span style={styles.priceText}>${p.price.toFixed(2)}</span></td>
                      <td style={styles.td}>
                        <span style={{ color: (p.stock?.quantity ?? 0) > 0 ? '#059669' : '#dc2626', fontWeight: '700', fontFamily: "'Space Grotesk', sans-serif" }}>
                          {p.stock?.quantity ?? 0}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.stockControls}>
                          <input style={styles.smallInput} type="number" placeholder="±"
                            value={stockForm[p.id]?.quantity ?? ''}
                            onChange={e => setStockForm(prev => ({ ...prev, [p.id]: { ...prev[p.id], quantity: e.target.value } }))} />
                          <input style={{ ...styles.smallInput, minWidth: '90px' }} placeholder="Motivo"
                            value={stockForm[p.id]?.reason ?? ''}
                            onChange={e => setStockForm(prev => ({ ...prev, [p.id]: { ...prev[p.id], reason: e.target.value } }))} />
                          <button style={styles.btnOk} onClick={() => handleAdjustStock(p.id)}>OK</button>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.btnEdit}
                          onClick={() => setEditProduct({ ...p, price: p.price.toString(), categoryId: p.category.id })}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'categories' && (
        <div>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Nueva categoría</h2>
            <form onSubmit={handleCreateCategory} style={styles.inlineForm}>
              <input
                style={{ ...styles.input, flex: 1 }}
                placeholder="Ej: Electrónica, Ropa, Deportes..."
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                required
              />
              <button type="submit" style={styles.btnCreate}>+ Crear</button>
            </form>
            {categoryMsg && (
              <div style={{
                marginTop: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: '500',
                background: categoryMsg.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.07)',
                color: categoryMsg.ok ? '#059669' : '#dc2626',
                border: `1px solid ${categoryMsg.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.18)'}`,
              }}>
                {categoryMsg.text}
              </div>
            )}
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Categorías existentes ({categories.length})</h2>
            {categories.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '2rem' }}>🏷️</span>
                <p style={{ color: '#94a3b8', marginTop: '8px' }}>No hay categorías creadas aún.</p>
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Nombre', 'Productos asociados', 'Acciones'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat, i) => {
                      const count = products.filter(p => p.category?.id === cat.id).length;
                      return (
                        <tr key={cat.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#fafbff' }}>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={styles.categoryIconSmall}>🏷️</span>
                              <span style={styles.productName}>{cat.name}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ ...styles.categoryTag }}>
                              {count} producto{count !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.btnDelete}
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Todos los pedidos ({orders.length})</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['ID', 'Cliente', 'Total', 'Estado', 'Cambiar estado'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#fafbff' }}>
                    <td style={styles.td}><span style={styles.orderId}>#{o.id.slice(0, 8).toUpperCase()}</span></td>
                    <td style={styles.td}><span style={{ color: '#475569' }}>{o.user.name}</span></td>
                    <td style={styles.td}><span style={styles.priceText}>${o.total.toFixed(2)}</span></td>
                    <td style={styles.td}>
                      <span style={{ color: STATUS_COLOR[o.status], fontSize: '0.85rem', fontWeight: '600' }}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <select style={styles.statusSelect} value={o.status}
                        onChange={e => handleUpdateStatus(o.id, e.target.value)}>
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Usuarios ({users.length})</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <input
                style={{ ...styles.input, flex: '1 1 240px' }}
                placeholder="Buscar por nombre o email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
              <select
                style={styles.input}
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
              >
                <option value="ALL">Todos los roles</option>
                <option value="ADMIN">Admin</option>
                <option value="CUSTOMER">Cliente</option>
              </select>
            </div>
            {userMsg && (
              <div style={{
                marginBottom: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: '500',
                background: userMsg.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.07)',
                color: userMsg.ok ? '#059669' : '#dc2626',
                border: `1px solid ${userMsg.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.18)'}`,
              }}>
                {userMsg.text}
              </div>
            )}
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Nombre', 'Email', 'Rol', 'Estado', 'Registro', ''].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#fafbff' }}>
                      <td style={styles.td}>
                        <span style={styles.productName}>{u.name}</span>
                        {currentUser?.id === u.id && (
                          <span style={{ ...styles.categoryTag, marginLeft: '8px', color: '#059669', background: 'rgba(16,185,129,0.08)' }}>Vos</span>
                        )}
                      </td>
                      <td style={styles.td}><span style={{ color: '#475569' }}>{u.email}</span></td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.categoryTag,
                          color: u.role === 'ADMIN' ? '#d97706' : '#7c3aed',
                          background: u.role === 'ADMIN' ? 'rgba(245,158,11,0.08)' : 'rgba(124,58,237,0.08)',
                        }}>
                          {u.role === 'ADMIN' ? 'Admin' : 'Cliente'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          color: u.active ? '#059669' : '#dc2626',
                          background: u.active ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.07)',
                          border: `1px solid ${u.active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.18)'}`,
                        }}>
                          {u.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          {new Date(u.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.btnEdit} onClick={() => setEditUser({ ...u })}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                      No hay usuarios que coincidan con los filtros
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div style={styles.modalOverlay} onClick={() => setEditUser(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Editar usuario</h3>
              <button style={styles.modalClose} onClick={() => setEditUser(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div style={mf.field}>
                <label style={mf.label}>Nombre</label>
                <input style={{ ...mf.input, opacity: 0.7 }} value={editUser.name} disabled />
              </div>
              <div style={mf.field}>
                <label style={mf.label}>Email</label>
                <input style={{ ...mf.input, opacity: 0.7 }} value={editUser.email} disabled />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ ...mf.field, flex: 1 }}>
                  <label style={mf.label}>Rol</label>
                  <select
                    style={mf.input}
                    value={editUser.role}
                    onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                    disabled={currentUser?.id === editUser.id}
                  >
                    <option value="CUSTOMER">Cliente</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div style={{ ...mf.field, flex: 1 }}>
                  <label style={mf.label}>Estado</label>
                  <select
                    style={mf.input}
                    value={editUser.active ? 'true' : 'false'}
                    onChange={e => setEditUser({ ...editUser, active: e.target.value === 'true' })}
                    disabled={currentUser?.id === editUser.id}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
              {currentUser?.id === editUser.id && (
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                  No podés modificar tu propio rol o estado.
                </p>
              )}
              <div style={mf.actions}>
                <button type="button" style={mf.btnCancel} onClick={() => setEditUser(null)}>Cancelar</button>
                <button type="submit" style={mf.btnSave}>Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editProduct && (
        <div style={styles.modalOverlay} onClick={() => setEditProduct(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Editar producto</h3>
              <button style={styles.modalClose} onClick={() => setEditProduct(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div style={mf.field}>
                <label style={mf.label}>Nombre</label>
                <input style={mf.input} value={editProduct.name}
                  onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} required />
              </div>
              <div style={mf.field}>
                <label style={mf.label}>Descripción</label>
                <input style={mf.input} value={editProduct.description}
                  onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ ...mf.field, flex: 1 }}>
                  <label style={mf.label}>Precio</label>
                  <input style={mf.input} type="number" step="0.01" value={editProduct.price}
                    onChange={e => setEditProduct({ ...editProduct, price: e.target.value })} required />
                </div>
                <div style={{ ...mf.field, flex: 1 }}>
                  <label style={mf.label}>Categoría</label>
                  <select style={mf.input} value={editProduct.categoryId}
                    onChange={e => setEditProduct({ ...editProduct, categoryId: e.target.value })} required>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={mf.field}>
                <label style={mf.label}>URL de imagen (opcional)</label>
                <input style={mf.input} placeholder="https://..." value={editProduct.imageUrl ?? ''}
                  onChange={e => setEditProduct({ ...editProduct, imageUrl: e.target.value })} />
              </div>
              <div style={mf.actions}>
                <button type="button" style={mf.btnCancel} onClick={() => setEditProduct(null)}>
                  Cancelar
                </button>
                <button type="submit" style={mf.btnSave}>
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' },
  pageHeader: { marginBottom: '32px' },
  pageTitle: { fontSize: '2rem', fontWeight: '700', color: '#1e293b', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '4px' },
  pageSub: { color: '#94a3b8', fontSize: '0.9rem' },
  tabs: {
    display: 'flex',
    gap: '6px',
    marginBottom: '28px',
    background: '#f1f4fb',
    padding: '4px',
    borderRadius: '12px',
    width: 'fit-content',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  tab: {
    padding: '8px 22px',
    border: 'none',
    borderRadius: '9px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    background: 'transparent',
    color: '#94a3b8',
    fontFamily: 'Inter, sans-serif',
  },
  activeTab: {
    background: '#ffffff',
    color: '#7c3aed',
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
    fontWeight: '600',
  },
  section: { marginBottom: '36px' },
  sectionTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    marginBottom: '14px',
    fontFamily: 'Inter, sans-serif',
  },
  form: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
    padding: '20px',
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '14px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  },
  inlineForm: {
    display: 'flex',
    gap: '10px',
    padding: '20px',
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '14px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  },
  input: {
    flex: '1 1 180px',
    padding: '10px 14px',
    background: '#f8faff',
    border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: '10px',
    color: '#1e293b',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
  },
  btnCreate: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
  },
  tableWrap: {
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    background: '#f8faff',
    fontFamily: 'Inter, sans-serif',
  },
  td: { padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)', verticalAlign: 'middle' as const },
  productName: { color: '#1e293b', fontWeight: '500', fontSize: '0.9rem' },
  categoryTag: {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: '#7c3aed',
    background: 'rgba(124,58,237,0.08)',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  priceText: { color: '#7c3aed', fontWeight: '600', fontFamily: "'Space Grotesk', sans-serif" },
  stockControls: { display: 'flex', gap: '6px', alignItems: 'center' },
  smallInput: {
    padding: '6px 10px',
    background: '#f8faff',
    border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: '8px',
    color: '#1e293b',
    fontSize: '0.85rem',
    outline: 'none',
    width: '60px',
    fontFamily: 'Inter, sans-serif',
  },
  btnOk: {
    padding: '6px 12px',
    background: 'rgba(124,58,237,0.08)',
    color: '#7c3aed',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  orderId: { fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.04em' },
  statusSelect: {
    padding: '6px 10px',
    background: '#f8faff',
    border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: '8px',
    color: '#64748b',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
  },
  categoryGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  categoryCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  categoryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  categoryIcon: {
    fontSize: '1.4rem',
  },
  categoryIconSmall: {
    fontSize: '1.1rem',
  },
  categoryName: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: '0.95rem',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  categoryCount: {
    color: '#94a3b8',
    fontSize: '0.82rem',
    marginTop: '2px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '14px',
  },
  btnDelete: {
    padding: '6px 14px',
    background: 'rgba(239,68,68,0.06)',
    color: '#dc2626',
    border: '1px solid rgba(239,68,68,0.18)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },
  btnEdit: {
    padding: '6px 14px',
    background: 'rgba(124,58,237,0.07)',
    color: '#7c3aed',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },
  btnCancel: {
    padding: '10px 20px',
    background: '#f1f5f9',
    color: '#64748b',
    border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '16px',
  },
  modal: {
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '20px',
    padding: '28px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '1rem',
    fontFamily: 'Inter, sans-serif',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '500',
    color: '#64748b',
    fontFamily: 'Inter, sans-serif',
  },
};
