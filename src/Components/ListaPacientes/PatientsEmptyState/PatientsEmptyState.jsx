import './PatientsEmptyState.css';
import { LuCircleAlert, LuFilterX, LuUserPlus, LuUsers } from 'react-icons/lu';
import Button from '@/Components/Button/Button';

// Tres variantes que no deben verse iguales: "empty" (cero pacientes reales
// en la sede/institución), "no-results" (hay pacientes pero el filtro/búsqueda
// activa no encontró ninguno) y "error" (falló la carga).
export default function PatientsEmptyState({ variant, onPrimaryAction }) {
  if (variant === 'error') {
    return (
      <div className="lp-empty-state lp-empty-state-error">
        <div className="lp-empty-icon"><LuCircleAlert className="icon" /></div>
        <div className="lp-empty-title">No pudimos cargar la lista de pacientes</div>
        <div className="lp-empty-sub">Ocurrió un error al consultar el servidor. Intenta de nuevo.</div>
        <Button variant="secondary" onClick={onPrimaryAction}>Reintentar</Button>
      </div>
    );
  }

  if (variant === 'no-results') {
    return (
      <div className="lp-empty-state">
        <div className="lp-empty-icon"><LuFilterX className="icon" /></div>
        <div className="lp-empty-title">No encontramos pacientes que coincidan con tu búsqueda</div>
        <div className="lp-empty-sub">Prueba con otro nombre o documento, o limpia los filtros aplicados.</div>
        <Button variant="secondary" onClick={onPrimaryAction}>Limpiar filtros</Button>
      </div>
    );
  }

  return (
    <div className="lp-empty-state">
      <div className="lp-empty-icon"><LuUsers className="icon" /></div>
      <div className="lp-empty-title">Todavía no hay pacientes registrados</div>
      <div className="lp-empty-sub">Registra el primer paciente de tu sede para empezar a agendar citas.</div>
      <Button icon={LuUserPlus} onClick={onPrimaryAction}>
        Agregar paciente
      </Button>
    </div>
  );
}
