'use client';

import { useRouter } from 'next/navigation';
import './FichaNotFound.css';
import { LuCircleAlert, LuUserX } from 'react-icons/lu';
import Button from '@/Components/Button/Button';

// Mismo patrón visual que PatientsEmptyState (Lista de Pacientes): icono +
// título + subtítulo + acción primaria, dos variantes que no deben verse
// iguales — "not-found" (id inválido en la URL) y "error" (falló la carga).
export default function FichaNotFound({ variant, onRetry }) {
  const router = useRouter();

  if (variant === 'error') {
    return (
      <div className="fp-empty-state">
        <div className="fp-empty-icon"><LuCircleAlert className="icon" /></div>
        <div className="fp-empty-title">No pudimos cargar la ficha del paciente</div>
        <div className="fp-empty-sub">Ocurrió un error al consultar el servidor. Intenta de nuevo.</div>
        <Button variant="secondary" onClick={onRetry}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="fp-empty-state">
      <div className="fp-empty-icon"><LuUserX className="icon" /></div>
      <div className="fp-empty-title">No encontramos este paciente</div>
      <div className="fp-empty-sub">El enlace puede estar roto o el paciente ya no existe en el sistema.</div>
      <Button onClick={() => router.push('/lista-pacientes')}>
        Volver a la lista
      </Button>
    </div>
  );
}
