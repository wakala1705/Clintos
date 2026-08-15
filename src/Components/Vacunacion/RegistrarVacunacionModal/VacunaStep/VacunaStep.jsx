'use client';

import { useState } from 'react';
import './VacunaStep.css';
import { LuCircleCheck, LuClock, LuPlus, LuShieldAlert, LuTriangleAlert } from 'react-icons/lu';
import { ESQUEMA_LABEL, MOTIVOS_FUERA_ESQUEMA, VACUNAS_CATALOGO } from '@/hooks/Vacunacion/mockVacunacionData';

function DosisBadge({ estado, diasAtraso }) {
  if (estado === 'proxima') return <span className="rv-dosis-badge proxima"><LuClock className="icon" aria-hidden="true" />Próxima</span>;
  if (estado === 'atrasada') return <span className="rv-dosis-badge atrasada"><LuTriangleAlert className="icon" aria-hidden="true" />Atrasada{diasAtraso ? ` · ${diasAtraso} días` : ''}</span>;
  if (estado === 'aplicada') return <span className="rv-dosis-badge aplicada"><LuCircleCheck className="icon" aria-hidden="true" />Aplicada</span>;
  return <span className="rv-dosis-badge pendiente">Pendiente</span>;
}

// Paso 2 del wizard "Registrar vacunación" — ver RegistrarVacunacionModal.jsx.
// `value`/`onChange` son controlados por el padre (misma fuente de verdad
// para los 5 pasos); el subview interno ('esquema' vs 'fuera-esquema') y el
// aviso de "dosis ya aplicada" son puramente de presentación, no afectan la
// selección real hasta que el usuario elige algo válido.
export default function VacunaStep({ paciente, value, onChange }) {
  const [subview, setSubview] = useState('esquema');
  const [intentoDuplicadoId, setIntentoDuplicadoId] = useState(null);

  const dosisPendientes = paciente.dosisPendientes || [];
  const sinEsquemaActivo = Boolean(paciente.sinEsquemaActivo);

  function handleElegirDosis(d) {
    if (d.estado === 'aplicada') {
      setIntentoDuplicadoId(d.id);
      return;
    }
    setIntentoDuplicadoId(null);
    onChange({ origen: 'esquema', dosis: d });
  }

  function handleFueraEsquemaChange(patch) {
    const base = value && value.origen === 'fuera-esquema' ? value : { origen: 'fuera-esquema', vacuna: '', motivo: '' };
    onChange({ ...base, ...patch });
  }

  return (
    <div className="rv-vacuna-step">
      <div className="rv-paciente-context">
        <span className="rv-paciente-context-name">{paciente.nombre} · {paciente.edadLabel}</span>
        <span className="rv-paciente-context-esquema">
          {sinEsquemaActivo ? 'Sin esquema activo' : `Esquema ${ESQUEMA_LABEL[paciente.esquema]?.toLowerCase()}`}
        </span>
      </div>

      {sinEsquemaActivo ? (
        <div className="rv-empty-state">
          <LuShieldAlert className="icon" aria-hidden="true" />
          <h4>Este paciente no tiene un esquema de vacunación activo.</h4>
          <div className="rv-empty-state-actions">
            <button type="button" className="btn btn-secondary" onClick={() => window.ncToast?.('Seleccionar esquema (en desarrollo).')}>
              Seleccionar esquema
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setSubview('fuera-esquema')}>
              Registrar vacuna fuera del esquema
            </button>
          </div>
        </div>
      ) : subview === 'fuera-esquema' ? (
        <div className="rv-fuera-esquema">
          <button type="button" className="rv-back-link" onClick={() => setSubview('esquema')}>← Volver a vacunas pendientes</button>

          <div className="rv-field">
            <label htmlFor="rv-fe-vacuna">Vacuna</label>
            <select
              id="rv-fe-vacuna"
              value={value?.origen === 'fuera-esquema' ? value.vacuna : ''}
              onChange={(e) => handleFueraEsquemaChange({ vacuna: e.target.value })}
            >
              <option value="">Selecciona una vacuna</option>
              {VACUNAS_CATALOGO.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="rv-field">
            <label htmlFor="rv-fe-motivo">Motivo</label>
            <select
              id="rv-fe-motivo"
              value={value?.origen === 'fuera-esquema' ? value.motivo : ''}
              onChange={(e) => handleFueraEsquemaChange({ motivo: e.target.value })}
            >
              <option value="">Selecciona un motivo</option>
              {MOTIVOS_FUERA_ESQUEMA.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>
      ) : dosisPendientes.length === 0 ? (
        <div className="rv-empty-state">
          <LuCircleCheck className="icon" aria-hidden="true" />
          <h4>Esquema completo</h4>
          <p>Este paciente no tiene dosis pendientes en su esquema.</p>
          <div className="rv-empty-state-actions">
            <button type="button" className="btn btn-primary" onClick={() => setSubview('fuera-esquema')}>
              <LuPlus className="icon" aria-hidden="true" />
              Registrar vacuna fuera del esquema
            </button>
          </div>
        </div>
      ) : (
        <>
          <h4 className="rv-section-title">Vacunas pendientes</h4>
          <div className="rv-dosis-list">
            {dosisPendientes.map((d) => {
              const selected = value?.origen === 'esquema' && value.dosis.id === d.id;
              const disabled = d.estado === 'aplicada';
              return (
                <div key={d.id}>
                  <button
                    type="button"
                    className={`rv-dosis-card${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
                    onClick={() => handleElegirDosis(d)}
                    role="radio"
                    aria-checked={selected}
                  >
                    <span className="rv-dosis-radio" aria-hidden="true" />
                    <span className="rv-dosis-info">
                      <span className="rv-dosis-nombre">{d.vacuna}</span>
                      <span className="rv-dosis-meta">{d.dosis} · Programada para {d.fechaProgramadaLabel}</span>
                    </span>
                    <DosisBadge estado={d.estado} diasAtraso={d.diasAtraso} />
                  </button>

                  {selected && (
                    <div className="rv-dosis-detalle">
                      <span><strong>Última dosis:</strong> {d.ultimaDosisLabel || 'Sin registro previo'}</span>
                      <span><strong>Estado:</strong> {d.estado === 'atrasada' ? `Atrasada${d.diasAtraso ? ` · ${d.diasAtraso} días` : ''}` : d.estado === 'proxima' ? 'Próxima' : 'Pendiente'}</span>
                    </div>
                  )}

                  {intentoDuplicadoId === d.id && (
                    <div className="rv-alert">
                      <LuTriangleAlert className="icon" aria-hidden="true" />
                      <span>Esta dosis ya fue aplicada el {d.fechaProgramadaLabel}. No es posible registrarla nuevamente.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button type="button" className="rv-fuera-esquema-link" onClick={() => setSubview('fuera-esquema')}>
            <LuPlus className="icon" aria-hidden="true" />
            Registrar vacuna fuera del esquema
          </button>
        </>
      )}
    </div>
  );
}
