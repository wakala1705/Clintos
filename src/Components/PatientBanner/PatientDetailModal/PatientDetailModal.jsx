'use client';

import './PatientDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import {
  LuBedDouble, LuCircleAlert, LuInfo, LuMapPin, LuUser,
} from 'react-icons/lu';

// `strong` sube el valor a un nivel de jerarquía mayor (--fs-lg/semibold) —
// se usa para los datos que el usuario busca primero (edad/sexo/asegurador,
// N° de admisión, cama); el resto queda en el nivel base. Un valor vacío se
// atenúa en vez de competir con los datos reales.
function Field({ label, value, strong = false }) {
  return (
    <div className="pdm-field">
      <span className="pdm-field-label">{label}</span>
      <span className={`pdm-field-value${strong ? ' strong' : ''}${value ? '' : ' empty'}`}>
        {value || 'No especificado'}
      </span>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="pdm-section">
      <h4 className="pdm-section-title">
        <Icon className="icon" aria-hidden="true" />
        {title}
      </h4>
      {children}
    </section>
  );
}

// Modal de detalle disparado por "Ver más" en PatientBanner (ver
// PatientBanner.jsx) — mismos datos que el banner (documento/edad/sexo/
// asegurador/alergias/secondRow) más los que no caben en la fila compacta:
// ciudad, dirección y contacto (teléfono/correo), y el set fijo de admisión
// (`patient.numeroAdmision/fechaIngreso/cama/idAfiliado/regimen/
// numeroContrato/idContrato/medicoTratante/diagnostico`, todos opcionales —
// una pantalla sin admisión, como Asignación de Citas, no muestra la
// sección). Como PatientBanner es global (compartido por Asignación de
// Citas/Gestión de Enfermería/Historia Clínica, ver comentario en
// PatientBanner.jsx), este modal solo usa tokens base garantizados en
// cualquier feature (los mismos que ModalHeader) en vez de depender del CSS
// de una sola feature.
//
// Jerarquía: 1) datos de identidad clave en la franja superior, 2) diagnóstico
// como bloque destacado, 3) datos de admisión (los primarios en grande),
// 4) contacto/información adicional en el nivel base, 5) alergias en ámbar.
export default function PatientDetailModal({ patient, secondRow, onClose }) {
  if (!patient) return null;

  // Campos de admisión "secundarios" (nivel base), en el orden de la fila 2
  // de PatientBanner.
  const admisionSecundarios = [
    { label: 'Fecha de ingreso', value: patient.fechaIngreso },
    { label: 'Médico tratante', value: patient.medicoTratante },
    { label: 'Id. Afiliado', value: patient.idAfiliado },
    { label: 'Régimen', value: patient.regimen },
    { label: 'N° Contrato', value: patient.numeroContrato },
    { label: 'ID Contrato', value: patient.idContrato },
  ].filter((f) => f.value);
  const tieneAdmision = Boolean(patient.numeroAdmision || patient.cama || patient.diagnostico)
    || admisionSecundarios.length > 0;

  // secondRow puede repetir campos que ya se muestran en la sección de
  // admisión (Médico tratante/Diagnóstico en Hospitalización) — se descartan
  // por label para no mostrarlos dos veces.
  const yaMostrados = new Set([
    'Diagnóstico', 'Cama', 'N° Admisión',
    ...admisionSecundarios.map((f) => f.label),
  ]);
  const adicionales = (secondRow ?? []).filter((item) => !yaMostrados.has(item.label));

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
          title="Detalle del paciente"
          titleId="pdm-title"
          onClose={onClose}
        />

        <div className="pdm-body">
          <div className="pdm-identity">
            <div className="pdm-identity-head">
              <PatientAvatar iniciales={patient.iniciales} className="pdm-avatar" />
              <div className="pdm-identity-name">
                <span className="pdm-name">{patient.nombre}</span>
                <span className="pdm-doc">CC {patient.documento}</span>
              </div>
            </div>
            <div className="pdm-identity-grid">
              <Field label="Edad" value={patient.edad} strong />
              <Field label="Sexo" value={patient.sexo} strong />
              <Field label="Asegurador" value={patient.eps} strong />
            </div>
          </div>

          {tieneAdmision && (
            <Section icon={LuBedDouble} title="Admisión">
              {patient.diagnostico && (
                <div className="pdm-callout">
                  <span className="pdm-field-label">Diagnóstico</span>
                  <span className="pdm-callout-value">{patient.diagnostico}</span>
                </div>
              )}
              {(patient.numeroAdmision || patient.cama) && (
                <div className="pdm-grid pdm-grid-primary">
                  {patient.numeroAdmision && <Field label="N° Admisión" value={patient.numeroAdmision} strong />}
                  {patient.cama && <Field label="Cama" value={patient.cama} strong />}
                </div>
              )}
              {admisionSecundarios.length > 0 && (
                <div className="pdm-grid">
                  {admisionSecundarios.map((f) => (
                    <Field key={f.label} label={f.label} value={f.value} />
                  ))}
                </div>
              )}
            </Section>
          )}

          <Section icon={LuMapPin} title="Contacto">
            <div className="pdm-grid">
              <Field label="Ciudad" value={patient.ciudad} />
              <Field label="Dirección" value={patient.direccion} />
              <Field label="Teléfono" value={patient.telefono} />
              <Field label="Correo electrónico" value={patient.email} />
            </div>
          </Section>

          {adicionales.length > 0 && (
            // Título genérico a propósito: secondRow trae contenido distinto
            // según el caller (admisión/contrato/cama en Enfermería, cita/
            // servicio en Historia Clínica, ciudad/citas futuras en
            // Asignación de Citas, ver PatientBanner.jsx) — un título fijo
            // tipo "Admisión" sería incorrecto en los otros dos.
            <Section icon={LuInfo} title="Información adicional">
              <div className="pdm-grid">
                {adicionales.map((item) => (
                  <Field key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </Section>
          )}

          {patient.allergies && patient.allergies.length > 0 && (
            <Section icon={LuCircleAlert} title="Alergias registradas">
              <div className="pdm-allergy-list">
                {patient.allergies.map((a) => (
                  <div className="pdm-allergy-row" key={a.name}>
                    <span className="k">{a.name}</span>
                    <span className="v">{a.reaction}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
