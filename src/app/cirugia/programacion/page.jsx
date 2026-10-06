import { Suspense } from 'react';
import ProgramacionSalaCirugias from '@/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias';

export default function ProgramacionSalaCirugiasPage() {
  // Suspense: la pantalla lee ?solicitud= (useSearchParams) al venir de Gestión de cirugías.
  return (
    <Suspense fallback={null}>
      <ProgramacionSalaCirugias />
    </Suspense>
  );
}
