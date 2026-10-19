// Resumen de la hoja de gasto quirúrgico ya registrada: lo que se ve tras "Registrar consumo" y
// al reabrir la hoja. Lógica pura (sin React ni store): arma el modelo de vista a partir de la
// cirugía y la hoja, y el documento HTML que se imprime / guarda como PDF.
import {
  calcularDevuelto, dxDeIngreso, fechaDDMMAAAA, formatearMiles, formatoDuracionMin, minutosEntreHoras, totales,
} from '../hojaConsumo/hojaConsumo.js';
import { SALAS, fechaHoraRangoLabel } from '../mockCirugiaData.js';

const aNumero = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
const esNumero = (n) => n !== null && Number.isFinite(n);

// "2026-10-15T08:45" -> "15.OCT.2026 - 08:45" (formato de fecha con hora del proyecto).
export function fechaHoraLarga(iso) {
  if (!iso) return '—';
  const [fecha, hora] = String(iso).split('T');
  return hora ? fechaHoraRangoLabel(fecha, hora) : fechaDDMMAAAA(fecha);
}

// Duración real entre inicio y fin de cirugía ('HH:mm'), en minutos; null si falta alguno o el fin
// es anterior al inicio.
function minutosReales(tiempos) {
  if (!tiempos?.inicioOperac || !tiempos?.termOperac) return null;
  const min = minutosEntreHoras(tiempos.inicioOperac, tiempos.termOperac);
  return min >= 0 ? min : null;
}

