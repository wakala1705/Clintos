'use client';

import { useState } from 'react';
import '../PlantillaIngresoHospitalizacion/shared/shared.css';
import '../PlantillaIngresoHospitalizacion/PlantillaIngresoHospitalizacion.css';
import './PlantillaInformeQuirurgico.css';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import ViewSettingsMenu from '../PlantillaIngresoHospitalizacion/ViewSettingsMenu/ViewSettingsMenu';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { LuArrowLeft, LuMaximize2, LuMinimize2 } from 'react-icons/lu';

const SI_NO = [{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }];

// Informe quirúrgico (nota operatoria) de una cirugía ya finalizada, abierto
// desde HC de Cirugía (/cirugia/historia-clinica/[id], ver AtencionPaciente.jsx).
// Reutiliza el titlebar/body/footer de PlantillaIngresoHospitalizacion (.pih-*)
// pero con un formulario simple de una sola columna. Parte de los datos de la
// cirugía (procedimiento, diagnóstico) y exige hallazgos y descripción.
// `registro` (opcional): informe ya guardado que se reabre desde "Editar".
export default function PlantillaInformeQuirurgico({
  cirugia, registro, onSalir, onGuardar, maximizada, onToggleMaximizar,
}) {
  const [valores, setValores] = useState(() => ({
    procedimientoRealizado: cirugia.procedimientoPrincipal,
    diagnosticoPreoperatorio: cirugia.dxIngreso ?? '',
    diagnosticoPosoperatorio: cirugia.dxIngreso ?? '',
    hallazgos: '',
    descripcion: '',
    complicaciones: 'Ninguna',
    sangrado: '',
    conteoCompleto: 'si',
    muestrasPatologia: 'no',
    planPosoperatorio: '',
    ...registro?.contenido,
  }));
  const [intento, setIntento] = useState(false);
  const [columnLayout, setColumnLayout] = useState('dos-columnas');

  const set = (key) => (e) => setValores((v) => ({ ...v, [key]: e.target.value }));
  const setSelect = (key) => (value) => setValores((v) => ({ ...v, [key]: value }));
  const faltaHallazgos = valores.hallazgos.trim() === '';
  const faltaDescripcion = valores.descripcion.trim() === '';

  function handleGuardar() {
    if (faltaHallazgos || faltaDescripcion) { setIntento(true); return; }
    onGuardar(valores);
  }

  return (
    <>
      <div className="pih-titlebar">
        <button type="button" className="pih-titlebar-icon-btn" onClick={onSalir} aria-label="Salir de la plantilla">
          <LuArrowLeft className="icon" aria-hidden="true" />
        </button>
        <div className="pih-titlebar-info">
          <span className="pih-titlebar-label">PLANTILLA:</span>
          <span className="pih-titlebar-title">Informe quirúrgico</span>
          {registro ? (
            <Badge tone="neutral">Registro N° {registro.numero}</Badge>
          ) : (
            <Badge tone="success">Nuevo registro</Badge>
          )}
        </div>
        <div className="pih-titlebar-actions">
          <ViewSettingsMenu columnLayout={columnLayout} onColumnLayoutChange={setColumnLayout} />
          <button
            type="button"
            className="pih-titlebar-icon-btn"
            onClick={onToggleMaximizar}
            aria-label={maximizada ? 'Restaurar pantalla' : 'Expandir pantalla'}
            title={maximizada ? 'Restaurar pantalla' : 'Expandir pantalla'}
          >
            {maximizada ? <LuMinimize2 className="icon" aria-hidden="true" /> : <LuMaximize2 className="icon" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="pih-body">
        <form className={`pih-content${columnLayout === 'dos-columnas' ? ' pih-cols-2' : ''}`} onSubmit={(e) => e.preventDefault()}>
          <div className="pih-section-block">
            <h3 className="pih-section-title">Procedimiento</h3>
            <div className="pih-fields">
              <div className="form-field">
                <label htmlFor="iq-procedimiento">Procedimiento realizado</label>
                <input id="iq-procedimiento" type="text" value={valores.procedimientoRealizado} onChange={set('procedimientoRealizado')} />
              </div>
              <div className="form-field">
                <label htmlFor="iq-dx-pre">Diagnóstico preoperatorio</label>
                <input id="iq-dx-pre" type="text" value={valores.diagnosticoPreoperatorio} onChange={set('diagnosticoPreoperatorio')} />
              </div>
              <div className="form-field">
                <label htmlFor="iq-dx-pos">Diagnóstico posoperatorio</label>
                <input id="iq-dx-pos" type="text" value={valores.diagnosticoPosoperatorio} onChange={set('diagnosticoPosoperatorio')} />
              </div>
              <div className="form-field">
                <label htmlFor="iq-hallazgos">Hallazgos<span className="req">*</span></label>
                <textarea id="iq-hallazgos" rows={4} value={valores.hallazgos} onChange={set('hallazgos')} aria-invalid={intento && faltaHallazgos} />
                {intento && faltaHallazgos && <span className="iq-error" role="alert">Describe los hallazgos operatorios.</span>}
              </div>
              <div className="form-field">
                <label htmlFor="iq-descripcion">Descripción de la técnica<span className="req">*</span></label>
                <textarea id="iq-descripcion" rows={6} value={valores.descripcion} onChange={set('descripcion')} aria-invalid={intento && faltaDescripcion} />
                {intento && faltaDescripcion && <span className="iq-error" role="alert">Describe la técnica quirúrgica.</span>}
              </div>
            </div>
          </div>

          <div className="pih-section-block">
            <h3 className="pih-section-title">Cierre y posoperatorio</h3>
            <div className="pih-fields">
              <div className="form-field">
                <label htmlFor="iq-complicaciones">Complicaciones</label>
                <input id="iq-complicaciones" type="text" value={valores.complicaciones} onChange={set('complicaciones')} />
              </div>
              <div className="form-field">
                <label htmlFor="iq-sangrado">Sangrado estimado (mL)</label>
                <input id="iq-sangrado" type="text" inputMode="numeric" value={valores.sangrado} onChange={set('sangrado')} />
              </div>
              <div className="form-field">
                <label htmlFor="iq-conteo">Conteo de gasas e instrumental completo</label>
                <FormSelect id="iq-conteo" value={valores.conteoCompleto} onChange={setSelect('conteoCompleto')} options={SI_NO} />
              </div>
              <div className="form-field">
                <label htmlFor="iq-patologia">Muestras a patología</label>
                <FormSelect id="iq-patologia" value={valores.muestrasPatologia} onChange={setSelect('muestrasPatologia')} options={SI_NO} />
              </div>
              <div className="form-field">
                <label htmlFor="iq-plan">Plan posoperatorio</label>
                <textarea id="iq-plan" rows={4} value={valores.planPosoperatorio} onChange={set('planPosoperatorio')} />
              </div>
            </div>
          </div>

          <div className="pih-footer">
            <Button type="button" variant="secondary" onClick={onSalir}>Cancelar</Button>
            <Button type="button" variant="primary" onClick={handleGuardar}>Guardar y salir</Button>
          </div>
        </form>
      </div>
    </>
  );
}
