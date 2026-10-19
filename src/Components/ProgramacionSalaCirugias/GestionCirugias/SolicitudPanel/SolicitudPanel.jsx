'use client';

import { useEffect, useRef } from 'react';
import {
  LuCalendarPlus, LuChevronRight, LuEye, LuFileText, LuFlaskConical, LuMicroscope, LuScanLine,
  LuShieldCheck, LuStethoscope,
} from 'react-icons/lu';
import './SolicitudPanel.css';
import Button from '@/Components/Button/Button';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import EstadoChip from '../EstadoChip/EstadoChip';
import MensajeInfo from './MensajeInfo/MensajeInfo';
import { ORIGEN_LABEL, listaProcedimientos } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';
import { capitalizarNombre } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import {
  ESTADO_GENERAL_LABEL, ESTADO_ITEM_LABEL, ITEM_LABEL, TONO_GENERAL, TONO_ITEM,
  accionItem, enmascararDocumento, estadoEstudios, evaluarSolicitud, mensajeFaltantes,
} from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';

// Ícono de cada requisito, junto a su título.
const ICONO_ITEM = {
  orden: LuFileText,
  estudios: LuMicroscope,
  laboratorios: LuFlaskConical,
  imagenes: LuScanLine,
  valoracion: LuStethoscope,
  autorizacion: LuShieldCheck,
};

// Solo se marca lo que se sale de la regla: todo es obligatorio salvo lo que dice "Opcional".
function Opcional() {
  return <span className="sp-opcional">Opcional</span>;
}

// Estado de una fila: lo completo es solo el ícono en badge (igual que las columnas de
// la tabla principal, con el texto para lectores de pantalla); lo pendiente/bloqueado/no
// requerido lleva el chip con texto, así el ojo va directo a lo que requiere acción.
function EstadoFila({ estado }) {
  const tone = TONO_ITEM[estado];
  if (estado !== 'ok') return <EstadoChip tone={tone}>{ESTADO_ITEM_LABEL[estado]}</EstadoChip>;
  return <EstadoChip tone={tone} iconOnly srLabel={ESTADO_ITEM_LABEL[estado]} />;
}

