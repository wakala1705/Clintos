'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LuSearch } from 'react-icons/lu';
import './SeleccionarSolicitudModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import OrigenTag from '../GestionCirugias/OrigenTag/OrigenTag';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { enmascararDocumento, filtrarSolicitudes } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { ORIGEN_LABEL } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';
import { duracionEstimadaMin } from '@/hooks/ProgramacionSalaCirugias/gestion/programacion';
import { MINUTOS_FRANJA, duracionLabel } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';

const OPCIONES_ORIGEN = [
  { value: '', label: 'Todos' },
  ...Object.entries(ORIGEN_LABEL).map(([value, label]) => ({ value, label })),
];

// Modal de "Programar cirugía" en la agenda: lista solo las solicitudes de
// Gestión de cirugías con la lista de chequeo completa (estado 'lista', ver
// evaluarSolicitud). Elegir una avisa al padre (`onElegir`), que abre el
// wizard "Nueva cirugía" con la solicitud precargada.
export default function SeleccionarSolicitudModal({ solicitudes, onClose, onElegir }) {
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
          subtitle={`${totalListas} ${totalListas === 1 ? 'solicitud lista' : 'solicitudes listas'} para programar`}
          onClose={onClose}
          closeLabel="Cerrar selección de solicitud"
        />

        <div className="filter-bar sso-toolbar">
          <div className="search-field">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Paciente, documento o procedimiento"
              aria-label="Buscar por paciente, documento o procedimiento"
            />
          </div>
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
                  <th scope="col">Origen</th>
                  <th scope="col">Médico</th>
                  <th scope="col">Duración estimada</th>
                  <th scope="col"><span className="sso-sr">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((s) => (
                  <tr key={s.id} onClick={() => onElegir(s)}>
                    <td>
                      <span className="sso-main">{s.paciente.nombre}</span>
                      <span className="sso-sub">
                        {enmascararDocumento(s.paciente.tipoDocumento, s.paciente.numeroDocumento)}
                      </span>
                    </td>
                    <td>
                      <span className="sso-main">{s.procedimiento}</span>
                      <span className="sso-sub">{s.especialidad}</span>
                    </td>
                    <td><OrigenTag origen={s.origen} /></td>
                    <td>{s.cirujano ?? s.medicoOrdena}</td>
                    <td>{duracionLabel(duracionEstimadaMin(s) / MINUTOS_FRANJA)}</td>
                    <td className="sso-accion">
                      <Button
                        size="sm"
                        className="sso-programar"
                        aria-label={`Programar cirugía de ${s.paciente.nombre}`}
                        onClick={(e) => { e.stopPropagation(); onElegir(s); }}
                      >
                        Programar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
