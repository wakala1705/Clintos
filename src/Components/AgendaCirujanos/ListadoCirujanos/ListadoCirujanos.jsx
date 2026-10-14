'use client';

import { useState } from 'react';
import './ListadoCirujanos.css';
import SearchField from '@/Components/SearchField/SearchField';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import CirujanosTable from '../CirujanosTable/CirujanosTable';
import { contarPorEstado, filtrarCirujanos } from '@/hooks/AgendaCirujanos/listado';
import { cirujanosVisibles } from '@/hooks/AgendaCirujanos/permisos';

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'configurada', label: 'Configuradas' },
  { value: 'por-vencer', label: 'Por vencer' },
  { value: 'vencida', label: 'Vencidas' },
  { value: 'sin-configurar', label: 'Sin configurar' },
];

// Listado de cirujanos con su estado de agenda. Una sola fila de toolbar (ver
// AGENTS.md "Barra de filtros de listado"): buscador, spacer, chips de estado
// con conteo. `filas` null = cargando.
export default function ListadoCirujanos({
  filas, hoy, usuario, onAbrir,
}) {
  const [estado, setEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const propias = filas ? cirujanosVisibles(usuario, filas) : [];
  const conteo = contarPorEstado(propias, hoy);
  const visibles = filtrarCirujanos(propias, { estado, busqueda }, hoy);
  const opciones = FILTROS.map((f) => ({ ...f, count: conteo[f.value] }));

  return (
    <>
      <div className="psc-page-header">
        <div>
          <h1>Agenda de cirujanos</h1>
          <p>Configura cuándo opera cada cirujano. Programación solo podrá asignarle cirugías dentro de esa disponibilidad.</p>
        </div>
      </div>

      <section className="ac-card ac-lista" aria-label="Listado de cirujanos">
        <div className="filter-bar">
          <SearchField
            className="ac-buscador"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por nombre del cirujano"
            ariaLabel="Buscar cirujano"
          />
          <div className="filter-spacer" />
          <SegmentedFilterBar
            options={opciones}
            value={estado}
            onChange={setEstado}
            ariaLabel="Filtrar por estado de agenda"
          />
        </div>

        {filas === null ? (
          <p className="ac-estado" role="status">Cargando cirujanos…</p>
        ) : (
          <CirujanosTable filas={visibles} hoy={hoy} usuario={usuario} onAbrir={onAbrir} />
        )}

        <div className="ac-lista-pie">
          <span>Mostrando {visibles.length} de {propias.length} cirujanos</span>
          <span>Un cirujano sin agenda vigente no se puede elegir al programar una cirugía, salvo urgencias.</span>
        </div>
      </section>
    </>
  );
}
