'use client';

import { useState } from 'react';
import './SignosVitalesTab.css';
import { VITALES_READINGS } from '@/hooks/GestionEnfermeria/mockMonitoreo';
import { isVitalAbnormal } from '@/hooks/GestionEnfermeria/vitalAbnormality';
import ViewToggle from '@/Components/GestionEnfermeria/shared/ViewToggle/ViewToggle';
import Button from '@/Components/Button/Button';
import { LuList, LuChartLine, LuPlus } from 'react-icons/lu';
import DateRangeChips from './DateRangeChips/DateRangeChips';
import VitalesChart from './VitalesChart/VitalesChart';
import RegistrarSignosVitalesModal from '../modals/RegistrarSignosVitalesModal/RegistrarSignosVitalesModal';
import { VITAL_PARAMS } from './vitalParams';

const VIEW_OPTIONS = [
  { value: 'tabla', label: 'Tabla', icon: LuList },
  { value: 'grafica', label: 'Gráfica', icon: LuChartLine },
];

// patientProfile es un placeholder — AtencionEnfermeria.jsx todavía no pasa
// datos reales de paciente a sus tabs (ver su propio comentario sobre `id`
// sin conectar aún), así que isVitalAbnormal recibe un objeto vacío hasta
// que ese dato exista.
const patientProfile = {};

export default function SignosVitalesTab() {
  const [view, setView] = useState('tabla');
  // dateRange queda cableado a UI/estado pero no recorta `readings` — mismo
  // criterio y misma razón que el filtro "Rango" de HojaMedicamentosTab.jsx
  // (dataset mock fijo, sin rango de fechas real que filtrar todavía).
  const [dateRange, setDateRange] = useState({ mode: 'hoy', desde: null, hasta: null });
  const [activeParams, setActiveParams] = useState(['tas', 'pulso']);
  const [readings, setReadings] = useState(VITALES_READINGS);
  const [showModal, setShowModal] = useState(false);

  function toggleParam(key) {
    setActiveParams((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function handleConfirmRegistro(reading) {
    setReadings((prev) => [...prev, { id: `vt-${prev.length + 1}`, ...reading }]);
    setShowModal(false);
    window.ncToast?.('Signos vitales registrados.');
  }

  return (
    <div role="tabpanel" id="subpanel-signos-vitales" aria-labelledby="subtab-signos-vitales" tabIndex="0" className="sub-panel">
      <div className="filter-bar">
        <ViewToggle view={view} onChange={setView} options={VIEW_OPTIONS} />
        <DateRangeChips value={dateRange} onChange={setDateRange} />
        <div className="filter-spacer" />
        <Button variant="primary" icon={LuPlus} onClick={() => setShowModal(true)}>
          Registrar signos vitales
        </Button>
      </div>

      {view === 'tabla' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fe. Toma</th>
                <th>Hora Toma</th>
                {VITAL_PARAMS.map((p) => <th key={p.key}>{p.label}</th>)}
                <th>Tomado por</th>
                <th>Observación</th>
                <th>Área funcional</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id}>
                  <td>{r.fecha}</td>
                  <td>{r.hora}</td>
                  {VITAL_PARAMS.map((p) => (
                    <td key={p.key} className={isVitalAbnormal(p.key, r[p.key], patientProfile) ? 'svt-cell-alert' : undefined}>
                      {r[p.key]}
                    </td>
                  ))}
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
        <>
          <div className="chip-group svt-param-chips">
            {VITAL_PARAMS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`chip-filter${activeParams.includes(p.key) ? ' active' : ''}`}
                aria-pressed={activeParams.includes(p.key)}
                onClick={() => toggleParam(p.key)}
              >
                <span className="svt-chip-swatch" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>
          <VitalesChart readings={readings} activeParams={activeParams} />
        </>
      )}

      {showModal && (
        <RegistrarSignosVitalesModal
          registradoPor="Camilo Grondona"
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmRegistro}
        />
      )}
    </div>
  );
}
