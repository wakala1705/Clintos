'use client';

import './ValeEstructuralEtapa.css';
import { CONDICIONES_ESTRUCTURALES } from '../valeData';

const OPCIONES_PRESENCIA = [
  { value: 'si', label: 'Presente' },
  { value: 'no', label: 'Ausente' },
];
const OPCIONES_INTEGRIDAD = [
  { value: 'si', label: 'Íntegra' },
  { value: 'no', label: 'No íntegra' },
];

// Fila reutilizada dos veces por card (Presencia/Integridad) — función local,
// no componente propio: es puramente presentacional y exclusiva de esta
// etapa, mismo criterio que renderDetalle() en HistoriaClinicaTab.jsx.
function ToggleRow({ label, opciones, valor, onChange }) {
  return (
    <div className="vale-estr-row">
      <span className="vale-estr-row-label">{label}</span>
      <div className="pf-toggle-group">
        {opciones.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`pf-toggle-btn${valor === opt.value ? ' active' : ''}`}
            aria-pressed={valor === opt.value}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Etapa 2 de VALE — Condiciones estructurales. No bloquea el avance (lista
// de hallazgos anatómicos, no prueba de tamizaje). Se agrupan en cards
// escaneables por parte anatómica en vez de la cuadrícula compacta de
// dropdowns del formulario legacy (encargo explícito) — cada card conserva
// Presencia e Integridad, los mismos dos campos que ya existían.
export default function ValeEstructuralEtapa({ data, onChange }) {
  return (
    <div className="ac-wrap">
      <h1 className="pf-section-title">Condiciones estructurales</h1>
      <p className="pf-section-desc">
        Registra presencia e integridad de cada elemento anatómico evaluado.
      </p>

      <section className="pf-card">
        <div className="vale-estr-grid">
          {CONDICIONES_ESTRUCTURALES.map((c) => (
            <div className="vale-estr-card" key={c.key}>
              <h2 className="vale-estr-card-title">{c.label}</h2>
              <ToggleRow
                label="Presencia"
                opciones={OPCIONES_PRESENCIA}
                valor={data[c.key]?.presencia ?? null}
                onChange={(v) => onChange(c.key, { presencia: v })}
              />
              <ToggleRow
                label="Integridad"
                opciones={OPCIONES_INTEGRIDAD}
                valor={data[c.key]?.integridad ?? null}
                onChange={(v) => onChange(c.key, { integridad: v })}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
