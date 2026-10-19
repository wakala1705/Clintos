import { Suspense } from 'react';
import AgendaCirujanos from '@/Components/AgendaCirujanos/AgendaCirujanos';
import '@/Components/AgendaCirujanos/shared/shared.css';

export default function AgendaCirujanosPage() {
  // Suspense: la pantalla lee ?cirujano= (useSearchParams) para abrir el editor.
  return (
    <Suspense fallback={null}>
      <AgendaCirujanos />
    </Suspense>
  );
}
