'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuChevronDown, LuEye, LuEyeOff, LuBuilding2, LuMapPin,
  LuArrowLeft, LuStethoscope, LuLandmark, LuUsers, LuUserCog, LuLoaderCircle,
} from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import AreaFuncionalPickerModal from '@/Components/AreaFuncionalPickerModal/AreaFuncionalPickerModal';
import { setActiveModule } from '@/hooks/Session/session';
import { setAreaFuncionalSeleccionada } from '@/hooks/AreaFuncional/areaFuncional';
import ModuleCard from './ModuleCard/ModuleCard';
import styles from './login.module.css';

const COMPANY_OPTIONS = [
  { value: 'unicia-sas', label: 'UNICIA SAS' },
];

const MODULES = [
  {
    id: 'asistencial',
    label: 'Asistencial HIS',
    description: 'Historia clínica, órdenes médicas, enfermería y camas.',
    icon: LuStethoscope,
    tone: 'blue',
    route: '/home',
    available: true,
  },
  {
    id: 'inventario',
    label: 'Contable',
    description: 'Facturación, cartera, cuentas y reportes financieros.',
    icon: LuLandmark,
    tone: 'green',
    route: '/home',
    available: true,
  },
  {
    id: 'nomina',
    label: 'Nómina',
    description: 'Turnos, contratos, novedades y liquidación de personal.',
    icon: LuUsers,
    tone: 'orange',
    route: null,
    available: false,
  },
];

const ADMIN_MODULE = {
  id: 'administrador',
  label: 'Administrador',
  icon: LuUserCog,
  tone: 'neutral',
  route: '/home',
};

// Simulación de la latencia de autenticación: el botón queda en estado de
// carga este tiempo antes de abrir el picker de área funcional / navegar.
const LOGIN_DELAY_MS = 1200;

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState('module');
  const [selectedModule, setSelectedModule] = useState(null);
  const [form, setForm] = useState({
    company: 'unicia-sas',
    name: '',
    password: '',
    area: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [areaPickerAbierto, setAreaPickerAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const loginTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(loginTimerRef.current), []);

  const handleSelectModule = (moduleItem) => {
    if (!moduleItem.available) return;
    setSelectedModule(moduleItem);
    setError('');
    setStep('login');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setSelectedModule(ADMIN_MODULE);
    setError('');
    setStep('login');
  };

  const handleBack = () => {
    clearTimeout(loginTimerRef.current);
    setLoading(false);
    setStep('module');
    setSelectedModule(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Simulación (encargo explícito): al ingresar el usuario se reconoce
      // de inmediato la Sede 01, sin esperar a que la elija a mano -- hoy
      // cualquier usuario cae ahí por igual, pendiente de reemplazar por la
      // lógica real de sede-por-usuario más adelante.
      if (name === 'name') next.area = value.trim() ? 'sede1' : '';
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.company || !form.name || !form.password || !form.area) {
      setError('Completa todos los campos para continuar.');
      return;
    }

    setError('');
    const moduleId = selectedModule?.id ?? 'asistencial';
    setActiveModule(moduleId);

    // El catálogo de área funcional se dispara acá en vez de navegar directo
    // a /home (encargo explícito): login queda montado de fondo, el modal en
    // foco encima -- solo al elegir (handleAreaSeleccionada) se navega.
    // Asistencial pide área funcional; el resto (Inventario/Administrador)
    // no tiene un picker de entrada propio en login -- Inventario pide
    // bodega recién al entrar a "Salidas asistenciales" (encargo explícito
    // "pasemos ese modal a cuando selecciono el módulo/card de Salidas
    // asistenciales, tanto en usuario contable como administrador"; antes
    // se disparaba acá mismo, en el login, antes de llegar a Home siquiera
    // -- ver BodegaPickerButton.jsx).
    setLoading(true);
    loginTimerRef.current = setTimeout(() => {
      if (moduleId === 'asistencial') {
        setLoading(false);
        setAreaPickerAbierto(true);
      } else {
        // Se mantiene el estado de carga hasta que la ruta nueva desmonte login.
        router.push(selectedModule?.route ?? '/home');
      }
    }, LOGIN_DELAY_MS);
  };

  const handleAreaSeleccionada = (area) => {
    setAreaFuncionalSeleccionada(area.id);
    router.push(selectedModule?.route ?? '/home');
  };

  return (
    <div className={styles['body-login']}>
      <div className={styles.container}>
        <div className={styles['block-logo']}>
          <div className={styles.logo}>
            <img src="/img/Logo_v2.svg" alt="Clintos" />
          </div>

          <div className={styles.copy}>
            <p>© 2026 Clintos HIS - Versión 3.0</p>
          </div>
        </div>

        <div className={styles['block-form']}>
          {step === 'module' ? (
            <div key="module" className={styles.step}>
              <div>
                <p className={styles.stepEyebrow}>Paso 1 de 2</p>
                <h2 className={styles.stepTitle}>¿A qué módulo quieres ingresar?</h2>
                <p className={styles.stepSubtitle}>Selecciona un módulo para continuar con tu inicio de sesión.</p>

                <div className={styles.moduleList}>
                  {MODULES.map((moduleItem) => (
                    <ModuleCard
                      key={moduleItem.id}
                      icon={moduleItem.icon}
                      tone={moduleItem.tone}
                      title={moduleItem.label}
                      description={moduleItem.description}
                      disabled={!moduleItem.available}
                      onClick={() => handleSelectModule(moduleItem)}
                    />
                  ))}
                </div>
              </div>

              <a href="#" className={styles.adminLink} onClick={handleAdminLogin}>Ingresar como administrador</a>
            </div>
          ) : (
            <div key="login" className={styles.step}>
              <div>
                <div className={styles.stepHeaderRow}>
                  <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="Volver a selección de módulo">
                    <LuArrowLeft className={styles.backBtnIcon} />
                  </button>

                  {selectedModule && (
                    <span className={`${styles.moduleTag} ${styles[selectedModule.tone ?? 'neutral']}`}>
                      <selectedModule.icon className={styles.moduleTagIcon} />
                      {selectedModule.label}
                    </span>
                  )}
                </div>

                <div className={styles.header}>
                  <h2>Inicio de sesión</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className={styles['form-group']}>
                  <div className={styles.company}>
                    <label htmlFor="company">Compañía</label>
                    <div className={styles.selectWrap}>
                      <LuBuilding2 className={styles.selectLeadingIcon} />
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
                    <label htmlFor="area">Sede</label>
                    <div className={styles.selectWrap}>
                      <LuMapPin className={styles.selectLeadingIcon} />
                      <select
                        id="area"
                        name="area"
                        value={form.area}
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar sede</option>
                        <option value="sede1">Sede 1</option>
                        <option value="sede2">Sede 2</option>
                      </select>
                      <LuChevronDown className={styles.selectIcon} />
                    </div>
                  </div>

                  {error && <p className={styles.error}>{error}</p>}
                </div>

                <div className={styles['block-cta']}>
                  <Button
                    type="submit"
                    className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading && <LuLoaderCircle className={styles.spinner} aria-hidden="true" />}
                    {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
                  </Button>
                  <a href="#" className={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {areaPickerAbierto && (
        <AreaFuncionalPickerModal
          area={null}
          onSelect={handleAreaSeleccionada}
          onClose={() => setAreaPickerAbierto(false)}
        />
      )}
    </div>
  );
}
