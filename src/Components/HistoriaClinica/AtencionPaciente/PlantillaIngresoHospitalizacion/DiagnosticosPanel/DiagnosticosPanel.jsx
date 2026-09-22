'use client';

import { useId, useState } from 'react';
import './DiagnosticosPanel.css';
import { LuPlus, LuSearch, LuStethoscope } from 'react-icons/lu';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import CatalogoDiagnosticosModal from '@/Components/CatalogoDiagnosticosModal/CatalogoDiagnosticosModal';

const TIPO_DX_OPTIONS = [
  { value: 'presuntivo', label: 'Presuntivo' },
  { value: 'confirmado-nuevo', label: 'Confirmado nuevo' },
  { value: 'confirmado-repetido', label: 'Confirmado repetido' },
];

// Bloque "Diagnósticos" de la columna derecha de pih-body (encargo
// explícito). CIE-10/CIE-11 son los dos selectpicker con el mismo criterio
// de búsqueda (encargo explícito): texto plano + ícono de lupa + placeholder
// (mismo patrón que .meta-item.picker-btn de AreaFuncionalPickerButton, no
// un input dentro de una caja), y ambos abren CatalogoDiagnosticosModal (el
// único catálogo de diagnósticos del proyecto -- ese modal es app-wide, ver
// su comentario, nació en Programación de Sala de Cirugía y se promovió acá
// en vez de duplicar su catálogo; no existe todavía un catálogo CIE-11
// separado, así que por ahora ambos campos buscan sobre el mismo). Cada uno
// abre su propia instancia del modal (`catalogoAbierto` por campo) para que
// "Confirmar" escriba en el estado correcto sin acoplar ambos pickers.
// CIE-10/CIE-11 son obligatorios (encargo explícito, ver `.req`); Tipo DX es
// un FormSelect de opciones fijas.
export default function DiagnosticosPanel() {
  const [cie10, setCie10] = useState('');
  const [cie11, setCie11] = useState('');
  const [tipoDx, setTipoDx] = useState('');
  const [catalogoCie10Abierto, setCatalogoCie10Abierto] = useState(false);
  const [catalogoCie11Abierto, setCatalogoCie11Abierto] = useState(false);
  const cie10LabelId = useId();
  const cie11LabelId = useId();

  return (
    <div className="dxp-panel">
      <div className="dxp-title-row">
        <span className="dxp-title-icon"><LuStethoscope className="icon" aria-hidden="true" /></span>
        <h3 className="pih-section-title dxp-title">Diagnósticos</h3>
      </div>

      <div className="pih-fields">
        <div className="form-field">
          <label id={cie10LabelId}>CIE-10<span className="req">*</span></label>
          <button
            type="button"
            className="dxp-diag-picker"
            aria-labelledby={cie10LabelId}
            onClick={() => setCatalogoCie10Abierto(true)}
          >
            <span className={cie10 ? 'dxp-diag-value' : 'dxp-diag-placeholder'}>
              {cie10 || 'Selecciona un diagnóstico'}
            </span>
            <LuSearch className="icon" aria-hidden="true" />
          </button>
        </div>

        <div className="form-field">
          <label id={cie11LabelId}>CIE-11<span className="req">*</span></label>
          <button
            type="button"
            className="dxp-diag-picker"
            aria-labelledby={cie11LabelId}
            onClick={() => setCatalogoCie11Abierto(true)}
          >
            <span className={cie11 ? 'dxp-diag-value' : 'dxp-diag-placeholder'}>
              {cie11 || 'Selecciona un diagnóstico'}
            </span>
            <LuSearch className="icon" aria-hidden="true" />
          </button>
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

        {/* Solo el botón por ahora (encargo explícito) -- agregar la fila de
            diagnóstico relacionado que dispara es un paso aparte, todavía no
            pedido. */}
        <Button type="button" variant="secondary-accent" size="sm" icon={LuPlus} className="dxp-add-relacionado">
          Agregar diagnóstico relacionado
        </Button>
      </div>

      {catalogoCie10Abierto && (
        <CatalogoDiagnosticosModal
          onSelect={setCie10}
          onClose={() => setCatalogoCie10Abierto(false)}
        />
      )}
      {catalogoCie11Abierto && (
        <CatalogoDiagnosticosModal
          onSelect={setCie11}
          onClose={() => setCatalogoCie11Abierto(false)}
        />
      )}
    </div>
  );
}
