import './FacturasEmptyState.css';
import { LuFilterX } from 'react-icons/lu';
import Button from '@/Components/Button/Button';

// Única variante necesaria hoy: sin resultados para el filtro/búsqueda
// activos (no hay un estado "cero facturas reales" en el mock, a diferencia
// de PatientsEmptyState — Facturación siempre parte con datos).
export default function FacturasEmptyState({ onClearFilters }) {
  return (
    <div className="fact-empty-state">
      <div className="fact-empty-icon"><LuFilterX className="icon" /></div>
      <div className="fact-empty-title">No encontramos facturas que coincidan con tu búsqueda</div>
      <div className="fact-empty-sub">Prueba con otro número, tercero o afiliado, o limpia los filtros aplicados.</div>
      <Button variant="secondary" onClick={onClearFilters}>Limpiar filtros</Button>
    </div>
  );
}
