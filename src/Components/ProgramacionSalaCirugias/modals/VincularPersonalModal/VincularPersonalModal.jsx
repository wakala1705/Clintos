'use client';

import { useEffect, useRef, useState } from 'react';
import './VincularPersonalModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import CatalogoMedicosModal from '../CatalogoMedicosModal/CatalogoMedicosModal';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { ROLES_PERSONAL } from '@/hooks/ProgramacionSalaCirugias/personalCirugia';
import { soloNombre } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { capitalizarNombre } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { LuPlus, LuUsers, LuX } from 'react-icons/lu';

// "Vincular personal" (tab Personal clínico del detalle, cirugía sin nadie
// asignado): una fila por rol, igual que el paso 2 del wizard "Nueva cirugía"
// (mismos roles de ROLES_PERSONAL y mismo selector, CatalogoMedicosModal).
// `onConfirmar` recibe `[{ rol, nombre }]`; "Vincular" se habilita con al menos
// una persona. Cada rol admite varias.
// Con `inicial` (el personal ya vinculado) es "Editar personal": abre con esa lista y
// "Guardar cambios" se habilita solo si algo cambió (puede quedar vacía).
export default function VincularPersonalModal({ inicial, onConfirmar, onClose }) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);
  const editando = Boolean(inicial);
  const [personal, setPersonal] = useState(inicial ?? []);
  const [rolAbierto, setRolAbierto] = useState(null);

  // Escape cierra solo este modal; con el catálogo encima, lo cierra el catálogo.
  useEffect(() => {
    if (rolAbierto) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, rolAbierto]);

  function handleAgregar(rol, valor) {
    const nombre = soloNombre(valor);
    if (personal.some((p) => p.rol === rol && p.nombre === nombre)) return;
    setPersonal([...personal, { rol, nombre }]);
  }

  const puedeConfirmar = editando
    ? JSON.stringify(personal) !== JSON.stringify(inicial)
    : personal.length > 0;

  function handleConfirmar() {
    if (!puedeConfirmar) return;
    onConfirmar(personal);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div ref={modalRef} className="modal-card vpm-modal-card" role="dialog" aria-modal="true" aria-labelledby="vpm-title">
        <ModalHeader
          icon={LuUsers}
          tone="primary"
          title={editando ? 'Editar personal' : 'Vincular personal'}
          titleId="vpm-title"
          onClose={onClose}
          closeLabel={editando ? 'Cerrar edición de personal' : 'Cerrar vinculación de personal'}
        />
        <div className="modal-body vpm-body">
          <ul className="vpm-roles">
            {ROLES_PERSONAL.map(({ rol, catalogo }) => {
              const delRol = personal.filter((p) => p.rol === rol);
              return (
                <li className="vpm-rol" key={rol}>
                  <div className="vpm-rol-label">
                    <span className="vpm-rol-nombre">{rol}</span>
                    {delRol.length === 0 && <span className="vpm-rol-sub">Opcional</span>}
                  </div>
                  {delRol.length > 0 && (
                    <ul className="vpm-personas">
                      {delRol.map((p) => (
                        <li className="vpm-persona" key={p.nombre}>
                          <span className="vpm-persona-nombre">{capitalizarNombre(p.nombre)}</span>
                          <button
                            type="button"
                            className="ncw-icon-btn vpm-quitar"
                            onClick={() => setPersonal(personal.filter((x) => x !== p))}
                            aria-label={`Quitar ${rol} ${capitalizarNombre(p.nombre)}`}
                            title="Quitar"
                          >
                            <LuX className="icon" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    className="ncw-icon-btn ncw-icon-btn-primary vpm-agregar"
                    onClick={() => setRolAbierto({ rol, catalogo })}
                    aria-label={delRol.length === 0 ? `Agregar ${rol.toLowerCase()}` : `Agregar otro ${rol.toLowerCase()}`}
                    title={delRol.length === 0 ? `Agregar ${rol.toLowerCase()}` : `Agregar otro ${rol.toLowerCase()}`}
                  >
                    <LuPlus className="icon" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" disabled={!puedeConfirmar} onClick={handleConfirmar}>{editando ? 'Guardar cambios' : 'Vincular personal'}</Button>
        </div>
      </div>

      {rolAbierto && (
        <CatalogoMedicosModal
          tipo={rolAbierto.catalogo}
          onSelect={(valor) => handleAgregar(rolAbierto.rol, valor)}
          onClose={() => setRolAbierto(null)}
        />
      )}
    </div>
  );
}
