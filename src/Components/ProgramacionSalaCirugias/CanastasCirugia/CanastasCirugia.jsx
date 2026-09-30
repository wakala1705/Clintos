'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuCalendarDays, LuPackageSearch } from 'react-icons/lu';
// Tokens (:root), reset del shell y reglas compartidas de la feature: los
// mismos 2 archivos que carga RevisionVencidas.jsx, porque esta ruta es otra
// página de la misma feature (ProgramacionSalaCirugias).
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './CanastasCirugia.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CanastasFechaNav from '../canastas/CanastasFechaNav/CanastasFechaNav';
import CanastasKpis from '../canastas/CanastasKpis/CanastasKpis';
import CanastaAlerta from '../canastas/CanastaAlerta/CanastaAlerta';
import CanastasLista from '../canastas/CanastasLista/CanastasLista';
import CanastaDetalle from '../canastas/CanastaDetalle/CanastaDetalle';
import {
  HORA_DEMO, SALAS, ahoraDemo, deshacerResolucion, fechaISO, fetchCanastasDia,
  registrarConsumo, registrarRecepcion, resumenCanasta,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { filtrarCanastas, primeraPorRecibir } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';

// Sede fija '02' en todo el módulo (ver VencidasFiltrosBar.jsx).
const SALA_OPTIONS = SALAS.filter((s) => s.sedeId === '02').map((s) => ({ value: s.value, label: s.descripcion }));
const USUARIO = 'Camilo Grondona';

// "Canastas de cirugía" (maestro-detalle, diseño 2026-09-30): las cirugías de
// UNA sala a la izquierda; a la derecha la canasta de la seleccionada, con
// recepción por cantidades, autorización por urgencia y consumo/devolución.
// El bloqueo de inicio es solo informativo acá (spec 2026-09-30): la agenda no
// lo consume todavía. Los borradores (recibido/OK/usado/pestaña) viven por
// cirugía en `drafts` para no perderse al cambiar de selección.
export default function CanastasCirugia() {
  const router = useRouter();
  const [salaId, setSalaId] = useState('qx-1');
  const [fecha, setFecha] = useState(() => fechaISO(new Date()));
  const [filtros, setFiltros] = useState({ busqueda: '', estado: 'todas' });
  const [cirugias, setCirugias] = useState(null); // null = cargando
  const [seleccionId, setSeleccionId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState(null);
  // { message, snapshot } -- con snapshot el toast ofrece "Deshacer".
  const [toast, setToast] = useState(null);
  // Reloj del render (no `new Date()` directo): alimenta "Inicia en N min".
  // Hora de demostración fija (HORA_DEMO en el mock) o la real si es null.
  const [ahora, setAhora] = useState(() => ahoraDemo());
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCanastasDia({ fecha, salaId }).then((items) => {
      if (!cancelled) setCirugias(items);
    });
    return () => { cancelled = true; };
  }, [fecha, salaId]);

  // Con hora fija no hay nada que refrescar.
  useEffect(() => {
    if (HORA_DEMO) return undefined;
    const id = window.setInterval(() => setAhora(ahoraDemo()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  const lista = cirugias ?? [];
  const filtradas = filtrarCanastas(lista, filtros);
  // La selección sale de la lista completa (no de `filtradas`) para que un
  // filtro no deje el detalle en blanco; sin selección explícita, la primera
  // despachada por recibir (lo accionable) o la primera cirugía.
  const seleccion = lista.find((c) => c.id === seleccionId)
    ?? lista.find((c) => resumenCanasta(c).estado === 'despachada')
    ?? lista[0]
    ?? null;

  // Otra canasta despachada por recibir (la abierta ya está a la vista).
  const siguiente = primeraPorRecibir(lista, seleccion?.id ?? null);

  function showToast(message, snapshot = null) {
    setToast({ message, snapshot });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), snapshot ? 5000 : 2600);
  }

  function handleSelect(id) {
    setSeleccionId(id);
    setError(null);
  }

  function handleDraftChange(id, patch) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  // Ejecuta una acción del mock; si lanza, deja el estado intacto y muestra el
  // mensaje en el detalle. El snapshot (cirugía ANTES de la acción) alimenta
  // "Deshacer" -- misma forma que usa deshacerResolucion.
  function aplicar(cirugia, accion, mensaje) {
    try {
      const actualizada = accion();
      setCirugias((prev) => (prev ?? []).map((c) => (c.id === actualizada.id ? actualizada : c)));
      setDrafts((d) => {
        const resto = { ...d };
        delete resto[cirugia.id];
        return resto;
      });
      setError(null);
      showToast(mensaje(actualizada), [cirugia]);
    } catch (e) {
      setError(e?.message ?? 'No se pudo completar la acción.');
    }
  }

  function handleRecibir(cirugia, recibidos) {
    aplicar(
      cirugia,
      () => registrarRecepcion(cirugia.id, { recibidos, usuario: USUARIO }),
      (c) => (resumenCanasta(c).estado === 'con-novedades'
        ? `Canasta de ${cirugia.paciente.nombre} recibida con novedades`
        : `Canasta de ${cirugia.paciente.nombre} recibida`),
    );
  }

  function handleRegistrarConsumo(cirugia, usados) {
    aplicar(
      cirugia,
      () => registrarConsumo(cirugia.id, { usados, usuario: USUARIO }),
      () => `Consumo de ${cirugia.paciente.nombre} registrado`,
    );
  }

  function handleDeshacer() {
    const snapshot = toast?.snapshot;
    if (!snapshot) return;
    deshacerResolucion(snapshot);
    setCirugias((prev) => (prev ?? []).map((c) => (c.id === snapshot[0].id ? snapshot[0] : c)));
    window.clearTimeout(toastTimerRef.current);
    setToast(null);
  }

  const esHoy = fecha === fechaISO(ahora);
  const salaLabel = SALA_OPTIONS.find((o) => o.value === salaId)?.label ?? salaId;

  // El header (sala/fecha) se muestra siempre, aun sin resultados -- si se
  // ocultara junto con el estado vacío, un día sin cirugías dejaría al usuario
  // sin forma de cambiar de sala/fecha.
  let cuerpo;
  if (cirugias === null) {
    cuerpo = <div className="cnc-estado" role="status">Cargando canastas…</div>;
  } else if (lista.length === 0) {
    cuerpo = (
      <div className="cnc-estado">
        <LuPackageSearch className="cnc-estado-icon" aria-hidden="true" />
        <p className="cnc-estado-text">No hay cirugías programadas en esta sala para esta fecha.</p>
      </div>
    );
  } else {
    cuerpo = (
      <>
        <div className={`cnc-resumen${siguiente ? ' cnc-resumen-alerta' : ''}`}>
          <CanastasKpis cirugias={lista} filtro={filtros.estado} onFiltrar={(estado) => setFiltros((f) => ({ ...f, estado }))} />
          {siguiente && <CanastaAlerta cirugia={siguiente} ahora={ahora} onVerificar={handleSelect} />}
        </div>
        <div className="cnc-workspace">
          <CanastasLista
            titulo={esHoy ? 'Cirugías de hoy' : 'Cirugías del día'}
            subtitulo={`${lista.length} en ${salaLabel} · por prioridad`}
            filtradas={filtradas}
            seleccionId={seleccion?.id ?? null}
            ahora={ahora}
            filtros={filtros}
            onFiltrosChange={(cambios) => setFiltros((f) => ({ ...f, ...cambios }))}
            onSelect={handleSelect}
          />
          {seleccion && (
            <CanastaDetalle
              cirugia={seleccion}
              draft={drafts[seleccion.id] ?? {}}
              error={error}
              onDraftChange={(patch) => handleDraftChange(seleccion.id, patch)}
              onRecibir={(recibidos) => handleRecibir(seleccion, recibidos)}
              onRegistrarConsumo={(usados) => handleRegistrarConsumo(seleccion, usados)}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Canastas de cirugía"
          user={{ name: USUARIO, role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cnc-content">
          <div className="psc-page-header">
            <div>
              <h1>Canastas de cirugía</h1>
              <p>Verifica, recibe y legaliza los insumos de las cirugías de tu sala.</p>
            </div>
            <div className="psc-page-header-actions">
              <div className="cnc-sala-select">
                <FormSelect id="cnc-sala" ariaLabel="Sala" value={salaId} onChange={setSalaId} options={SALA_OPTIONS} />
              </div>
              <CanastasFechaNav fecha={fecha} onFechaChange={setFecha} />
              <Button variant="secondary-accent" icon={LuCalendarDays} onClick={() => router.push('/programacion-sala-cirugias')}>
                Ver agenda
              </Button>
            </div>
          </div>

          {cuerpo}
        </div>
      </div>

      <div className={`psc-toast cnc-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast?.message}</span>
        {toast?.snapshot && (
          <button type="button" className="cnc-toast-undo" onClick={handleDeshacer}>Deshacer</button>
        )}
      </div>
    </div>
  );
}
