'use client';

import { useEffect, useRef } from 'react';
import { LuCalendarPlus, LuCircleAlert, LuCircleCheck, LuInfo } from 'react-icons/lu';
import './SolicitudPanel.css';
import Button from '@/Components/Button/Button';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import EstadoChip from '../EstadoChip/EstadoChip';
import { ORIGEN_LABEL, listaProcedimientos } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';
import {
  ESTADO_GENERAL_LABEL, ESTADO_ITEM_LABEL, ITEM_LABEL, TONO_GENERAL, TONO_ITEM,
  accionItem, enmascararDocumento, estadoEstudios, evaluarSolicitud, mensajeFaltantes,
} from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';

function Etiqueta({ obligatorio }) {
  return (
    <span className={`sp-req${obligatorio ? ' sp-req-obligatorio' : ''}`}>
      {obligatorio ? 'Obligatorio' : 'Opcional'}
    </span>
  );
}

// Detalle + acción contextual (acción de texto = rol `link`).
function Detalle({ clave, item, onAccion }) {
  const accion = accionItem(clave, item.estado);
  return (
    <>
      <p className="sp-detalle">{item.detalle}</p>
      {accion && (
        <button type="button" className="sp-link" onClick={() => onAccion(accion, ITEM_LABEL[clave], clave)}>
          {accion}
        </button>
      )}
    </>
  );
}

function Paso({ numero, titulo, estado, obligatorio, children }) {
  return (
    <li className="sp-paso">
      <div className="sp-paso-head">
        <span className="sp-num" aria-hidden="true">{numero}</span>
        <h3 className="sp-paso-titulo">
          <span className="sp-sr">Paso {numero}: </span>{titulo}
        </h3>
      </div>
      <div className="sp-paso-meta">
        <EstadoChip tone={TONO_ITEM[estado]}>{ESTADO_ITEM_LABEL[estado]}</EstadoChip>
        <Etiqueta obligatorio={obligatorio} />
      </div>
      {children}
    </li>
  );
}

