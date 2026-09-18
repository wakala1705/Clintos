'use client';

import { useRef, useState } from 'react';
import './RowActionsMenu.css';
import AccionesMegaMenu from '@/Components/Admisiones/AccionesMegaMenu/AccionesMegaMenu';
import { LuSquareMenu } from 'react-icons/lu';

// Botón (ícono square-menu) de la fila que abre el megamenú de acciones de la admisión (ver
// AccionesMegaMenu). Acá "Editar"/"Detalles" ya son sus propias columnas con
// botón directo (ver AdmisionesTable.jsx, mismo layout de la referencia).
// Estado de apertura local; el megamenú se ancla a este botón (borde derecho
// con borde derecho) y se cierra solo tras elegir una acción. Al cerrarse el
// foco vuelve al botón: el panel se desmonta con el foco adentro.
export default function RowActionsMenu({ nombre, onAction }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleAction(item) {
    close();
    onAction(item);
  }

  return (
    <div className="adm-row-menu">
      <button
        type="button"
        ref={triggerRef}
        className="adm-row-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Más acciones para ${nombre}`}
        title="Más acciones"
      >
        <LuSquareMenu className="icon" />
      </button>

      {open && <AccionesMegaMenu anchorRef={triggerRef} onClose={close} onAction={handleAction} />}
    </div>
  );
}
