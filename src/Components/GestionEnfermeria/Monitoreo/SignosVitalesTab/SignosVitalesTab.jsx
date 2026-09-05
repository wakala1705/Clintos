'use client';

import { useState } from 'react';
import './SignosVitalesTab.css';
import { getVitalStatus } from '@/hooks/GestionEnfermeria/vitalAbnormality';
import ViewToggle from '@/Components/GestionEnfermeria/shared/ViewToggle/ViewToggle';
import { LuList, LuChartLine } from 'react-icons/lu';
import DateRangeChips from './DateRangeChips/DateRangeChips';
import VitalesChart from './VitalesChart/VitalesChart';
import { VITAL_PARAMS } from './vitalParams';
import { VITAL_GROUPS } from './vitalGroups';
import { formatFechaHora, formatRelative } from './vitalTime';
import SignosVitalesResumen from './SignosVitalesResumen/SignosVitalesResumen';
import VitalStatusTag from './VitalStatusTag/VitalStatusTag';

const VIEW_OPTIONS = [
  { value: 'tabla', label: 'Tabla', icon: LuList },
  { value: 'grafica', label: 'Gráfica', icon: LuChartLine },
];

// patientProfile es un placeholder — AtencionEnfermeria.jsx todavía no pasa
// datos reales de paciente a sus tabs (ver su propio comentario sobre `id`
// sin conectar aún), así que getVitalStatus recibe un objeto vacío hasta
// que ese dato exista.
const patientProfile = {};

// `readings` viene de Monitoreo.jsx: el botón "Registrar signos vitales" se
// movió a la fila de subnavegación (fuera de este sub-panel, ver
// Monitoreo.jsx), así que el estado de las lecturas también se subió ahí
// para que un registro nuevo se refleje acá sin duplicar la fuente de datos.
export default function SignosVitalesTab({ readings, getStatus = getVitalStatus }) {
  const [view, setView] = useState('tabla');
  // dateRange queda cableado a UI/estado pero no recorta `readings` — mismo
  // criterio y misma razón que el filtro "Rango" de HojaMedicamentosTab.jsx
  // (dataset mock fijo, sin rango de fechas real que filtrar todavía).
  const [dateRange, setDateRange] = useState({ mode: '24h', desde: null, hasta: null });

  const latest = readings.length ? readings[readings.length - 1] : null;

  return (
    <div role="tabpanel" id="subpanel-signos-vitales" aria-labelledby="subtab-signos-vitales" tabIndex="0" className="sub-panel active">
      <div className="filter-bar">
        <ViewToggle view={view} onChange={setView} options={VIEW_OPTIONS} />
        <div className="filter-spacer" />
        <DateRangeChips value={dateRange} onChange={setDateRange} />
      </div>

      <SignosVitalesResumen latest={latest} getStatus={getStatus} />

      {view === 'tabla' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                {VITAL_PARAMS.map((p) => <th key={p.key}>{p.label} ({p.unit})</th>)}
                <th>Tomado por</th>
                <th>Observación</th>
                <th>Área funcional</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="cell-primary">{formatFechaHora(r.fecha, r.hora)}</span>
                    <span className="cell-sub">{formatRelative(r.fecha, r.hora)}</span>
                  </td>
                  {VITAL_PARAMS.map((p) => {
                    const status = getStatus(p.key, r[p.key], patientProfile);
                    return (
                      <td key={p.key}>
                        <span className="cell-primary">
                          {r[p.key] ?? '—'}
                          {r[p.key] != null && <span className="svt-cell-unit"> {p.unit}</span>}
                        </span>
                        {status.status === 'normal' && <span className="cell-sub svt-cell-normal">Normal</span>}
                        {(status.status === 'high' || status.status === 'low') && (
                          <span className="cell-sub svt-cell-status">
                            <VitalStatusTag status={status} />
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td>{r.tomadoPor}</td>
                  <td className={r.observacion ? undefined : 'cell-muted'}>{r.observacion ?? '—'}</td>
                  <td>{r.areaFuncional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'grafica' && (
        <div className="svt-grafica-wrap">
          <div className="svt-chart-grid">
            {VITAL_GROUPS.map((group) => (
              <VitalesChart key={group.key} readings={readings} group={group} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