function Dato({ label, children }) {
  return (
    <div className="sp-dato">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

// Modal con el detalle del chequeo de una solicitud: datos, los 4 pasos y la
// acción "Programar cirugía" (que abre el modal de la agenda encima).
export default function SolicitudPanel({
  solicitud, onClose, onAccion, onProgramar,
}) {
  const panelRef = useRef(null);
  useModalFocusTrap(panelRef);
  const ev = evaluarSolicitud(solicitud);
  const { checklist } = solicitud;
  const puedeProgramar = ev.estado === 'lista';
  const estudiosObligatorio = checklist.laboratorios.obligatorio || checklist.imagenes.obligatorio;

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay open">
      <div
        ref={panelRef}
        className="modal-card sp-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sp-titulo"
      >
        <ModalHeader
          title={solicitud.paciente.nombre}
          titleId="sp-titulo"
          onClose={onClose}
          closeLabel="Cerrar chequeo de la solicitud"
        />
        <div className="sp-estado">
          <EstadoChip tone={TONO_GENERAL[ev.estado]}>{ESTADO_GENERAL_LABEL[ev.estado]}</EstadoChip>
          <span className="sp-conteo">
            <strong>{ev.completos} de {ev.total}</strong> obligatorios completos
          </span>
        </div>

        <div className="sp-cuerpo">
          <section aria-labelledby="sp-datos-titulo">
            <h3 id="sp-datos-titulo" className="sp-seccion">Datos</h3>
            <dl className="sp-datos">
              <Dato label="Paciente">
                {solicitud.paciente.nombre}
                <span className="sp-dato-sub">
                  {enmascararDocumento(solicitud.paciente.tipoDocumento, solicitud.paciente.numeroDocumento)} · {solicitud.paciente.edad} años
                </span>
              </Dato>
              <Dato label={`Orden · ${ORIGEN_LABEL[solicitud.origen]}`}>
                {solicitud.ordenNumero}
                <span className="sp-dato-sub">{solicitud.medicoOrdena}</span>
                {solicitud.institucionRemite && <span className="sp-dato-sub">{solicitud.institucionRemite}</span>}
              </Dato>
              <Dato label="CUPS · Procedimientos">
                {listaProcedimientos(solicitud).map((p) => (
                  <span key={p.nombre} className="sp-dato-proc">{p.cups} · {p.nombre}</span>
                ))}
                <span className="sp-dato-sub">{solicitud.especialidad}</span>
              </Dato>
              <Dato label="Terceros">
                {solicitud.eps}
                <span className="sp-dato-sub">Entidad pagadora · {solicitud.regimen}</span>
                <span className="sp-dato-sub">Contrato {solicitud.contrato}</span>
              </Dato>
            </dl>
          </section>

          <section aria-labelledby="sp-lista-titulo">
            <h3 id="sp-lista-titulo" className="sp-seccion">Lista de chequeo</h3>
            <ol className="sp-pasos">
              <Paso numero={1} titulo="Orden médica" estado={checklist.orden.estado} obligatorio={checklist.orden.obligatorio}>
                <Detalle clave="orden" item={checklist.orden} onAccion={onAccion} />
              </Paso>
              <Paso numero={2} titulo="Autorización de la EPS" estado={checklist.autorizacion.estado} obligatorio={checklist.autorizacion.obligatorio}>
                <Detalle clave="autorizacion" item={checklist.autorizacion} onAccion={onAccion} />
              </Paso>
              <Paso numero={3} titulo="Valoración preanestésica" estado={checklist.valoracion.estado} obligatorio={checklist.valoracion.obligatorio}>
                <Detalle clave="valoracion" item={checklist.valoracion} onAccion={onAccion} />
              </Paso>
              <Paso numero={4} titulo="Estudios requeridos" estado={estadoEstudios(checklist)} obligatorio={estudiosObligatorio}>
                <ul className="sp-sub">
                  {['laboratorios', 'imagenes'].map((clave) => {
                    const item = checklist[clave];
                    return (
                      <li key={clave} className="sp-subitem">
                        <div className="sp-subitem-head">
                          <span className="sp-subitem-nombre">{ITEM_LABEL[clave]}</span>
                          <EstadoChip tone={TONO_ITEM[item.estado]} mini>{ESTADO_ITEM_LABEL[item.estado]}</EstadoChip>
                          <Etiqueta obligatorio={item.obligatorio} />
                        </div>
                        <Detalle clave={clave} item={item} onAccion={onAccion} />
                      </li>
                    );
                  })}
                </ul>
              </Paso>
            </ol>
          </section>
        </div>

        <footer className="sp-pie">
          <div className="sp-mensajes">
          {puedeProgramar ? (
            <p className="sp-mensaje sp-mensaje-ok" id="sp-mensaje">
              <LuCircleCheck className="icon" aria-hidden="true" />
              <span>Todos los requisitos obligatorios están completos.</span>
            </p>
          ) : (
            <p
              className={`sp-mensaje ${ev.estado === 'bloqueada' ? 'sp-mensaje-bloqueada' : 'sp-mensaje-pendiente'}`}
              id="sp-mensaje"
            >
              <LuCircleAlert className="icon" aria-hidden="true" />
              <span>{mensajeFaltantes(ev)}</span>
            </p>
          )}
          {puedeProgramar && ev.opcionalesPendientes.length > 0 && (
            <p className="sp-mensaje sp-mensaje-info">
              <LuInfo className="icon" aria-hidden="true" />
              <span>
                {ev.opcionalesPendientes.map((i) => ITEM_LABEL[i.key]).join(', ')}: opcional pendiente, no bloquea la programación.
              </span>
            </p>
          )}
          </div>
          <Button
            icon={LuCalendarPlus}
            className="sp-programar"
            disabled={!puedeProgramar}
            aria-describedby="sp-mensaje"
            onClick={() => onProgramar(solicitud)}
          >
            Programar cirugía
          </Button>
        </footer>
      </div>
    </div>
  );
}
