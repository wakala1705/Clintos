'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import './TurnoActivoButton.css';
import {
  LuAlarmClockCheck, LuChevronDown, LuLogIn, LuTriangleAlert,
} from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import CerrarTurnoModal from '@/Components/CerrarTurnoModal/CerrarTurnoModal';
import { useTurnoActivo } from '@/hooks/Turno/turno';

// Meta-item "Turno:" del Topbar (rutas de Gestión de Enfermería, ver
// Topbar.jsx) -- hermano de @/Components/SedePickerButton (mismo look
// .meta-item.picker-btn), pero a diferencia de Sede/Área el detalle se abre
// en un dropdown compacto anclado bajo el botón (portal + position:fixed,
// mismo mecanismo que FormSelect: coords por getBoundingClientRect, cierre
// por click-afuera/Escape), no en un modal con overlay -- es solo estado de
// lectura + un atajo, no una selección. El modal con overlay queda reservado
// para la confirmación destructiva real (ver CerrarTurnoModal).
//
// A diferencia de la versión anterior, este botón SIEMPRE se monta en rutas
// de Gestión de Enfermería (ya no `return null` sin turno activo): sin turno
// muestra "Turno: Sin turno" con un punto gris, y su dropdown ofrece "Abrir
// turno" en vez de estar ausente del header.

// minutos -> "Hace X h Y min" -- mismo formato que "hace" en
// mockAlertasData.js (ver minutosDesdeHace ahí), calculado una sola vez al
// abrir el dropdown (useState lazy), nunca con un reloj corriendo.
function formatoHace(minutos) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `Hace ${mins} min`;
  if (mins === 0) return `Hace ${horas} h`;
  return `Hace ${horas} h ${mins} min`;
}

// true si `apertura` (Date) cae fuera de la ventana [horaInicio, horaFin]
// del turno -- mismo manejo de "cruza medianoche" que duracionHoras en
// hooks/GestionTurnos/mockTurnosData.js.
function fueraDeVentana(apertura, horaInicio, horaFin) {
  const [hi, mi] = horaInicio.split(':').map(Number);
  const [hf, mf] = horaFin.split(':').map(Number);
  const inicioMin = hi * 60 + mi;
  let finMin = hf * 60 + mf;
  if (finMin <= inicioMin) finMin += 24 * 60;
  let aperturaMin = apertura.getHours() * 60 + apertura.getMinutes();
  if (aperturaMin < inicioMin) aperturaMin += 24 * 60;
  return aperturaMin < inicioMin || aperturaMin > finMin;
}

export default function TurnoActivoButton() {
  const router = useRouter();
  const turnoActivo = useTurnoActivo();
  const [open, setOpen] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [coords, setCoords] = useState(null);
  // Snapshot de "ahora" al ABRIR el dropdown (no al montar el botón, que
  // queda montado toda la sesión) -- mismo criterio de "nunca un reloj
  // corriendo" que formatoHace abajo, pero recalculado cada apertura para
  // que "Hace X" no quede congelado en la hora en la que cargó la página.
  const [ahora, setAhora] = useState(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  useLayoutEffect(() => {
    if (!open) return undefined;
    function updateCoords() {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(e) {
      const insideTrigger = triggerRef.current?.contains(e.target);
      const insideDropdown = dropdownRef.current?.contains(e.target);
      if (!insideTrigger && !insideDropdown) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleToggleOpen() {
    if (!open) setAhora(new Date());
    setOpen((v) => !v);
  }

  function handleAbrirTurno() {
    setOpen(false);
    router.push('/gestion-enfermeria');
  }

  function handlePedirCierre() {
    setOpen(false);
    setConfirmando(true);
  }

  const haceLabel = turnoActivo?.horaApertura && ahora
    ? formatoHace(Math.max(0, Math.round((ahora - turnoActivo.horaApertura) / 60000)))
    : null;
  const fueraDeHorario = turnoActivo?.horaApertura
    ? fueraDeVentana(turnoActivo.horaApertura, turnoActivo.turno.horaInicio, turnoActivo.turno.horaFin)
    : false;

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="meta-item picker-btn"
        onClick={handleToggleOpen}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className={`tab-dot ${turnoActivo ? 'active' : 'inactive'}`} aria-hidden="true" />
        <span className="lbl">Turno:</span> <b>{turnoActivo ? turnoActivo.turno.label : 'Sin turno'}</b>
        <LuChevronDown className={`icon chev${open ? ' open' : ''}`} aria-hidden="true" />
      </button>

      {open && coords && createPortal(
        <div
          ref={dropdownRef}
          className="tab-dropdown"
          role="dialog"
          aria-label={turnoActivo ? 'Turno activo' : 'Sin turno activo'}
          style={{ top: coords.top, right: coords.right }}
        >
          {turnoActivo ? (
            <>
              <div className="tab-status">
                <span className="tab-dot active" aria-hidden="true" />
                Turno activo
              </div>

              <p className="tab-turno-name">{turnoActivo.turno.label}</p>
              <p className="tab-turno-rango">{turnoActivo.turno.rango}</p>

              <div className="tab-divider" />

              <span className="tab-field-label">Unidad</span>
              <p className="tab-field-value">{turnoActivo.unidad.label}</p>

              {turnoActivo.horaAperturaLabel && (
                <p className={`tab-inicio-row${fueraDeHorario ? ' tab-inicio-warn' : ''}`}>
                  {fueraDeHorario && <LuTriangleAlert className="tab-inicio-warn-icon" aria-hidden="true" />}
                  Inicio real · <b>{turnoActivo.horaAperturaLabel}</b>
                  {haceLabel && <> · {haceLabel}</>}
                </p>
              )}

              <div className="tab-divider" />

              <Button variant="danger" size="sm" icon={LuAlarmClockCheck} className="tab-action-btn" onClick={handlePedirCierre}>
                Cerrar turno
              </Button>
            </>
          ) : (
            <>
              <p className="tab-empty-title">Sin turno activo</p>
              <p className="tab-empty-desc">Para comenzar a trabajar en Gestión de Enfermería, abre un turno.</p>
              <Button variant="primary" size="sm" icon={LuLogIn} className="tab-action-btn" onClick={handleAbrirTurno}>
                Abrir turno
              </Button>
            </>
          )}
        </div>,
        document.body,
      )}

      {confirmando && turnoActivo && (
        <CerrarTurnoModal turnoActivo={turnoActivo} onClose={() => setConfirmando(false)} />
      )}
    </>
  );
}
