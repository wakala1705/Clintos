'use client';

import { LuCheckCheck, LuInfo, LuPlus, LuTriangleAlert } from 'react-icons/lu';
import './InsumosPanel.css';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import StepperConsumo from '../StepperConsumo/StepperConsumo';
import {
  calcularDevuelto, consumoCompleto, excedeEntregado, marcarTodoConsumido, materialManual, materialesConConsumo,
  totales,
} from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';

// Columna derecha: paquete, progreso del consumo y tabla de insumos con consumido editable.
export default function InsumosPanel({ materiales, onChange }) {
  const set = (id, campo, valor) => onChange(materiales.map((m) => (m.id === id ? { ...m, [campo]: valor } : m)));
  const registrados = materialesConConsumo(materiales).length;
  const completo = consumoCompleto(materiales);
  const tot = totales(materiales);
  const ratio = materiales.length ? registrados / materiales.length : 0;

  return (
    <div className="hca-insumos">
      <div className="hca-insumos-top">
        <div className="hca-paquete">
          <div className="hca-progreso">
            <div className="hca-progreso-texto">
              <span>Consumo registrado</span>
              <b>{registrados} de {materiales.length}</b>
            </div>
            <div
              className="hca-progreso-barra"
              role="progressbar"
              aria-label="Consumo registrado"
              aria-valuemin={0}
              aria-valuemax={materiales.length}
              aria-valuenow={registrados}
            >
              <div className={`hca-progreso-relleno${completo ? ' is-completo' : ''}`} style={{ transform: `scaleX(${ratio})` }} />
            </div>
          </div>
        </div>
        <div className="hca-insumos-acciones">
          <Button variant="tinted" icon={LuCheckCheck} onClick={() => onChange(marcarTodoConsumido(materiales))}>
            Todo consumido
          </Button>
          <Button variant="outline" icon={LuPlus} onClick={() => onChange([...materiales, materialManual()])}>
            Agregar insumo
          </Button>
        </div>
      </div>

      <div className="hca-tabla-card">
        <table className="hca-tabla">
          <thead>
            <tr>
              <th>Material</th>
              <th className="hca-num">Entregado</th>
              <th className="hca-num">Consumido</th>
              <th className="hca-num">Devuelto</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((m) => {
              const exceso = excedeEntregado(m);
              const devuelto = calcularDevuelto(m);
              const nombre = m.nombre || 'insumo nuevo';
              let celdaDevuelto = <span className="hca-vacio">—</span>;
              if (exceso) celdaDevuelto = <Badge tone="danger">Excede</Badge>;
              else if (devuelto !== null) celdaDevuelto = <Badge tone={devuelto > 0 ? 'info' : 'success'}>{devuelto}</Badge>;
              return (
                <tr key={m.id} className={exceso ? 'is-error' : undefined}>
                  <td>
                    {m.manual ? (
                      <input
                        className="hca-input"
                        type="text"
                        value={m.nombre}
                        placeholder="Nombre del insumo"
                        aria-label="Nombre del insumo"
                        onChange={(e) => set(m.id, 'nombre', e.target.value)}
                      />
                    ) : (
                      <span className="hca-nombre">
                        {m.nombre}
                        {m.receta && (
                          <span className="hca-formula">
                            <LuTriangleAlert className="icon" aria-hidden="true" />
                            Requiere fórmula
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="hca-num">
                    {m.manual ? (
                      <input
                        className="hca-input hca-input-num"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        value={m.entregado}
                        aria-label={`Entregado de ${nombre}`}
                        onChange={(e) => set(m.id, 'entregado', e.target.value)}
                      />
                    ) : (
                      <span className="hca-entregado">{m.entregado}</span>
                    )}
                  </td>
                  <td className="hca-num">
                    <StepperConsumo
                      value={m.consumido}
                      max={m.entregado === '' || Number.isNaN(Number(m.entregado)) ? null : Number(m.entregado)}
                      label={nombre}
                      invalid={exceso}
                      onChange={(v) => set(m.id, 'consumido', v)}
                    />
                  </td>
                  <td className="hca-num">{celdaDevuelto}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Total · {tot.items} {tot.items === 1 ? 'ítem' : 'ítems'}</td>
              <td className="hca-num">{tot.entregado}</td>
              <td className="hca-num">{registrados ? tot.consumido : '—'}</td>
              <td className="hca-num">{registrados ? tot.devuelto : '—'}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="hca-nota">
        <LuInfo className="icon" aria-hidden="true" />
        Devuelto se calcula automáticamente: Entregado − Consumido.
      </p>
    </div>
  );
}
