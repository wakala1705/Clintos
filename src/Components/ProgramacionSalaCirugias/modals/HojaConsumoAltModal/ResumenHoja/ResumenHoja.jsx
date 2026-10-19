'use client';

import { useMemo, useState } from 'react';
import {
  LuArrowLeft, LuCheck, LuCircleCheck, LuClipboardCheck, LuClock, LuFileQuestion, LuPackageCheck, LuPackageMinus, LuPrinter, LuTruck,
} from 'react-icons/lu';
import './ResumenHoja.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import ChipFilter from '@/Components/ChipFilter/ChipFilter';
import PdfViewerModal from '@/Components/PdfViewerModal/PdfViewerModal';
import ContextoBarra from '../ContextoBarra/ContextoBarra';
import { construirResumenHoja, documentoResumenHtml } from '@/hooks/ProgramacionSalaCirugias/cierre/resumenHoja';

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Modal aparte y de solo lectura con el resumen de la hoja de gasto, en dos modos:
// - `pendiente`: paso previo al registro. Se abre al pulsar "Registrar consumo" en la hoja y NADA se ha
//   registrado todavía: "Confirmar" (`onConfirmar`) es lo que registra el consumo y genera la devolución a
//   farmacia; cerrar o "Volver a la hoja" (`onVolver`) regresa a la hoja sin registrar. `error` muestra
//   por qué falló la confirmación.
// - registrada (por defecto): lo que se abre al reabrir una hoja ya registrada; "Cerrar" (`onClose`).
// Las cifras y el documento salen de resumenHoja.js (lógica pura con tests); "Imprimir / Guardar PDF"
// abre el documento en PdfViewerModal.
export default function ResumenHoja({
  cirugia, hoja, pendiente = false, error = '', onClose, onVolver, onConfirmar, onVerEnCanastas,
}) {
  const vm = useMemo(() => construirResumenHoja(cirugia, hoja, { pendiente }), [cirugia, hoja, pendiente]);
  const salir = pendiente ? onVolver : onClose;
  const [filtro, setFiltro] = useState('todos');
  const [verPdf, setVerPdf] = useState(false);
  const srcDoc = useMemo(() => (verPdf ? documentoResumenHtml(vm) : ''), [verPdf, vm]);

  const conDevolucion = vm.filas.filter((f) => f.conDevolucion);
  const filas = filtro === 'devolucion' ? conDevolucion : vm.filas;
  const c = vm.cifras;

  const cifras = [
    {
      icon: LuPackageCheck, label: 'Insumos usados', valor: c.usadas, extra: `de ${c.entregadas} entregados`,
    },
    {
      icon: LuPackageMinus, label: 'Devueltos a farmacia', valor: c.devueltas, extra: plural(c.insumosDevueltos, 'insumo', 'insumos'),
    },
    {
      icon: LuFileQuestion, label: 'Sin consumo digitado', valor: c.sinDato, extra: c.sinDato > 0 ? 'contados como usados' : 'todos informados', warn: c.sinDato > 0,
    },
    {
      icon: LuClock, label: 'Tiempo quirúrgico', valor: c.tiempoReal, extra: `estimado ${c.tiempoEstimado}`,
    },
  ];

  return (
    <div className="modal-overlay open" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) salir(); }}>
    <div className="modal-card hcr-card" role="dialog" aria-modal="true" aria-labelledby="hcr-title">
      <ModalHeader
        icon={LuClipboardCheck}
        tone="primary"
        title="Resumen de la hoja de gasto quirúrgico"
        titleId="hcr-title"
        titleAdornment={pendiente ? <Badge tone="warn">Por confirmar</Badge> : <Badge tone="success">Registrada</Badge>}
        subtitle={pendiente
          ? 'Revisa el resumen. Al confirmar se registra el consumo y se genera la devolución a farmacia.'
          : `Registrada el ${vm.registro.cuando} por ${vm.registro.por}`}
        onClose={salir}
        closeLabel={pendiente ? 'Volver a la hoja' : 'Cerrar resumen'}
        autoFocusClose
      />

      <ContextoBarra cirugia={cirugia} />

      <div className="hcr-cuerpo">
        {error && <p className="hcr-error" role="alert">{error}</p>}
        <div className={`hcr-estado ${vm.devolucion.tono}`} role="status">
          <span className="hcr-estado-icon">
            {vm.devolucion.tono === 'info' ? <LuTruck className="icon" aria-hidden="true" /> : <LuCircleCheck className="icon" aria-hidden="true" />}
          </span>
          <div>
            <strong>{vm.devolucion.titulo}</strong>
            <span>{vm.devolucion.detalle}</span>
          </div>
        </div>

        <dl className="hcr-cifras">
          {cifras.map((x) => (
            <div key={x.label} className={`hcr-cifra${x.warn ? ' warn' : ''}`}>
              <span className="hcr-cifra-icon"><x.icon className="icon" aria-hidden="true" /></span>
              <div>
                <dt>{x.label}</dt>
                <dd>{x.valor} <small>{x.extra}</small></dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="hcr-columnas">
          <div className="hcr-lateral">
            <section aria-labelledby="hcr-equipo">
              <h4 id="hcr-equipo" className="hcr-titulo">Equipo quirúrgico</h4>
              <dl className="hcr-lista hcr-equipo">
                {vm.equipo.map((e) => (
                  <div key={e.rol}><dt>{e.rol}</dt><dd>{e.nombre}</dd></div>
                ))}
              </dl>
            </section>
            <section aria-labelledby="hcr-tiempos">
              <h4 id="hcr-tiempos" className="hcr-titulo">Tiempos</h4>
              <dl className="hcr-lista">
                {vm.tiempos.map((t) => (
                  <div key={t.etiqueta}><dt>{t.etiqueta}</dt><dd>{t.valor}</dd></div>
                ))}
              </dl>
            </section>
          </div>

          <section aria-labelledby="hcr-insumos">
            <div className="hcr-tabla-cab">
              <h4 id="hcr-insumos" className="hcr-titulo">Insumos</h4>
              <div className="hcr-filtros" role="group" aria-label="Filtrar insumos">
                <ChipFilter size="sm" active={filtro === 'todos'} aria-pressed={filtro === 'todos'} count={vm.filas.length} onClick={() => setFiltro('todos')}>Todos</ChipFilter>
                <ChipFilter size="sm" active={filtro === 'devolucion'} aria-pressed={filtro === 'devolucion'} count={conDevolucion.length} disabled={conDevolucion.length === 0} onClick={() => setFiltro('devolucion')}>Con devolución</ChipFilter>
              </div>
            </div>
            <div className="hcr-tabla-wrap">
              <table className="hcr-tabla">
                <thead>
                  <tr>
                    <th scope="col">Material</th>
                    <th scope="col" className="hcr-num">Entregado</th>
                    <th scope="col" className="hcr-num">Usado</th>
                    <th scope="col" className="hcr-num">Devuelto</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.length === 0 && (
                    <tr><td colSpan={4} className="hcr-vacio">Ningún insumo tiene devolución.</td></tr>
                  )}
                  {filas.map((f) => (
                    <tr key={f.nombre} className={f.conDevolucion ? 'hcr-dev' : undefined}>
                      <td>{f.nombre}</td>
                      <td className="hcr-num">{f.entregado}</td>
                      <td className="hcr-num">
                        {f.sinDato && <span className="hcr-sin-dato">sin dato</span>}
                        {f.usado}
                      </td>
                      <td className="hcr-num">{f.devuelto || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total · {plural(vm.totalItems, 'ítem', 'ítems')}</td>
                    <td className="hcr-num">{vm.totalEntregado}</td>
                    <td className="hcr-num">{c.usadas}</td>
                    <td className="hcr-num">{c.devueltas}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>
      </div>

      <div className="modal-footer hca-footer">
        <div className="hca-footer-acciones">
          {pendiente && <Button variant="secondary" icon={LuArrowLeft} onClick={onVolver}>Volver a la hoja</Button>}
          {!pendiente && onVerEnCanastas && (
            <Button variant="secondary-accent" icon={LuPackageMinus} onClick={() => onVerEnCanastas(cirugia)}>Ver en Canastas</Button>
          )}
          <Button variant="secondary-accent" icon={LuPrinter} onClick={() => setVerPdf(true)}>Imprimir / PDF</Button>
          {pendiente
            ? <Button icon={LuCheck} onClick={onConfirmar}>Confirmar</Button>
            : <Button onClick={onClose}>Cerrar</Button>}
        </div>
      </div>

    </div>

    {verPdf && (
      <PdfViewerModal
        title="Resumen de la hoja de gasto quirúrgico"
        subtitle={vm.paciente.nombre}
        srcDoc={srcDoc}
        onClose={() => setVerPdf(false)}
      />
    )}
    </div>
  );
}
