'use client';

import { useState } from 'react';
import './CorregirInconsistenciaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuCircleCheck } from 'react-icons/lu';

// Corrección CONTEXTUAL al tipo de problema (encargo, sección 7: "no
// utilizar un formulario genérico de corrección para todos los casos") — un
// solo componente/modal, pero el CUERPO cambia por completo según
// `inconsistencia.tipo` (ver CUERPO_POR_TIPO abajo), como si fueran 5 flujos
// distintos que comparten únicamente el andamiaje de modal/footer. Ninguno
// de los 5 tiene una pantalla propia de "Bed Board" detrás (asignar/
// trasladar paciente, etc. — fuera de alcance, ver encargo sección 17), así
// que cada uno resuelve el problema DENTRO de este mismo modal.
function CuerpoOcupadaSinPaciente({ inconsistencia }) {
  return (
    <>
      <p className="cbi-corregir-texto">
        Estas camas figuran como ocupadas pero no tienen un paciente asignado. Márcalas
        como libres para que vuelvan a estar disponibles.
      </p>
      <ul className="cbi-corregir-lista">
        {inconsistencia.camas.map((c) => (
          <li key={c} className="cbi-corregir-item">
            <span>{c}</span>
            <span className="cbi-corregir-item-accion">Ocupada → Libre</span>
          </li>
        ))}
      </ul>
    </>
  );
}
function CuerpoPacienteDuplicado({ inconsistencia, valor, onChange }) {
  return (
    <>
      <p className="cbi-corregir-texto">
        {inconsistencia.paciente} tiene 2 camas activas al mismo tiempo. Elige cuál cama
        conserva — la otra queda libre.
      </p>
      <div className="cbi-corregir-radios">
        {inconsistencia.camas.map((c) => (
          <label key={c} className="cbi-corregir-radio">
            <input type="radio" name="cbi-cama-conserva" checked={valor === c} onChange={() => onChange(c)} />
            Conservar {c} para {inconsistencia.paciente}
          </label>
        ))}
      </div>
    </>
  );
}
function CuerpoMantenimientoLibre({ inconsistencia }) {
  return (
    <>
      <p className="cbi-corregir-texto">
        Estas camas están en mantenimiento pero aparecen como disponibles. Se corrige su
        estado para que reflejen Mantenimiento de forma consistente.
      </p>
      <ul className="cbi-corregir-lista">
        {inconsistencia.camas.map((c) => (
          <li key={c} className="cbi-corregir-item">
            <span>{c}</span>
            <span className="cbi-corregir-item-accion">Libre → Mantenimiento</span>
          </li>
        ))}
      </ul>
    </>
  );
}
function CuerpoReservaVencida({ inconsistencia }) {
  return (
    <p className="cbi-corregir-texto">
      La reserva de la cama {inconsistencia.camas[0]} expiró hace más de 24 horas. Al
      corregir, la reserva se cierra y la cama queda libre para una nueva asignación.
    </p>
  );
}
function CuerpoCapacidadNoConfigurada({ inconsistencia, valor, onChange }) {
  return (
    <>
      <p className="cbi-corregir-texto">Define la capacidad máxima de camas para cada habitación.</p>
      {inconsistencia.habitaciones.map((h) => (
        <div className="form-field" key={h}>
          <label htmlFor={`cbi-cap-${h}`}>{h}</label>
          <input
            id={`cbi-cap-${h}`}
            type="number"
            min="1"
            max="6"
            placeholder="Ej. 2"
            value={valor[h] ?? ''}
            onChange={(e) => onChange({ ...valor, [h]: e.target.value })}
          />
        </div>
      ))}
    </>
  );
}

const CTA_POR_TIPO = {
  'ocupada-sin-paciente': 'Marcar como libres',
  'paciente-duplicado': 'Resolver duplicidad',
  'mantenimiento-libre': 'Corregir estado',
  'reserva-vencida': 'Liberar reserva',
  'capacidad-no-configurada': 'Guardar capacidad',
};

export default function CorregirInconsistenciaModal({ inconsistencia, onClose, onConfirm }) {
  const [camaConservada, setCamaConservada] = useState('');
  const [capacidades, setCapacidades] = useState({});

  if (!inconsistencia) return null;

  const requierePaciente = inconsistencia.tipo === 'paciente-duplicado';
  const requiereCapacidad = inconsistencia.tipo === 'capacidad-no-configurada';
  const puedeConfirmar = (!requierePaciente || camaConservada !== '')
    && (!requiereCapacidad || inconsistencia.habitaciones.every((h) => capacidades[h]?.trim()));

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onConfirm(inconsistencia.id);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cbi-corregir-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbi-corregir-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuCircleCheck}
            tone="primary"
            title={inconsistencia.titulo}
            subtitle="Corregir inconsistencia"
            titleId="cbi-corregir-title"
            onClose={onClose}
          />
          <div className="modal-body">
            {inconsistencia.tipo === 'ocupada-sin-paciente' && <CuerpoOcupadaSinPaciente inconsistencia={inconsistencia} />}
            {inconsistencia.tipo === 'paciente-duplicado' && (
              <CuerpoPacienteDuplicado inconsistencia={inconsistencia} valor={camaConservada} onChange={setCamaConservada} />
            )}
            {inconsistencia.tipo === 'mantenimiento-libre' && <CuerpoMantenimientoLibre inconsistencia={inconsistencia} />}
            {inconsistencia.tipo === 'reserva-vencida' && <CuerpoReservaVencida inconsistencia={inconsistencia} />}
            {inconsistencia.tipo === 'capacidad-no-configurada' && (
              <CuerpoCapacidadNoConfigurada inconsistencia={inconsistencia} valor={capacidades} onChange={setCapacidades} />
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!puedeConfirmar}>{CTA_POR_TIPO[inconsistencia.tipo]}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
