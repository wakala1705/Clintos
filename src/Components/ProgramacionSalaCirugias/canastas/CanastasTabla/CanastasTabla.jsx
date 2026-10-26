'use client';

import './CanastasTabla.css';
import { LuEye, LuPackageSearch } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import FormSelect from '@/Components/FormSelect/FormSelect';
import SearchField from '@/Components/SearchField/SearchField';
import EstadoCirugiaBadge from '../../EstadoCirugiaBadge/EstadoCirugiaBadge';
import { CANASTA_ESTADO_LABEL, resumenCanasta } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { CANASTA_META, ESTADO_FILTRO_OPTIONS, badgeProps } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';

// Vista "Tabla" de Canastas de cirugía: las solicitudes del día de todas las
// salas (o de una) en una sola tabla; el detalle (recepción / consumo) se abre
// en un modal (CanastaDetalleModal). Barra de una sola fila: buscador a la
// izquierda (precedido por el navegador de fecha, que en esta vista vive acá y no
// en el header); sala y estado a la derecha. Los datos y las acciones viven en el
// orquestador (CanastasCirugia.jsx): esta capa no tiene estado propio.
export default function CanastasTabla({
  cirugias, fechaNav, filtros, onFiltrosChange, salaFiltro, salaOptions, onSalaChange, salaLabel, onAbrir,
}) {
  return (
    <section className="cnt-panel" aria-label="Solicitudes de canastas del día">
      <div className="filter-bar cnt-toolbar">
        {fechaNav}
        <SearchField
          className="cnt-search"
          value={filtros.busqueda}
          onChange={(busqueda) => onFiltrosChange({ busqueda })}
          placeholder="Buscar paciente, procedimiento o solicitud..."
          ariaLabel="Buscar por paciente, procedimiento o número de solicitud"
        />
        <span className="filter-spacer" />
        <div className="cnt-select">
          <FormSelect id="cnt-sala" ariaLabel="Sala" value={salaFiltro} onChange={onSalaChange} options={salaOptions} />
        </div>
        <div className="cnt-select">
          <FormSelect
            id="cnt-estado"
            ariaLabel="Estado de la canasta"
            value={filtros.estado}
            onChange={(estado) => onFiltrosChange({ estado })}
            options={ESTADO_FILTRO_OPTIONS}
          />
        </div>
      </div>

      {cirugias.length === 0 ? (
        <div className="cnt-vacio" role="status">
          <LuPackageSearch className="cnt-vacio-icon" aria-hidden="true" />
          <p>Ninguna solicitud coincide con los filtros.</p>
        </div>
      ) : (
        <div className="cnt-scroll">
          <table className="cnt-table">
            <thead>
              <tr>
                <th scope="col">Solicitud</th>
                <th scope="col" className="cnt-num">Recibidos</th>
                <th scope="col">Estado de la canasta</th>
                <th scope="col">Paciente</th>
                <th scope="col">Procedimiento</th>
                <th scope="col">Hora de procedimiento</th>
                <th scope="col">Sala</th>
                <th scope="col"><span className="cnt-sr">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {cirugias.map((c) => {
                const r = resumenCanasta(c);
                return (
                  <tr
                    key={c.id}
                    tabIndex={0}
                    onClick={() => onAbrir(c.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) onAbrir(c.id); }}
                  >
                    <td className="cnt-solicitud">{c.farmacia?.numeroPedido ?? '—'}</td>
                    <td className="cnt-num">{r.total === 0 ? '—' : `${r.recibidos}/${r.total}`}</td>
                    <td><Badge {...badgeProps(CANASTA_META[r.estado])}>{CANASTA_ESTADO_LABEL[r.estado]}</Badge></td>
                    <td><span className="cnt-main">{c.paciente.nombre}</span></td>
                    <td>
                      <span className="cnt-proc">
                        {c.procedimientoPrincipal}
                        {c.estado === 'urgencia' && <EstadoCirugiaBadge estado="urgencia" size="sm" />}
                      </span>
                    </td>
                    <td className="cnt-hora">{c.horaInicio}</td>
                    <td>{salaLabel(c.salaId)}</td>
                    <td className="cnt-actions">
                      <button
                        type="button"
                        className="cnt-ver"
                        aria-label={`Ver detalle de ${c.paciente.nombre}`}
                        title="Ver detalle"
                        onClick={(e) => { e.stopPropagation(); onAbrir(c.id); }}
                      >
                        <LuEye className="icon" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
