'use client';

import { useState } from 'react';
import './NuevaReservaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREAS, PISOS, SECTORES, SEDES,
} from '@/hooks/GestionCamas/mockReservasData';
import { LuCalendarPlus } from 'react-icons/lu';

const SEDE_OPTIONS = SEDES.filter((s) => s.value !== 'todas');
const AREA_OPTIONS = AREAS.filter((a) => a.value !== 'todas');
const PISO_OPTIONS = PISOS.filter((p) => p.value !== 'todos');
const SECTOR_OPTIONS = SECTORES.filter((s) => s.value !== 'todos');
const PISO_LABEL = Object.fromEntries(PISO_OPTIONS.map((p) => [p.value, p.label]));
const SECTOR_LABEL = Object.fromEntries(SECTOR_OPTIONS.map((s) => [s.value, s.label]));

const CAMPOS_INICIALES = {
  paciente: '',
  hc: '',
  cama: '',
  sede: '',
  area: '',
  piso: '',
  sector: '',
  inicioFecha: '',
  inicioHora: '',
  vencimientoFecha: '',
  vencimientoHora: '',
};

function fechaISOaDDMMAAAA(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// "+ Nueva reserva" — formulario de creación (nace siempre en Pendiente, ver
// GestionCamasReservas.jsx: una reserva recién creada todavía no está
// confirmada por Admisiones). Un solo bloque de campos (a diferencia de
// NuevaCamaModal, que separa en 3 secciones) — este formulario es más chico
// y no tiene un "Mostrar más" opcional que justifique esa división.
export default function NuevaReservaModal({ onClose, onSubmit }) {
  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [errores, setErrores] = useState({});

  function setCampo(key, value) {
    setCampos((prev) => ({ ...prev, [key]: value }));
  }

  function validar() {
    const nuevos = {};
    if (!campos.paciente.trim()) nuevos.paciente = 'El paciente es obligatorio.';
    if (!campos.hc.trim()) nuevos.hc = 'La historia clínica es obligatoria.';
    if (!campos.cama.trim()) nuevos.cama = 'La cama es obligatoria.';
    if (!campos.sede) nuevos.sede = 'Selecciona una sede.';
    if (!campos.area) nuevos.area = 'Selecciona un área.';
    if (!campos.piso) nuevos.piso = 'Selecciona un piso.';
    if (!campos.sector) nuevos.sector = 'Selecciona un sector.';
    if (!campos.inicioFecha || !campos.inicioHora) nuevos.inicio = 'La fecha y hora de inicio son obligatorias.';
    if (!campos.vencimientoFecha || !campos.vencimientoHora) nuevos.vencimiento = 'La fecha y hora de vencimiento son obligatorias.';

    if (!nuevos.inicio && !nuevos.vencimiento) {
      const inicio = new Date(`${campos.inicioFecha}T${campos.inicioHora}`);
      const vencimiento = new Date(`${campos.vencimientoFecha}T${campos.vencimientoHora}`);
      if (vencimiento <= inicio) nuevos.vencimiento = 'El vencimiento debe ser posterior al inicio.';
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    onSubmit({
      paciente: campos.paciente.trim(),
      hc: campos.hc.trim(),
      cama: campos.cama.trim(),
      ubicacion: `${PISO_LABEL[campos.piso]} · ${SECTOR_LABEL[campos.sector]}`,
      piso: campos.piso,
      sector: campos.sector,
      sede: campos.sede,
      area: campos.area,
      inicioFecha: fechaISOaDDMMAAAA(campos.inicioFecha),
      inicioHora: campos.inicioHora,
      vencimientoFecha: fechaISOaDDMMAAAA(campos.vencimientoFecha),
      vencimientoHora: campos.vencimientoHora,
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cbr-form-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbr-form-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuCalendarPlus}
            tone="primary"
            title="Nueva reserva"
            titleId="cbr-form-title"
            onClose={onClose}
          />
          <div className="modal-body cbr-form-body">
            <div className="cbr-form-row">
              <div className="form-field">
                <label htmlFor="cbr-form-paciente">Paciente<span className="cbr-required-mark">*</span></label>
                <input
                  id="cbr-form-paciente"
                  type="text"
                  placeholder="Nombre del paciente"
                  value={campos.paciente}
                  onChange={(e) => setCampo('paciente', e.target.value)}
                />
                {errores.paciente && <span className="cbr-form-error">{errores.paciente}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="cbr-form-hc">Historia clínica<span className="cbr-required-mark">*</span></label>
                <input
                  id="cbr-form-hc"
                  type="text"
                  placeholder="Ej. HC-10480"
                  value={campos.hc}
                  onChange={(e) => setCampo('hc', e.target.value)}
                />
                {errores.hc && <span className="cbr-form-error">{errores.hc}</span>}
              </div>
            </div>

            <div className="cbr-form-row">
              <div className="form-field">
                <label htmlFor="cbr-form-cama">Cama<span className="cbr-required-mark">*</span></label>
                <input
                  id="cbr-form-cama"
                  type="text"
                  placeholder="Ej. 301-A"
                  value={campos.cama}
                  onChange={(e) => setCampo('cama', e.target.value)}
                />
                {errores.cama && <span className="cbr-form-error">{errores.cama}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="cbr-form-sede">Sede<span className="cbr-required-mark">*</span></label>
                <FormSelect
                  id="cbr-form-sede"
                  value={campos.sede}
                  onChange={(v) => setCampo('sede', v)}
                  placeholder="Selecciona una sede"
                  options={SEDE_OPTIONS}
                />
                {errores.sede && <span className="cbr-form-error">{errores.sede}</span>}
              </div>
            </div>

            <div className="cbr-form-row">
              <div className="form-field">
                <label htmlFor="cbr-form-area">Área<span className="cbr-required-mark">*</span></label>
                <FormSelect
                  id="cbr-form-area"
                  value={campos.area}
                  onChange={(v) => setCampo('area', v)}
                  placeholder="Selecciona un área"
                  options={AREA_OPTIONS}
                />
                {errores.area && <span className="cbr-form-error">{errores.area}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="cbr-form-piso">Piso<span className="cbr-required-mark">*</span></label>
                <FormSelect
                  id="cbr-form-piso"
                  value={campos.piso}
                  onChange={(v) => setCampo('piso', v)}
                  placeholder="Selecciona un piso"
                  options={PISO_OPTIONS}
                />
                {errores.piso && <span className="cbr-form-error">{errores.piso}</span>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="cbr-form-sector">Sector<span className="cbr-required-mark">*</span></label>
              <FormSelect
                id="cbr-form-sector"
                value={campos.sector}
                onChange={(v) => setCampo('sector', v)}
                placeholder="Selecciona un sector"
                options={SECTOR_OPTIONS}
              />
              {errores.sector && <span className="cbr-form-error">{errores.sector}</span>}
            </div>

            <div className="cbr-form-row">
              <div className="form-field">
                <label htmlFor="cbr-form-inicio-fecha">Inicio<span className="cbr-required-mark">*</span></label>
                <input
                  id="cbr-form-inicio-fecha"
                  type="date"
                  value={campos.inicioFecha}
                  onChange={(e) => setCampo('inicioFecha', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="cbr-form-inicio-hora">&nbsp;</label>
                <input
                  id="cbr-form-inicio-hora"
                  type="time"
                  value={campos.inicioHora}
                  onChange={(e) => setCampo('inicioHora', e.target.value)}
                />
              </div>
            </div>
            {errores.inicio && <span className="cbr-form-error">{errores.inicio}</span>}

            <div className="cbr-form-row">
              <div className="form-field">
                <label htmlFor="cbr-form-vencimiento-fecha">Vencimiento<span className="cbr-required-mark">*</span></label>
                <input
                  id="cbr-form-vencimiento-fecha"
                  type="date"
                  value={campos.vencimientoFecha}
                  onChange={(e) => setCampo('vencimientoFecha', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="cbr-form-vencimiento-hora">&nbsp;</label>
                <input
                  id="cbr-form-vencimiento-hora"
                  type="time"
                  value={campos.vencimientoHora}
                  onChange={(e) => setCampo('vencimientoHora', e.target.value)}
                />
              </div>
            </div>
            {errores.vencimiento && <span className="cbr-form-error">{errores.vencimiento}</span>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Crear reserva</button>
          </div>
        </form>
      </div>
    </div>
  );
}
