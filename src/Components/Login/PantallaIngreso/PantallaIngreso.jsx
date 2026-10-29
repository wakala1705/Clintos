'use client';

import { LuCheck, LuMapPin, LuLoaderCircle } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import './PantallaIngreso.css';

// Pantalla de bienvenida que cubre el login mientras se carga el home (ver
// login.jsx: el backend tarda unos segundos). Es solo presentación: quien la
// monta decide cuándo se desmonta (al navegar a la ruta nueva).
export default function PantallaIngreso({ nombre, rol, area, sede }) {
  return (
    <div className="pi-screen" role="status" aria-live="polite">
      <div className="pi-content">
        <div className="pi-check-halo" aria-hidden="true">
          <div className="pi-check">
            <LuCheck className="pi-check-icon" strokeWidth={3} />
          </div>
        </div>

        <h1 className="pi-title">Hola, {nombre}</h1>
        <Badge tone="info">{rol}</Badge>

        <div className="pi-context">
          <p className="pi-context-eyebrow">Iniciando en</p>
          <div className="pi-context-row">
            <LuMapPin className="pi-context-icon" aria-hidden="true" />
            <div>
              {area && <p className="pi-context-main">{area}</p>}
              <p className={area ? 'pi-context-sub' : 'pi-context-main'}>{sede}</p>
            </div>
          </div>
        </div>

        <div className="pi-progress-block">
          <p className="pi-progress-text">
            Redirigiendo automáticamente…
            <LuLoaderCircle className="pi-spinner" aria-hidden="true" />
          </p>
          <div className="pi-progress-track" aria-hidden="true">
            <div className="pi-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
