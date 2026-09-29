import './TrazabilidadPagination.css';
import Button from '@/Components/Button/Button';
import { LuWrench } from 'react-icons/lu';

// "Reintentar trabajos colgados" se repite acá (mismo callback que el botón
// del toolbar) -- encargo de la referencia: acceso rápido también al fondo
// de una lista larga, sin tener que volver a subir. Formato de la paginación
// en sí ("Página X de Y (N registros)" + Anterior/Siguiente en texto) es el
// de la referencia -- distinto del patrón dominante en el resto del proyecto
// (Mostrando X-Y de Z + flechas ícono-solo, ver Pagination.jsx de
// Facturación/ListaPacientes), sin precedente exacto para "texto visible"
// (ver research); mismos criterios de disabled en los extremos.
export default function TrazabilidadPagination({
  page, pageSize, total, onChangePage, onReintentarColgados,
}) {
  if (total === 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="traz-footer">
      <Button variant="secondary" size="sm" icon={LuWrench} onClick={onReintentarColgados}>
        Reintentar trabajos colgados (&gt;30m)
      </Button>

      <div className="traz-footer-pagination">
        <span className="traz-pagination-label">Página {page} de {totalPages} ({total} registros)</span>
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChangePage(page - 1)}>Anterior</Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onChangePage(page + 1)}>Siguiente</Button>
      </div>
    </div>
  );
}
