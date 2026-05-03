'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';


interface Facultad {
  id: number;
  nombre: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login state
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [regForm, setRegForm] = useState({
    nombre: '', correo: '', password: '', confirmPassword: '', facultadId: 0,
  });
  const [facultades, setFacultades] = useState<Facultad[]>([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/faculties')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setFacultades(data); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    // Check URL params on client side
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered')) {
        setSuccess('Cuenta creada exitosamente. Inicia sesión.');
        setTab('login');
      }
      if (params.get('tab') === 'register') {
        setTab('register');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { correo, password, redirect: false });
      if (result?.error) {
        const errorMessages: Record<string, string> = {
          CredentialsSignin: 'Correo o contraseña incorrectos',
          'Correo y contraseña son requeridos': 'Correo y contraseña son requeridos',
          'Usuario desactivado': 'Tu cuenta está desactivada. Contacta al administrador.',
        };
        setError(errorMessages[result.error] ?? 'Error al iniciar sesión. Intenta de nuevo.');
      } else {
        router.push('/reservas');
        router.refresh();
      }
    } catch {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regForm.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!specialCharRegex.test(regForm.password)) {
      setError('La contraseña debe contener al menos un carácter especial');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!regForm.facultadId) { setError('Seleccione una facultad'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: regForm.nombre,
          correo: regForm.correo,
          password: regForm.password,
          facultadId: regForm.facultadId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al registrarse'); return; }
      setRegForm({ nombre: '', correo: '', password: '', confirmPassword: '', facultadId: 0 });
      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setTab('login');

    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      background: 'linear-gradient(180deg, #f0f0f5 0%, #e8e8f0 100%)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Image
          src="/UAO-LOGO-NUEVO_Mesa-de-trabajo-1-1-1-1.png"
          alt="Logo UAO"
          width={180}
          height={72}
          priority
          style={{ objectFit: 'contain', display: 'block', margin: '0 auto 16px' }}
        />
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Sistema de Reservas
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Universidad - Salas de Estudio
        </p>
      </div>

      {/* Card */}
      <div className="card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '4px' }}>Bienvenido</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Inicia sesión o crea una cuenta para reservar salas de estudio
        </p>

        {/* Tabs */}
        <div className="tab-group" style={{ marginBottom: '24px' }}>
          <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
            Iniciar Sesión
          </button>
          <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}>
            Registrarse
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '10px',
            background: 'var(--danger-bg)', marginBottom: '16px',
            fontSize: '0.8rem', color: 'var(--danger)',
          }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}
        {success && (
          <div style={{
            padding: '10px 14px', borderRadius: '10px',
            background: 'var(--success-bg)', marginBottom: '16px',
            fontSize: '0.8rem', color: 'var(--success)',
          }}>
            {success}
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">Correo Electrónico</label>
              <input id="login-correo" className="input-field" type="email"
                placeholder="correo@ejemplo.com" value={correo}
                onChange={(e) => setCorreo(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label className="label">Contraseña</label>
              <input id="login-password" className="input-field" type="password"
                placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button id="login-submit" type="submit" className="btn-accent" disabled={loading}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '14px' }}>
              <label className="label">Nombre Completo</label>
              <input id="register-nombre" className="input-field" type="text"
                placeholder="Juan Pérez" value={regForm.nombre}
                onChange={(e) => setRegForm({ ...regForm, nombre: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label className="label">Correo Electrónico</label>
              <input id="register-correo" className="input-field" type="email"
                placeholder="correo@ejemplo.com" value={regForm.correo}
                onChange={(e) => setRegForm({ ...regForm, correo: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label className="label">Facultad</label>
              <select id="register-facultad" className="input-field" value={regForm.facultadId}
                onChange={(e) => setRegForm({ ...regForm, facultadId: Number(e.target.value) })} required>
                <option value={0}>Seleccione una facultad</option>
                {facultades.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label className="label">Contraseña</label>
              <input id="register-password" className="input-field" type="password"
                placeholder="••••••••" value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required minLength={8} />
              <p className="helper-text">Mínimo 8 caracteres y al menos un carácter especial (!@#$%...)</p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label className="label">Confirmar Contraseña</label>
              <input id="register-confirm" className="input-field" type="password"
                placeholder="••••••••" value={regForm.confirmPassword}
                onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })} required minLength={8} />
            </div>
            <button id="register-submit" type="submit" className="btn-accent" disabled={loading}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: '24px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        © 2026 Universidad Autónoma De Occidente - Sistema de Reservas de Salas
      </p>
    </div>
  );
}