const duracion = (min) => (min === null ? '—' : formatoDuracionMin(min * 60));

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Estado de la devolución a farmacia (`hoja.resumen.devolucion`): tono (info = hay devolución
// pendiente, ok = nada que devolver, neutral = sin generar / sin dato), título y detalle. `texto` es la
// misma información en una línea (documento impreso). `pendiente`: el resumen se muestra ANTES de confirmar,
// así que habla en futuro ("se generará") en vez de dar por hecha la devolución.
function estadoDevolucion(devolucion, pendiente = false) {
  let tono = 'neutral';
  let titulo = 'Devolución a farmacia';
  let detalle = 'Sin información de la devolución.';
  if (devolucion && !devolucion.generada) {
    titulo = pendiente ? 'No se generará una nueva devolución' : 'Devolución no generada';
    detalle = 'El consumo de la canasta ya estaba registrado antes de la hoja.';
  } else if (devolucion && devolucion.unidades === 0) {
    tono = 'ok';
    titulo = pendiente ? 'No hay insumos por devolver a farmacia' : 'Sin devoluciones a farmacia';
    detalle = 'Todo lo entregado se usó.';
  } else if (devolucion) {
    tono = 'info';
    const cantidad = `${plural(devolucion.unidades, 'unidad', 'unidades')} en ${plural(devolucion.insumos, 'insumo', 'insumos')}`;
    if (pendiente) {
      titulo = 'Se generará la devolución a farmacia';
      detalle = `${cantidad} · quedará pendiente de firma de farmacia`;
    } else {
      titulo = devolucion.consecutivo ? `Devolución N.º ${devolucion.consecutivo} generada` : 'Devolución generada';
      detalle = `${cantidad} · pendiente de firma de farmacia`;
    }
  }
  return {
    tono, titulo, detalle, texto: `${titulo}. ${detalle}`,
  };
}

// Lo que se guarda en la hoja al registrar (`hoja.resumen`), para que el resumen no cambie si luego
// cambia la canasta: quién registró y qué devolución se generó.
export function resumenAlRegistrar({ plan, usuario, consecutivo = null }) {
  return {
    registradaPor: usuario,
    sinDato: plan.sinDato,
    devolucion: {
      generada: plan.generaDevolucion, unidades: plan.unidades, insumos: plan.insumos, consecutivo,
    },
  };
}

// Modelo de vista del resumen. Las filas con devolución van primero (es lo que farmacia revisa).
// `pendiente`: la hoja aún no se registró (es la vista previa antes de "Confirmar").
export function construirResumenHoja(cirugia, hoja, { pendiente = false } = {}) {
  const pac = cirugia.paciente ?? {};
  const sala = SALAS.find((s) => s.value === cirugia.salaId);
  const dx = dxDeIngreso(cirugia.dxIngreso ?? cirugia.wizardDatos?.dxIngreso);
  const snapshot = hoja.resumen ?? {};

  const filas = hoja.materiales.map((m) => {
    const consumido = aNumero(m.consumido);
    const devuelto = calcularDevuelto(m);
    const entregado = aNumero(m.entregado) ?? 0;
    const sinDato = !esNumero(consumido);
    return {
      nombre: m.nombre,
      entregado,
      // Sin dato de consumo la hoja se registra como usado completo (nada que devolver).
      sinDato,
      usado: sinDato ? entregado : consumido,
      devuelto: devuelto === null ? null : devuelto,
      conDevolucion: devuelto !== null && devuelto > 0,
    };
  });
  const ordenadas = [
    ...filas.filter((f) => f.conDevolucion),
    ...filas.filter((f) => !f.conDevolucion),
  ];

  const tot = totales(hoja.materiales);
  const usadas = filas.reduce((acc, f) => acc + f.usado, 0);
  const realMin = minutosReales(hoja.tiempos);
  const estimadaMin = cirugia.horaInicio && cirugia.horaFin
    ? minutosEntreHoras(cirugia.horaInicio, cirugia.horaFin)
    : null;

  return {
    paciente: {
      nombre: pac.nombre || '—',
      edad: pac.edad !== undefined && pac.edad !== null ? `${pac.edad} años` : '—',
      historia: formatearMiles(pac.documento),
    },
    cirugia: {
      fecha: fechaDDMMAAAA(cirugia.fecha),
      sala: sala?.descripcion ?? '—',
      procedimiento: cirugia.procedimientoPrincipal || '—',
      cups: cirugia.procedimientos?.[0]?.cups || '—',
      dxCodigo: dx.codigo,
      dxDescripcion: dx.descripcion,
    },
    pendiente,
    registro: {
      cuando: fechaHoraLarga(hoja.registradaEn),
      por: snapshot.registradaPor ?? '—',
    },
    cifras: {
      usadas,
      entregadas: tot.entregado,
      devueltas: snapshot.devolucion?.unidades ?? tot.devuelto,
      insumosDevueltos: snapshot.devolucion?.insumos ?? filas.filter((f) => f.conDevolucion).length,
      sinDato: snapshot.sinDato ?? filas.filter((f) => f.sinDato).length,
      tiempoReal: duracion(realMin),
      tiempoEstimado: duracion(estimadaMin),
    },
    equipo: [
      { rol: 'Cirujano principal', nombre: hoja.equipo?.cirujano || '—' },
      { rol: 'Cirujano ayudante', nombre: hoja.equipo?.ayudante || '—' },
      { rol: 'Anestesiólogo', nombre: hoja.equipo?.anestesiologo || '—' },
      { rol: 'Instrumentador(a)', nombre: hoja.equipo?.instrumentista || '—' },
      { rol: 'Circulante', nombre: hoja.equipo?.circulante || '—' },
    ],
    tiempos: [
      { etiqueta: 'Inicio anestesia', valor: hoja.tiempos?.inicioAnest || '—' },
      { etiqueta: 'Inicio cirugía', valor: hoja.tiempos?.inicioOperac || '—' },
      { etiqueta: 'Fin cirugía', valor: hoja.tiempos?.termOperac || '—' },
    ],
    filas: ordenadas,
    totalItems: tot.items,
    totalEntregado: tot.entregado,
    devolucion: {
      generada: Boolean(snapshot.devolucion?.generada),
      ...estadoDevolucion(snapshot.devolucion, pendiente),
    },
  };
}

const ESCAPES = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
export const escaparHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

// Documento A4 imprimible del resumen. Estilos en línea: se muestra en un <iframe srcDoc> y desde
// ahí el navegador lo imprime o lo guarda como PDF. Todo texto va escapado.
export function documentoResumenHtml(vm) {
  const e = escaparHtml;
  const filas = vm.filas.map((f) => `
      <tr${f.conDevolucion ? ' class="dev"' : ''}>
        <td>${e(f.nombre)}</td>
        <td class="n">${e(f.entregado)}</td>
        <td class="n">${e(f.usado)}${f.sinDato ? ' <i>(sin dato)</i>' : ''}</td>
        <td class="n">${e(f.devuelto ? f.devuelto : '—')}</td>
      </tr>`).join('');
  const cifras = [
    ['Usados', `${vm.cifras.usadas} de ${vm.cifras.entregadas} u.`],
    ['Devueltas a farmacia', `${vm.cifras.devueltas} u. en ${vm.cifras.insumosDevueltos} insumos`],
    ['Sin consumo digitado (contados como usados)', `${vm.cifras.sinDato} insumos`],
    ['Tiempo quirúrgico', `${vm.cifras.tiempoReal} (estimado ${vm.cifras.tiempoEstimado})`],
  ].map(([k, v]) => `<div class="cifra"><span>${e(k)}</span><b>${e(v)}</b></div>`).join('');
  const equipo = vm.equipo.map((x) => `<tr><td class="k">${e(x.rol)}</td><td>${e(x.nombre)}</td></tr>`).join('');
  const tiempos = vm.tiempos.map((x) => `<tr><td class="k">${e(x.etiqueta)}</td><td>${e(x.valor)}</td></tr>`).join('');

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Resumen de hoja de gasto quirúrgico</title>
<style>
  @page{size:A4;margin:16mm;}
  *{box-sizing:border-box;}
  body{margin:0;padding:24px;font:12px/1.45 system-ui,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:#101827;background:#fff;}
  h1{margin:0 0 2px;font-size:18px;font-weight:600;}
  h2{margin:18px 0 6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#374151;}
  .sub{margin:0;color:#6b7280;}
  .ficha{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-top:12px;padding:10px 12px;border:1px solid #e5e8ef;border-radius:8px;}
  .ficha span{color:#6b7280;}
  .cifras{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
  .cifra{border:1px solid #e5e8ef;border-radius:8px;padding:8px 10px;}
  .cifra span{display:block;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.03em;}
  .cifra b{font-size:13px;font-weight:600;}
  .dos{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  table{width:100%;border-collapse:collapse;}
  th{padding:6px 8px;text-align:left;font-size:11px;font-weight:600;color:#374151;background:#f4f6fb;border-bottom:1px solid #e5e8ef;}
  td{padding:5px 8px;border-bottom:1px solid #eef0f4;}
  th.n,td.n{text-align:right;white-space:nowrap;}
  td.k{width:42%;color:#6b7280;}
  tr.dev td{background:#fff4e0;}
  td i{color:#6b7280;font-size:10px;}
  tfoot td{font-weight:600;border-top:1px solid #e5e8ef;}
  .nota{margin-top:12px;padding:8px 12px;border-radius:8px;background:#f4f6fb;}
  .firmas{display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:48px;}
  .firma{padding-top:6px;border-top:1px solid #374151;text-align:center;color:#374151;}
  tr{break-inside:avoid;}
</style></head>
<body>
  <h1>Hoja de gasto quirúrgico · Resumen</h1>
  <p class="sub">${vm.pendiente ? 'Vista previa · pendiente de confirmar' : `Registrada el ${e(vm.registro.cuando)} por ${e(vm.registro.por)}`}</p>

  <div class="ficha">
    <div><span>Paciente: </span><b>${e(vm.paciente.nombre)}</b></div>
    <div><span>N° historia clínica: </span>${e(vm.paciente.historia)}</div>
    <div><span>Edad: </span>${e(vm.paciente.edad)}</div>
    <div><span>Fecha / Sala: </span>${e(vm.cirugia.fecha)} · ${e(vm.cirugia.sala)}</div>
    <div><span>Procedimiento (CUPS): </span>${e(vm.cirugia.cups)} ${e(vm.cirugia.procedimiento)}</div>
    <div><span>Diagnóstico (CIE-10): </span>${e(vm.cirugia.dxCodigo)} ${e(vm.cirugia.dxDescripcion)}</div>
  </div>

  <h2>Resumen del consumo</h2>
  <div class="cifras">${cifras}</div>

  <h2>Insumos</h2>
  <table>
    <thead><tr><th>Material</th><th class="n">Entregado</th><th class="n">Usado</th><th class="n">Devuelto</th></tr></thead>
    <tbody>${filas}</tbody>
    <tfoot><tr><td>Total · ${e(vm.totalItems)} ítems</td><td class="n">${e(vm.totalEntregado)}</td><td class="n">${e(vm.cifras.usadas)}</td><td class="n">${e(vm.cifras.devueltas)}</td></tr></tfoot>
  </table>
  <div class="nota">${e(vm.devolucion.texto)}</div>

  <div class="dos">
    <div><h2>Equipo quirúrgico</h2><table><tbody>${equipo}</tbody></table></div>
    <div><h2>Tiempos</h2><table><tbody>${tiempos}</tbody></table></div>
  </div>

  <div class="firmas">
    <div class="firma">Firma del circulante</div>
    <div class="firma">Firma de farmacia</div>
  </div>
</body></html>`;
}
