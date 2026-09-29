'use client';

import {
  useEffect, useRef, useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  LuCalendarDays, LuClock, LuPackage, LuPackageCheck, LuPackageSearch,
} from 'react-icons/lu';
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
import CanastasFiltrosBar from '../canastas/CanastasFiltrosBar/CanastasFiltrosBar';
import CanastasTable from '../canastas/CanastasTable/CanastasTable';
import ConfirmarRecepcionModal from '../canastas/ConfirmarRecepcionModal/ConfirmarRecepcionModal';
import {
  SALAS, addDias, deshacerResolucion, diaCortoLabel, fechaISO, fetchCanastasDia, registrarEntregaInsumos, resumenCanasta,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Sede fija '02' en todo el módulo (ver VencidasFiltrosBar.jsx).
const SALA_OPTIONS = SALAS.filter((s) => s.sedeId === '02').map((s) => ({ value: s.value, label: s.descripcion }));

function coincideBusqueda(cirugia, busqueda) {
  if (!busqueda) return true;
  const texto = busqueda.trim().toLowerCase();
  return cirugia.paciente.nombre.toLowerCase().includes(texto)
    || cirugia.paciente.documento.toLowerCase().includes(texto)
    || cirugia.procedimientoPrincipal.toLowerCase().includes(texto);
}

// "Canastas de cirugía" (encargo explícito, 2026-09-29): listado de las
// cirugías de UNA sala (el personal de quirófano que RECIBE los insumos está
// físicamente en un quirófano puntual) para que confirme la recepción de
// cada canasta sin entrar una por una al DetalleCirugiaPanel. Único cambio de
// estado que esta pantalla dispara: registrarEntregaInsumos (ya existía,
// usado hasta ahora desde InsumosTab) -- pedir/cancelar/devolver insumos
// siguen siendo acciones de Programación, esta pantalla no las duplica.
export default function CanastasCirugia() {
  const router = useRouter();
  const [salaId, setSalaId] = useState('qx-1');
  const [fecha, setFecha] = useState(() => fechaISO(new Date()));
  const [filtros, setFiltros] = useState({ busqueda: '', estado: 'pendientes' });
  const [cirugias, setCirugias] = useState(null); // null = cargando
  // Cirugía cuyo ConfirmarRecepcionModal está abierto, o null si ninguno.
  const [modalCirugia, setModalCirugia] = useState(null);
  // { message, snapshot } -- con snapshot el toast ofrece "Deshacer".
  const [toast, setToast] = useState(null);
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

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  const lista = cirugias ?? [];
  const kpis = {
    recibidas: lista.filter((c) => resumenCanasta(c).estado === 'recibida').length,
    pendientes: lista.filter((c) => resumenCanasta(c).estado === 'pendiente-recepcion').length,
    sinSolicitar: lista.filter((c) => resumenCanasta(c).estado === 'sin-solicitar').length,
  };
  const conteo = { pendientes: kpis.pendientes, recibidas: kpis.recibidas, todas: lista.length };
  const filtradas = lista.filter((c) => {
    if (filtros.estado === 'pendientes' && resumenCanasta(c).estado !== 'pendiente-recepcion') return false;
    if (filtros.estado === 'recibidas' && resumenCanasta(c).estado !== 'recibida') return false;
    return coincideBusqueda(c, filtros.busqueda);
  });
  function handleFiltrosChange(cambios) {
    setFiltros((f) => ({ ...f, ...cambios }));
  }

  function cambiarDia(delta) {
    setFecha((f) => fechaISO(addDias(new Date(`${f}T00:00:00`), delta)));
  }

  function showToast(message, snapshot = null) {
    setToast({ message, snapshot });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), snapshot ? 5000 : 2600);
  }

  // `snapshot` es la cirugía tal como estaba ANTES de recibirse -- misma
  // forma que usa deshacerResolucion (RevisionVencidas.jsx), no hace falta
  // una función de deshacer propia para esta transición.
  function handleConfirmarRecepcion(cirugia) {
    const snapshot = [cirugia];
    const actualizada = registrarEntregaInsumos(cirugia.id);
    setCirugias((prev) => prev.map((c) => (c.id === cirugia.id ? actualizada : c)));
    showToast(`Canasta de ${cirugia.paciente.nombre} recibida`, snapshot);
    setModalCirugia(null);
  }

  function handleDeshacer() {
    const snapshot = toast?.snapshot;
    if (!snapshot) return;
    deshacerResolucion(snapshot);
    setCirugias((prev) => prev.map((c) => (c.id === snapshot[0].id ? snapshot[0] : c)));
    window.clearTimeout(toastTimerRef.current);
    setToast(null);
  }

  // La barra de filtros se muestra siempre, aun sin resultados -- si se
  // ocultara junto con el estado vacío, un día sin cirugías dejaría al
  // usuario sin forma de cambiar de sala/fecha.
  let listaBody;
  if (cirugias === null) {
    listaBody = <div className="cnc-estado" role="status">Cargando canastas…</div>;
  } else if (lista.length === 0) {
    listaBody = (
      <div className="cnc-estado">
        <LuPackageSearch className="cnc-estado-icon" aria-hidden="true" />
        <p className="cnc-estado-text">No hay cirugías programadas en esta sala para esta fecha.</p>
      </div>
    );
  } else if (filtradas.length === 0) {
    listaBody = (
      <div className="cnc-estado cnc-estado-filtros">
        <p className="cnc-estado-text">Ninguna canasta coincide con los filtros.</p>
      </div>
    );
  } else {
    listaBody = <CanastasTable items={filtradas} onAbrirRecepcion={setModalCirugia} />;
  }

  const hoyISO = fechaISO(new Date());
  const fechaNavLabel = `${fecha === hoyISO ? 'Hoy · ' : ''}${diaCortoLabel(fecha)}`;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Canastas de cirugía"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="psc-page-header">
            <div>
              <h1>Canastas de cirugía</h1>
              <p>Verifica y recibe las canastas de insumos solicitadas para las cirugías de tu sala.</p>
            </div>
            <div className="psc-page-header-actions">
              <div className="cnc-sala-select">
                <FormSelect id="cnc-sala" ariaLabel="Sala" value={salaId} onChange={setSalaId} options={SALA_OPTIONS} />
              </div>
              <Button variant="secondary-accent" icon={LuCalendarDays} onClick={() => router.push('/programacion-sala-cirugias')}>
                Ver agenda
              </Button>
            </div>
          </div>

          <div className="cnc-kpis">
            <div className="cnc-kpi">
              <span className="cnc-kpi-icon-wrap cnc-kpi-success"><LuPackageCheck className="icon" aria-hidden="true" /></span>
              <div>
                <div className="cnc-kpi-value">{kpis.recibidas}</div>
                <div className="cnc-kpi-label">Canastas recibidas</div>
              </div>
            </div>
            <div className="cnc-kpi">
              <span className="cnc-kpi-icon-wrap cnc-kpi-warn"><LuPackage className="icon" aria-hidden="true" /></span>
              <div>
                <div className="cnc-kpi-value">{kpis.pendientes}</div>
                <div className="cnc-kpi-label">Pendientes de recepción</div>
              </div>
            </div>
            <div className="cnc-kpi">
              <span className="cnc-kpi-icon-wrap cnc-kpi-neutral"><LuClock className="icon" aria-hidden="true" /></span>
              <div>
                <div className="cnc-kpi-value">{kpis.sinSolicitar}</div>
                <div className="cnc-kpi-label">Sin solicitar</div>
              </div>
            </div>
          </div>

          <div className="cnc-card cnc-list-card">
            <CanastasFiltrosBar
              filtros={filtros}
              conteo={conteo}
              onChange={handleFiltrosChange}
              fecha={fecha}
              fechaLabel={fechaNavLabel}
              onFechaChange={setFecha}
              onDiaAnterior={() => cambiarDia(-1)}
              onDiaSiguiente={() => cambiarDia(1)}
            />
            {listaBody}
          </div>
        </div>
      </div>

      {modalCirugia && (
        <ConfirmarRecepcionModal
          cirugia={modalCirugia}
          onConfirmar={() => handleConfirmarRecepcion(modalCirugia)}
          onClose={() => setModalCirugia(null)}
        />
      )}

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
