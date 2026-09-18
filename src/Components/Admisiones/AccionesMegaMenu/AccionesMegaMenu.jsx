'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import './AccionesMegaMenu.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import {
  LuArrowLeftRight, LuCircleAlert, LuCircleX, LuFile, LuFileText, LuFolder,
  LuInfo, LuLogOut, LuPercent, LuRows3, LuSend, LuStethoscope, LuBedSingle,
} from 'react-icons/lu';

// Columnas del megamenú — `tone` decide el color de la franja y de los
// íconos (ver AccionesMegaMenu.css). Los ítems son de acción sobre la
// admisión de la fila; el padre decide qué hace cada uno vía `onAction`.
const COLUMNAS = [
  {
    id: 'clinicas',
    label: 'Clínicas',
    tone: 'primary',
    items: [
      { id: 'historia-clinica', label: 'Historia clínica', icon: LuStethoscope },
      { id: 'cambiar-habitacion', label: 'Cambiar habitación', icon: LuBedSingle },
      { id: 'remisiones', label: 'Remisiones', icon: LuSend },
      { id: 'soat', label: 'SOAT', icon: LuStethoscope },
      { id: 'revisar', label: 'Revisar', icon: LuFileText },
      { id: 'traslado-area-funcional', label: 'Traslado área funcional', icon: LuArrowLeftRight },
      { id: 'asignar-consultorio', label: 'Asignar consultorio', icon: LuStethoscope },
      { id: 'dar-alta', label: 'Dar alta', icon: LuLogOut },
    ],
  },
  {
    id: 'administrativas',
    label: 'Administrativas',
    tone: 'success',
    items: [
      { id: 'facturas', label: 'Facturas', icon: LuFileText },
      { id: 'facturacion', label: 'Facturación', icon: LuFileText },
      { id: 'nueva-desde-prog-cirugia', label: 'Nueva desde prog. cirugía', icon: LuFileText },
      { id: 'reenviar-a-caja', label: 'Reenviar a caja', icon: LuArrowLeftRight },
      { id: 'bonos-a-caja', label: 'Bonos a caja', icon: LuFileText },
      { id: 'descuentos', label: 'Descuentos', icon: LuPercent },
      { id: 'reliquidar', label: 'Reliquidar', icon: LuFileText },
      { id: 'cargos', label: 'Cargos', icon: LuFileText },
      { id: 'resumen-contrato', label: 'Resumen contrato', icon: LuFileText },
      { id: 'contratos-relacionados', label: 'Contratos relacionados', icon: LuFile },
      { id: 'agregar-a-bd-de-contrato', label: 'Agregar a BD de contrato', icon: LuRows3 },
    ],
  },
  {
    id: 'validaciones',
    label: 'Validaciones',
    tone: 'warning',
    items: [
      { id: 'mov-sin-confirmar', label: 'Mov. sin confirmar', icon: LuCircleAlert },
      { id: 'no-procesar', label: 'No procesar', icon: LuCircleX },
    ],
  },
  {
    id: 'gestion-documental',
    label: 'Gestión documental',
    tone: 'neutral',
    items: [
      { id: 'documentos', label: 'Documentos', icon: LuFolder },
      { id: 'informacion-adicional', label: 'Información adicional', icon: LuInfo },
    ],
  },
];

// Panel con las acciones de una admisión agrupadas en 4 columnas, anclado al
// botón que lo abrió (`anchorRef`): su borde derecho queda alineado al borde
// derecho del botón, igual que RowMoreMenu. Se monta en document.body con
// position:fixed vía createPortal para no quedar recortado por el overflow de
// la tabla (mismo criterio que FormSelect, ver AGENTS.md); el padre solo lo
// renderiza mientras está abierto, así que `document` siempre existe acá.
// Si no entra hacia abajo se abre hacia arriba, y si tampoco entero se limita
// el alto y scrollea el cuerpo. Usa el header homologado de ModalHeader.
const GAP = 4;
const MARGIN = 8;

export default function AccionesMegaMenu({ anchorRef, onClose, onAction }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    function updatePos() {
      const anchor = anchorRef.current;
      const menu = menuRef.current;
      if (!anchor || !menu) return;
      const rect = anchor.getBoundingClientRect();
      const { innerWidth, innerHeight } = window;
      const width = menu.offsetWidth;
      // Alto "natural" (sin recortar): el cuerpo mide su scrollHeight aunque
      // ya esté limitado por max-height, header y footer no se achican.
      const natural = Array.from(menu.children).reduce(
        (h, c) => h + (c.classList.contains('adm-mm-body') ? c.scrollHeight : c.offsetHeight),
        2,
      );
      const below = innerHeight - rect.bottom - GAP - MARGIN;
      const above = rect.top - GAP - MARGIN;
      const placeBelow = natural <= below || below >= above;
      setPos({
        left: Math.max(MARGIN, Math.min(rect.right - width, innerWidth - width - MARGIN)),
        ...(placeBelow ? { top: rect.bottom + GAP } : { bottom: innerHeight - rect.top + GAP }),
        maxHeight: Math.min(natural, placeBelow ? below : above),
      });
    }
    function handleScroll(e) {
      // El cuerpo del propio megamenú scrollea sin mover el ancla.
      if (!menuRef.current?.contains(e.target)) updatePos();
    }
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [anchorRef]);

  useEffect(() => {
    function handleClickOutside(e) {
      const insideMenu = menuRef.current?.contains(e.target);
      const insideAnchor = anchorRef.current?.contains(e.target);
      if (!insideMenu && !insideAnchor) onClose();
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [anchorRef, onClose]);

  // Hasta medir el primer render queda invisible (el efecto de layout corre
  // antes de pintar, así que no hay parpadeo).
  const style = pos ?? { top: 0, left: 0, visibility: 'hidden' };

  return createPortal(
    <div className="adm-mm" ref={menuRef} style={style} role="dialog" aria-labelledby="adm-mm-title">
      <ModalHeader title="Acciones" titleId="adm-mm-title" onClose={onClose} autoFocusClose />

      <div className="adm-mm-body">
        {COLUMNAS.map((col) => (
          <section className={`adm-mm-col tone-${col.tone}`} key={col.id} aria-label={col.label}>
            <h4 className="adm-mm-col-title">{col.label}</h4>
            <ul className="adm-mm-list">
              {col.items.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button type="button" className="adm-mm-item" onClick={() => onAction({ id, label })}>
                    <Icon className="icon" aria-hidden="true" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="adm-mm-footer">
        <button type="button" className="adm-mm-shortcuts" onClick={() => onAction({ id: 'atajos', label: 'Atajos' })}>
          Ver atajos
          <LuInfo className="icon" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
