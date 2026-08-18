'use client';

import './PatientDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import { LuUser } from 'react-icons/lu';

function Field({ label, value }) {
  return (
    <div className="pdm-field">
      <span className="pdm-field-label">{label}</span>
      <span className="pdm-field-value">{value || 'No especificado'}</span>
    </div>
  );
}

// Modal de detalle disparado por "Ver más" en PatientBanner (ver
// PatientBanner.jsx) — mismos datos que el banner (documento/edad/sexo/
// asegurador/alergias/secondRow) más los que no caben en la fila compacta:
// ciudad, dirección y contacto (teléfono/correo). Como PatientBanner es
// global (compartido por Asignación de Citas/Gestión de Enfermería/Historia
// Clínica, ver comentario en PatientBanner.jsx), este modal solo usa tokens
// base garantizados en cualquier feature (--surface-modal/--border/--ink-*)
// en vez de depender del CSS de una sola feature.
export default function PatientDetailModal({ patient, secondRow, onClose }) {
  if (!patient) return null;

  return (
    <div className="pdm-overlay" role="presentation" onClick={onClose}>
      <div
        className="pdm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          icon={LuUser}
          title={patient.nombre}
          titleId="pdm-title"
          subtitle={`Documento ${patient.documento}`}
          onClose={onClose}
        />

        <div className="pdm-body">
          <div className="pdm-identity-row">
            <PatientAvatar iniciales={patient.iniciales} className="pdm-avatar" />
            <div className="pdm-grid">
              <Field label="Edad" value={patient.edad} />
              <Field label="Sexo" value={patient.sexo} />
              <Field label="Asegurador" value={patient.eps} />
            </div>
          </div>

          <div className="pdm-section">
            <div className="pdm-section-title">Contacto</div>
            <div className="pdm-grid">
              <Field label="Ciudad" value={patient.ciudad} />
              <Field label="Dirección" value={patient.direccion} />
              <Field label="Teléfono" value={patient.telefono} />
              <Field label="Correo electrónico" value={patient.email} />
            </div>
          </div>

          {secondRow && secondRow.length > 0 && (
            <div className="pdm-section">
              {/* Título genérico a propósito: secondRow trae contenido distinto
                  según el caller (admisión/contrato/cama en Enfermería, cita/
                  servicio en Historia Clínica, ciudad/citas futuras en
                  Asignación de Citas, ver PatientBanner.jsx) — un título fijo
                  tipo "Admisión" sería incorrecto en los otros dos. */}
              <div className="pdm-section-title">Información adicional</div>
              <div className="pdm-grid">
                {secondRow.map((item) => (
                  <Field key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          )}

          {patient.allergies && patient.allergies.length > 0 && (
            <div className="pdm-section">
              <div className="pdm-section-title">Alergias registradas</div>
              <div className="pdm-allergy-list">
                {patient.allergies.map((a) => (
                  <div className="pdm-allergy-row" key={a.name}>
                    <span className="k">{a.name}</span>
                    <span className="v">{a.reaction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
