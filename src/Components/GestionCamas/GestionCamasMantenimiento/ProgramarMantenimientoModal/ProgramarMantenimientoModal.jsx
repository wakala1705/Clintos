'use client';

import { useState } from 'react';
import './ProgramarMantenimientoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREAS, PRIORIDADES, SEDES, TIPOS,
} from '@/hooks/GestionCamas/mockMantenimientoData';
import { LuWrench } from 'react-icons/lu';

const SEDE_OPTIONS = SEDES.filter((s) => s.value !== 'todas');
const AREA_OPTIONS = AREAS.filter((a) => a.value !== 'todas');
const TIPO_OPTIONS = TIPOS.filter((t) => t.value !== 'todos');
const PRIORIDAD_OPTIONS = PRIORIDADES.filter((p) => p.value !== 'todas');

const CAMPOS_INICIALES = {
  cama: '', sede: '', area: '', tipo: '', prioridad: '', fecha: '', hora: '', responsable: '', descripcion: '',
};

// "+ Programar mantenimiento" — único CTA primario del header (encargo
// sección 3). Nace siempre en estado `programado` — mismo criterio que
// NuevaReservaModal.jsx (un registro recién creado no arranca en otro
// estado).
export default function ProgramarMantenimientoModal({ onClose, onSubmit }) {
  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [errores, setErrores] = useState({});

  function setCampo(key, value) {
    setCampos((prev) => ({ ...prev, [key]: value }));
  }

  function validar() {
    const nuevos = {};
    if (!campos.cama.trim()) nuevos.cama = 'La cama es obligatoria.';
    if (!campos.sede) nuevos.sede = 'Selecciona una sede.';
    if (!campos.area) nuevos.area = 'Selecciona un área.';
    if (!campos.tipo) nuevos.tipo = 'Selecciona un tipo de mantenimiento.';
    if (!campos.prioridad) nuevos.prioridad = 'Selecciona una prioridad.';
    if (!campos.fecha || !campos.hora) nuevos.fecha = 'La fecha y hora programada son obligatorias.';
    if (!campos.responsable.trim()) nuevos.responsable = 'El responsable es obligatorio.';
    if (!campos.descripcion.trim()) nuevos.descripcion = 'La descripción es obligatoria.';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    const [anio, mes, dia] = campos.fecha.split('-').map(Number);
    const [hora, minuto] = campos.hora.split(':').map(Number);
    onSubmit({
      cama: campos.cama.trim(),
      sede: campos.sede,
      area: campos.area,
      tipo: campos.tipo,
      prioridad: campos.prioridad,
      fechaProgramada: new Date(anio, mes - 1, dia, hora, minuto).getTime(),
      responsable: campos.responsable.trim(),
      descripcion: campos.descripcion.trim(),
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cbm-form-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-form-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuWrench}
            tone="primary"
            title="Programar mantenimiento"
            titleId="cbm-form-title"
            onClose={onClose}
          />
          <div className="modal-body cbm-form-body">
            <div className="cbm-form-row">
              <div className="form-field">
                <label htmlFor="cbm-form-cama">Cama<span className="cbm-required-mark">*</span></label>
                <input
                  id="cbm-form-cama"
                  type="text"
                  placeholder="Ej. 101-A"
                  value={campos.cama}
                  onChange={(e) => setCampo('cama', e.target.value)}
                />
                {errores.cama && <span className="cbm-form-error">{errores.cama}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="cbm-form-sede">Sede<span className="cbm-required-mark">*</span></label>
                <FormSelect
                  id="cbm-form-sede"
                  value={campos.sede}
                  onChange={(v) => setCampo('sede', v)}
                  placeholder="Selecciona una sede"
                  options={SEDE_OPTIONS}
                />
                {errores.sede && <span className="cbm-form-error">{errores.sede}</span>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="cbm-form-area">Área<span className="cbm-required-mark">*</span></label>
              <FormSelect
                id="cbm-form-area"
                value={campos.area}
                onChange={(v) => setCampo('area', v)}
                placeholder="Selecciona un área"
                options={AREA_OPTIONS}
              />
              {errores.area && <span className="cbm-form-error">{errores.area}</span>}
            </div>

            <div className="cbm-form-row">
              <div className="form-field">
                <label htmlFor="cbm-form-tipo">Tipo de mantenimiento<span className="cbm-required-mark">*</span></label>
                <FormSelect
                  id="cbm-form-tipo"
                  value={campos.tipo}
                  onChange={(v) => setCampo('tipo', v)}
                  placeholder="Selecciona un tipo"
                  options={TIPO_OPTIONS}
                />
                {errores.tipo && <span className="cbm-form-error">{errores.tipo}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="cbm-form-prioridad">Prioridad<span className="cbm-required-mark">*</span></label>
                <FormSelect
                  id="cbm-form-prioridad"
                  value={campos.prioridad}
                  onChange={(v) => setCampo('prioridad', v)}
                  placeholder="Selecciona una prioridad"
                  options={PRIORIDAD_OPTIONS}
                />
                {errores.prioridad && <span className="cbm-form-error">{errores.prioridad}</span>}
              </div>
            </div>

            <div className="cbm-form-row">
              <div className="form-field">
                <label htmlFor="cbm-form-fecha">Fecha programada<span className="cbm-required-mark">*</span></label>
                <input
                  id="cbm-form-fecha"
                  type="date"
                  value={campos.fecha}
                  onChange={(e) => setCampo('fecha', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="cbm-form-hora">&nbsp;</label>
                <input
                  id="cbm-form-hora"
                  type="time"
                  value={campos.hora}
                  onChange={(e) => setCampo('hora', e.target.value)}
                />
              </div>
            </div>
            {errores.fecha && <span className="cbm-form-error">{errores.fecha}</span>}

            <div className="form-field">
              <label htmlFor="cbm-form-responsable">Responsable<span className="cbm-required-mark">*</span></label>
              <input
                id="cbm-form-responsable"
                type="text"
                placeholder="Nombre del responsable"
                value={campos.responsable}
                onChange={(e) => setCampo('responsable', e.target.value)}
              />
              {errores.responsable && <span className="cbm-form-error">{errores.responsable}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="cbm-form-descripcion">Descripción<span className="cbm-required-mark">*</span></label>
              <textarea
                id="cbm-form-descripcion"
                rows="3"
                placeholder="Describe el trabajo a realizar..."
                value={campos.descripcion}
                onChange={(e) => setCampo('descripcion', e.target.value)}
              />
              {errores.descripcion && <span className="cbm-form-error">{errores.descripcion}</span>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Programar mantenimiento</button>
          </div>
        </form>
      </div>
    </div>
  );
}
