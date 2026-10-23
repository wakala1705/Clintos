'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import './SeleccionarSolicitudModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import { LuUserPlus } from 'react-icons/lu';
import OrigenTag from '../GestionCirugias/OrigenTag/OrigenTag';
import PrioridadTag from '../GestionCirugias/PrioridadTag/PrioridadTag';
import DiagnosticoTag from '../GestionCirugias/DiagnosticoTag/DiagnosticoTag';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import {
  capitalizarNombre, filtrarSolicitudes, inicialesPaciente,
} from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { ORIGEN_LABEL } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';

import SearchField from '@/Components/SearchField/SearchField';
const OPCIONES_ORIGEN = [
  { value: '', label: 'Todos' },
  ...Object.entries(ORIGEN_LABEL).map(([value, label]) => ({ value, label })),
];

// Modal de "Programar cirugía" en la agenda: lista solo las solicitudes de
// Gestión de cirugías con la lista de chequeo completa (estado 'lista', ver
// evaluarSolicitud). Elegir una avisa al padre (`onElegir`), que abre el
// wizard "Nueva cirugía" con la solicitud precargada. "Programar otro paciente"
// (onOtroPaciente) abre el buscador de pacientes del flujo anterior, para
// agendar a alguien que no está en esta lista.
export default function SeleccionarSolicitudModal({
  solicitudes, onClose, onElegir, onOtroPaciente, cirujano,
}) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);

  const [busqueda, setBusqueda] = useState('');
  const [origen, setOrigen] = useState('');

  // Base sin el filtro de origen, para contar cada segmento.
  const listas = useMemo(
    () => filtrarSolicitudes(solicitudes, { busqueda, estado: 'lista' }),
    [solicitudes, busqueda],
  );
  const visibles = origen ? listas.filter((s) => s.origen === origen) : listas;
  // Solicitud marcada en la tabla; si un filtro la saca de la lista visible,
  // deja de contar como selección (y "Programar" vuelve a deshabilitarse).
  const [seleccionId, setSeleccionId] = useState(null);
  const seleccionada = visibles.find((s) => s.id === seleccionId) ?? null;
  const opciones = OPCIONES_ORIGEN.map((o) => ({
    ...o,
    count: o.value ? listas.filter((s) => s.origen === o.value).length : listas.length,
  }));
  const totalListas = useMemo(
    () => filtrarSolicitudes(solicitudes, { estado: 'lista' }).length,
    [solicitudes],
  );

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay open">
      <div
        ref={modalRef}
        className="modal-card sso-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sso-title"
      >
        <ModalHeader
          title="Programar cirugía"
          titleId="sso-title"
          subtitle={cirujano ? `Cirujano: ${capitalizarNombre(cirujano)}` : undefined}
          onClose={onClose}
          closeLabel="Cerrar selección de solicitud"
        />

        <div className="filter-bar sso-toolbar">
          <SearchField className="psc-search" value={busqueda} onChange={(v) => setBusqueda(v)} placeholder="Paciente, documento o procedimiento" ariaLabel="Buscar por paciente, documento o procedimiento" />
          <span className="filter-spacer" />
          <SegmentedFilterBar
            options={opciones}
            value={origen}
            onChange={setOrigen}
            ariaLabel="Filtrar por origen de la orden"
          />
        </div>

        {visibles.length === 0 ? (
          <div className="sso-vacio" role="status">
            <strong>
              {totalListas === 0
                ? 'No hay solicitudes listas para programar'
                : 'Ninguna solicitud coincide con la búsqueda'}
            </strong>
            <span>
              {totalListas === 0
                ? 'Completa la lista de chequeo de una solicitud en Gestión de cirugías para poder programarla.'
                : 'Prueba con otro nombre, documento u origen.'}
            </span>
          </div>
        ) : (
          <div className="sso-scroll">
            <table className="sso-table">
              <caption className="sso-sr">Solicitudes listas para programar</caption>
              <thead>
                <tr>
                  <th scope="col">Paciente</th>
                  <th scope="col">Procedimiento</th>
                  <th scope="col">Tercero</th>
                  <th scope="col">Prioridad</th>
                  <th scope="col">Diagnóstico</th>
                  <th scope="col">Origen</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((s) => (
                  <tr
                    key={s.id}
                    className={s.id === seleccionId ? 'selected' : undefined}
                    tabIndex={0}
                    aria-selected={s.id === seleccionId}
                    onClick={() => setSeleccionId(s.id)}
                    onDoubleClick={() => onElegir(s)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' || e.target !== e.currentTarget) return;
                      // Enter marca la fila; sobre la ya marcada equivale al doble clic.
                      if (s.id === seleccionId) onElegir(s);
                      else setSeleccionId(s.id);
                    }}
                  >
                    <td>
                      <div className="sso-paciente-cell">
                        <PatientAvatar iniciales={inicialesPaciente(s.paciente.nombre)} className="sso-avatar" />
                        <span className="sso-main sso-paciente">{s.paciente.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <span className="sso-main sso-procedimiento">{s.procedimiento}</span>
                    </td>
                    <td className="sso-tercero">{s.eps || '—'}</td>
                    <td><PrioridadTag prioritaria={s.prioritaria} /></td>
                    <td><DiagnosticoTag primeraVez={s.primeraVez} /></td>
                    <td><OrigenTag origen={s.origen} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="sso-pie">
          {onOtroPaciente && (
            <Button variant="secondary-accent" icon={LuUserPlus} onClick={onOtroPaciente}>
              Programar otro paciente
            </Button>
          )}
          <Button className="sso-programar" disabled={!seleccionada} onClick={() => onElegir(seleccionada)}>
            Programar
          </Button>
        </div>
      </div>
    </div>
  );
}
