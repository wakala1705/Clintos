'use client';

import { useState } from 'react';
import './ExportarCatalogoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuDownload } from 'react-icons/lu';

const OPCIONES = [
  { value: 'todos', label: 'Todos los catálogos' },
  { value: 'tipos-cama', label: 'Tipos de cama' },
  { value: 'estados-cama', label: 'Estados' },
  { value: 'motivos', label: 'Motivos' },
  { value: 'reglas-validacion', label: 'Reglas' },
  { value: 'parametros-generales', label: 'Parámetros' },
];

// Encargo, sección 17 — "Respetar sede, servicio y permisos": el export
// hereda los filtros de Sede/Servicio que el admin ya tiene aplicados en la
// pantalla (props sede/servicio), mostrados acá como contexto de solo
// lectura en vez de un selector propio duplicado.
export default function ExportarCatalogoModal({
  sede, servicio, sedeLabel, servicioLabel, onClose, onConfirm,
}) {
  const [seleccion, setSeleccion] = useState('todos');

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbc-exp-title">
        <ModalHeader icon={LuDownload} tone="primary" title="Exportar catálogos" titleId="cbc-exp-title" onClose={onClose} />
        <div className="modal-body">
          <fieldset className="cbc-exp-fieldset">
            <legend className="cbc-exp-legend">Selecciona qué deseas exportar</legend>
            {OPCIONES.map((o) => (
              <label className="cbc-exp-option" key={o.value}>
                <input type="radio" name="cbc-exp" value={o.value} checked={seleccion === o.value} onChange={() => setSeleccion(o.value)} />
                <span>{o.label}</span>
              </label>
            ))}
          </fieldset>

          <div className="cbc-exp-formato">
            <span>Formato</span>
            <b>Excel</b>
          </div>
          {(sede !== 'todas' || servicio !== 'todos') && (
            <div className="cbc-exp-formato cbc-exp-alcance">
              <span>Alcance</span>
              <b>{sede !== 'todas' ? sedeLabel : servicioLabel}</b>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary" onClick={() => onConfirm(seleccion)}>
            <LuDownload className="icon" aria-hidden="true" />Exportar
          </button>
        </div>
      </div>
    </div>
  );
}
