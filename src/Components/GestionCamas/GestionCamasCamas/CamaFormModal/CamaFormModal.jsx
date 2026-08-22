'use client';

import { useState } from 'react';
import './CamaFormModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  ESTADOS, SEDES, SERVICIOS, SERVICIO_TIPO, TIPO_LABEL,
} from '@/hooks/GestionCamas/mockCamasAdminData';
import { LuBedDouble } from 'react-icons/lu';

const ESTADO_INICIAL_OPTIONS = ESTADOS.filter((e) => e.value !== 'todos');
const SEDE_OPTIONS = SEDES.filter((s) => s.value !== 'todas');
const SERVICIO_OPTIONS = SERVICIOS.filter((s) => s.value !== 'todos');

// Un solo formulario para Crear/Editar (encargo, sección 12: "no crear un
// formulario completamente diferente") — `mode` solo cambia título/CTA del
// footer y qué valores llegan precargados (ver CamaFormModal.jsx desde
// GestionCamasCamas.jsx). "Tipo de cama" es de solo lectura: en este modelo
// el tipo queda definido 1:1 por el Servicio elegido (ver SERVICIO_TIPO,
// mockCamasAdminData.js) — encargo sección 12, "si algún atributo no puede
// modificarse... mostrarlo como solo lectura".
export default function CamaFormModal({
  mode, cama, camasExistentes, onClose, onSubmit,
}) {
  const [codigo, setCodigo] = useState(cama?.codigo ?? '');
  const [habitacionCodigo, setHabitacionCodigo] = useState(cama?.habitacionCodigo ?? '');
  const [servicio, setServicio] = useState(cama?.servicio ?? '');
  const [sede, setSede] = useState(cama?.sede ?? '');
  const [estado, setEstado] = useState(cama?.estado ?? 'habilitada');
  const [errores, setErrores] = useState({});

  const esEdicion = mode === 'editar';
  const tipo = servicio ? SERVICIO_TIPO[servicio] : null;

  function validar() {
    const nuevos = {};
    const codigoNormalizado = codigo.trim();
    if (!codigoNormalizado) nuevos.codigo = 'El código de cama es obligatorio.';
    else if (camasExistentes.some((c) => c.codigo.toLowerCase() === codigoNormalizado.toLowerCase() && c.id !== cama?.id)) {
      nuevos.codigo = 'Ya existe una cama con este código.';
    }
    if (!habitacionCodigo.trim()) nuevos.habitacionCodigo = 'La habitación es obligatoria.';
    if (!servicio) nuevos.servicio = 'Selecciona un servicio.';
    if (!sede) nuevos.sede = 'Selecciona una sede.';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    onSubmit({
      codigo: codigo.trim(),
      nombre: `Cama ${codigo.trim().replace(/^C-/i, '')}`,
      habitacionCodigo: habitacionCodigo.trim(),
      habitacionNombre: `Habitación ${habitacionCodigo.trim().replace(/^H-/i, '')}`,
      servicio,
      sede,
      tipo,
      estado,
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cba-form-modal-card" role="dialog" aria-modal="true" aria-labelledby="cba-form-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuBedDouble}
            tone="primary"
            title={esEdicion ? 'Editar cama' : 'Nueva cama'}
            titleId="cba-form-title"
            subtitle={esEdicion ? cama?.codigo : undefined}
            onClose={onClose}
          />
          <div className="modal-body cba-form-body">
            <div className="form-field">
              <label htmlFor="cba-form-codigo">Código de cama</label>
              <input
                id="cba-form-codigo"
                type="text"
                placeholder="Ej. C-101"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
              {errores.codigo && <span className="cba-form-error">{errores.codigo}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="cba-form-habitacion">Habitación</label>
              <input
                id="cba-form-habitacion"
                type="text"
                placeholder="Ej. H-101"
                value={habitacionCodigo}
                onChange={(e) => setHabitacionCodigo(e.target.value)}
              />
              {errores.habitacionCodigo && <span className="cba-form-error">{errores.habitacionCodigo}</span>}
            </div>

            <div className="cba-form-row">
              <div className="form-field">
                <label htmlFor="cba-form-servicio">Servicio</label>
                <FormSelect
                  id="cba-form-servicio"
                  value={servicio}
                  onChange={setServicio}
                  placeholder="Selecciona un servicio"
                  options={SERVICIO_OPTIONS}
                />
                {errores.servicio && <span className="cba-form-error">{errores.servicio}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="cba-form-sede">Sede</label>
                <FormSelect
                  id="cba-form-sede"
                  value={sede}
                  onChange={setSede}
                  placeholder="Selecciona una sede"
                  options={SEDE_OPTIONS}
                />
                {errores.sede && <span className="cba-form-error">{errores.sede}</span>}
              </div>
            </div>

            <div className="cba-form-row">
              <div className="form-field">
                <label>Tipo de cama</label>
                <div className="tf-readonly-value">{tipo ? TIPO_LABEL[tipo] : '—'}</div>
                <span className="cba-form-hint">Definido automáticamente según el servicio.</span>
              </div>

              <div className="form-field">
                <label htmlFor="cba-form-estado">Estado inicial</label>
                <FormSelect
                  id="cba-form-estado"
                  value={estado}
                  onChange={setEstado}
                  options={ESTADO_INICIAL_OPTIONS}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{esEdicion ? 'Guardar cambios' : 'Crear cama'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
