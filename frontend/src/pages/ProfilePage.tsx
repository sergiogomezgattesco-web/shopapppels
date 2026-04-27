import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    api.get('/users/me').then(r => setProfile({ name: r.data.name, email: r.data.email }));
  }, []);

  const flash = (setter: any, text: string, type: 'ok' | 'err') => {
    setter({ text, type });
    setTimeout(() => setter(null), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingProfile) return;
    setSavingProfile(true);
    try {
      await api.put('/users/me', profile);
      await refreshUser?.();
      flash(setProfileMsg, 'Perfil actualizado correctamente', 'ok');
    } catch (err: any) {
      flash(setProfileMsg, err.response?.data?.message ?? 'Error al actualizar', 'err');
    }
    setSavingProfile(false);
  };

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingPwd) return;
    if (pwd.newPassword !== pwd.confirm) {
      flash(setPwdMsg, 'Las contraseñas no coinciden', 'err');
      return;
    }
    setSavingPwd(true);
    try {
      await api.put('/users/me/password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      flash(setPwdMsg, 'Contraseña actualizada', 'ok');
    } catch (err: any) {
      flash(setPwdMsg, err.response?.data?.message ?? 'Error al cambiar la contraseña', 'err');
    }
    setSavingPwd(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.avatar}>{(user?.name?.[0] ?? 'U').toUpperCase()}</div>
        <div>
          <h1 style={styles.title}>Mi perfil</h1>
          <p style={styles.subtitle}>Actualizá tu información personal y de seguridad</p>
        </div>
      </div>

      <div style={styles.grid}>
        <form onSubmit={handleSaveProfile} style={styles.card}>
          <h3 style={styles.cardTitle}>Datos personales</h3>
          <div style={styles.field}>
            <label style={styles.label}>Nombre</label>
            <input
              style={styles.input}
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </div>
          {profileMsg && (
            <div style={profileMsg.type === 'ok' ? styles.msgOk : styles.msgErr}>{profileMsg.text}</div>
          )}
          <button
            type="submit"
            style={{ ...styles.btnPrimary, opacity: savingProfile ? 0.7 : 1 }}
            disabled={savingProfile}
          >
            {savingProfile ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <form onSubmit={handleChangePwd} style={styles.card}>
          <h3 style={styles.cardTitle}>Cambiar contraseña</h3>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña actual</label>
            <input
              style={styles.input}
              type="password"
              value={pwd.currentPassword}
              onChange={e => setPwd({ ...pwd, currentPassword: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Nueva contraseña</label>
            <input
              style={styles.input}
              type="password"
              value={pwd.newPassword}
              onChange={e => setPwd({ ...pwd, newPassword: e.target.value })}
              minLength={6}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Confirmar nueva contraseña</label>
            <input
              style={styles.input}
              type="password"
              value={pwd.confirm}
              onChange={e => setPwd({ ...pwd, confirm: e.target.value })}
              required
            />
          </div>
          {pwdMsg && (
            <div style={pwdMsg.type === 'ok' ? styles.msgOk : styles.msgErr}>{pwdMsg.text}</div>
          )}
          <button
            type="submit"
            style={{ ...styles.btnPrimary, opacity: savingPwd ? 0.7 : 1 }}
            disabled={savingPwd}
          >
            {savingPwd ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '32px',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
    fontFamily: "'Space Grotesk', sans-serif",
    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: "'Space Grotesk', sans-serif",
    margin: 0,
  },
  subtitle: {
    fontSize: '0.92rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: "'Space Grotesk', sans-serif",
    marginBottom: '4px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '0.82rem',
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
    fontSize: '0.92rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
  },
  btnPrimary: {
    marginTop: '8px',
    padding: '12px',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
  },
  msgOk: {
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.2)',
    color: '#059669',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '0.85rem',
  },
  msgErr: {
    background: 'rgba(239,68,68,0.06)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#ef4444',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '0.85rem',
  },
};
