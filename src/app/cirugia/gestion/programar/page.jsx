import { Suspense } from 'react';
import ProgramarCirugia from '@/Components/ProgramacionSalaCirugias/ProgramarCirugia/ProgramarCirugia';
import '@/Components/ProgramacionSalaCirugias/GestionCirugias/shared/shared.css';

// Suspense: ProgramarCirugia lee la solicitud de la URL (useSearchParams).
export default function ProgramarCirugiaPage() {
  return (
    <Suspense fallback={null}>
      <ProgramarCirugia />
    </Suspense>
  );
}
