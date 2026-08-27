'use client';

import { useMemo, useState } from 'react';
import './TrasladarCamaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREA_LABEL, AREAS, PISO_LABEL, PISOS, SECTOR_LABEL, SECTORES, SEDE_LABEL, SEDES,
} from '@/hooks/GestionCamas/mockCamasData';
import { LuArrowRightLeft } from 'react-icons/lu';

// Mismo criterio que NuevaCamaModal.jsx: los catálogos de filtro (SEDES/
// AREAS/PISOS/SECTORES) arrancan con un pseudo-valor "todas/os" que no
// aplica acá — Cama Destino necesita un valor real y concreto, no un filtro.
const SEDE_OPTIONS = SEDES.filter((s) => s.value !== 'todas');
const AREA_OPTIONS = AREAS.filter((a) => a.value !== 'todas');
const PISO_OPTIONS = PISOS.filter((p) => p.value !== 'todos');
const SECTOR_OPTIONS = SECTORES.filter((s) => s.value !== 'todos');

function pad(n) {
  return String(n).padStart(2, '0');
}

// Mismo helper que ReservarCamaModal.jsx (valor de <input type="datetime-local">
// = "ahora" en hora local) — acá sin `min` (a diferencia de Reservar, un
// traslado sí puede registrarse con hora ligeramente retroactiva a la hora
// real del movimiento físico, encargo no confirmado como bloqueante todavía).
function nowDatetimeLocalValue() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "Trasladar" (encargo: reemplaza el aviso "en desarrollo" de
// GestionCamas.jsx) — mueve al paciente de `cama` a otra cama Libre elegida
// por Sede/Área/Piso/Sector Destino (reemplaza los 4 campos de código+lupa
// del formulario legacy de referencia: más seguro que texto libre, ninguna
// combinación inválida u ocupada es seleccionable). Sin pestaña "Log": ese
// historial ya vive en Auditoría/Historial (GestionCamasAuditoria), no se
// duplica acá (encargo explícito).
//
// `camas` es la copia mutable en vivo de GestionCamas.jsx (no el mock
// estático CAMAS): "Cama Destino" tiene que reflejar el estado real de la
// sesión (una cama recién liberada debe aparecer, una recién ocupada debe
// desaparecer), no el snapshot inicial.
export default function TrasladarCamaModal({
  cama, camas, onClose, onConfirm,
}) {
  const [fecha, setFecha] = useState(nowDatetimeLocalValue);
  const [sedeDestino, setSedeDestino] = useState(cama.sede);
  const [areaDestino, setAreaDestino] = useState(cama.area);
  const [pisoDestino, setPisoDestino] = useState(cama.piso);
  const [sectorDestino, setSectorDestino] = useState(cama.sector);
  const [camaDestinoId, setCamaDestinoId] = useState('');

  const camasDestinoDisponibles = useMemo(() => camas.filter((c) => (
    c.estado === 'libre' && c.sede === sedeDestino && c.area === areaDestino
    && c.piso === pisoDestino && c.sector === sectorDestino
  )), [camas, sedeDestino, areaDestino, pisoDestino, sectorDestino]);

  const camaDestinoOptions = camasDestinoDisponibles.map((c) => ({ value: c.id, label: c.numero }));

  const puedeConfirmar = !!camaDestinoId;

  // Cambiar cualquier filtro de destino invalida la Cama Destino ya elegida
  // (puede no existir/no seguir Libre en el nuevo alcance) — mismo criterio
  // de "revalidar lo que depende de lo que acabo de tocar" que
  // ReservarCamaModal.jsx.
  function handleChangeSedeDestino(v) { setSedeDestino(v); setCamaDestinoId(''); }
  function handleChangeAreaDestino(v) { setAreaDestino(v); setCamaDestinoId(''); }
  function handleChangePisoDestino(v) { setPisoDestino(v); setCamaDestinoId(''); }
  function handleChangeSectorDestino(v) { setSectorDestino(v); setCamaDestinoId(''); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onConfirm(cama.id, camaDestinoId, fecha);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card tc-modal-card" role="dialog" aria-modal="true" aria-labelledby="trasladar-cama-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuArrowRightLeft}
            tone="primary"
            title="Trasladar paciente"
            titleId="trasladar-cama-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label>Cama actual</label>
              <div className="tf-readonly-value">
                {cama.numero} — {SEDE_LABEL[cama.sede]} · {AREA_LABEL[cama.area]} · {PISO_LABEL[cama.piso]} · {SECTOR_LABEL[cama.sector]}
              </div>
            </div>

            <div className="form-field">
              <label>Paciente</label>
              <div className="tf-readonly-value">
                {cama.paciente?.nombre ?? '—'} · Admisión {cama.paciente?.admisionId ?? '—'}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="tc-fecha">Fecha y hora de traslado</label>
              <input
                id="tc-fecha"
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            <div className="fp-section-title">Destino</div>

            <div className="tc-row">
              <div className="form-field">
                <label htmlFor="tc-sede-destino">Sede destino</label>
                <FormSelect
                  id="tc-sede-destino"
                  value={sedeDestino}
                  onChange={handleChangeSedeDestino}
                  options={SEDE_OPTIONS}
                />
              </div>
              <div className="form-field">
                <label htmlFor="tc-area-destino">Área destino</label>
                <FormSelect
                  id="tc-area-destino"
                  value={areaDestino}
                  onChange={handleChangeAreaDestino}
                  options={AREA_OPTIONS}
                />
              </div>
            </div>

            <div className="tc-row">
              <div className="form-field">
                <label htmlFor="tc-piso-destino">Piso destino</label>
                <FormSelect
                  id="tc-piso-destino"
                  value={pisoDestino}
                  onChange={handleChangePisoDestino}
                  options={PISO_OPTIONS}
                />
              </div>
              <div className="form-field">
                <label htmlFor="tc-sector-destino">Sector destino</label>
                <FormSelect
                  id="tc-sector-destino"
                  value={sectorDestino}
                  onChange={handleChangeSectorDestino}
                  options={SECTOR_OPTIONS}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="tc-cama-destino">Cama destino</label>
              <FormSelect
                id="tc-cama-destino"
                value={camaDestinoId}
                onChange={setCamaDestinoId}
                options={camaDestinoOptions}
                placeholder={camaDestinoOptions.length === 0 ? 'No hay camas libres con estos filtros' : 'Selecciona una cama'}
                disabled={camaDestinoOptions.length === 0}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!puedeConfirmar}>Confirmar traslado</button>
          </div>
        </form>
      </div>
    </div>
  );
}
