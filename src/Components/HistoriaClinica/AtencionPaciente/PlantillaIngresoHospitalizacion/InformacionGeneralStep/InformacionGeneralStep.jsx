'use client';

import { useState } from 'react';
import FormSelect from '@/Components/FormSelect/FormSelect';

// Transcrito de la sección "ANAMNESIS" de la captura del sistema legado
// (INGHOSP) — motivo/enfermedad/revisión por sistema quedan como campos
// libres (el legado los trae con texto de plantilla sin diligenciar, ver
// mockHistoriaClinicaRecords.js) y Reingreso como Sí/No. Las 4 secciones de
// la plantilla son un solo formulario continuo (encargo explícito, ver
// PlantillaIngresoHospitalizacion.jsx) — este Step ya no se oculta con
// `hidden`, el nav lateral hace scroll hasta acá en vez de mostrar/ocultar.
const SI_NO_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
];

export default function InformacionGeneralStep() {
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [enfermedadActual, setEnfermedadActual] = useState('');
  const [revisionPorSistema, setRevisionPorSistema] = useState('');
  const [reingreso, setReingreso] = useState('');

  return (
    <div>
      <h3 className="pih-section-title">Información general</h3>
      <p className="pih-section-desc">Motivo de la consulta, enfermedad actual y revisión por sistema del ingreso.</p>

      <div className="pih-fields">
        <div className="form-field">
          <label htmlFor="ig-motivo-consulta">Motivo de consulta</label>
          <textarea
            id="ig-motivo-consulta"
            rows={4}
            value={motivoConsulta}
            onChange={(e) => setMotivoConsulta(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="ig-enfermedad-actual">Enfermedad actual</label>
          <textarea
            id="ig-enfermedad-actual"
            rows={4}
            value={enfermedadActual}
            onChange={(e) => setEnfermedadActual(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="ig-revision-sistema">Revisión por sistema</label>
          <textarea
            id="ig-revision-sistema"
            rows={4}
            value={revisionPorSistema}
            onChange={(e) => setRevisionPorSistema(e.target.value)}
          />
        </div>

        <div className="form-field" style={{ maxWidth: 280 }}>
          <label htmlFor="ig-reingreso">Reingreso</label>
          <FormSelect
            id="ig-reingreso"
            value={reingreso}
            onChange={setReingreso}
            options={SI_NO_OPTIONS}
            placeholder="Selecciona una opción"
          />
        </div>
      </div>
    </div>
  );
}
