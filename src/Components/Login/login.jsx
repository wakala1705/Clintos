'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuChevronDown, LuEye, LuEyeOff, LuBuilding2, LuMapPin,
  LuArrowLeft, LuStethoscope, LuChartBar, LuUsers, LuUserCog,
} from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import { setActiveModule } from '@/hooks/Session/session';
import ModuleCard from './ModuleCard/ModuleCard';
import styles from './login.module.css';

const COMPANY_OPTIONS = [
  { value: 'unicia-sas', label: 'UNICIA SAS' },
];

const MODULES = [
  {
    id: 'asistencial',
    label: 'Módulo Asistencial',
    description: 'Historia clínica, órdenes médicas, enfermería y camas.',
    icon: LuStethoscope,
    tone: 'blue',
    route: '/home',
    available: true,
  },
  {
    id: 'contable',
    label: 'Módulo Contable',
    description: 'Facturación, cartera, cuentas y reportes financieros.',
    icon: LuChartBar,
    tone: 'green',
    route: null,
    available: false,
  },
  {
    id: 'nomina',
    label: 'Módulo Nómina',
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
  route: '/home',
};

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
    setStep('module');
    setSelectedModule(null);
    setError('');
  };

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
    setActiveModule(selectedModule?.id ?? 'asistencial');
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
                <button type="button" className={styles.backChip} onClick={handleBack}>
                  <LuArrowLeft className={styles.backChipIcon} />
                  {selectedModule && <selectedModule.icon className={styles.backChipModuleIcon} />}
                  {selectedModule?.label.replace('Módulo ', '')}
                </button>

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
                  <Button type="submit" className={styles.submitButton}>Iniciar sesión</Button>
                  <a href="#" className={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
