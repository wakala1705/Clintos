'use client';

import { useMemo, useState } from 'react';
import {
  LuArrowLeft, LuCheck, LuChevronDown, LuCircleCheck, LuClipboardCheck, LuClock, LuFileQuestion, LuPackageCheck, LuPackage, LuPackageMinus, LuPrinter, LuTimer, LuTruck, LuUsers,
} from 'react-icons/lu';
import './ResumenHoja.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
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
  const [verPdf, setVerPdf] = useState(false);
  const [estadoAbierto, setEstadoAbierto] = useState(false);
  const srcDoc = useMemo(() => (verPdf ? documentoResumenHtml(vm) : ''), [verPdf, vm]);

  const c = vm.cifras;

  // Las 3 primeras viven dentro de la franja de estado (acordeón); el tiempo quirúrgico, en el bloque de Tiempos.
  const cifrasEstado = [
    {
      icon: LuPackageCheck, label: 'Insumos usados', valor: c.usadas, extra: `de ${c.entregadas} entregados`,
    },
    {
      icon: LuPackageMinus, label: 'Devueltos a farmacia', valor: c.devueltas, extra: plural(c.insumosDevueltos, 'insumo', 'insumos'),
    },
    {
      icon: LuFileQuestion, label: 'Sin consumo digitado', valor: c.sinDato, extra: c.sinDato > 0 ? 'contados como usados' : 'todos informados', warn: c.sinDato > 0,
    },
  ];
  const cifrasTiempo = [
    {
      icon: LuClock, label: 'Tiempo quirúrgico', valor: c.tiempoReal, extra: `estimado ${c.tiempoEstimado}`,
    },
  ];
  const renderCifras = (lista) => (
    <dl className="hcr-cifras">
      {lista.map((x) => (
        <div key={x.label} className={`hcr-cifra${x.warn ? ' warn' : ''}`}>
          <span className="hcr-cifra-icon"><x.icon className="icon" aria-hidden="true" /></span>
          <div>
            <dt>{x.label}</dt>
            <dd>{x.valor} <small>{x.extra}</small></dd>
          </div>
        </div>
      ))}
    </dl>
  );

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
        <div className={`hcr-estado ${vm.devolucion.tono}`}>
          <button
            type="button"
            className="hcr-estado-cab"
            aria-expanded={estadoAbierto}
            aria-controls="hcr-estado-cuerpo"
            onClick={() => setEstadoAbierto((v) => !v)}
          >
            <span className="hcr-estado-icon">
              {vm.devolucion.tono === 'info' ? <LuTruck className="icon" aria-hidden="true" /> : <LuCircleCheck className="icon" aria-hidden="true" />}
            </span>
            <span className="hcr-estado-texto" role="status">
              <strong>{vm.devolucion.titulo}</strong>
              <span className="hcr-estado-sub">{vm.devolucion.detalle}</span>
            </span>
            <LuChevronDown className="icon hcr-estado-chev" aria-hidden="true" />
          </button>
          <div id="hcr-estado-cuerpo" className="hcr-estado-cuerpo" hidden={!estadoAbierto}>
            {renderCifras(cifrasEstado)}
          </div>
        </div>

        <div className="hcr-columnas">
          <section aria-labelledby="hcr-insumos" className="hcr-bloque hcr-insumos">
            <div className="hcr-sec-cab">
              <span className="hcr-sec-icon"><LuPackage className="icon" aria-hidden="true" /></span>
              <h4 id="hcr-insumos" className="hcr-titulo">Insumos</h4>
            </div>
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
                {vm.filas.map((f) => (
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
          </section>

          <div className="hcr-lateral hcr-bloque">
            <section aria-labelledby="hcr-equipo">
              <div className="hcr-sec-cab">
                <span className="hcr-sec-icon"><LuUsers className="icon" aria-hidden="true" /></span>
                <h4 id="hcr-equipo" className="hcr-titulo">Equipo quirúrgico</h4>
              </div>
              <dl className="hcr-lista hcr-equipo">
                {vm.equipo.map((e) => (
                  <div key={e.rol}><dt>{e.rol}</dt><dd>{e.nombre}</dd></div>
                ))}
              </dl>
            </section>
            <section aria-labelledby="hcr-tiempos">
              <div className="hcr-sec-cab">
                <span className="hcr-sec-icon"><LuTimer className="icon" aria-hidden="true" /></span>
                <h4 id="hcr-tiempos" className="hcr-titulo">Tiempos</h4>
              </div>
              <dl className="hcr-lista">
                {vm.tiempos.map((t) => (
                  <div key={t.etiqueta}><dt>{t.etiqueta}</dt><dd>{t.valor}</dd></div>
                ))}
              </dl>
              {renderCifras(cifrasTiempo)}
            </section>
          </div>
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
