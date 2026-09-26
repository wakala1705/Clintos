import { LuTriangleAlert } from 'react-icons/lu';
import './TriageResumen.css';
import { UMBRAL_ESPERA_MIN, formatearEspera, promedioMin } from '@/hooks/Triage/triageData';

// Franja de resumen bajo la barra de filtros — réplica de la línea de la
// referencia legacy ("Pacientes en espera: 1 | Tiempo promedio de espera:
// 28h 19m | ⚠ 1 pacientes > 30m"). Se calcula sobre la pestaña completa, no
// sobre la búsqueda: es el estado de la sala, no del filtro.
export default function TriageResumen({ tab, lista }) {
  const promedio = formatearEspera(promedioMin(lista));

  if (tab === 'clasificados') {
    return (
      <div className="tg-resumen">
        <span>Clasificados: <b>{lista.length}</b></span>
        <span className="tg-resumen-sep" aria-hidden="true" />
        <span>Tiempo promedio hasta clasificación: <b>{promedio}</b></span>
      </div>
    );
  }

  const demorados = lista.filter((p) => p.esperaMin > UMBRAL_ESPERA_MIN).length;

  return (
    <div className="tg-resumen">
      <span>Pacientes en espera: <b>{lista.length}</b></span>
      <span className="tg-resumen-sep" aria-hidden="true" />
      <span>Tiempo promedio de espera: <b>{promedio}</b></span>
      {demorados > 0 && (
        <>
          <span className="tg-resumen-sep" aria-hidden="true" />
          <span className="tg-resumen-alerta">
            <LuTriangleAlert className="icon" aria-hidden="true" />
            <b>{demorados}</b> {demorados === 1 ? 'paciente' : 'pacientes'} con más de {UMBRAL_ESPERA_MIN} min
          </span>
        </>
      )}
    </div>
  );
}
