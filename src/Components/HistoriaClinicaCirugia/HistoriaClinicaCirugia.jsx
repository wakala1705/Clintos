'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuCircleCheck, LuFileCheck, LuFilePen, LuFilePlus, LuFileText, LuMaximize2, LuMinimize2,
} from 'react-icons/lu';
import '../ProgramacionSalaCirugias/ProgramacionSalaCirugias.css';
import '../ProgramacionSalaCirugias/shared/shared.css';
import './HistoriaClinicaCirugia.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import SearchField from '@/Components/SearchField/SearchField';
import FormSelect from '@/Components/FormSelect/FormSelect';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import { fechaHoraRangoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { RANGOS_PANEL, rangoFechas } from '@/hooks/ProgramacionSalaCirugias/panel/panel';
import { ESTADO_HC_LABEL, listarCirugiasFinalizadas } from '@/hooks/HistoriaClinicaCirugia/mockHcCirugia';

const ESTADO_OPTIONS = [
  { value: 'todas', label: 'Todos los estados' },
  { value: 'pendiente', label: ESTADO_HC_LABEL.pendiente },
  { value: 'realizada', label: ESTADO_HC_LABEL.realizada },
];
// Chips de tiempo (mismos que el Panel general). Arranca en 'mes': una HC
// pendiente puede ser de días atrás y con 'hoy' quedaría fuera de la vista.
const RANGO_OPTIONS = Object.entries(RANGOS_PANEL).map(([value, { label }]) => ({ value, label }));

// "Historia clínica" de Cirugía: bandeja del médico con las cirugías ya
// finalizadas. Cada una pasa de "HC pendiente" a "HC realizada" cuando se
// diligencia su informe quirúrgico (pantalla de atención, variante "cirugia"
// de AtencionPaciente). Misma estructura que HC Hospitalización: encabezado,
// KPIs y una tabla con la barra de filtros de una sola fila.
export default function HistoriaClinicaCirugia() {
  const router = useRouter();
  const [cirugias, setCirugias] = useState(null); // null = cargando
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [rango, setRango] = useState('mes');
  // Botón expandir de la barra: compacta los KPIs a una línea para darle ese
  // alto a la tabla (mismo toggle que HC Hospitalización).
  const [tablaExpandida, setTablaExpandida] = useState(false);
  const ExpandIcon = tablaExpandida ? LuMinimize2 : LuMaximize2;

  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  useEffect(() => {
    let cancelled = false;
    listarCirugiasFinalizadas().then((items) => { if (!cancelled) setCirugias(items); });
    return () => { cancelled = true; };
  }, []);

  // Cirugías del rango elegido; los KPIs cuentan sobre esta lista (antes del filtro de estado).
  const lista = useMemo(() => {
    const { inicio, fin } = rangoFechas(rango);
    return (cirugias ?? []).filter((c) => c.fecha >= inicio && c.fecha <= fin);
  }, [cirugias, rango]);
  const kpis = useMemo(() => ({
    total: lista.length,
    pendientes: lista.filter((c) => !c.hc).length,
    realizadas: lista.filter((c) => c.hc).length,
  }), [lista]);

  const filas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return lista.filter((c) => {
      if (filtro === 'pendiente' && c.hc) return false;
      if (filtro === 'realizada' && !c.hc) return false;
      if (!q) return true;
      return [c.paciente.nombre, c.paciente.documento, c.procedimientoPrincipal, c.cirujano].some((v) => v?.toLowerCase().includes(q));
    });
  }, [lista, filtro, busqueda]);

  const abrir = (c) => router.push(`/cirugia/historia-clinica/${c.id}`);

  let contenido;
  if (cirugias === null) {
    contenido = <p className="hcq-estado" role="status">Cargando cirugías…</p>;
  } else if (filas.length === 0) {
    contenido = <p className="hcq-estado" role="status">{lista.length === 0 ? 'Todavía no hay cirugías finalizadas.' : 'Ninguna cirugía coincide con los filtros.'}</p>;
  } else {
    contenido = (
      <div className="hcq-scroll">
        <table className="hcq-table">
          <thead>
            <tr>
              <th scope="col">Fecha y hora</th>
              <th scope="col">Paciente</th>
              <th scope="col">Procedimiento</th>
              <th scope="col">Sala</th>
              <th scope="col">Cirujano</th>
              <th scope="col">Estado de la HC</th>
              <th scope="col"><span className="hcq-sr">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {filas.map((c) => (
              <tr
                key={c.id}
                tabIndex={0}
                onClick={() => abrir(c)}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) abrir(c); }}
              >
                <td className="hcq-hora">{fechaHoraRangoLabel(c.fecha, c.horaInicio)}</td>
                <td><span className="hcq-main">{c.paciente.nombre}</span></td>
                <td className="hcq-upper">{c.procedimientoPrincipal}</td>
                <td>{c.salaNombre}</td>
                <td className="hcq-upper">{c.cirujano}</td>
                <td>
                  <Badge tone={c.hc ? 'success' : 'warn'}>{c.hc ? ESTADO_HC_LABEL.realizada : ESTADO_HC_LABEL.pendiente}</Badge>
                </td>
                <td className="hcq-actions">
                  <div role="presentation" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    {c.hc ? (
                      <Button size="sm" variant="outline" icon={LuFileText} onClick={() => abrir(c)}>Abrir HC</Button>
                    ) : (
                      <Button size="sm" icon={LuFilePlus} onClick={() => abrir(c)}>Crear HC</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Cirugía"
          page="Historia clínica"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content hcq-content">
          <div className="psc-page-header">
            <div>
              <h1>Historia clínica - Cirugía</h1>
              <p>Cirugías finalizadas pendientes de su informe quirúrgico.</p>
            </div>
          </div>

          <div className={`hcq-kpis${tablaExpandida ? ' compact' : ''}`}>
            <KpiCard icon={LuCircleCheck} label="Cirugías finalizadas" compact={tablaExpandida} value={kpis.total} description={RANGOS_PANEL[rango].periodo} variant="neutral" />
            <KpiCard icon={LuFilePen} label="HC pendientes" compact={tablaExpandida} value={kpis.pendientes} description="Sin informe quirúrgico" variant="warning" />
            <KpiCard icon={LuFileCheck} label="HC realizadas" compact={tablaExpandida} value={kpis.realizadas} description="Con informe quirúrgico" variant="success" />
          </div>

          <section className="hcq-panel" aria-label="Cirugías finalizadas">
            <div className="filter-bar hcq-toolbar">
              <SearchField className="hcq-search" value={busqueda} onChange={setBusqueda} placeholder="Buscar paciente, procedimiento..." ariaLabel="Buscar cirugías" />
              <span className="filter-spacer" />
              <SegmentedFilterBar options={RANGO_OPTIONS} value={rango} onChange={setRango} ariaLabel="Filtrar cirugías por fecha" />
              <div className="hcq-estado-select">
                <FormSelect id="hcq-estado" ariaLabel="Estado de la historia clínica" value={filtro} onChange={setFiltro} options={ESTADO_OPTIONS} />
              </div>
              <button
                type="button"
                className="hcq-expand-btn"
                onClick={() => setTablaExpandida((v) => !v)}
                aria-pressed={tablaExpandida}
                aria-label={tablaExpandida ? 'Contraer tabla' : 'Expandir tabla'}
                title={tablaExpandida ? 'Contraer tabla' : 'Expandir tabla'}
              >
                <ExpandIcon className="icon" aria-hidden="true" />
              </button>
            </div>
            {contenido}
          </section>
        </div>
      </div>
    </div>
  );
}
