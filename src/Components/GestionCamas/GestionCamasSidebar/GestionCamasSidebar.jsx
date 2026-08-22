'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './GestionCamasSidebar.css';
import { INCONSISTENCIAS_INICIALES } from '@/hooks/GestionCamas/mockIntegridadData';
import {
  LuBedDouble, LuChartColumn, LuHistory, LuLayoutGrid, LuSettings, LuShieldCheck,
} from 'react-icons/lu';

// Encargo: el header propio del sidebar ("Gestión de Camas" + ícono) es
// redundante — el nombre del módulo ya está en el breadcrumb del Topbar y el
// título de la página en el contenido principal. En su lugar, un label chico
// en mayúscula sobre la lista (mismo patrón que un section-label de menú:
// contextualiza "estos son ítems de navegación" sin repetir el nombre del
// módulo).

// Sidebar secundario del módulo administrativo "Gestión de Camas" — segundo
// nivel de navegación, distinto del sidebar global de íconos (Sidebar.jsx,
// entre módulos de Clintos): éste vive DENTRO del módulo (encargo explícito:
// "convertir la navegación horizontal por tabs... en un sidebar interno
// vertical, secundario al sidebar global"). Reemplaza a la antigua
// GestionCamasNav (franja horizontal debajo del breadcrumb); mismo criterio
// de activo derivado de usePathname() que el resto de navs del proyecto
// (GestionEnfermeriaNav.jsx). Los 6 ítems ya tienen ruta propia (Resumen,
// Camas, Integridad, Indicadores, Auditoría/Historial, Configuración) — el
// fallback de botón + aviso "en desarrollo" (ver el bloque `!item.href` más
// abajo) queda para si se agrega un ítem nuevo sin pantalla todavía, mismo
// criterio que el resto de accesos sin pantalla propia en el proyecto.
// Conteo del badge de "Integridad" = inconsistencias Activas del mock
// inicial (mismo número que muestra la propia pantalla de Integridad al
// entrar) — no se recalcula en vivo si el admin corrige/ignora algo en esa
// pantalla (su copia local es aparte, ver GestionCamasIntegridad.jsx),
// mismo criterio de "no fabricar sincronía que el mock no modela" que el
// resto del proyecto (ver mockPanelGeneralData.js).
const INCONSISTENCIAS_ACTIVAS = INCONSISTENCIAS_INICIALES.filter((i) => i.estado === 'activa').length;

const ITEMS = [
  {
    id: 'resumen', label: 'Resumen', href: '/gestion-camas', icon: LuLayoutGrid,
  },
  {
    id: 'camas', label: 'Camas', href: '/gestion-camas/camas', icon: LuBedDouble,
  },
  {
    id: 'integridad', label: 'Integridad', href: '/gestion-camas/integridad', icon: LuShieldCheck, badge: INCONSISTENCIAS_ACTIVAS,
  },
  {
    id: 'indicadores', label: 'Indicadores', href: '/gestion-camas/indicadores', icon: LuChartColumn,
  },
  {
    id: 'auditoria', label: 'Auditoría / Historial', href: '/gestion-camas/auditoria', icon: LuHistory,
  },
  // Configuración pasa al final (después de Auditoría/Historial, encargo
  // previo) y ya tiene ruta propia (ver GestionCamasConfiguracion.jsx) — deja
  // de ser el único ítem sin pantalla que disparaba el aviso "en desarrollo".
  {
    id: 'configuracion', label: 'Configuración', href: '/gestion-camas/configuracion', icon: LuSettings,
  },
];

export default function GestionCamasSidebar() {
  const pathname = usePathname();

  return (
    <aside className="cbs-sidebar">
      <nav className="cbs-nav" aria-label="Secciones de Gestión de Camas">
        <span className="cbs-nav-label-group" aria-hidden="true">Secciones</span>
        {ITEMS.map((item) => {
          const active = item.href ? pathname === item.href : false;
          const className = `cbs-nav-item${active ? ' active' : ''}`;
          const inner = (
            <>
              <item.icon className="icon cbs-nav-icon" aria-hidden="true" />
              <span className="cbs-nav-label">{item.label}</span>
              {!!item.badge && <span className="cbs-nav-badge">{item.badge}</span>}
              <span className="cbs-tooltip" role="tooltip">{item.label}</span>
            </>
          );

          if (!item.href) {
            return (
              <button
                key={item.id}
                type="button"
                className={className}
                onClick={() => window.ncToast?.(`${item.label} (en desarrollo).`)}
              >
                {inner}
              </button>
            );
          }
          return (
            <Link key={item.id} href={item.href} className={className} aria-current={active ? 'page' : undefined}>
              {inner}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
