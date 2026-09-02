'use client';

import { useEffect, useMemo, useState } from 'react';
import './HojaMedicamentosTab.css';
import { HOJA_MEDICAMENTOS } from '@/hooks/GestionEnfermeria/mockMonitoreo';
import ClinicalStatusBadge from '@/Components/GestionEnfermeria/shared/ClinicalStatusBadge/ClinicalStatusBadge';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import { LuDownload } from 'react-icons/lu';

const RANGO_OPTIONS = [
  { value: 'estancia', label: 'Estancia completa' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Última semana' },
  { value: 'custom', label: 'Rango personalizado' },
];
const TURNO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche' },
];
const ESTADO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'administered', label: 'Administrado' },
  { value: 'incident', label: 'Incidencia' },
  { value: 'suspended', label: 'Suspendido' },
];

// Vista histórica de solo lectura (a diferencia de Gestión de medicamentos,
// que es operativa) — default "Estancia completa" en vez de "Hoy". El
// filtro "Rango" no recorta HOJA_MEDICAMENTOS (dataset mock fijo, sin campo
// de fecha por fila) — queda cableado a UI/estado para cuando este módulo
// deje de ser un mock, mismo criterio que otras pantallas de este proyecto
// que documentan esa misma limitación de datos de prototipo.
export default function HojaMedicamentosTab() {
  const [rango, setRango] = useState('estancia');
  const [turno, setTurno] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filas = useMemo(
    () => HOJA_MEDICAMENTOS.filter(
      (f) => (turno === '' || f.turno === turno) && (estado === '' || f.estado === estado),
    ),
    [turno, estado],
  );

  return (
    <div role="tabpanel" id="subpanel-hoja-medicamentos" aria-labelledby="subtab-hoja-medicamentos" tabIndex="0" className="sub-panel active">
      <div className="filter-bar">
        <FormSelect id="hm-rango" value={rango} onChange={setRango} options={RANGO_OPTIONS} />
        <FormSelect id="hm-turno" value={turno} onChange={setTurno} options={TURNO_OPTIONS} placeholder="Turno" />
        <FormSelect id="hm-estado" value={estado} onChange={setEstado} options={ESTADO_OPTIONS} placeholder="Estado" />
        <div className="filter-spacer" />
        <Button
          variant="outline"
          icon={LuDownload}
          onClick={() => window.ncToast?.('Exportar / Imprimir: función en desarrollo.')}
        >
          Exportar / Imprimir
        </Button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Programado</th>
              <th>Real</th>
              <th>Administrado por</th>
              <th>Estado</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {loading && [0, 1, 2].map((i) => (
              <tr key={`skeleton-${i}`}>
                <td colSpan={6}><span className="hm-skeleton-row" /></td>
              </tr>
            ))}
            {!loading && filas.map((f) => (
              <tr key={f.id}>
                <td>
                  <span className="cell-primary">{f.medicamento.nombre} {f.medicamento.dosis}</span>
                  <span className="cell-sub">{f.medicamento.via} · {f.medicamento.frecuencia}</span>
                </td>
                <td>{f.programado}</td>
                <td>{f.real ?? '—'}</td>
                <td>{f.administradoPor ?? '—'}</td>
                <td><ClinicalStatusBadge status={f.estado} /></td>
                <td className={f.nota ? undefined : 'cell-muted'}>{f.nota ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filas.length === 0 && (
          <div className="hm-empty-state">No hay registros para el rango y los filtros seleccionados.</div>
        )}
      </div>
    </div>
  );
}
