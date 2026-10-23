'use client';

import { useEffect, useRef, useState } from 'react';
import './VincularEquiposModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import CatalogoEquiposModal from '../CatalogoEquiposModal/CatalogoEquiposModal';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { LuPlus, LuStethoscope, LuX } from 'react-icons/lu';

// "Vincular equipos" (tab Equipos del detalle, cirugía sin equipos): se arma la
// lista con el mismo catálogo del paso 4 del wizard (CatalogoEquiposModal, uno
// por vez). `onConfirmar` recibe `[{ nombre, tipo, identificacion }]`;
// "Vincular" se habilita con al menos un equipo.
// Con `inicial` (los equipos ya vinculados) es "Editar equipos": abre con esa lista y
// "Guardar cambios" se habilita solo si algo cambió (puede quedar vacía).
export default function VincularEquiposModal({ inicial, onConfirmar, onClose }) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);
  const editando = Boolean(inicial);
  const [equipos, setEquipos] = useState(inicial ?? []);
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);

  // Escape cierra solo este modal; con el catálogo encima, lo cierra el catálogo.
  useEffect(() => {
    if (catalogoAbierto) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, catalogoAbierto]);

  function handleAgregar(equipo) {
    if (equipos.some((e) => e.identificacion === equipo.identificacion)) return;
    setEquipos([...equipos, equipo]);
  }

  const ids = (lista) => lista.map((e) => e.identificacion).join('|');
  const puedeConfirmar = editando ? ids(equipos) !== ids(inicial) : equipos.length > 0;

  function handleConfirmar() {
    if (!puedeConfirmar) return;
    onConfirmar(equipos);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div ref={modalRef} className="modal-card vem-modal-card" role="dialog" aria-modal="true" aria-labelledby="vem-title">
        <ModalHeader
          icon={LuStethoscope}
          tone="primary"
          title={editando ? 'Editar equipos' : 'Vincular equipos'}
          titleId="vem-title"
          onClose={onClose}
          closeLabel={editando ? 'Cerrar edición de equipos' : 'Cerrar vinculación de equipos'}
        />
        <div className="modal-body vem-body">
          <div className="vem-cabecera">
            <span className="vem-contador" aria-live="polite">
              {equipos.length === 0 ? 'Aún no has agregado equipos.' : `${equipos.length} ${equipos.length === 1 ? 'equipo agregado' : 'equipos agregados'}`}
            </span>
            <Button type="button" variant="outline" size="sm" icon={LuPlus} onClick={() => setCatalogoAbierto(true)}>
              Agregar equipo
            </Button>
          </div>
          {equipos.length > 0 && (
            <ul className="vem-lista">
              {equipos.map((e) => (
                <li className="vem-equipo" key={e.identificacion}>
                  <span className="vem-equipo-texto">
                    <span className="vem-equipo-nombre">{e.nombre}</span>
                    <span className="vem-equipo-sub">{e.tipo} · {e.identificacion}</span>
                  </span>
                  <button
                    type="button"
                    className="ncw-icon-btn vem-quitar"
                    onClick={() => setEquipos(equipos.filter((x) => x.identificacion !== e.identificacion))}
                    aria-label={`Quitar ${e.nombre}`}
                    title="Quitar"
                  >
                    <LuX className="icon" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" disabled={!puedeConfirmar} onClick={handleConfirmar}>{editando ? 'Guardar cambios' : 'Vincular equipos'}</Button>
        </div>
      </div>

      {catalogoAbierto && (
        <CatalogoEquiposModal onSelect={handleAgregar} onClose={() => setCatalogoAbierto(false)} />
      )}
    </div>
  );
}
