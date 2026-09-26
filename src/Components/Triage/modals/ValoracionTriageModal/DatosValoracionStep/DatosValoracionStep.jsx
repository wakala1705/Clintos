import { LuActivity, LuCircleHelp, LuUserRound } from 'react-icons/lu';
import './DatosValoracionStep.css';
import { CONDICIONES_ESPECIALES, SIGNOS_VITALES } from '@/hooks/Triage/triageData';

// Paso 2 de la valoración (se llega eligiendo "Ninguno de los anteriores"):
// motivo de consulta, condición especial del usuario y signos vitales.
// Formulario controlado: el estado (`datos`) vive en ValoracionTriageModal
// para no perderse al ir y volver entre pasos.
//
// Signos vitales: <input type="text" inputMode> en vez de type="number" (sin
// flechas de incremento, que no tienen sentido para una toma clínica);
// `limpiarNumero` deja solo dígitos, y un punto en los campos `decimal`.
function limpiarNumero(valor, decimal) {
  const limpio = valor.replace(decimal ? /[^\d.]/g : /\D/g, '');
  if (!decimal) return limpio;
  const [entero, ...resto] = limpio.split('.');
  return resto.length ? `${entero}.${resto.join('')}` : entero;
}

export default function DatosValoracionStep({ datos, onChange }) {
  function setCampo(campo, valor) {
    onChange({ ...datos, [campo]: valor });
  }
  function setSigno(key, valor) {
    onChange({ ...datos, signos: { ...datos.signos, [key]: valor } });
  }

  return (
    <div className="tg-dv">
      <section className="tg-dv-section">
        <label htmlFor="tg-dv-motivo" className="tg-dv-section-title">
          <LuCircleHelp className="icon" aria-hidden="true" />
          Motivo de consulta
        </label>
        <textarea
          id="tg-dv-motivo"
          className="tg-dv-textarea"
          rows={3}
          placeholder="Describe brevemente el motivo de consulta."
          value={datos.motivo}
          onChange={(e) => setCampo('motivo', e.target.value)}
        />
      </section>

      <fieldset className="tg-dv-section">
        <legend className="tg-dv-section-title">
          <LuUserRound className="icon" aria-hidden="true" />
          Condiciones especiales del usuario
        </legend>
        <div className="tg-dv-condiciones">
          {CONDICIONES_ESPECIALES.map((c) => {
            const checked = datos.condicion === c.value;
            return (
              <label key={c.value} className={`tg-dv-condicion${checked ? ' selected' : ''}`}>
                <span>{c.label}</span>
                <input
                  type="radio"
                  name="tg-dv-condicion"
                  value={c.value}
                  checked={checked}
                  onChange={() => setCampo('condicion', c.value)}
                />
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="tg-dv-section">
        <legend className="tg-dv-section-title">
          <LuActivity className="icon" aria-hidden="true" />
          Signos vitales
        </legend>
        {SIGNOS_VITALES.map((fila, i) => (
          <div key={i} className={`tg-dv-signos cols-${fila.length}`}>
            {fila.map((s) => (
              <div key={s.key} className="tg-dv-signo">
                <label htmlFor={`tg-dv-${s.key}`} className="tg-dv-label" title={s.title}>{s.label}</label>
                <div className="tg-dv-input-unidad">
                  <input
                    id={`tg-dv-${s.key}`}
                    type="text"
                    inputMode={s.decimal ? 'decimal' : 'numeric'}
                    autoComplete="off"
                    value={datos.signos[s.key] ?? ''}
                    onChange={(e) => setSigno(s.key, limpiarNumero(e.target.value, s.decimal))}
                    aria-describedby={`tg-dv-${s.key}-unidad`}
                  />
                  <span id={`tg-dv-${s.key}-unidad`} className="tg-dv-unidad">{s.unidad}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </fieldset>
    </div>
  );
}
