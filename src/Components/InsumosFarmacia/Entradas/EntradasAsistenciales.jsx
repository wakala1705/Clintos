'use client';

import { useEffect, useMemo, useState } from 'react';

// Tokens (:root), shell y estilos .mig-*/.filter-bar/.card: los de Solicitudes (Salidas
// asistenciales), porque es otra pantalla del mismo submódulo Inventario.
import '../Solicitudes/Solicitudes.css';
import '../Solicitudes/shared/shared.css';
import './EntradasAsistenciales.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import FilterListDropdown from '../Solicitudes/FilterListDropdown/FilterListDropdown';
import MovimientosPagination from '../Solicitudes/MovimientosPagination/MovimientosPagination';
import EntradasGrid from './EntradasGrid/EntradasGrid';
import EntradaDetalle from './EntradaDetalle/EntradaDetalle';
import { listarDevolucionesCirugia } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import SearchField from '@/Components/SearchField/SearchField';
import {
  ENTRADAS_HISTORICAS, ESTADO_ENTRADA_OPTIONS, ORIGEN_ENTRADA_OPTIONS, conteosEstado,
  entradasDesdeDevoluciones, filtrarEntradas, ordenarEntradas, totalesEntradas,
} from '@/hooks/InsumosFarmacia/entradasAsistenciales';

const PAGE_SIZE = 15;
const FILTROS_INICIALES = { busqueda: '', estado: 'todos', origen: 'todos' };

// "Entradas asistenciales" (Módulo Contable → Inventario): el registro de todas las
// devoluciones de insumos a farmacia. Las que genera Cirugía al registrar el consumo
// aparecen aquí al instante (listarDevolucionesCirugia); el resto es histórico de
// ejemplo de otras áreas. Solo lectura: las entradas las crean los procesos de origen.
export default function EntradasAsistenciales() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(1);
  // Se leen al montar: las devoluciones de Cirugía viven en memoria y esta página se monta
  // al navegar hasta ella, así que ya incluye las recién registradas.
  const [entradas] = useState(() => ordenarEntradas([
    ...entradasDesdeDevoluciones(listarDevolucionesCirugia()),
    ...ENTRADAS_HISTORICAS,
  ]));

  function handleFiltrosChange(patch) {
    setPage(1);
    setFiltros((f) => ({ ...f, ...patch }));
  }

  // Los conteos de las pestañas respetan el resto de filtros (origen y texto), no el estado.
  const conteos = useMemo(
    () => conteosEstado(filtrarEntradas(entradas, { ...filtros, estado: 'todos' })),
    [entradas, filtros],
  );
  const filtradas = useMemo(() => filtrarEntradas(entradas, filtros), [entradas, filtros]);
  const totales = useMemo(() => totalesEntradas(filtradas), [filtradas]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const pagina = filtradas.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE);

  // Siempre hay algo seleccionado si hay filas (mismo patrón que Salidas asistenciales).
  const effectiveSelectedId = filtradas.some((e) => e.id === selectedId) ? selectedId : (filtradas[0]?.id ?? null);
  const seleccionada = filtradas.find((e) => e.id === effectiveSelectedId) ?? null;

  const opcionesEstado = ESTADO_ENTRADA_OPTIONS.map((o) => ({
    value: o.value, label: o.label, count: o.value === 'todos' ? conteos.todos : conteos[o.value],
  }));

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Inventario"
          page="Entradas asistenciales"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="mig-page-header">
            <div>
              <h1>Entradas asistenciales de inventario</h1>
              <p>Registro de las devoluciones de insumos a farmacia, con su origen y los lotes devueltos.</p>
            </div>
            <p className="ent-resumen" aria-live="polite">
              <b>{totales.unidades}</b> unidades devueltas en <b>{totales.entradas}</b> {totales.entradas === 1 ? 'entrada vigente' : 'entradas vigentes'}
            </p>
          </div>

          <div className="card">
            <div className="mig-shell">
              <div className="filter-bar mig-toolbar">
                <SearchField className="mig-search" value={filtros.busqueda} onChange={(v) => handleFiltrosChange({ busqueda: v })} placeholder="Buscar por consecutivo, paciente o referencia" ariaLabel="Buscar entradas" />

                <div className="filter-spacer" />

                <SegmentedFilterBar
                  options={opcionesEstado}
                  value={filtros.estado}
                  onChange={(v) => handleFiltrosChange({ estado: v })}
                  ariaLabel="Filtrar entradas por estado"
                />
                <div className="filter-cluster">
                  <FilterListDropdown
                    label="Origen"
                    options={ORIGEN_ENTRADA_OPTIONS}
                    value={filtros.origen}
                    onChange={(v) => handleFiltrosChange({ origen: v })}
                  />
                </div>
              </div>

              <EntradasGrid entradas={pagina} selectedId={effectiveSelectedId} onSelect={setSelectedId} />

              <MovimientosPagination
                page={effectivePage}
                pageSize={PAGE_SIZE}
                total={filtradas.length}
                onChangePage={setPage}
                etiqueta="entradas"
              />

              <EntradaDetalle entrada={seleccionada} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
