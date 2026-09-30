'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuArrowLeft, LuEye, LuSearch } from 'react-icons/lu';
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './CanastasHistorial.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import FormSelect from '@/Components/FormSelect/FormSelect';
import DetalleSolicitudModal from '../canastas/DetalleSolicitudModal/DetalleSolicitudModal';
import { CANASTA_ESTADO_LABEL } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { CANASTA_META, badgeProps } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import { HISTORIAL_CANASTAS, fechaHoraHistorial, filtrarHistorial } from '@/hooks/ProgramacionSalaCirugias/canastasHistorial';

const USUARIO = 'Camilo Grondona';
const ESTADO_OPTIONS = [
  { value: 'todas', label: 'Todos los estados' },
  ...Object.entries(CANASTA_ESTADO_LABEL).map(([value, label]) => ({ value, label })),
];

// Historial de solicitudes de canastas a farmacia (datos de ejemplo).
export default function CanastasHistorial() {
  const router = useRouter();
  const [filtros, setFiltros] = useState({ busqueda: '', estado: 'todas' });
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  const filas = filtrarHistorial(HISTORIAL_CANASTAS, filtros);

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Historial de canastas"
          user={{ name: USUARIO, role: 'Administrador', initials: 'CG' }}
        />
        <div className="content cnc-content">
          <div className="psc-page-header">
            <div>
              <h1>Historial de canastas</h1>
              <p>Consulta las solicitudes de canastas a farmacia y su estado.</p>
            </div>
            <div className="psc-page-header-actions">
              <Button variant="secondary-accent" icon={LuArrowLeft} onClick={() => router.push('/programacion-sala-cirugias/canastas')}>
                Volver a canastas
              </Button>
            </div>
          </div>

          <section className="cnc-panel cnc-hist">
            <div className="filter-bar cnc-hist-filtros">
              <div className="search-field">
                <LuSearch className="icon" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Paciente o solicitud"
                  aria-label="Buscar en el historial"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros((f) => ({ ...f, busqueda: e.target.value }))}
                />
              </div>
              <div className="filter-spacer" />
              <div className="cnc-hist-estado">
                <FormSelect
                  id="cnc-hist-estado"
                  ariaLabel="Estado de la canasta"
                  value={filtros.estado}
                  onChange={(estado) => setFiltros((f) => ({ ...f, estado }))}
                  options={ESTADO_OPTIONS}
                />
              </div>
            </div>
            <div className="cnc-hist-scroll">
              <table className="cnc-tabla">
                <thead>
                  <tr>
                    <th>Solicitud</th>
                    <th>Fecha de solicitud</th>
                    <th>Paciente</th>
                    <th>Procedimiento</th>
                    <th>Sala</th>
                    <th>Estado</th>
                    <th>Solicitó</th>
                    <th>Recibió</th>
                    <th className="cnc-hist-acc">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f) => (
                    <tr key={f.solicitud}>
                      <td className="cnc-hist-num">{f.solicitud}</td>
                      <td className="cnc-hist-nowrap">{fechaHoraHistorial(f.fecha)}</td>
                      <td className="cnc-hist-paciente">{f.paciente}</td>
                      <td className="cnc-hist-proc">{f.procedimiento}</td>
                      <td className="cnc-hist-nowrap">{f.sala}</td>
                      <td><Badge {...badgeProps(CANASTA_META[f.estado])}>{CANASTA_ESTADO_LABEL[f.estado]}</Badge></td>
                      <td>{f.solicitadoPor}</td>
                      <td>{f.recibidoPor}</td>
                      <td className="cnc-hist-acc">
                        <button
                          type="button"
                          className="cnc-hist-ver"
                          aria-label={`Ver detalle de la solicitud ${f.solicitud}`}
                          title="Ver detalle"
                          onClick={() => setDetalle(f)}
                        >
                          <LuEye className="icon" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filas.length === 0 && <p className="cnc-sin-resultados">Ninguna solicitud coincide con los filtros.</p>}
            </div>
          </section>
        </div>
      </div>
      {detalle && <DetalleSolicitudModal solicitud={detalle} onClose={() => setDetalle(null)} />}
    </div>
  );
}
