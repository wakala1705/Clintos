'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LuArrowRight, LuTriangleAlert } from 'react-icons/lu';
import { fechaISO, fetchVencidas } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { contarPorTipo } from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';
import './RevisionPendienteBanner.css';

// Aviso en la agenda cuando hay programaciones vencidas sin cerrar (spec
// 2026-09-25): no bloquea el trabajo diario, pero el pendiente siempre se
// ve. Se calcula al montar -- volver desde la revisión lo remonta y refleja
// lo resuelto allá.
export default function RevisionPendienteBanner() {
  const [conteo, setConteo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchVencidas({ hoy: fechaISO(new Date()) }).then((items) => {
      if (!cancelled) setConteo(contarPorTipo(items));
    });
    return () => { cancelled = true; };
  }, []);

  if (!conteo || conteo.total === 0) return null;

  return (
    <div className="rpb-banner" role="status">
      <LuTriangleAlert className="rpb-icon" aria-hidden="true" />
      <p className="rpb-text">
        <strong>
          {conteo.total} {conteo.total === 1 ? 'programación vencida sin cerrar' : 'programaciones vencidas sin cerrar'}
        </strong>
        {conteo.insumos > 0 && <span> · {conteo.insumos} con insumos comprometidos</span>}
      </p>
      <Link href="/programacion-sala-cirugias/revision" className="rpb-link">
        Revisar
        <LuArrowRight className="rpb-link-icon" aria-hidden="true" />
      </Link>
    </div>
  );
}
