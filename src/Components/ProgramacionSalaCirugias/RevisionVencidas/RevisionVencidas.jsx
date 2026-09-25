'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LuArrowLeft, LuChevronLeft, LuChevronRight, LuCircleCheck, LuSearchX,
} from 'react-icons/lu';
// Tokens (:root), reset del shell y reglas compartidas de la feature: los
// mismos 2 archivos que carga ProgramacionSalaCirugias.jsx, porque esta
// subruta es otra página de la misma feature.
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './RevisionVencidas.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import VencidasResumen from '../revision/VencidasResumen/VencidasResumen';
import VencidasFiltrosBar from '../revision/VencidasFiltrosBar/VencidasFiltrosBar';
import VencidasTable from '../revision/VencidasTable/VencidasTable';
import AccionesLoteBar from '../revision/AccionesLoteBar/AccionesLoteBar';
import ConfirmarRealizadasDialog from '../revision/ConfirmarRealizadasDialog/ConfirmarRealizadasDialog';
import MarcarIncumplidaModal from '../modals/MarcarIncumplidaModal/MarcarIncumplidaModal';
import CancelarCirugiaModal from '../modals/CancelarCirugiaModal/CancelarCirugiaModal';
import ReprogramarCirugiaModal from '../modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal';
import {
  addDias,
  cancelarCirugia,
  deshacerResolucion,
  fechaISO,
  fechaLabel,
  fetchVencidas,
  marcarIncumplidas,
  marcarRealizadas,
  reprogramarCirugia,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  contarPorTipo, filtrarVencidas, ordenarVencidas, paginar,
} from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';

const POR_PAGINA = 50;
const FILTROS_INICIALES = {
  tipo: 'todas', salaId: 'todas', busqueda: '', desde: '', hasta: '',
};

function etiqueta(cirugia) {
  return cirugia.numeroProgramacion ?? cirugia.id;
}

