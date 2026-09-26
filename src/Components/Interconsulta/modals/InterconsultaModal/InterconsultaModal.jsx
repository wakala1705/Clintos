'use client';

import { useEffect, useRef, useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import './InterconsultaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  CONDUCTAS, ESTADO_LABEL, ESTADO_TONE, RESULTADOS, formatearFecha,
} from '@/hooks/Interconsulta/interconsultaData';
import { estaCerrada, puedeConfirmarCargo } from '@/hooks/Interconsulta/interconsultaAcciones';

// Bloque "Acciones de Soporte Técnico" (Reintentar SMS, Regenerar HC, Anular
// interconsulta) oculto (encargo explícito). El bloque, su estado y sus
// acciones siguen intactos — poner en true para volver a mostrarlo.
const MOSTRAR_SOPORTE_TECNICO = false;

// Dato del resumen (etiqueta en mayúsculas + valor), sin caja propia. `-`
// cuando no hay dato. `ancho` ocupa 2 columnas (para el texto más largo).
function Dato({ label, children, ancho }) {
  return (
    <div className={`im-dato${ancho ? ' wide' : ''}`}>
      <dt>{label}</dt>
      <dd title={typeof children === 'string' ? children : undefined}>{children || '-'}</dd>
    </div>
  );
}

function Card({ titulo, children, className = '' }) {
  return (
    <section className={`im-card ${className}`}>
      <h4 className="im-card-title">{titulo}</h4>
      <div className="im-card-body">{children}</div>
    </section>
  );
}

