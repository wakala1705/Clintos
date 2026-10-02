'use client';

import './FirmasCards.css';
import Badge from '@/Components/Badge/Badge';

// Firmas de la hoja: solo estado (la firma de farmacia llega después del registro).
export default function FirmasCards({ equipo, registrada }) {
  const firmas = [
    { rol: 'Médico', estado: 'Pendiente', tone: 'warn', detalle: equipo.cirujano ? `Responsable: ${equipo.cirujano}` : 'Sin responsable asignado' },
    { rol: 'Recibí conforme', estado: 'Pendiente', tone: 'warn', detalle: equipo.circulante ? `Responsable: ${equipo.circulante}` : 'Sin responsable asignado' },
    registrada
      ? { rol: 'Farmacia', estado: 'Por firmar', tone: 'warn', detalle: 'Consumo registrado, a la espera de farmacia' }
      : { rol: 'Farmacia', estado: 'Sin iniciar', tone: 'neutral', detalle: 'Firma cuando se registre el consumo' },
  ];
  return (
    <section className="hco-section" aria-labelledby="hco-firmas-titulo">
      <div className="hco-section-head">
        <h4 id="hco-firmas-titulo" className="hco-kicker">Firmas</h4>
      </div>
      <div className="hco-firmas">
        {firmas.map((f) => (
          <div key={f.rol} className="hco-firma">
            <div className="hco-firma-top">
              <span className="hco-firma-rol">{f.rol}</span>
              <Badge tone={f.tone} dot>{f.estado}</Badge>
            </div>
            <div className="hco-firma-detalle">{f.detalle}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
