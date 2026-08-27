'use client';

import { useMemo, useState } from 'react';
import './HistorialCamaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import EstadoCamaBadge from '../EstadoCamaBadge/EstadoCamaBadge';
import { AREA_LABEL, SEDE_LABEL } from '@/hooks/GestionCamas/mockCamasData';
import {
  AHORA_HISTORIAL, EVENTOS_HISTORIAL, EVENTO_LABEL, ESTADOS_HISTORIAL, FECHA_PRESETS_HISTORIAL,
  formatFechaHistorial, generarHistorialCama,
} from '@/hooks/GestionCamas/mockHistorialCamaData';
import { LuFilterX, LuHistory, LuSearch } from 'react-icons/lu';

const FILTROS_INICIALES = {
  fecha: 'todos', usuario: 'todos', evento: 'todos', estado: 'todos', paciente: '', admision: '',
};

const UN_DIA_MS = 86400000;

// "Historial" (menú "⋯" de cada cama, ver mockCamasData.js/MENU_ACCIONES) —
// reemplaza el aviso "en desarrollo" que tenía esta acción. Reusa el mismo
// punto de entrada que "Ver historial completo" dentro de BedDetailModal
// (encargo: un solo lugar para ver el historial completo de una cama, no 2
// UI distintas — ver BedDetailModal.jsx, que ya no tiene su propio drill-in
// interno). El historial en sí es generado (generarHistorialCama, ver
// mockHistorialCamaData.js) porque hace falta uno por cada una de las 199
// camas del inventario, no una semilla curada chica como Mantenimiento.
export default function HistorialCamaModal({ cama, onClose }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

  // Depende solo de cama.id (no de `cama` completo): `cama` es una nueva
  // referencia en cada render del padre (camas.find(...), ver
  // GestionCamas.jsx) aunque sus datos no cambien — regenerar el historial
  // en cada render perdería el propósito de useMemo.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const historial = useMemo(() => generarHistorialCama(cama), [cama.id]);

  const usuarioOptions = useMemo(() => {
    const usuarios = [...new Set(historial.map((ev) => ev.usuario))];
    return [{ value: 'todos', label: 'Todos los usuarios' }, ...usuarios.map((u) => ({ value: u, label: u }))];
  }, [historial]);

  const eventosFiltrados = useMemo(() => {
    const pacienteQ = filtros.paciente.trim().toLowerCase();
    const admisionQ = filtros.admision.trim().toLowerCase();
    return historial.filter((ev) => {
      if (filtros.usuario !== 'todos' && ev.usuario !== filtros.usuario) return false;
      if (filtros.evento !== 'todos' && ev.evento !== filtros.evento) return false;
      if (filtros.estado !== 'todos' && ev.estado !== filtros.estado) return false;
      if (pacienteQ && !(ev.paciente ?? '').toLowerCase().includes(pacienteQ)) return false;
      if (admisionQ && !(ev.admisionId ?? '').toLowerCase().includes(admisionQ)) return false;
      if (filtros.fecha === 'hoy') {
        const inicioHoy = AHORA_HISTORIAL - (AHORA_HISTORIAL % UN_DIA_MS);
        if (ev.fecha < inicioHoy || ev.fecha >= inicioHoy + UN_DIA_MS) return false;
      } else if (filtros.fecha === '7d') {
        if (ev.fecha < AHORA_HISTORIAL - 7 * UN_DIA_MS) return false;
      } else if (filtros.fecha === '30d') {
        if (ev.fecha < AHORA_HISTORIAL - 30 * UN_DIA_MS) return false;
      }
      return true;
    });
  }, [historial, filtros]);

  function handleChangeFiltro(key, value) {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  }

  const cantidadFiltrosActivos = Object.entries(filtros)
    .filter(([key, value]) => (key === 'paciente' || key === 'admision' ? value.trim() !== '' : value !== 'todos'))
    .length;

  return (
    <div className="modal-overlay open" role="presentation" onClick={onClose}>
      <div
        className="modal-card hcm-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hcm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          icon={LuHistory}
          title={`Historial · Cama ${cama.numero}`}
          titleId="hcm-title"
          subtitle={`${SEDE_LABEL[cama.sede]} · ${AREA_LABEL[cama.area]}`}
          onClose={onClose}
        />

        <div className="modal-body hcm-body">
          <div className="hcm-filters">
            <div className="form-field">
              <label htmlFor="hcm-fecha">Fecha</label>
              <FormSelect id="hcm-fecha" value={filtros.fecha} onChange={(v) => handleChangeFiltro('fecha', v)} options={FECHA_PRESETS_HISTORIAL} />
            </div>
            <div className="form-field">
              <label htmlFor="hcm-usuario">Usuario</label>
              <FormSelect id="hcm-usuario" value={filtros.usuario} onChange={(v) => handleChangeFiltro('usuario', v)} options={usuarioOptions} />
            </div>
            <div className="form-field">
              <label htmlFor="hcm-evento">Evento</label>
              <FormSelect id="hcm-evento" value={filtros.evento} onChange={(v) => handleChangeFiltro('evento', v)} options={EVENTOS_HISTORIAL} />
            </div>
            <div className="form-field">
              <label htmlFor="hcm-estado">Estado</label>
              <FormSelect id="hcm-estado" value={filtros.estado} onChange={(v) => handleChangeFiltro('estado', v)} options={ESTADOS_HISTORIAL} />
            </div>
            <div className="form-field">
              <label htmlFor="hcm-paciente">Paciente</label>
              <div className="hcm-search-field">
                <LuSearch className="icon" aria-hidden="true" />
                <input
                  id="hcm-paciente"
                  type="text"
                  placeholder="Buscar paciente..."
                  value={filtros.paciente}
                  onChange={(e) => handleChangeFiltro('paciente', e.target.value)}
                />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="hcm-admision">Admisión</label>
              <div className="hcm-search-field">
                <LuSearch className="icon" aria-hidden="true" />
                <input
                  id="hcm-admision"
                  type="text"
                  placeholder="Buscar admisión..."
                  value={filtros.admision}
                  onChange={(e) => handleChangeFiltro('admision', e.target.value)}
                />
              </div>
            </div>
            {cantidadFiltrosActivos > 0 && (
              <button type="button" className="btn btn-secondary btn-sm hcm-limpiar-btn" onClick={() => setFiltros(FILTROS_INICIALES)}>
                <LuFilterX className="icon" aria-hidden="true" />
                Limpiar filtros
                <span className="badge-count">{cantidadFiltrosActivos}</span>
              </button>
            )}
          </div>

          {eventosFiltrados.length === 0 ? (
            <div className="cb-activity-empty">No se encontraron eventos con estos filtros.</div>
          ) : (
            <ol className="hcm-timeline">
              {eventosFiltrados.map((ev, idx) => (
                <li key={ev.id} className="hcm-timeline-item">
                  <div className="hcm-timeline-rail">
                    <span className="hcm-timeline-dot" />
                    {idx < eventosFiltrados.length - 1 && <span className="hcm-timeline-line" />}
                  </div>
                  <div className="hcm-timeline-content">
                    <span className="hcm-timeline-fecha">{formatFechaHistorial(ev.fecha)}</span>
                    <div className="hcm-timeline-headline">
                      <span className="hcm-timeline-evento">{EVENTO_LABEL[ev.evento]}</span>
                      <EstadoCamaBadge estado={ev.estado} />
                    </div>
                    {(ev.paciente || ev.admisionId || ev.usuario || ev.motivo) && (
                      <div className="hcm-timeline-detail">
                        {ev.paciente && <span><strong>Paciente:</strong> {ev.paciente}</span>}
                        {ev.admisionId && <span><strong>Admisión:</strong> {ev.admisionId}</span>}
                        {ev.usuario && <span><strong>Usuario:</strong> {ev.usuario}</span>}
                        {ev.motivo && <span><strong>Motivo:</strong> {ev.motivo}</span>}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
