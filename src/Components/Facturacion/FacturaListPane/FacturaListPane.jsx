'use client';

import './FacturaListPane.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { SORT_OPTIONS } from '@/hooks/Facturacion/mockFacturasData';
import FacturaRow from './FacturaRow/FacturaRow';
import FacturasEmptyState from './FacturasEmptyState/FacturasEmptyState';
import FacturasListSkeleton from './FacturasListSkeleton/FacturasListSkeleton';
import Pagination from './Pagination/Pagination';

// Columna izquierda del maestro-detalle: contador + orden, lista con scroll
// interno de altura fija (no crece infinito la página) y paginación al pie —
// soporta 50+ resultados sin degradar performance (encargo explícito).
export default function FacturaListPane({
  status, facturas, total, page, pageSize, sortBy, onChangeSortBy, onChangePage,
  selectedId, onSelect, onClearFilters,
}) {
  return (
    <div className="fact-list-pane">
      <div className="fact-list-meta">
        <span>{total} factura{total === 1 ? '' : 's'} encontrada{total === 1 ? '' : 's'}</span>
        <div className="fact-sort-field">
          <label htmlFor="fact-sort-by">Ordenar:</label>
          <FormSelect
            id="fact-sort-by"
            ariaLabel="Ordenar facturas"
            value={sortBy}
            onChange={onChangeSortBy}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {status === 'loading' && <FacturasListSkeleton />}

      {status === 'ready' && total === 0 && <FacturasEmptyState onClearFilters={onClearFilters} />}

      {status === 'ready' && total > 0 && (
        <>
          <div className="fact-rows-scroll">
            {facturas.map((f) => (
              <FacturaRow key={f.id} factura={f} selected={f.id === selectedId} onSelect={onSelect} />
            ))}
          </div>
          <Pagination page={page} pageSize={pageSize} total={total} onChangePage={onChangePage} />
        </>
      )}
    </div>
  );
}
