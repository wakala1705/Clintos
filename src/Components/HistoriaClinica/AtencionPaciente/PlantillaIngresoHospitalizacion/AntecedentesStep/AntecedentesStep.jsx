'use client';

import { useState } from 'react';
import FormSelect from '@/Components/FormSelect/FormSelect';

// Transcrito de "ANTECEDENTES PATOLOGICOS"/"ANTECEDENTES PERSONALES" de la
// captura del sistema legado (INGHOSP): 7 pares booleano (Sí/No) +
// observaciones, más "Antecedentes familiares" (sin observaciones — el
// legado no trae ese campo para él, ver mockHistoriaClinicaRecords.js) y los
// campos sueltos de cierre de la sección (gineco-obstétricos, urológicos,
// social/económico). Las 4 secciones de la plantilla son un solo formulario
// continuo (encargo explícito, ver PlantillaIngresoHospitalizacion.jsx) —
// este Step ya no se oculta con `hidden`, el nav lateral hace scroll hasta
// acá en vez de mostrar/ocultar.
const SI_NO_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
];

const CAMPOS_BOOLEANOS = [
  { key: 'toxicos', label: 'Tóxicos', conObservaciones: true },
  { key: 'patologicos', label: 'Patológicos', conObservaciones: true },
  { key: 'oncologicos', label: 'Oncológicos', conObservaciones: true },
  { key: 'quirurgicos', label: 'Quirúrgicos', conObservaciones: true },
  { key: 'farmacologicos', label: 'Farmacológicos', conObservaciones: true },
  { key: 'transfusionales', label: 'Transfusionales', conObservaciones: true },
  { key: 'alergicos', label: 'Alérgicos', conObservaciones: true },
  { key: 'familiares', label: 'Antecedentes familiares' },
];

function estadoInicialBooleanos() {
  return Object.fromEntries(CAMPOS_BOOLEANOS.map((c) => [c.key, { valor: '', observaciones: '' }]));
}

export default function AntecedentesStep() {
  const [booleanos, setBooleanos] = useState(estadoInicialBooleanos);
  const [ginecoObstetricos, setGinecoObstetricos] = useState('');
  const [menarquia, setMenarquia] = useState('');
  const [fum, setFum] = useState('');
  const [ciclos, setCiclos] = useState('');
  const [urologicos, setUrologicos] = useState('');
  const [antecedentesSocialEconomico, setAntecedentesSocialEconomico] = useState('');

  function updateBooleano(key, campo, value) {
    setBooleanos((prev) => ({ ...prev, [key]: { ...prev[key], [campo]: value } }));
  }

  return (
    <div>
      <h3 className="pih-section-title">Antecedentes</h3>
      <p className="pih-section-desc">Antecedentes personales, gineco-obstétricos y social/económicos del paciente.</p>

      <div className="pih-fields">
        {CAMPOS_BOOLEANOS.map((campo) => (
          <div className="pih-campo-grupo" key={campo.key}>
            <div className="form-field">
              <label htmlFor={`ah-${campo.key}`}>{campo.label}</label>
              <FormSelect
                id={`ah-${campo.key}`}
                value={booleanos[campo.key].valor}
                onChange={(v) => updateBooleano(campo.key, 'valor', v)}
                options={SI_NO_OPTIONS}
                placeholder="Selecciona una opción"
              />
            </div>
            {campo.conObservaciones && (
              <div className="form-field">
                <label htmlFor={`ah-${campo.key}-obs`}>Observaciones {campo.label.toLowerCase()}</label>
                <textarea
                  id={`ah-${campo.key}-obs`}
                  rows={3}
                  value={booleanos[campo.key].observaciones}
                  onChange={(e) => updateBooleano(campo.key, 'observaciones', e.target.value)}
                />
              </div>
            )}
          </div>
        ))}

        <div className="form-field">
          <label htmlFor="ah-gineco-obstetricos">Gineco-obstétricos</label>
          <textarea
            id="ah-gineco-obstetricos"
            rows={3}
            placeholder="G: P: A: C: V: M:"
            value={ginecoObstetricos}
            onChange={(e) => setGinecoObstetricos(e.target.value)}
          />
        </div>

        <div className="pih-grid-3">
          <div className="form-field">
            <label htmlFor="ah-menarquia">Menarquia</label>
            <input id="ah-menarquia" type="text" value={menarquia} onChange={(e) => setMenarquia(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="ah-fum">FUM</label>
            <input id="ah-fum" type="text" placeholder="DD/MM/AAAA" value={fum} onChange={(e) => setFum(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="ah-ciclos">Ciclos</label>
            <input id="ah-ciclos" type="text" value={ciclos} onChange={(e) => setCiclos(e.target.value)} />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="ah-urologicos">Urológicos / Observaciones genitourinarias</label>
          <textarea
            id="ah-urologicos"
            rows={3}
            value={urologicos}
            onChange={(e) => setUrologicos(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="ah-social-economico">Antecedentes social / económico</label>
          <textarea
            id="ah-social-economico"
            rows={3}
            value={antecedentesSocialEconomico}
            onChange={(e) => setAntecedentesSocialEconomico(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
