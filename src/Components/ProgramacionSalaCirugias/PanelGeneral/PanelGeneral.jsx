'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuDownload, LuLayoutDashboard, LuPlus, LuSearch,
} from 'react-icons/lu';
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './PanelGeneral.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import DetalleCirugiaPanel from '../DetalleCirugiaPanel/DetalleCirugiaPanel';
import ReprogramarCirugiaModal from '../modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal';
import CancelarCirugiaModal from '../modals/CancelarCirugiaModal/CancelarCirugiaModal';
import PanelKpis from './PanelKpis/PanelKpis';
import CirugiasDiaTable from './CirugiasDiaTable/CirugiasDiaTable';
import TableroDia from '../TableroDia/TableroDia';
import {
  SALAS, ahoraDemo, fechaISO, fetchAgendaRango,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { canastasHref } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import {
  conteosFiltros, filasACsv, filtrarFilas, kpisPanel,
} from '@/hooks/ProgramacionSalaCirugias/panel/panel';
import useCirugiasAcciones from '@/hooks/ProgramacionSalaCirugias/useCirugiasAcciones';

// Sede fija '02' en todo el módulo (ver CanastasCirugia.jsx).
const SEDE_ID = '02';
const SALAS_SEDE = SALAS.filter((s) => s.sedeId === SEDE_ID);
const salaLabel = (salaId) => SALAS_SEDE.find((s) => s.value === salaId)?.descripcion ?? salaId;

// "Panel general" de Cirugía: portada del módulo. Resume el día de hoy (KPIs)
// y lista sus cirugías con filtros por estado y búsqueda. Desde la fila se
// abre el detalle y, con el "⋯", se reprograma, cancela o cierra la cirugía.
// Crear una cirugía (wizard) vive en Programación.
export default function PanelGeneral() {
  const router = useRouter();
  const [cirugias, setCirugias] = useState(null); // null = cargando
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [tableroAbierto, setTableroAbierto] = useState(false);
  // Reloj del render: define "en curso"/"retrasada" (ver estadoVisual).
  const [ahora] = useState(() => ahoraDemo());

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const hoy = fechaISO(new Date());
    Promise.all(SALAS_SEDE.map((s) => fetchAgendaRango({
      sedeId: SEDE_ID, salaId: s.value, inicio: hoy, fin: hoy,
    }))).then((porSala) => {
      if (!cancelled) setCirugias(porSala.flat());
    });
    return () => { cancelled = true; };
  }, []);

  // La respuesta de cada mutación ya trae el registro completo: se refleja en
  // la lista sin re-fetch (sale del panel si cambió de día).
  function applyUpdated(actualizada) {
    setCirugias((prev) => {
      const lista = prev ?? [];
      if (actualizada.sedeId !== SEDE_ID || actualizada.fecha !== fechaISO(new Date())) {
        return lista.filter((c) => c.id !== actualizada.id);
      }
      return lista.some((c) => c.id === actualizada.id)
        ? lista.map((c) => (c.id === actualizada.id ? actualizada : c))
        : [...lista, actualizada];
    });
  }

  const {
    modal, setModal, toast,
    handleSubmitReprogramar, handleSubmitCancelar,
    handleReprogramarCirugia, handleCancelarCirugia,
    handleMarcarRealizada, handleMarcarIncumplida,
    handlePedirInsumos, handleCancelarSolicitud,
  } = useCirugiasAcciones({ applyUpdated });

  const lista = cirugias ?? [];
  const conteos = conteosFiltros(lista, ahora);
  const filas = filtrarFilas(lista, ahora, { filtro, busqueda });
  const selectedCirugia = lista.find((c) => c.id === selectedId) ?? null;
  const hayFiltros = filtro !== 'todas' || busqueda.trim() !== '';

  const opcionesFiltro = [
    { value: 'todas', label: 'Todas', count: conteos.todas },
    { value: 'pendientes', label: 'Pendientes', count: conteos.pendientes },
    { value: 'en-curso', label: 'En curso', count: conteos['en-curso'] },
    { value: 'finalizadas', label: 'Finalizadas', count: conteos.finalizadas },
    { value: 'canceladas', label: 'Canceladas', count: conteos.canceladas },
  ];

  // Exporta lo que muestra la tabla (con los filtros aplicados).
  function handleExportar() {
    const csv = filasACsv(filas, ahora, salaLabel);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `cirugias-${fechaISO(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function limpiarFiltros() {
    setFiltro('todas');
    setBusqueda('');
  }

  let listado;
  if (cirugias === null) {
    listado = <p className="pg-cir-estado" role="status">Cargando cirugías…</p>;
  } else if (filas.length === 0) {
    listado = (
      <div className="pg-cir-estado" role="status">
        <p>{lista.length === 0 ? 'No hay cirugías programadas para hoy.' : 'Ninguna cirugía coincide con los filtros.'}</p>
        {hayFiltros && <Button variant="secondary" size="sm" onClick={limpiarFiltros}>Limpiar filtros</Button>}
      </div>
    );
  } else {
    listado = (
      <CirugiasDiaTable
        filas={filas}
        ahora={ahora}
        salaLabel={salaLabel}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onReprogramar={handleReprogramarCirugia}
        onMarcarRealizada={handleMarcarRealizada}
        onMarcarIncumplida={handleMarcarIncumplida}
        onCancelar={handleCancelarCirugia}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Cirugía"
          page="Panel general"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content pg-cir-content">
          <div className="psc-page-header">
            <div>
              <h1>Panel general - Cirugías</h1>
              <p>Estado de las salas y programación quirúrgica del día.</p>
            </div>
            <div className="psc-page-header-actions">
              <Button variant="secondary" icon={LuDownload} onClick={handleExportar} disabled={filas.length === 0}>
                Exportar
              </Button>
              <Button icon={LuPlus} onClick={() => router.push('/cirugia/programacion')}>
                Programar cirugía
              </Button>
            </div>
          </div>

          <div className="pg-cir-kpis">
            <PanelKpis kpis={kpisPanel(lista, ahora, SALAS_SEDE)} />
          </div>

          <section className="pg-cir-panel" aria-label="Cirugías de hoy">
            <div className="filter-bar pg-cir-toolbar">
              <div className="search-field">
                <LuSearch className="icon" aria-hidden="true" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar paciente, procedimiento..."
                  aria-label="Buscar cirugías"
                />
              </div>
              <span className="filter-spacer" />
              <SegmentedFilterBar
                options={opcionesFiltro}
                value={filtro}
                onChange={setFiltro}
                ariaLabel="Filtrar cirugías por estado"
              />
              <Button variant="secondary-accent" icon={LuLayoutDashboard} onClick={() => setTableroAbierto(true)}>
                Tablero del día
              </Button>
            </div>
            {listado}
          </section>
        </div>
      </div>

      <DetalleCirugiaPanel
        cirugia={selectedCirugia}
        onClose={() => setSelectedId(null)}
        onReprogramar={handleReprogramarCirugia}
        onCancelar={handleCancelarCirugia}
        onMarcarRealizada={handleMarcarRealizada}
        onMarcarIncumplida={handleMarcarIncumplida}
        onPedirInsumos={handlePedirInsumos}
        onCancelarSolicitud={handleCancelarSolicitud}
        onVerEnCanastas={(cirugia) => router.push(canastasHref(cirugia))}
      />

      {modal?.type === 'reprogramar' && (
        <ReprogramarCirugiaModal cirugia={modal.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitReprogramar} />
      )}
      {modal?.type === 'cancelar' && (
        <CancelarCirugiaModal cirugia={modal.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitCancelar} />
      )}

      {/* Tablero del día: modal de 90% x 90%. Va después del detalle y los
          modales de acción de esta pantalla para quedar encima si coinciden. */}
      {tableroAbierto && (
        <TableroDia onClose={() => setTableroAbierto(false)} onCirugiaActualizada={applyUpdated} />
      )}

      <div className={`psc-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
