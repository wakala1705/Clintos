import { Suspense } from 'react';
import CanastasCirugia from '@/Components/ProgramacionSalaCirugias/CanastasCirugia/CanastasCirugia';

// Suspense: CanastasCirugia lee los parámetros de la URL (useSearchParams).
export default function CanastasCirugiaPage() {
  return (
    <Suspense fallback={null}>
      <CanastasCirugia />
    </Suspense>
  );
}
