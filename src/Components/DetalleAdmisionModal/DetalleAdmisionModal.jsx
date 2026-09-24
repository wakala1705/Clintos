'use client';

import { useEffect } from 'react';
import './DetalleAdmisionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import {
  LuBedDouble, LuContact, LuFileText, LuHistory, LuIdCard, LuShieldCheck,
} from 'react-icons/lu';

// Un par etiqueta/valor. `—` cuando no hay dato (nunca una fila vacía).
function Campo({ label, children, full }) {
  return (
    <div className={`dam-field${full ? ' full' : ''}`}>
      <dt>{label}</dt>
      <dd>{children ?? '—'}</dd>
    </div>
  );
}

function Seccion({ icon: Icon, titulo, children }) {
  return (
    <section className="dam-section">
      <h4 className="dam-section-title">
        <Icon className="icon" aria-hidden="true" />
        {titulo}
      </h4>
      <dl className="dam-fields">{children}</dl>
    </section>
  );
}

function area(a) {
  return a ? `${a.codigo} · ${a.nombre}` : null;
}

// Detalle de una admisión — app-wide (AGENTS.md "Component organization"):
// lo usan HC Hospitalización (menú "⋯" → "Ver detalle"), Admisiones y
// Enfermería → Pacientes (columna "Detalles"/menú de la tabla de
// admisiones). Cada pantalla arma el `detalle` desde su propio mock
// (getDetalleAdmision en mockHospitalizadosData.js, detalleDesdeAdmision en
// mockAdmisionesData.js) con el mismo shape.
//
// Organización:
// 1. Franja de identidad: quién es (avatar, nombre, documento, edad, sexo)
//    y los datos que ubican la admisión (ingreso, estancia, cama); N° de
//    admisión/historia en el subtítulo y el estado como badge del header.
// 2. 4 secciones agrupadas por pregunta: ¿dónde está? (Admisión), ¿quién
//    paga? (Contratación), ¿a quién llamo? (Acompañante) y ¿quién la
//    registró? (Trazabilidad).
//
// Campos opcionales: los que un `detalle` no trae (`undefined`) no se
// pintan — ej. Admisiones no tiene diagnóstico ni edad, HC Hospitalización
// no tiene triage. `null` sí se pinta como "—"/texto de vacío (el campo
// aplica pero no hay dato). `onVerHistoria` opcional: sin él, solo "Cerrar".
export default function DetalleAdmisionModal({ detalle, onClose, onVerHistoria }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const d = detalle;
  const trasladado = d.areaIngreso && d.areaActual && d.areaIngreso.codigo !== d.areaActual.codigo;
  const identidadSub = [
    `CC ${d.documento}`, d.edadDetallada, d.sexo,
  ].filter(Boolean).join(' · ');
  const subtitulo = [
    `N° Admisión ${d.numeroAdmision}`, d.historia && `Historia ${d.historia}`,
  ].filter(Boolean).join(' · ');

  return (
    <div className="dam-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dam-modal" role="dialog" aria-modal="true" aria-labelledby="dam-title">
        <ModalHeader
          icon={LuIdCard}
          tone="primary"
          title="Detalle de admisión"
          titleId="dam-title"
          subtitle={subtitulo}
          trailing={d.estado && <Badge tone={d.estado.tone} dot>{d.estado.label}</Badge>}
          onClose={onClose}
          autoFocusClose
        />

        <div className="dam-body">
          <div className="dam-identity">
            <PatientAvatar iniciales={d.iniciales} className="dam-avatar" />
            <div className="dam-identity-main">
              <div className="dam-name">{d.nombre}</div>
              <div className="dam-identity-sub">{identidadSub}</div>
            </div>
            <dl className="dam-stats">
              <div className="dam-stat">
                <dt>Ingreso</dt>
                <dd>{d.fechaIngreso} <span className="dam-muted">{d.horaIngreso}</span></dd>
              </div>
              {d.estancia !== undefined && (
                <div className="dam-stat">
                  <dt>Estancia</dt>
                  <dd>
                    {d.estancia}
                    {d.nuevoIngreso && <Badge tone="info" className="dam-stat-badge">Nuevo ingreso</Badge>}
                    {d.prolongada && <Badge tone="warn" className="dam-stat-badge">Prolongada</Badge>}
                  </dd>
                </div>
              )}
              <div className="dam-stat">
                <dt>Cama</dt>
                <dd>{d.cama ?? <span className="dam-muted">Sin asignar</span>}</dd>
              </div>
            </dl>
          </div>

          <div className="dam-grid">
            <Seccion icon={LuBedDouble} titulo="Admisión">
              {d.tipoAdmision !== undefined && <Campo label="Tipo de admisión">{d.tipoAdmision}</Campo>}
              {d.triage !== undefined && <Campo label="Triage">{d.triage}</Campo>}
              <Campo label="Área funcional de ingreso">{area(d.areaIngreso)}</Campo>
              <Campo label="Área funcional actual">
                {area(d.areaActual)}
                {trasladado && <span className="dam-muted"> (trasladado)</span>}
              </Campo>
              <Campo label="Habitación / Cama">
                {d.cama ? [d.habitacion, `Cama ${d.cama}`].filter(Boolean).join(' · ') : null}
              </Campo>
              {d.medicoTratante !== undefined && <Campo label="Médico tratante">{d.medicoTratante}</Campo>}
              {d.diagnostico !== undefined && <Campo label="Diagnóstico de ingreso" full>{d.diagnostico}</Campo>}
            </Seccion>

            <Seccion icon={LuShieldCheck} titulo="Contratación">
              <Campo label="Contratante" full>{d.contratante}</Campo>
              <Campo label="Tipo de contrato">{d.tipoContrato}</Campo>
              <Campo label="Régimen">{d.regimen ? `EPS · ${d.regimen}` : null}</Campo>
            </Seccion>

            <Seccion icon={LuContact} titulo="Acompañante">
              <Campo label="Nombre">{d.acompanante?.nombre}</Campo>
              <Campo label="Vínculo">{d.acompanante?.vinculo}</Campo>
              <Campo label="Teléfono">
                {d.acompanante?.telefono
                  ? <a className="dam-link" href={`tel:${d.acompanante.telefono}`}>{d.acompanante.telefono}</a>
                  : null}
              </Campo>
              <Campo label="Dirección">{d.acompanante?.direccion}</Campo>
            </Seccion>

            <Seccion icon={LuHistory} titulo="Trazabilidad">
              <Campo label="Médico de ingreso" full>
                {d.medicoIngreso && (
                  <>
                    {d.medicoIngreso.nombre}
                    <span className="dam-muted"> · CC {d.medicoIngreso.documento}</span>
                  </>
                )}
              </Campo>
              <Campo label="Usuario que ingresa">{d.usuarioIngresa}</Campo>
              <Campo label="Usuario que da alta">
                {d.usuarioAlta ?? <span className="dam-muted">Sin alta registrada</span>}
              </Campo>
            </Seccion>
          </div>
        </div>

        <div className="dam-footer">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          {onVerHistoria && (
            <Button variant="primary" icon={LuFileText} onClick={onVerHistoria}>Ver historia clínica</Button>
          )}
        </div>
      </div>
    </div>
  );
}
