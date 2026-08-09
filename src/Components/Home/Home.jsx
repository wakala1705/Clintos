'use client';

import { useEffect } from 'react';
import './Home.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import ModuleCard from '@/Components/Home/ModuleCard/ModuleCard';
import {
  LuActivity,
  LuBed,
  LuCalendarClock,
  LuCalendarDays,
  LuCalendarPlus,
  LuClipboardCheck,
  LuFileText,
  LuHeart,
  LuHeartPulse,
  LuSiren,
  LuStethoscope,
  LuUsers,
} from 'react-icons/lu';

const MODULE_GROUPS = [
  {
    title: 'Consulta Externa',
    icon: LuStethoscope,
    items: [
      {
        title: 'Asignación de citas',
        description: 'Agenda y gestiona las citas de consulta externa.',
        icon: LuCalendarDays,
        href: '/asignacion-citas',
        enabled: true,
      },
      {
        title: 'Programar cita',
        description: 'Programa una nueva cita para un paciente.',
        icon: LuCalendarPlus,
        href: '/programar-cita',
        enabled: true,
      },
      {
        title: 'Reprogramar citas',
        description: 'Reagenda citas existentes de pacientes.',
        icon: LuCalendarClock,
        enabled: false,
      },
      {
        title: 'Historia clínica',
        description: 'Consulta el historial clínico de pacientes de consulta externa.',
        icon: LuFileText,
        enabled: false,
      },
      {
        title: 'Signos vitales',
        description: 'Registra y consulta signos vitales de pacientes.',
        icon: LuHeart,
        enabled: false,
      },
      {
        title: 'Lista de pacientes',
        description: 'Consulta y administra el listado de pacientes.',
        icon: LuUsers,
        href: '/lista-pacientes',
        enabled: true,
      },
      {
        title: 'Accidentes de tránsito',
        description: 'Registro de atenciones por accidentes de tránsito.',
        icon: LuSiren,
        enabled: false,
      },
    ],
  },
  {
    title: 'Hospitalización',
    icon: LuBed,
    items: [
      {
        title: 'Gestión de enfermería',
        description: 'Cronograma de medicamentos, órdenes médicas y pedidos.',
        icon: LuHeartPulse,
        href: '/gestion-enfermeria',
        enabled: true,
      },
      {
        title: 'Triage',
        description: 'Clasificación y priorización de pacientes al ingreso.',
        icon: LuActivity,
        enabled: false,
      },
      {
        title: 'Admisiones',
        description: 'Registro y gestión de ingresos hospitalarios.',
        icon: LuClipboardCheck,
        enabled: false,
      },
      {
        title: 'Historia clínica',
        description: 'Diagnósticos, evolución clínica e historial médico del paciente.',
        icon: LuFileText,
        enabled: false,
      },
    ],
  },
];

export default function Home() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: false });
    return cleanup;
  }, []);

  return (
    <div className="app">

      <Sidebar />

      <div className="main">

        <Topbar page="Inicio" user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }} />

        <div className="content home-content">

          <div className="home-hero">
            <h1>Bienvenido a Clintos</h1>
            <p>Selecciona un módulo para continuar.</p>
          </div>

          {MODULE_GROUPS.map((group) => (
            <section className="module-section" key={group.title}>
              <div className="module-section-header">
                <group.icon className="icon" />
                <h2>{group.title}</h2>
              </div>
              <div className="module-grid">
                {group.items.map((item) => (
                  <ModuleCard
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    href={item.href}
                    enabled={item.enabled}
                  />
                ))}
              </div>
            </section>
          ))}

        </div>
      </div>
    </div>
  );
}