// Detalle de una interconsulta (botón "Abrir" de la bandeja): identidad de la
// solicitud, los datos que pidió el solicitante (solo lectura), la respuesta
// clínica del interconsultante (editable), acciones de soporte técnico y la
// trazabilidad de la solicitud.
//
// El modal no muta nada por su cuenta: cada botón llama a `onAccion(tipo,
// payload)` y el padre aplica la acción (ver aplicarAccion en
// hooks/Interconsulta/interconsultaAcciones.js) y la `solicitud` que llega por
// props ya trae el resultado (estado, trazabilidad).
// Guardar respuesta, Confirmar + cargo y Anular cierran el modal; Reintentar
// SMS y Regenerar HC lo dejan abierto para ver su evento en la trazabilidad.
//
// Se monta con `key={solicitud.id}` desde el padre: el estado del formulario
// arranca desde la respuesta guardada de esa solicitud.
export default function InterconsultaModal({ solicitud, onClose, onAccion }) {
  const s = solicitud;
  const cerrada = estaCerrada(s);

  const [concepto, setConcepto] = useState(s.respuesta.concepto);
  const [resultado, setResultado] = useState(s.respuesta.resultado);
  const [observaciones, setObservaciones] = useState(s.respuesta.observaciones);
  const [telefono, setTelefono] = useState('');
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [errores, setErrores] = useState({});
  const [trazaAbierta, setTrazaAbierta] = useState(false);
  const trazaRef = useRef(null);

  // La trazabilidad vive al fondo del cuerpo con scroll: al abrirla, se
  // desplaza lo justo para que el historial quede a la vista.
  useEffect(() => {
    if (trazaAbierta) trazaRef.current?.scrollIntoView({ block: 'nearest' });
  }, [trazaAbierta]);

  useEffect(() => {
    function handleKeyDown(e) {
      // Con un FormSelect abierto, Escape cierra su lista, no el modal.
      if (e.key === 'Escape' && !document.querySelector('.form-select-dropdown')) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function setError(campo, mensaje) {
    setErrores((prev) => ({ ...prev, [campo]: mensaje }));
  }

  function guardarRespuesta() {
    if (!concepto.trim()) {
      setError('concepto', 'El concepto médico es obligatorio para guardar la respuesta.');
      return;
    }
    onAccion('guardar-respuesta', { concepto: concepto.trim(), resultado, observaciones: observaciones.trim() });
    onClose();
  }

  function reintentarSms() {
    const digitos = telefono.replace(/\D/g, '');
    if (digitos.length < 10) {
      setError('telefono', 'Digite un teléfono móvil de 10 dígitos.');
      return;
    }
    onAccion('reintentar-sms', { telefono: digitos });
    setTelefono('');
    setError('telefono', null);
  }

  function anular() {
    if (!motivoAnulacion.trim()) {
      setError('motivo', 'Indique el motivo de la anulación.');
      return;
    }
    onAccion('anular', { motivo: motivoAnulacion.trim() });
    onClose();
  }

  return (
    <div className="im-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="im-modal" role="dialog" aria-modal="true" aria-labelledby="im-title">
        <ModalHeader
          title={`Interconsulta #${s.numero}`}
          titleId="im-title"
          onClose={onClose}
          autoFocusClose
        />

        <div className="im-body">
          {/* Un solo bloque: quién es el paciente y el estado arriba, los datos
              de la solicitud debajo (2 filas de 4 columnas). */}
          <section className="im-resumen" aria-label="Resumen de la solicitud">
            <div className="im-identity">
              <div className="im-identity-main">
                <span className="im-name">{s.paciente}</span>
                <span className="im-identity-sub">Identificación: {s.documento}</span>
              </div>
              <Badge tone={ESTADO_TONE[s.estado] ?? 'neutral'} dot>{ESTADO_LABEL[s.estado] ?? s.estado}</Badge>
            </div>

            <dl className="im-datos">
              <Dato label="Servicio" ancho>{s.servicio}</Dato>
              <Dato label="Especialidad">{s.especialidad}</Dato>
              <Dato label="Solicitante">{s.solicitante}</Dato>
              <Dato label="Interconsultante">{s.interconsultante}</Dato>
              <Dato label="Fecha solicitud">{formatearFecha(s.fecha)}</Dato>
              <Dato label="HC HIC">{s.hc}</Dato>
              <Dato label="No. prestación">{s.prestacion}</Dato>
            </dl>
          </section>

          <div className="im-cols">
            <Card titulo="Datos de la Solicitud">
              <div className="im-field">
                <label htmlFor="im-motivo">Motivo de la interconsulta</label>
                <textarea id="im-motivo" rows={2} value={s.motivo} readOnly />
              </div>
              <div className="im-field">
                <label htmlFor="im-examen">Examen físico relevante</label>
                <textarea id="im-examen" rows={2} value={s.examen} readOnly />
              </div>
              <div className="im-field">
                <label htmlFor="im-ayudas">Ayudas diagnósticas</label>
                <textarea id="im-ayudas" rows={2} value={s.ayudas} readOnly />
              </div>
              <div className="im-field">
                <label htmlFor="im-hiekg">Hiekg</label>
                <input id="im-hiekg" type="text" value={s.hiekg ?? '-'} readOnly />
              </div>
              <div className="im-field">
                <label htmlFor="im-inicio">Inicio de síntomas</label>
                <input id="im-inicio" type="text" value={s.inicioSintomas ? formatearFecha(s.inicioSintomas) : '-'} readOnly />
              </div>
              <div className="im-field">
                <label htmlFor="im-conducta">Conducta principal</label>
                <FormSelect
                  id="im-conducta"
                  value={s.conducta ?? ''}
                  onChange={() => {}}
                  options={CONDUCTAS}
                  placeholder="Sin seleccionar"
                  disabled
                />
              </div>
            </Card>

            <Card titulo="Respuesta Clínica">
              <div className="im-field">
                <label htmlFor="im-concepto">Concepto médico</label>
                <textarea
                  id="im-concepto"
                  rows={3}
                  value={concepto}
                  placeholder="Digite concepto médico..."
                  disabled={cerrada}
                  aria-invalid={errores.concepto ? 'true' : undefined}
                  aria-describedby={errores.concepto ? 'im-concepto-error' : undefined}
                  onChange={(e) => { setConcepto(e.target.value); setError('concepto', null); }}
                />
                {errores.concepto && <p id="im-concepto-error" className="im-error" role="alert">{errores.concepto}</p>}
              </div>
              <div className="im-field">
                <label htmlFor="im-resultado">Resultado de la interconsulta</label>
                <FormSelect
                  id="im-resultado"
                  value={resultado}
                  onChange={setResultado}
                  options={RESULTADOS}
                  disabled={cerrada}
                />
              </div>
              <div className="im-field">
                <label htmlFor="im-observaciones">Observaciones adicionales</label>
                <textarea
                  id="im-observaciones"
                  rows={3}
                  value={observaciones}
                  placeholder="Observaciones clínicas complementarias..."
                  disabled={cerrada}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>
            </Card>
          </div>

          {MOSTRAR_SOPORTE_TECNICO && (
            <Card titulo="Acciones de Soporte Técnico" className="im-soporte">
              <div className="im-soporte-row">
                <div className="im-field">
                  <label htmlFor="im-telefono" className="sr-only">Teléfono móvil para reintento SMS</label>
                  <input
                    id="im-telefono"
                    type="tel"
                    inputMode="numeric"
                    value={telefono}
                    placeholder="Teléfono móvil para reintento SMS"
                    aria-invalid={errores.telefono ? 'true' : undefined}
                    aria-describedby={errores.telefono ? 'im-telefono-error' : undefined}
                    onChange={(e) => { setTelefono(e.target.value); setError('telefono', null); }}
                  />
                  {errores.telefono && <p id="im-telefono-error" className="im-error" role="alert">{errores.telefono}</p>}
                </div>
                <Button variant="outline" onClick={reintentarSms}>Reintentar SMS</Button>
                <Button variant="outline" onClick={() => onAccion('regenerar-hc')}>Regenerar HC</Button>
              </div>
              <div className="im-soporte-row">
                <div className="im-field">
                  <label htmlFor="im-anulacion" className="sr-only">Motivo o nota para anulación</label>
                  <input
                    id="im-anulacion"
                    type="text"
                    value={motivoAnulacion}
                    placeholder="Motivo o nota para anulación..."
                    disabled={cerrada}
                    aria-invalid={errores.motivo ? 'true' : undefined}
                    aria-describedby={errores.motivo ? 'im-anulacion-error' : undefined}
                    onChange={(e) => { setMotivoAnulacion(e.target.value); setError('motivo', null); }}
                  />
                  {errores.motivo && <p id="im-anulacion-error" className="im-error" role="alert">{errores.motivo}</p>}
                </div>
                <Button variant="danger-outline" disabled={cerrada} onClick={anular}>Anular interconsulta</Button>
              </div>
            </Card>
          )}

          {/* Colapsable (arranca cerrada): el historial es consulta puntual, no
              parte de responder la interconsulta. */}
          <section ref={trazaRef} className={`im-card im-traza-card${trazaAbierta ? ' open' : ''}`}>
            <h4 className="im-card-title im-card-title-toggle">
              <button
                type="button"
                className="im-card-toggle"
                aria-expanded={trazaAbierta}
                aria-controls="im-traza-panel"
                onClick={() => setTrazaAbierta((v) => !v)}
              >
                Trazabilidad e Historial
                <LuChevronDown className="icon im-card-chev" aria-hidden="true" />
              </button>
            </h4>
            {trazaAbierta && (
              <div id="im-traza-panel" className="im-card-body">
                <ol className="im-traza">
                  {s.traza.map((t, i) => (
                    <li key={`${t.estado}-${t.fecha}-${i}`} className="im-traza-item">
                      <span className="im-traza-dot" aria-hidden="true" />
                      <div>
                        <div className="im-traza-head">
                          <b>{t.estado}</b>
                          <span>{formatearFecha(t.fecha)} · {t.usuario}</span>
                        </div>
                        <div className="im-traza-detalle">{t.detalle}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        </div>

        <div className="im-footer">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button
            variant="secondary"
            disabled={!puedeConfirmarCargo(s)}
            onClick={() => { onAccion('confirmar-cargo'); onClose(); }}
          >
            Confirmar + cargo
          </Button>
          <Button disabled={cerrada} onClick={guardarRespuesta}>Guardar respuesta</Button>
        </div>
      </div>
    </div>
  );
}
