'use client';

import {
  useEffect, useId, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import { LuCalendar, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import panel from '@/Components/DropdownPanel/DropdownPanel.module.css';
import Button from '@/Components/Button/Button';
import {
  DIAS_CORTOS, celdasMes, dentroDeRango, fechaCorta, finDeSemana, hoyISO, inicioDeSemana,
  sumarDias, sumarMeses, tituloMes,
} from '@/hooks/DatePicker/fechas';
import './DatePicker.css';

// Selector de fecha propio (no el <input type="date"> nativo, que no respeta
// la tipografía, los radios ni el dropdown del proyecto). Un disparador + un
// calendario mensual en un panel flotante.
//
// El panel se porta a document.body con position:fixed (mismo criterio que
// FormSelect): no lo recorta ningún overflow y sirve igual dentro de un modal.
// Se abre debajo del disparador, o arriba si no entra.
//
// Teclado (patrón "date picker dialog" de WAI-ARIA APG): al abrir, el foco va
// al día elegido; ←/→ ±1 día, ↑/↓ ±1 semana, Inicio/Fin = lunes/domingo de la
// semana, RePág/AvPág ±1 mes, Enter/Espacio elige, Escape cierra y devuelve
// el foco al disparador. Los días fuera de `min`/`max` no se pueden elegir.
//
// `value` y `onChange` usan 'YYYY-MM-DD' (nunca un Date ni un evento); `''`
// = sin fecha (se muestra `placeholder`).
//  - Sin `children`: disparador de campo de formulario (DD/MM/AAAA + ícono de
//    calendario, mismo alto y borde que FormSelect). Con `children`: el
//    disparador es solo ese contenido y `triggerClassName` lo estiliza.
//  - `size="sm"`: disparador más bajo (--input-sm) para popovers y filtros.
//  - `clearable`: "Limpiar" en el pie (campos opcionales y filtros).
//  - `required`: resaltado ámbar mientras está vacío (igual que FormSelect).
//  - `invalid`: borde de error (el mensaje va aparte, en el formulario).
//  - `ariaLabel` es opcional: con un <label htmlFor={id}> visible no hace falta.
const ANCHO_POR_DEFECTO = 296; // antes del primer render del panel; el real lo define el CSS

export default function DatePicker({
  value, onChange, children, id, ariaLabel, triggerClassName, min, max, disabled = false,
  required = false, clearable = false, invalid = false, placeholder = 'dd/mm/aaaa', size = 'md',
}) {
  const autoId = useId();
  const uid = id ?? autoId;
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [mes, setMes] = useState(value || ''); // cualquier día del mes visible
  const [foco, setFoco] = useState(value || ''); // día con foco de teclado
  const [hoy, setHoy] = useState('');
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const pedirFoco = useRef(false);

  useLayoutEffect(() => {
    if (!open) return undefined;
    function actualizar() {
      const rect = triggerRef.current.getBoundingClientRect();
      const alto = panelRef.current?.offsetHeight ?? 0;
      const ancho = panelRef.current?.offsetWidth ?? ANCHO_POR_DEFECTO;
      const left = Math.min(Math.max(8, rect.left + rect.width / 2 - ancho / 2), window.innerWidth - ancho - 8);
      const abajo = rect.bottom + 4;
      const cabeAbajo = abajo + alto <= window.innerHeight - 8;
      const top = cabeAbajo || rect.top - 4 - alto < 8 ? abajo : rect.top - 4 - alto;
      setCoords({ top, left });
    }
    actualizar();
    window.addEventListener('resize', actualizar);
    window.addEventListener('scroll', actualizar, true);
    return () => {
      window.removeEventListener('resize', actualizar);
      window.removeEventListener('scroll', actualizar, true);
    };
  }, [open, mes]);

  useEffect(() => {
    if (!open) return undefined;
    function fueraClick(e) {
      if (triggerRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', fueraClick);
    return () => document.removeEventListener('mousedown', fueraClick);
  }, [open]);

  // Lleva el foco real al día resaltado al abrir y tras cada tecla de navegación.
  // Espera a `coords`: hasta entonces el panel está oculto (visibility:hidden) y
  // un elemento oculto no puede recibir el foco.
  useEffect(() => {
    if (!open || !coords || !pedirFoco.current) return;
    pedirFoco.current = false;
    panelRef.current?.querySelector(`[data-iso="${foco}"]`)?.focus();
  }, [open, foco, coords]);

  function abrir() {
    const ahora = hoyISO();
    // Sin valor, abre en hoy (o en el límite más cercano si hoy queda fuera de rango).
    let base = value || ahora;
    if (!dentroDeRango(base, min, max)) base = min && base < min ? min : max;
    setMes(base);
    setFoco(base);
    setHoy(ahora);
    pedirFoco.current = true;
    setOpen(true);
  }

  function cerrar(devolverFoco = true) {
    setOpen(false);
    if (devolverFoco) triggerRef.current?.focus();
  }

  function elegir(iso) {
    if (!dentroDeRango(iso, min, max)) return;
    cerrar();
    if (iso !== value) onChange(iso);
  }

  function limpiar() {
    cerrar();
    onChange('');
  }

  function moverFoco(iso) {
    if (!dentroDeRango(iso, min, max)) return;
    pedirFoco.current = true;
    setFoco(iso);
    setMes(iso);
  }

  function teclaDia(e) {
    const pasos = {
      ArrowLeft: () => sumarDias(foco, -1),
      ArrowRight: () => sumarDias(foco, 1),
      ArrowUp: () => sumarDias(foco, -7),
      ArrowDown: () => sumarDias(foco, 7),
      Home: () => inicioDeSemana(foco),
      End: () => finDeSemana(foco),
      PageUp: () => sumarMeses(foco, -1),
      PageDown: () => sumarMeses(foco, 1),
    };
    if (pasos[e.key]) {
      e.preventDefault();
      moverFoco(pasos[e.key]());
    }
  }

  function teclaPanel(e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      cerrar();
    } else if (e.key === 'Tab') {
      // El panel vive al final del body: se cierra para que el Tab siga con normalidad.
      cerrar();
    }
  }

  const celdas = open ? celdasMes(mes) : [];
  // Día tabulable (roving tabindex): el resaltado si está en el mes visible, si no el día 1.
  const diaTab = celdas.find((c) => c.iso === foco && !c.fuera)?.iso ?? celdas.find((c) => !c.fuera)?.iso;

  return (
    <>
      <button
        type="button"
        id={uid}
        ref={triggerRef}
        className={children ? triggerClassName : ['dp-trigger', size === 'sm' && 'dp-sm', triggerClassName].filter(Boolean).join(' ')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        data-invalid={invalid || undefined}
        data-required-empty={required && !value ? 'true' : undefined}
        disabled={disabled}
        onClick={() => (open ? cerrar(false) : abrir())}
      >
        {children ?? (
          <>
            <span className={value ? 'dp-valor' : 'dp-placeholder'}>{value ? fechaCorta(value) : placeholder}</span>
            <LuCalendar className="icon dp-icono" aria-hidden="true" />
          </>
        )}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className={`dp-panel ${panel.panel}`}
          role="dialog"
          aria-label="Elegir fecha"
          style={{ top: coords?.top ?? 0, left: coords?.left ?? 0, visibility: coords ? 'visible' : 'hidden' }}
          onKeyDown={teclaPanel}
        >
          <div className="dp-head">
            <button type="button" className="dp-nav" aria-label="Mes anterior" onClick={() => setMes(sumarMeses(mes, -1))}>
              <LuChevronLeft className="icon" aria-hidden="true" />
            </button>
            <span className="dp-titulo" aria-live="polite">{tituloMes(mes)}</span>
            <button type="button" className="dp-nav" aria-label="Mes siguiente" onClick={() => setMes(sumarMeses(mes, 1))}>
              <LuChevronRight className="icon" aria-hidden="true" />
            </button>
          </div>
          <div className="dp-grid" role="group" aria-label={tituloMes(mes)}>
            {DIAS_CORTOS.map((d) => <span key={d} className="dp-dow" aria-hidden="true">{d}</span>)}
            {celdas.map((c) => {
              const elegido = c.iso === value;
              const deshabilitado = !dentroDeRango(c.iso, min, max);
              return (
                <button
                  key={c.iso}
                  type="button"
                  data-iso={c.iso}
                  tabIndex={c.iso === diaTab ? 0 : -1}
                  className={['dp-dia', c.fuera && 'fuera', c.iso === hoy && 'hoy', elegido && 'elegido'].filter(Boolean).join(' ')}
                  aria-pressed={elegido}
                  aria-current={c.iso === hoy ? 'date' : undefined}
                  aria-label={`${c.n} de ${tituloMes(c.iso).toLowerCase()}`}
                  disabled={deshabilitado}
                  onClick={() => elegir(c.iso)}
                  onKeyDown={teclaDia}
                  onFocus={() => { if (c.iso !== foco) setFoco(c.iso); }}
                >
                  {c.n}
                </button>
              );
            })}
          </div>
          <div className="dp-pie">
            {clearable && value ? <Button variant="secondary" size="sm" onClick={limpiar}>Limpiar</Button> : <span />}
            <Button variant="secondary" size="sm" disabled={!dentroDeRango(hoy, min, max)} onClick={() => elegir(hoy)}>Hoy</Button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
