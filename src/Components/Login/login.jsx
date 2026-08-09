'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuChevronDown, LuEye, LuEyeOff } from 'react-icons/lu';
import styles from './login.module.css';

const COMPANY_OPTIONS = [
  { value: 'unicia-sas', label: 'UNICIA SAS' },
];

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({
    company: 'unicia-sas',
    name: '',
    password: '',
    area: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.company || !form.name || !form.password || !form.area) {
      setError('Completa todos los campos para continuar.');
      return;
    }

    setError('');
    router.push('/home');
  };

  return (
    <div className={styles['body-login']}>
      <div className={styles.container}>
        <div className={styles['block-logo']}>
          <div className={styles.logo}>
            <img src="/img/Logo_alt.svg" alt="Clintos" />
          </div>

          <div className={styles.copy}>
            <p>© 2026 Clintos HIS - Versión 3.0</p>
          </div>
        </div>

        <div className={styles['block-form']}>
          <div className={styles.header}>
            <h2>Inicio de sesión</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles['form-group']}>
              <div className={styles.company}>
                <label htmlFor="company">Compañía</label>
                <div className={styles.selectWrap}>
                  <select
                    id="company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                  >
                    {COMPANY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <LuChevronDown className={styles.selectIcon} />
                </div>
              </div>

              <div className={styles.name}>
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Ingresa tu usuario"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.password}>
                <label htmlFor="password">Contraseña</label>
                <div className={styles.passwordWrap}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Ingresa tu contraseña"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <LuEyeOff className={styles.eyeIcon} /> : <LuEye className={styles.eyeIcon} />}
                  </button>
                </div>
              </div>

              <div className={styles.area}>
                <label htmlFor="area">Área funcional</label>
                <div className={styles.selectWrap}>
                  <select
                    id="area"
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar área</option>
                    <option value="area1">Área 1</option>
                    <option value="area2">Área 2</option>
                  </select>
                  <LuChevronDown className={styles.selectIcon} />
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}
            </div>

            <div className={styles['block-cta']}>
              <button type="submit">Iniciar sesión</button>
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
