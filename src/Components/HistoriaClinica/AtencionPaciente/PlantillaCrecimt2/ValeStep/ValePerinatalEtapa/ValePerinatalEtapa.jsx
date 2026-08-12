'use client';

import './ValePerinatalEtapa.css';
import TriStateField from '../../TriStateField/TriStateField';
import { PERINATAL_MENOR_2_ANIOS, PERINATAL_TODAS_EDADES } from '../valeData';

const SI_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
];

// Etapa 1 de VALE — Condiciones perinatales y postnatales. No bloquea el
// avance (mismo criterio no-bloqueante que RiesgoStep/FactoresRiesgoStep):
// es una lista de factores de riesgo, no una prueba de tamizaje. Reutiliza
// TriStateField directamente para Sí/No + "Describa" en progressive
// disclosure — mismo componente que AntecedentesStep ya usa para el mismo
// patrón, no se reconstruye.
//
// Sin campo de edad: el único condicional de edad de todo VALE vive en
// "Comprensión, expresión e interacción" (ver ValeDesarrolloEtapa.jsx, chips
// de RANGOS_CEI) — acá los dos grupos quedan siempre visibles, y es el
// propio profesional quien diligencia "Menores de 2 años" solo cuando
// aplica (ver su descripción debajo del título).
export default function ValePerinatalEtapa({ data, onChange }) {
  return (
    <div className="ac-wrap">
      <h1 className="pf-section-title">Condiciones perinatales y postnatales</h1>
      <p className="pf-section-desc">
        Registra los antecedentes perinatales y postnatales relevantes para la valoración del desarrollo.
      </p>

      <section className="pf-card">
        <div className="pf-group">
          <h2 className="pf-card-title">Menores de 2 años</h2>
          <p className="pf-card-desc">Diligenciar únicamente si el paciente es menor de 2 años.</p>
          <div className="pf-grid-4">
            {PERINATAL_MENOR_2_ANIOS.map((c) => (
              <TriStateField
                key={c.key}
                label={c.label}
                options={SI_NO}
                value={data[c.key]?.valor ?? null}
                onChange={(v) => onChange(c.key, { valor: v })}
                showDescription={data[c.key]?.valor === 'si'}
                descriptionValue={data[c.key]?.descripcion ?? ''}
                onDescriptionChange={(v) => onChange(c.key, { descripcion: v })}
                descriptionPlaceholder={`Describe brevemente: ${c.label.toLowerCase()}`}
              />
            ))}
          </div>
        </div>

        <div className="pf-group">
          <h2 className="pf-card-title">Todas las edades</h2>
          <div className="pf-grid-4">
            {PERINATAL_TODAS_EDADES.map((c) => (
              <TriStateField
                key={c.key}
                label={c.label}
                options={SI_NO}
                value={data[c.key]?.valor ?? null}
                onChange={(v) => onChange(c.key, { valor: v })}
                showDescription={data[c.key]?.valor === 'si'}
                descriptionValue={data[c.key]?.descripcion ?? ''}
                onDescriptionChange={(v) => onChange(c.key, { descripcion: v })}
                descriptionPlaceholder={`Describe brevemente: ${c.label.toLowerCase()}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
