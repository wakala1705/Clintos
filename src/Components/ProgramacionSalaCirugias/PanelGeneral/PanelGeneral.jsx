'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LuDownload, LuPlus, LuTv,
} from 'react-icons/lu';
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './PanelGeneral.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import DetalleCirugiaPanel from '../DetalleCirugiaPanel/DetalleCirugiaPanel';
import ReprogramarCirugiaModal from '../modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal';
import CancelarCirugiaModal from '../modals/CancelarCirugiaModal/CancelarCirugiaModal';
import IniciarCirugiaModal from '../modals/IniciarCirugiaModal/IniciarCirugiaModal';
import FinalizarCirugiaModal from '../modals/FinalizarCirugiaModal/FinalizarCirugiaModal';
import HojaConsumoAltModal from '../modals/HojaConsumoAltModal/HojaConsumoAltModal';
import PanelKpis from './PanelKpis/PanelKpis';
import CirugiasDiaTable from './CirugiasDiaTable/CirugiasDiaTable';
import VistaEstados from './VistaEstados/VistaEstados';
import DerivacionModal from '../modals/DerivacionModal/DerivacionModal';
import PantallaFamiliaresModal from '@/Components/PantallaFamiliares/PantallaFamiliaresModal/PantallaFamiliaresModal';
import {
  SALAS, ahoraDemo, fechaISO, fetchAgendaRango, motivoNoIniciable,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { canastasHref } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import {
  RANGOS_PANEL, filasACsv, filtrarFilas, kpisPanel, rangoFechas,
} from '@/hooks/ProgramacionSalaCirugias/panel/panel';
import useCirugiasAcciones from '@/hooks/ProgramacionSalaCirugias/useCirugiasAcciones';

import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import VistaPanelMenu from './VistaPanelMenu/VistaPanelMenu';
import SearchField from '@/Components/SearchField/SearchField';
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
  // Vista del contenido del panel: "Tabla" (por defecto) o "Tablero" (por
  // estado, arrastrable). Vive en la URL (?vista=tablero) para poder abrirla
  // directo o dejarla fija en una pantalla de coordinación. Ambas vistas usan el
  // mismo rango (Hoy/Semana/Mes); con más de un día las tarjetas muestran su fecha.
  const searchParams = useSearchParams();
  const vista = searchParams.get('vista') === 'tablero' ? 'tablero' : 'tabla';
  function setVista(v) {
    router.replace(v === 'tablero' ? '/cirugia?vista=tablero' : '/cirugia', { scroll: false });
  }
  // Datos cargados + el rango al que pertenecen: si no coincide con el rango
  // elegido, se está cargando (sin setState síncrono en el efecto).
  const [datos, setDatos] = useState({ rango: null, items: [] });
  const [filtro, setFiltro] = useState('todas');
  const [rango, setRango] = useState('hoy');
  const [busqueda, setBusqueda] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  // Demo de la pantalla de familiares (televisor de la sala de espera) en un modal.
  const [familiaresAbierto, setFamiliaresAbierto] = useState(false);
  // Tipo de vista: compacto (KPIs de una línea, la tarjeta de la tabla o el
  // tablero gana ese alto) o expandido. Arranca compacto (encargo explícito);
  // se elige en el menú de configuración de vista.
  const [tipoVista, setTipoVista] = useState('compacto');
  const kpisCompactos = tipoVista === 'compacto';
  // Reloj del render: define "en curso"/"retrasada" (ver estadoVisual).
  const [ahora] = useState(() => ahoraDemo());

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const { inicio, fin } = rangoFechas(rango);
    Promise.all(SALAS_SEDE.map((s) => fetchAgendaRango({
      sedeId: SEDE_ID, salaId: s.value, inicio, fin,
    }))).then((porSala) => {
      if (!cancelled) setDatos({ rango, items: porSala.flat() });
    });
    return () => { cancelled = true; };
  }, [rango]);

  const cirugias = datos.rango === rango ? datos.items : null; // null = cargando
  const rangoActual = rangoFechas(rango);
  const { periodo } = RANGOS_PANEL[rango];

  // La respuesta de cada mutación ya trae el registro completo: se refleja en
  // la lista sin re-fetch (sale del panel si quedó fuera del rango).
  function applyUpdated(actualizada) {
    const fuera = actualizada.sedeId !== SEDE_ID
      || actualizada.fecha < rangoActual.inicio || actualizada.fecha > rangoActual.fin;
    setDatos((prev) => {
      let items;
      if (fuera) items = prev.items.filter((c) => c.id !== actualizada.id);
      else if (prev.items.some((c) => c.id === actualizada.id)) items = prev.items.map((c) => (c.id === actualizada.id ? actualizada : c));
      else items = [...prev.items, actualizada];
      return { ...prev, items };
    });
  }

  const {
    modal, setModal, toast,
    handleSubmitReprogramar, handleSubmitCancelar,
    handleReprogramarCirugia, handleCancelarCirugia,
    handleIniciarCirugia, handleAbrirHoja, handleSubmitIniciar, handleFinalizarCirugia, handleSubmitFinalizar, handleFinalizarDesdeHoja,
    handleMarcarRealizada, handleMarcarIncumplida,
    handleMoverEtapa, handleSubmitDerivacion,
    handlePedirInsumos, handleVincularCanasta, handleCancelarSolicitud, handleConsumoRegistrado,
  } = useCirugiasAcciones({ applyUpdated });

  const lista = cirugias ?? [];
  const filas = filtrarFilas(lista, ahora, { filtro, busqueda });
  const selectedCirugia = lista.find((c) => c.id === selectedId) ?? null;
  const hayFiltros = filtro !== 'todas' || busqueda.trim() !== '';

  // Exporta lo que muestra la tabla (con los filtros aplicados).
  function handleExportar() {
    const csv = filasACsv(filas, ahora, salaLabel);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `cirugias-${rango}-${fechaISO(new Date())}.csv`;
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
  } else if (vista === 'tablero') {
    listado = (
      <VistaEstados
        cirugias={filas}
        salaLabel={salaLabel}
        mostrarFecha={rango !== 'hoy'}
        ahora={ahora}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMoverEtapa={handleMoverEtapa}
        onReprogramar={handleReprogramarCirugia}
        onMarcarRealizada={handleMarcarRealizada}
        onMarcarIncumplida={handleMarcarIncumplida}
        onCancelar={handleCancelarCirugia}
      />
    );
  } else if (filas.length === 0) {
    listado = (
      <div className="pg-cir-estado" role="status">
        <p>{lista.length === 0 ? `No hay cirugías programadas ${periodo}.` : 'Ninguna cirugía coincide con los filtros.'}</p>
        {hayFiltros && <Button variant="secondary" size="sm" onClick={limpiarFiltros}>Limpiar filtros</Button>}
      </div>
    );
  } else {
    listado = (
      <CirugiasDiaTable
        filas={filas}
        ahora={ahora}
        salaLabel={salaLabel}
        mostrarFecha={rango !== 'hoy'}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onReprogramar={handleReprogramarCirugia}
        onMarcarRealizada={handleMarcarRealizada}
        onMarcarIncumplida={handleMarcarIncumplida}
        onCancelar={handleCancelarCirugia}
        motivoNoIniciable={(c) => motivoNoIniciable(c, ahora, lista)}
        onIniciar={handleIniciarCirugia}
        onAbrirHoja={handleAbrirHoja}
        onFinalizar={handleFinalizarCirugia}
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
              <Button variant="secondary" icon={LuTv} onClick={() => setFamiliaresAbierto(true)}>
                Pantalla de familiares
              </Button>
              {vista === 'tabla' && (
                <Button variant="secondary" icon={LuDownload} onClick={handleExportar} disabled={filas.length === 0}>
                  Exportar
                </Button>
              )}
              <Button icon={LuPlus} onClick={() => router.push('/cirugia/programacion')}>
                Programar cirugía
              </Button>
            </div>
          </div>

          <div className={`pg-cir-kpis${kpisCompactos ? ' compact' : ''}`}>
            <PanelKpis
              kpis={kpisPanel(lista, ahora, SALAS_SEDE, rangoActual.dias)}
              compact={kpisCompactos}
              filtro={filtro}
              periodo={periodo}
              onFiltro={setFiltro}
            />
          </div>

          <section className="pg-cir-panel" aria-label={`Cirugías de ${periodo}`}>
            <div className="filter-bar pg-cir-toolbar">
              <SearchField className="psc-search" value={busqueda} onChange={(v) => setBusqueda(v)} placeholder="Buscar paciente, procedimiento..." ariaLabel="Buscar cirugías" />
              <span className="filter-spacer" />
              <SegmentedFilterBar
                options={Object.entries(RANGOS_PANEL).map(([value, { label }]) => ({ value, label }))}
                value={rango}
                onChange={setRango}
                ariaLabel="Filtrar cirugías por fecha"
              />
              <VistaPanelMenu
                vista={vista}
                onChange={setVista}
                tipo={tipoVista}
                onChangeTipo={setTipoVista}
              />
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
        onVincularCanasta={handleVincularCanasta}
        onCancelarSolicitud={handleCancelarSolicitud}
        onConsumoRegistrado={handleConsumoRegistrado}
        onFinalizarCirugia={handleFinalizarDesdeHoja}
        onVerEnCanastas={(cirugia) => router.push(canastasHref(cirugia))}
      />

      {modal?.type === 'reprogramar' && (
        <ReprogramarCirugiaModal cirugia={modal.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitReprogramar} />
      )}
      {modal?.type === 'iniciar' && (
        <IniciarCirugiaModal cirugia={modal.cirugia} salaLabel={salaLabel(modal.cirugia.salaId)} onClose={() => setModal(null)} onSubmit={handleSubmitIniciar} />
      )}
      {modal?.type === 'finalizar' && (
        <FinalizarCirugiaModal cirugia={modal.cirugia} salaLabel={salaLabel(modal.cirugia.salaId)} onClose={() => setModal(null)} onSubmit={handleSubmitFinalizar} />
      )}
      {modal?.type === 'hoja' && (
        <HojaConsumoAltModal
          cirugia={lista.find((c) => c.id === modal.cirugia.id) ?? modal.cirugia}
          onConsumoRegistrado={handleConsumoRegistrado}
          onFinalizar={handleFinalizarDesdeHoja}
          onClose={() => setModal(null)}
        />
      )}
      {familiaresAbierto && (
        <PantallaFamiliaresModal onClose={() => setFamiliaresAbierto(false)} />
      )}
      {modal?.type === 'derivar' && (
        <DerivacionModal cirugia={modal.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitDerivacion} />
      )}
      {modal?.type === 'cancelar' && (
        <CancelarCirugiaModal cirugia={modal.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitCancelar} />
      )}

      <div className={`psc-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