// Una fila de la lista de chequeo: título + detalle | estado | consulta.
// - Requisito completo: la acción es una consulta ("Ver orden") -> botón de solo ícono.
// - Requisito pendiente: la acción es una tarea ("Solicitar autorización") -> botón
//   con texto bajo el detalle, más visible que una consulta.
// `children` (subfilas) va debajo, a ancho completo.
function Fila({
  titulo, icono: Icono, estado, obligatorio, detalle, accion, onAccion, sub = false, children,
}) {
  const esConsulta = accion && estado === 'ok';
  const esTarea = accion && estado !== 'ok';
  return (
    <li className={`sp-fila${sub ? ' sp-fila-sub' : ''}`}>
      <div className="sp-fila-texto">
        <h4 className="sp-fila-titulo">
          {Icono && <Icono className="icon sp-fila-icono" aria-hidden="true" />}
          {titulo}
          {!obligatorio && <Opcional />}
        </h4>
        {detalle && <p className="sp-detalle">{detalle}</p>}
        {esTarea && (
          <Button variant="outline" size="sm" className="sp-tarea" onClick={onAccion}>{accion}</Button>
        )}
      </div>
      <div className="sp-fila-estado"><EstadoFila estado={estado} /></div>
      <div className="sp-fila-consulta">
        {esConsulta && (
          <button type="button" className="sp-icon-btn" onClick={onAccion} aria-label={accion} title={accion}>
            <LuEye className="icon" aria-hidden="true" />
          </button>
        )}
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

// Modal con el detalle del chequeo de una solicitud: datos, los requisitos y la
// acción "Programar cirugía" (que abre el modal de la agenda encima). Con
// `onSiguiente` (hay otra solicitud después de esta en la lista) ofrece pasar a
// ella sin cerrar; `posicion` ({ indice, total }) dice dónde se está en la cola.
export default function SolicitudPanel({
  solicitud, onClose, onAccion, onProgramar, onSiguiente, posicion,
}) {
  const panelRef = useRef(null);
  useModalFocusTrap(panelRef);
  const ev = evaluarSolicitud(solicitud);
  const { checklist } = solicitud;
  const puedeProgramar = ev.estado === 'lista';
  // El mensaje (ícono de info junto al estado de la lista) solo existe cuando falta algo (o hay un opcional pendiente).
  const hayMensajes = !puedeProgramar || ev.opcionalesPendientes.length > 0;
  const textoMensaje = !puedeProgramar
    ? mensajeFaltantes(ev)
    : `${ev.opcionalesPendientes.map((i) => ITEM_LABEL[i.key]).join(', ')}: opcional pendiente, no bloquea la programación.`;
  const estudiosObligatorio = checklist.laboratorios.obligatorio || checklist.imagenes.obligatorio;

  // Orden de las filas = orden de las columnas de la tabla.
  function filaDe(clave, titulo, sub = false) {
    const item = checklist[clave];
    const accion = accionItem(clave, item.estado);
    return (
      <Fila
        key={clave}
        titulo={titulo}
        icono={ICONO_ITEM[clave]}
        estado={item.estado}
        obligatorio={item.obligatorio}
        detalle={item.detalle}
        accion={accion}
        onAccion={() => onAccion(accion, ITEM_LABEL[clave], clave)}
        sub={sub}
      />
    );
  }

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
          title="Chequeo prequirúrgico"
          titleId="sp-titulo"
          onClose={onClose}
          closeLabel="Cerrar chequeo de la solicitud"
        />

        <div className="sp-cuerpo">
          <section className="sp-bloque sp-bloque-datos" aria-labelledby="sp-datos-titulo">
            <div className="sp-seccion-fila">
              <h3 id="sp-datos-titulo" className="sp-seccion">Datos</h3>
            </div>
            <div className="sp-datos">
              <dl className="sp-grupo">
                <Dato label="Paciente">
                  {solicitud.paciente.nombre}
                  <span className="sp-dato-sub">
                    {enmascararDocumento(solicitud.paciente.tipoDocumento, solicitud.paciente.numeroDocumento)} · {solicitud.paciente.edad} años
                  </span>
                </Dato>
              </dl>
              <dl className="sp-grupo">
                <Dato label={`Orden · ${ORIGEN_LABEL[solicitud.origen]}`}>
                  {solicitud.ordenNumero}
                  <span className="sp-dato-sub">{capitalizarNombre(solicitud.medicoOrdena)}</span>
                  {solicitud.institucionRemite && <span className="sp-dato-sub">{solicitud.institucionRemite}</span>}
                </Dato>
                <Dato label="CUPS · Procedimientos">
                  {listaProcedimientos(solicitud).map((p) => (
                    <span key={p.nombre} className="sp-dato-proc">{p.cups} · {p.nombre}</span>
                  ))}
                  <span className="sp-dato-sub">{solicitud.especialidad}</span>
                </Dato>
              </dl>
              <dl className="sp-grupo sp-grupo-terceros">
                <Dato label="Terceros">
                  {solicitud.eps}
                  <span className="sp-dato-sub">Entidad pagadora · {solicitud.regimen}</span>
                  <span className="sp-dato-sub">Contrato {solicitud.contrato}</span>
                </Dato>
              </dl>
            </div>
          </section>

          <section className="sp-bloque" aria-labelledby="sp-lista-titulo">
            <div className="sp-seccion-fila">
              <h3 id="sp-lista-titulo" className="sp-seccion">Lista de chequeo</h3>
              <div className="sp-estado-general">
                {hayMensajes && !puedeProgramar ? (
                  <MensajeInfo
                    tone={ev.estado === 'bloqueada' ? 'bloqueada' : 'pendiente'}
                    label={ev.estado === 'bloqueada' ? 'Por qué está bloqueada' : 'Por qué está pendiente'}
                    id="sp-mensaje-card"
                  >
                    {textoMensaje}
                  </MensajeInfo>
                ) : (
                  <>
                    <EstadoChip tone={TONO_GENERAL[ev.estado]}>{ESTADO_GENERAL_LABEL[ev.estado]}</EstadoChip>
                    {hayMensajes && (
                      <MensajeInfo tone="info" label="Ver detalle" id="sp-mensaje-card">{textoMensaje}</MensajeInfo>
                    )}
                  </>
                )}
              </div>
            </div>
            <ul className="sp-lista">
              {filaDe('orden', 'Orden médica')}
              <Fila titulo="Estudios requeridos" icono={ICONO_ITEM.estudios} estado={estadoEstudios(checklist)} obligatorio={estudiosObligatorio}>
                <ul className="sp-sub">
                  {filaDe('laboratorios', 'Laboratorios', true)}
                  {filaDe('imagenes', 'Estudios de imágenes', true)}
                </ul>
              </Fila>
              {filaDe('valoracion', 'Valoración preanestésica')}
              {filaDe('autorizacion', 'Autorización de la EPS')}
            </ul>
          </section>
        </div>

        <footer className="sp-pie">
          {hayMensajes && <span className="sp-sr" id="sp-mensaje">{textoMensaje}</span>}
          <div className="sp-acciones">
            {onSiguiente && (
              <>
                {posicion && (
                  <span className="sp-posicion" aria-live="polite">
                    {posicion.indice} de {posicion.total}
                  </span>
                )}
                <Button variant="outline" className="sp-siguiente" onClick={onSiguiente}>
                  Siguiente solicitud
                  <LuChevronRight className="sp-siguiente-icono" aria-hidden="true" />
                </Button>
              </>
            )}
            <Button
              icon={LuCalendarPlus}
              className="sp-programar"
              disabled={!puedeProgramar}
              aria-describedby={hayMensajes ? 'sp-mensaje' : undefined}
              onClick={() => onProgramar(solicitud)}
            >
              Programar cirugía
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
