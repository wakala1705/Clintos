'use client';

import FormSelect from '@/Components/FormSelect/FormSelect';
import FactoresRiesgoField from '../FactoresRiesgoField/FactoresRiesgoField';
import KarnofskyField from '../KarnofskyField/KarnofskyField';

// Pinta una sección de EVAPRE recorriendo su lista de campos (ver
// evaluacionPreanestesicaCampos.js). `valores` es el estado de TODO el
// formulario, indexado por `key`; `onChange(key, value)` actualiza un campo.
// Reutiliza .pih-fields/.pih-section-title de PlantillaIngresoHospitalizacion:
// mismo contenedor (pila vertical, o grilla de 2 columnas con .pih-cols-2).
export default function SeccionCampos({ seccion, valores, onChange }) {
  return (
    <div>
      <h3 className="pih-section-title">{seccion.label}</h3>

      <div className="pih-fields">
        {seccion.campos.map((campo) => {
          const id = `evapre-${campo.key}`;
          const value = valores[campo.key];

          if (campo.type === 'checks') {
            return (
              <FactoresRiesgoField
                key={campo.key} id={id} label={campo.label}
                options={campo.options} value={value}
                onChange={(v) => onChange(campo.key, v)}
              />
            );
          }
          if (campo.type === 'karnofsky') {
            return (
              <KarnofskyField
                key={campo.key} id={id} label={campo.label}
                value={value} onChange={(v) => onChange(campo.key, v)}
              />
            );
          }

          return (
            <div className="form-field" key={campo.key}>
              <label htmlFor={id}>{campo.label}</label>
              {campo.type === 'select' ? (
                <FormSelect
                  id={id}
                  value={value}
                  onChange={(v) => onChange(campo.key, v)}
                  options={campo.options}
                  placeholder={campo.placeholder}
                />
              ) : campo.type === 'textarea' ? (
                <textarea
                  id={id}
                  rows={5}
                  placeholder={campo.placeholder}
                  value={value}
                  onChange={(e) => onChange(campo.key, e.target.value)}
                />
              ) : (
                <input
                  id={id}
                  type="text"
                  placeholder={campo.placeholder}
                  value={value}
                  onChange={(e) => onChange(campo.key, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
