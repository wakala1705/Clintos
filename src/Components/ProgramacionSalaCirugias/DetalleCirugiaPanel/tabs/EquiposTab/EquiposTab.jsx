'use client';

import './EquiposTab.css';
import EquiposTable from '@/Components/EquiposTable/EquiposTable';

export default function EquiposTab({ cirugia }) {
  return <EquiposTable equipos={cirugia.equipos} />;
}
