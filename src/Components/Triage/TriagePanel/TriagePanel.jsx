'use client';

import { useMemo, useState } from 'react';

import './TriagePanel.css';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import TriageResumen from './TriageResumen/TriageResumen';
import EsperaTable from './EsperaTable/EsperaTable';
import ClasificadosTable from './ClasificadosTable/ClasificadosTable';
import TriageFooter from './TriageFooter/TriageFooter';
import { PAGE_SIZE, TABS } from '@/hooks/Triage/triageData';

import SearchField from '@/Components/SearchField/SearchField';
// Card del registro. Barra de una sola fila (AGENTS.md "Barra de filtros de
// listado"): buscador a la izquierda, .filter-spacer y las pestañas
// En espera / Clasificados (con su conteo) a la derecha. Debajo, el resumen
// de tiempos de la pestaña activa, la tabla y el footer con la paginación.
export default function TriagePanel({ enEspera, clasificados, onIniciar }) {
  const [tab, setTab] = useState('espera');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const lista = tab === 'espera' ? enEspera : clasificados;

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((p) => p.paciente.toLowerCase().includes(q)
      || p.documento.toLowerCase().includes(q));
  }, [lista, query]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const pageActual = Math.min(page, totalPages);
  const desde = (pageActual - 1) * PAGE_SIZE;
  const visibles = filtrados.slice(desde, desde + PAGE_SIZE);

  const tabs = TABS.map((t) => ({
    ...t,
    count: t.value === 'espera' ? enEspera.length : clasificados.length,
  }));

  return (
    <section className="card tg-panel">
      <div className="filter-bar tg-toolbar">
        <SearchField className="tg-search" value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Buscar por nombre o documento..." ariaLabel="Buscar por nombre o documento" />

        <div className="filter-spacer" />

        <SegmentedFilterBar
          options={tabs}
          value={tab}
          onChange={(v) => { setTab(v); setPage(1); }}
          ariaLabel="Pacientes en espera o clasificados"
        />
      </div>

      <TriageResumen tab={tab} lista={lista} />

      {tab === 'espera'
        ? <EsperaTable pacientes={visibles} onIniciar={onIniciar} />
        : <ClasificadosTable pacientes={visibles} />}

      <TriageFooter
        desde={filtrados.length === 0 ? 0 : desde + 1}
        hasta={desde + visibles.length}
        total={filtrados.length}
        page={pageActual}
        totalPages={totalPages}
        onChangePage={setPage}
      />
    </section>
  );
}
