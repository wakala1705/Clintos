'use client';

import './ValeResultadoEtapa.css';
import {
  LuActivity, LuBaby, LuBone, LuCircleCheck, LuClipboardList, LuEar, LuMessageCircle, LuTriangleAlert, LuUsers,
} from 'react-icons/lu';

// Comprensión/Expresión/Interacción/Vestibular son dimensiones de tamizaje
// reales (Aprobado/Falla/No aplica); Perinatal/Estructural son listas de
// hallazgos/factores de riesgo, no pruebas de tamizaje (ver valeData.js) —
// se muestran con un badge distinto (Con/Sin hallazgos) para que la
// diferencia sea clara de un vistazo, nunca como "aprobado/falla".
function badgeDimension(d) {
  if (!d.aplica) return { texto: 'No aplica a esta edad', variant: 'no-aplica' };
  return d.falla ? { texto: 'Falla', variant: 'fail' } : { texto: 'Aprobado', variant: 'pass' };
}
function badgeHallazgos(conHallazgos) {
  return conHallazgos
    ? { texto: 'Con hallazgos', variant: 'hallazgos' }
    : { texto: 'Sin hallazgos', variant: 'sin-hallazgos' };
}

// Etapa 5 (última) de VALE — Resultado. Separa visualmente la captura de la
// interpretación clínica (encargo): cards de resultado por dimensión +
// resultado general, y si hay FALLA, la conducta recomendada con jerarquía
// visual propia. `resultado` es `null` hasta terminar de validar Vestibular
// (ver ValeStep.jsx) — antes de eso se muestra un estado pendiente en vez de
// una pantalla en blanco.
export default function ValeResultadoEtapa({ resultado }) {
  if (!resultado) {
    return (
      <div className="ac-wrap">
        <h1 className="pf-section-title">Resultado VALE</h1>
        <p className="pf-section-desc">Resumen de la valoración del desarrollo infantil.</p>
        <section className="pf-card vale-res-pending">
          <LuClipboardList className="icon" aria-hidden="true" />
          <p>Completa las secciones de Comprensión/Expresión/Interacción y Vestibular para ver el resultado.</p>
        </section>
      </div>
    );
  }

  const cards = [
    { key: 'comprension', label: 'Comprensión', icon: LuEar, badge: badgeDimension(resultado.comprension) },
    { key: 'expresion', label: 'Expresión', icon: LuMessageCircle, badge: badgeDimension(resultado.expresion) },
    { key: 'interaccion', label: 'Interacción', icon: LuUsers, badge: badgeDimension(resultado.interaccion) },
    { key: 'vestibular', label: 'Vestibular', icon: LuActivity, badge: badgeDimension(resultado.vestibular) },
    {
      key: 'perinatal', label: 'Condiciones perinatales y postnatales', icon: LuBaby,
      badge: badgeHallazgos(resultado.perinatal.conHallazgos),
    },
    {
      key: 'estructural', label: 'Condiciones estructurales', icon: LuBone,
      badge: badgeHallazgos(resultado.estructural.conHallazgos),
    },
  ];

  return (
    <div className="ac-wrap">
      <h1 className="pf-section-title">Resultado VALE</h1>
      <p className="pf-section-desc">Resumen de la valoración del desarrollo infantil.</p>

      <section className={`vale-res-headline ${resultado.fallaTamizaje ? 'fail' : 'pass'}`}>
        {resultado.fallaTamizaje
          ? <LuTriangleAlert className="icon" aria-hidden="true" />
          : <LuCircleCheck className="icon" aria-hidden="true" />}
        <div>
          <h2>{resultado.fallaTamizaje ? 'Falla en el tamizaje' : 'Resultado satisfactorio'}</h2>
          <p>Total de respuestas negativas: <b>{resultado.totalNegativas}</b></p>
        </div>
      </section>

      {resultado.fallaTamizaje && resultado.conductaRecomendada && (
        <section className="vale-res-conducta">
          <h3>Conducta recomendada</h3>
          <p>{resultado.conductaRecomendada}</p>
        </section>
      )}

      <div className="vale-res-grid">
        {cards.map(({ key, label, icon: Icon, badge }) => (
          <div className="vale-res-card" key={key}>
            <div className={`vale-res-card-icon ${badge.variant}`}>
              <Icon className="icon" aria-hidden="true" />
            </div>
            <div className="vale-res-card-body">
              <span className="vale-res-card-label">{label}</span>
              <span className={`vale-res-badge ${badge.variant}`}>{badge.texto}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
