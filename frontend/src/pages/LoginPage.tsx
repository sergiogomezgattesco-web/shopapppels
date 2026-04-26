import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Email o contraseña incorrectos');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrap}>◈</div>
          <h2 style={styles.title}>Bienvenido</h2>
          <p style={styles.subtitle}>Ingresá a tu cuenta para continuar</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={styles.btn}>Ingresar</button>
        </form>

        <p style={styles.footer}>
          ¿No tenés cuenta?{' '}
          <Link to="/register" style={styles.link}>Registrate gratis</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 16px',
    minHeight: 'calc(100vh - 60px)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '20px',
    padding: '40px 36px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  iconWrap: {
    fontSize: '2.5rem',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'block',
    marginBottom: '12px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '6px',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.92rem',
    marginTop: '6px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#64748b',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    background: '#f8faff',
    border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: '10px',
    color: '#1e293b',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
  },
  btn: {
    marginTop: '8px',
    padding: '12px',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.06)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#ef4444',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '0.88rem',
    marginBottom: '16px',
  },
  footer: {
    textAlign: 'center' as const,
    color: '#94a3b8',
    fontSize: '0.88rem',
    marginTop: '24px',
  },
  link: {
    color: '#7c3aed',
    fontWeight: '500',
  },
};
