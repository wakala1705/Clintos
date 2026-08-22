'use client';

import { useState } from 'react';
import './DuplicarConfigModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { SEDES } from '@/hooks/GestionCamas/mockConfiguracionData';
import { LuArrowRight, LuCopy, LuTriangleAlert } from 'react-icons/lu';

const SEDES_DESTINO = SEDES.filter((s) => s.value !== 'todas');

const ELEMENTOS = [
  { id: 'tipos-cama', label: 'Tipos de cama', default: true },
  { id: 'estados-cama', label: 'Estados', default: true },
  { id: 'motivos', label: 'Motivos', default: true },
  { id: 'parametros-generales', label: 'Parámetros', default: true },
  { id: 'reglas-validacion', label: 'Reglas de validación', default: false },
];

// Encargo, sección 19 — "Reglas de validación" arranca sin marcar (copiar
// reglas entre sedes es la operación de mayor impacto de las 5 categorías,
// por eso no viene por defecto) y el modal siempre explicita qué se
// reemplaza antes de confirmar (sección 19: "mostrar claramente qué
// elementos serán reemplazados o agregados").
export default function DuplicarConfigModal({ onClose, onConfirm }) {
  const [desde, setDesde] = useState(SEDES_DESTINO[0].value);
  const [hacia, setHacia] = useState(SEDES_DESTINO[1]?.value ?? SEDES_DESTINO[0].value);
  const [seleccion, setSeleccion] = useState(
    Object.fromEntries(ELEMENTOS.map((e) => [e.id, e.default])),
  );

  function toggleElemento(id) {
    setSeleccion((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const mismaSede = desde === hacia;
  const elegidos = ELEMENTOS.filter((e) => seleccion[e.id]);
  const puedeConfirmar = !mismaSede && elegidos.length > 0;

  return (
    <div className="modal-overlay open">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="cbc-dup-title">
        <ModalHeader icon={LuCopy} tone="primary" title="Duplicar configuración" titleId="cbc-dup-title" onClose={onClose} />
        <div className="modal-body">
          <div className="cbc-dup-sedes">
            <div className="form-field">
              <label htmlFor="cbc-dup-desde">Desde</label>
              <select id="cbc-dup-desde" value={desde} onChange={(e) => setDesde(e.target.value)}>
                {SEDES_DESTINO.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <LuArrowRight className="icon" aria-hidden="true" />
            <div className="form-field">
              <label htmlFor="cbc-dup-hacia">Hacia</label>
              <select id="cbc-dup-hacia" value={hacia} onChange={(e) => setHacia(e.target.value)}>
                {SEDES_DESTINO.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {mismaSede && <p className="cbc-dup-error">La sede de destino debe ser distinta a la sede de origen.</p>}

          <fieldset className="cbc-dup-fieldset">
            <legend className="cbc-dup-legend">Seleccionar</legend>
            {ELEMENTOS.map((e) => (
              <label className="cbc-dup-option" key={e.id}>
                <input type="checkbox" checked={seleccion[e.id]} onChange={() => toggleElemento(e.id)} />
                <span>{e.label}</span>
              </label>
            ))}
          </fieldset>

          <div className="cbc-dup-nota">
            <LuTriangleAlert className="icon" aria-hidden="true" />
            {elegidos.length > 0
              ? `${elegidos.map((e) => e.label).join(', ')} de ${sedeLabelSafe(hacia)} se reemplazarán por la configuración de ${sedeLabelSafe(desde)}.`
              : 'Selecciona al menos una categoría para duplicar.'}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!puedeConfirmar}
            onClick={() => onConfirm({ desde, hacia, elementos: elegidos.map((e) => e.id) })}
          >
            Duplicar configuración
          </button>
        </div>
      </div>
    </div>
  );
}

function sedeLabelSafe(value) {
  return SEDES_DESTINO.find((s) => s.value === value)?.label ?? value;
}
