'use client';

import './DetalleRealizada.css';
import {
  LuCircle, LuCircleCheck, LuClipboardList, LuPackageMinus, LuTriangleAlert,
} from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import EstadoCirugiaBadge from '../../EstadoCirugiaBadge/EstadoCirugiaBadge';
import {
  SALAS, duracionLabel, edadDetalleLabel, fechaHoraRangoLabel, fechaHoraTrazaLabel,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { balanceInsumos, hitosCierre } from '@/hooks/ProgramacionSalaCirugias/detalleRealizada/detalleRealizada';
import { estadoCierre } from '@/hooks/ProgramacionSalaCirugias/cierre/cierre';

function Fact({ label, value }) {
  return (
    <div className="dcr-fact">
      <dt>{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="dcr-stat">
      <span className="dcr-stat-value">{value}</span>
      <span className="dcr-stat-label">{label}</span>
      {hint && <span className="dcr-stat-hint">{hint}</span>}
    </div>
  );
}

// Detalle de una cirugía REALIZADA (encargo explícito): en vez de la vista de
// preparación (tabs de insumos/personal/equipos y acciones sobre una cirugía
// abierta), un resumen del resultado y del cierre: qué se hizo, el balance de
// insumos (entregado/usado/devuelto) y la línea de tiempo del cierre. Solo
// lectura; lo único accionable es lo que falta cerrar (registrar consumo) y
// las hojas de consumo. Se monta dentro del mismo modal de DetalleCirugiaPanel.
export default function DetalleRealizada({
  cirugia, hoja, onClose, onVerEnCanastas, onAbrirHoja,
}) {
  const balance = balanceInsumos(cirugia);
  const cierre = estadoCierre(cirugia, hoja);
  const hitos = hitosCierre(cirugia, hoja);
  const { paciente } = cirugia;
  const sala = SALAS.find((s) => s.value === cirugia.salaId)?.descripcion;
  const duracionMin = duracionLabel(cirugia.horaInicio, cirugia.horaFin);

  return (
    <>
      <ModalHeader
        title="Detalle de la cirugía"
        titleId="dcp-title"
        onClose={onClose}
        closeLabel="Cerrar detalle"
        titleAdornment={<EstadoCirugiaBadge estado={cirugia.estado} />}
      />

      <div className="dcr-body">
        <section className="dcr-hero" aria-label="Resumen de la cirugía">
          <div className="dcr-hero-main">
            <div className="dcr-kicker">
              <span>Programación {cirugia.id}</span>
              {cierre.completo
                ? <Badge tone="success">Cierre completo</Badge>
                : <Badge tone="warn">{`Falta: ${cierre.faltan.join(' y ')}`}</Badge>}
            </div>
            <h4 className="dcr-title">{cirugia.procedimientoPrincipal}</h4>
            <p className="dcr-when">
              {fechaHoraRangoLabel(cirugia.fecha, cirugia.horaInicio, cirugia.horaFin)}
              {' · '}
              {duracionMin} programados
            </p>
            <dl className="dcr-facts">
              <Fact label="Paciente" value={paciente.nombre} />
              <Fact label="Documento" value={paciente.documento} />
              <Fact label="Edad" value={edadDetalleLabel(paciente)} />
              <Fact label="Aseguradora" value={paciente.aseguradora} />
              <Fact label="Cirujano" value={cirugia.cirujano} />
              <Fact label="Sala" value={sala} />
              <Fact label="Anestesia" value={cirugia.tipoAnestesia} />
              <Fact label="Servicio" value={cirugia.servicio} />
            </dl>
          </div>
          <div className="dcr-stats" aria-label="Balance de insumos">
            <Stat label="Entregado" value={balance.entregado} hint="unidades recibidas" />
            <Stat label="Usado" value={balance.usado ?? '—'} hint={balance.consumoRegistrado ? 'unidades' : 'pendiente'} />
            <Stat label="Devuelto" value={balance.devuelto} hint="a farmacia" />
          </div>
        </section>

        <div className="dcr-grid">
          <div className="dcr-col">
          <section className="dcr-card" aria-labelledby="dcr-hizo">
            <h4 id="dcr-hizo" className="dcr-card-title">Qué se hizo</h4>
            <ul className="dcr-procs">
              {cirugia.procedimientos.map((p) => (
                <li key={p.nombre}>
                  <div className="dcr-proc-head">
                    <strong>{p.nombre}</strong>
                    <span>{p.duracionMin} min</span>
                  </div>
                  {p.notas ? <p className="dcr-proc-notas">{p.notas}</p> : null}
                </li>
              ))}
            </ul>

            <h5 className="dcr-sub">Equipo humano</h5>
            <ul className="dcr-personal">
              {cirugia.personal.map((p) => (
                <li key={p.rol}>
                  <span>{p.rol}</span>
                  <strong>{p.nombre}</strong>
                </li>
              ))}
            </ul>

            {cirugia.equipos.length > 0 && (
              <details className="dcr-equipos">
                <summary>Equipos utilizados ({cirugia.equipos.length})</summary>
                <ul>
                  {cirugia.equipos.map((e) => (
                    <li key={e.identificacion}>
                      <strong>{e.nombre}</strong>
                      <span>{e.identificacion}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>

          <section className="dcr-card dcr-cierre" aria-labelledby="dcr-cierre">
            <h4 id="dcr-cierre" className="dcr-card-title">Cierre de la cirugía</h4>
            <ol className="dcr-timeline">
              {hitos.map((h) => (
                <li key={h.key} className={`dcr-hito ${h.estado}`}>
                  {h.estado === 'hecho'
                    ? <LuCircleCheck className="icon" aria-hidden="true" />
                    : <LuCircle className="icon" aria-hidden="true" />}
                  <span className="dcr-hito-label">{h.label}</span>
                  <span className="dcr-hito-meta">
                    {h.estado === 'pendiente'
                      ? 'Pendiente'
                      : [h.usuario, h.fecha ? fechaHoraTrazaLabel(h.fecha) : null].filter(Boolean).join(' · ')}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          </div>

          <section className="dcr-card" aria-labelledby="dcr-consumo">
            <h4 id="dcr-consumo" className="dcr-card-title">Consumo de insumos</h4>
            {!balance.consumoRegistrado && (
              <div className="dcr-alert" role="status">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                <span>
                  Falta registrar el consumo. Hasta entonces no se puede calcular lo usado ni lo que se devuelve.
                </span>
              </div>
            )}
            {balance.filas.length === 0 ? (
              <p className="dcr-empty">No se entregaron insumos para esta cirugía.</p>
            ) : (
              <div className="dcr-table-wrap">
                <table className="dcr-table">
                  <thead>
                    <tr>
                      <th scope="col">Insumo</th>
                      <th scope="col" className="dcr-num">Entregado</th>
                      <th scope="col" className="dcr-num">Usado</th>
                      <th scope="col" className="dcr-num">Devuelto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balance.filas.map((f) => (
                      <tr key={f.nombre}>
                        <td className="dcr-cell-main">{f.nombre}</td>
                        <td className="dcr-num">{f.entregado}</td>
                        <td className="dcr-num">{f.usado ?? '—'}</td>
                        <td className="dcr-num">{f.devuelto || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

      </div>

      <div className="dcp-actions dcr-actions">
        <div className="dcp-actions-estado">
          {/* Orden del cierre: primero la hoja de consumo (precarga el uso de la canasta), después el consumo y la devolución. */}
          <Button variant={cierre.hojaRegistrada ? 'secondary-accent' : 'primary'} icon={LuClipboardList} onClick={onAbrirHoja}>
            {cierre.hojaRegistrada ? 'Hoja de consumo' : 'Registrar hoja de consumo'}
          </Button>
          <Button
            variant={cierre.hojaRegistrada && !balance.consumoRegistrado ? 'primary' : 'secondary-accent'}
            icon={LuPackageMinus}
            onClick={() => onVerEnCanastas(cirugia)}
          >
            {balance.consumoRegistrado ? 'Ver en Canastas' : 'Registrar consumo y devolución'}
          </Button>
        </div>
      </div>
    </>
  );
}
