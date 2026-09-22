'use client';

import { useId, useState } from 'react';
import './DiagnosticosPanel.css';
import { LuSearch, LuStethoscope } from 'react-icons/lu';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CatalogoDiagnosticosModal from '@/Components/CatalogoDiagnosticosModal/CatalogoDiagnosticosModal';

const TIPO_DX_OPTIONS = [
  { value: 'presuntivo', label: 'Presuntivo' },
  { value: 'confirmado-nuevo', label: 'Confirmado nuevo' },
  { value: 'confirmado-repetido', label: 'Confirmado repetido' },
];

// Bloque "Diagnósticos" de la columna derecha de pih-body (encargo
// explícito). El campo CIE-10 lleva un botón de búsqueda que abre
// CatalogoDiagnosticosModal (encargo explícito: "el buscador del cie10
// debería abrir el modal de cie10 que ya tenemos diseñado" -- ese modal es
// app-wide, ver su comentario, nació en Programación de Sala de Cirugía y se
// promovió acá en vez de duplicar su catálogo). CIE-11/Tipo DX no llevan
// catálogo propio: CIE-11 queda como campo libre y Tipo DX es un FormSelect
// de opciones fijas.
export default function DiagnosticosPanel() {
  const [cie10, setCie10] = useState('');
  const [cie11, setCie11] = useState('');
  const [tipoDx, setTipoDx] = useState('');
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const cie10LabelId = useId();

  return (
    <div className="dxp-panel">
      <div className="dxp-title-row">
        <span className="dxp-title-icon"><LuStethoscope className="icon" aria-hidden="true" /></span>
        <h3 className="pih-section-title dxp-title">Diagnósticos</h3>
      </div>

      <div className="pih-fields">
        <div className="form-field">
          <label id={cie10LabelId}>CIE-10</label>
          {/* Texto plano + botón, no un input dentro de una caja (mismo
              patrón que .meta-item.picker-btn de AreaFuncionalPickerButton,
              encargo explícito) -- el nombre del diagnóstico se elige
              siempre desde CatalogoDiagnosticosModal, nunca se tipea a mano,
              así que no hace falta un campo editable: como texto envuelve
              solo con el ancho de la columna en vez de cortarse en una
              sola línea. */}
          <button
            type="button"
            className="dxp-diag-picker"
            aria-labelledby={cie10LabelId}
            onClick={() => setCatalogoAbierto(true)}
          >
            <span className={cie10 ? 'dxp-diag-value' : 'dxp-diag-placeholder'}>
              {cie10 || 'Selecciona un diagnóstico'}
            </span>
            <LuSearch className="icon" aria-hidden="true" />
          </button>
        </div>

        <div className="form-field">
          <label htmlFor="dxp-cie11">CIE-11</label>
          <input id="dxp-cie11" type="text" value={cie11} onChange={(e) => setCie11(e.target.value)} />
        </div>

        <div className="form-field">
          <label htmlFor="dxp-tipo">Tipo DX</label>
          <FormSelect
            id="dxp-tipo"
            value={tipoDx}
            onChange={setTipoDx}
            options={TIPO_DX_OPTIONS}
            placeholder="Selecciona una opción"
          />
        </div>
      </div>

      {catalogoAbierto && (
        <CatalogoDiagnosticosModal
          onSelect={setCie10}
          onClose={() => setCatalogoAbierto(false)}
        />
      )}
    </div>
  );
}