// "Revisión de programaciones vencidas" (spec 2026-09-25): cirugías en
// 'programada' con fecha anterior a hoy. Todo el estado de la pantalla vive
// acá; los componentes de ../revision/ son presentacionales.
export default function RevisionVencidas() {
  const router = useRouter();
  const [hoy] = useState(() => fechaISO(new Date()));
  const [manana] = useState(() => fechaISO(addDias(new Date(), 1)));
  const [vencidas, setVencidas] = useState(null); // null = cargando
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [orden, setOrden] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [seleccion, setSeleccion] = useState(() => new Set());
  const [expandidas, setExpandidas] = useState(() => new Set());
  // { type: 'incumplida' | 'confirmar-realizadas' | 'cancelar' | 'reprogramar', cirugias: [...] }
  const [modal, setModal] = useState(null);
  // { message, snapshot } -- con snapshot el toast ofrece "Deshacer".
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchVencidas({ hoy }).then((items) => {
      if (!cancelled) setVencidas(items);
    });
    return () => { cancelled = true; };
  }, [hoy]);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  const lista = vencidas ?? [];
  const conteo = contarPorTipo(lista);
  const filtradas = ordenarVencidas(filtrarVencidas(lista, filtros), orden);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = paginar(filtradas, paginaActual, POR_PAGINA);
  const seleccionadas = lista.filter((c) => seleccion.has(c.id));
  const desdeN = filtradas.length === 0 ? 0 : (paginaActual - 1) * POR_PAGINA + 1;
  const hastaN = Math.min(paginaActual * POR_PAGINA, filtradas.length);

  function showToast(message, snapshot = null) {
    setToast({ message, snapshot });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), snapshot ? 5000 : 2600);
  }

  // La selección se limpia al cambiar filtro o página (spec): evita actuar
  // sobre filas que ya no están a la vista.
  function handleFiltrosChange(cambios) {
    setFiltros((f) => ({ ...f, ...cambios }));
    setPagina(1);
    setSeleccion(new Set());
  }
  function handleLimpiarFiltros() {
    setFiltros(FILTROS_INICIALES);
    setPagina(1);
    setSeleccion(new Set());
  }
  function handlePagina(n) {
    setPagina(n);
    setSeleccion(new Set());
  }
  // asc -> desc -> orden por defecto.
  function handleOrdenar(columna) {
    setOrden((o) => {
      if (o?.columna !== columna) return { columna, direccion: 'asc' };
      if (o.direccion === 'asc') return { columna, direccion: 'desc' };
      return null;
    });
  }
  function toggleEnSet(setter, id) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function handleToggleTodas() {
    const todas = visibles.length > 0 && visibles.every((c) => seleccion.has(c.id));
    setSeleccion(todas ? new Set() : new Set(visibles.map((c) => c.id)));
  }

  function quitarResueltas(ids) {
    setVencidas((prev) => prev.filter((c) => !ids.includes(c.id)));
    const sinIds = (prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    };
    setSeleccion(sinIds);
    setExpandidas(sinIds);
  }

  function resolverRealizadas(cirugias) {
    const ids = cirugias.map((c) => c.id);
    const snapshot = marcarRealizadas(ids);
    quitarResueltas(ids);
    showToast(
      ids.length === 1
        ? `Programación ${etiqueta(cirugias[0])} marcada como realizada`
        : `${ids.length} programaciones marcadas como realizadas`,
      snapshot,
    );
  }

  function handleSubmitIncumplida({ causal, observacion }) {
    // Optional chaining acá y en el resto de los handlers que leen `modal`/
    // `toast`: con el React Compiler activo (next.config `reactCompiler`),
    // el handler memoizado se re-evalúa en render para comparar sus
    // dependencias por property-path, y en ese punto `modal`/`toast` puede
    // ser el `null` inicial -- mismo motivo que `modal?.cirugia?.id` en
    // ProgramacionSalaCirugias.jsx.
    const cirugias = modal?.cirugias;
    if (!cirugias) return;
    const ids = cirugias.map((c) => c.id);
    const snapshot = marcarIncumplidas(ids, { causal, observacion });
    quitarResueltas(ids);
    setModal(null);
    showToast(
      ids.length === 1
        ? `Programación ${etiqueta(cirugias[0])} marcada como incumplida`
        : `${ids.length} programaciones marcadas como incumplidas`,
      snapshot,
    );
  }

  function handleConfirmarRealizadas() {
    const cirugias = modal?.cirugias;
    if (!cirugias) return;
    setModal(null);
    resolverRealizadas(cirugias);
  }

  function handleSubmitCancelar(motivo) {
    const cirugia = modal?.cirugias?.[0];
    if (!cirugia) return;
    cancelarCirugia(cirugia.id, motivo);
    quitarResueltas([cirugia.id]);
    setModal(null);
    showToast(`Programación ${etiqueta(cirugia)} cancelada`);
  }

  function handleSubmitReprogramar(datos) {
    const cirugia = modal?.cirugias?.[0];
    if (!cirugia) return;
    reprogramarCirugia(cirugia.id, datos);
    quitarResueltas([cirugia.id]);
    setModal(null);
    showToast(`Programación ${etiqueta(cirugia)} reprogramada para el ${fechaLabel(datos.fecha)}`);
  }

  function handleDeshacer() {
    const snapshot = toast?.snapshot;
    if (!snapshot) return;
    deshacerResolucion(snapshot);
    setVencidas((prev) => [...prev.filter((c) => !snapshot.some((s) => s.id === c.id)), ...snapshot]);
    window.clearTimeout(toastTimerRef.current);
    setToast(null);
  }

  function handleAccion(accion, cirugia) {
    if (accion === 'realizada') resolverRealizadas([cirugia]);
    else setModal({ type: accion, cirugias: [cirugia] });
  }

  let cuerpo;
  if (vencidas === null) {
    cuerpo = <div className="rv-card rv-estado" role="status">Cargando programaciones…</div>;
  } else if (lista.length === 0) {
    cuerpo = (
      <div className="rv-card rv-estado">
        <LuCircleCheck className="rv-estado-icon rv-estado-icon-ok" aria-hidden="true" />
        <h2 className="rv-estado-title">No hay programaciones vencidas</h2>
        <p className="rv-estado-text">La agenda está al día.</p>
        <Button variant="secondary" icon={LuArrowLeft} onClick={() => router.push('/programacion-sala-cirugias')}>
          Volver a la agenda
        </Button>
      </div>
    );
  } else {
    cuerpo = (
      <>
        <VencidasResumen
          conteo={conteo}
          tipoActivo={filtros.tipo}
          onSelectTipo={(tipo) => handleFiltrosChange({ tipo })}
        />
        <div className="rv-card rv-list-card">
          <VencidasFiltrosBar
            filtros={filtros}
            conteo={conteo}
            onChange={handleFiltrosChange}
            onLimpiar={handleLimpiarFiltros}
          />
          {filtradas.length === 0 ? (
            <div className="rv-estado rv-estado-filtros">
              <LuSearchX className="rv-estado-icon" aria-hidden="true" />
              <p className="rv-estado-text">Ninguna programación coincide con los filtros.</p>
              <Button variant="secondary" onClick={handleLimpiarFiltros}>Limpiar filtros</Button>
            </div>
          ) : (
            <VencidasTable
              items={visibles}
              hoy={hoy}
              orden={orden}
              onOrdenar={handleOrdenar}
              seleccion={seleccion}
              onToggleSeleccion={(id) => toggleEnSet(setSeleccion, id)}
              onToggleTodas={handleToggleTodas}
              expandidas={expandidas}
              onToggleExpandida={(id) => toggleEnSet(setExpandidas, id)}
              onAccion={handleAccion}
            />
          )}
          <div className="rv-footer">
            <span className="rv-paginacion-label">{desdeN}–{hastaN} de {filtradas.length}</span>
            <div className="rv-paginacion-btns">
              <button
                type="button"
                className="psc-agenda-nav-btn"
                aria-label="Página anterior"
                disabled={paginaActual === 1}
                onClick={() => handlePagina(paginaActual - 1)}
              >
                <LuChevronLeft className="icon" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="psc-agenda-nav-btn"
                aria-label="Página siguiente"
                disabled={paginaActual === totalPaginas}
                onClick={() => handlePagina(paginaActual + 1)}
              >
                <LuChevronRight className="icon" aria-hidden="true" />
              </button>
            </div>
          </div>
          {seleccion.size > 0 && (
            <AccionesLoteBar
              cantidad={seleccion.size}
              onMarcarRealizadas={() => setModal({ type: 'confirmar-realizadas', cirugias: seleccionadas })}
              onMarcarIncumplidas={() => setModal({ type: 'incumplida', cirugias: seleccionadas })}
              onDeseleccionar={() => setSeleccion(new Set())}
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
          page="Revisión de programaciones vencidas"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <nav className="rv-breadcrumb" aria-label="Ruta de navegación">
            <Link href="/programacion-sala-cirugias">Programación sala de cirugías</Link>
            <LuChevronRight className="icon" aria-hidden="true" />
            <span aria-current="page">Revisión de vencidas</span>
          </nav>
          <div className="psc-page-header">
            <div>
              <h1>Programaciones vencidas sin cerrar</h1>
              <p>Estado Programada con fecha anterior a hoy. Resuelve cada una para liberar insumos y cerrar la agenda.</p>
            </div>
          </div>
          {cuerpo}
        </div>
      </div>

      {modal?.type === 'incumplida' && (
        <MarcarIncumplidaModal cirugias={modal?.cirugias} onClose={() => setModal(null)} onSubmit={handleSubmitIncumplida} />
      )}
      {modal?.type === 'confirmar-realizadas' && (
        <ConfirmarRealizadasDialog
          cantidad={modal?.cirugias?.length}
          conInsumos={modal?.cirugias?.filter((c) => c.farmacia?.numeroPedido).length}
          onCancel={() => setModal(null)}
          onConfirm={handleConfirmarRealizadas}
        />
      )}
      {modal?.type === 'cancelar' && (
        <CancelarCirugiaModal cirugia={modal?.cirugias?.[0]} onClose={() => setModal(null)} onSubmit={handleSubmitCancelar} />
      )}
      {modal?.type === 'reprogramar' && (
        <ReprogramarCirugiaModal
          cirugia={modal?.cirugias?.[0]}
          fechaMinima={manana}
          onClose={() => setModal(null)}
          onSubmit={handleSubmitReprogramar}
        />
      )}

      <div className={`psc-toast rv-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast?.message}</span>
        {toast?.snapshot && (
          <button type="button" className="rv-toast-undo" onClick={handleDeshacer}>Deshacer</button>
        )}
      </div>
    </div>
  );
}
