import { Suspense } from 'react';
import PanelGeneral from '@/Components/ProgramacionSalaCirugias/PanelGeneral/PanelGeneral';

export default function CirugiaPanelGeneralPage() {
  // Suspense: PanelGeneral lee ?vista= de la URL (useSearchParams).
  return (
    <Suspense fallback={null}>
      <PanelGeneral />
    </Suspense>
  );
}
