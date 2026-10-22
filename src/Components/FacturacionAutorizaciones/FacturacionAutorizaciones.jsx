'use client';

import { useEffect, useState } from 'react';
import '@/Components/Facturacion/shared/shared.css';
import './FacturacionAutorizaciones.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import ImprimirMenu from './ImprimirMenu/ImprimirMenu';
import SplitPane from '@/Components/SplitPane/SplitPane';
import VistaModoMenu from '@/Components/Facturacion/FacturaVistaClasica/VistaModoMenu/VistaModoMenu';
import FacturacionMasivaCEModal from '@/Components/FacturacionMasiva/modals/FacturacionMasivaCEModal/FacturacionMasivaCEModal';
import SearchField from '@/Components/SearchField/SearchField';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  SPLIT_RATIO_DEFAULT, setSplitRatio, setVistaModo, useSplitRatio, useVistaModo,
} from '@/hooks/FacturacionAutorizaciones/vistaAutorizacionesPrefs';
import { AUTORIZACIONES, coincideEstado } from '@/hooks/FacturacionAutorizaciones/mockAutorizacionesData';
import CatalogoAseguradorasModal from '@/Components/CatalogoAseguradorasModal/CatalogoAseguradorasModal';
import { ASEGURADORAS_CATALOGO } from '@/hooks/CatalogoAseguradorasModal/mockAseguradorasData';
import {
  LuUserPen, LuFileText, LuUsers,
  LuEye, LuPencil, LuSearch,
} from 'react-icons/lu';

const SIN_DATO = '—';

function moneda(valor) {
  return valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PYP_LABEL = { si: 'Sí', no: 'No', todos: 'Todos' };

// 'YYYY-MM-DD' -> 'DD/MM/AAAA'
function fechaCorta(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Datos de contexto de la facturación: solo lectura. Vienen de los filtros del
// modal de Facturación masiva (query string de la ruta); lo que falte se
// muestra como "—".
function datosFacturacion({ tercero, regimen, contrato, pyp, desde, hasta } = {}) {
  const aseguradora = ASEGURADORAS_CATALOGO.find((a) => a.idTercero === tercero);
  // "340 - Contributivo" (lo arma el catálogo de contratos) -> "Contributivo"
  const nombreRegimen = regimen?.includes(' - ') ? regimen.split(' - ').slice(1).join(' - ') : regimen;
  let rango = SIN_DATO;
  if (desde && hasta) rango = `${fechaCorta(desde)} – ${fechaCorta(hasta)}`;
  else if (desde) rango = `Desde ${fechaCorta(desde)}`;
  else if (hasta) rango = `Hasta ${fechaCorta(hasta)}`;
  return [
    { label: 'Id. Tercero', value: tercero ? [tercero, aseguradora?.razonSocial].filter(Boolean).join(' · ') : SIN_DATO },
    { label: 'Régimen', value: nombreRegimen || SIN_DATO },
    { label: 'ID. Contrato', value: contrato || SIN_DATO },
    { label: 'P y P', value: PYP_LABEL[pyp] || SIN_DATO },
    { label: 'Rango de fechas', value: rango },
  ];
}
const DATOS_CONSECUTIVO = [
  { label: 'Cons Fact.', value: '0208474646' },
  { label: 'KCNTID', value: '340' },
];

const CAMPOS_BUSQUEDA = [
  { value: 'autorizacion', label: 'No. autorización' },
  { value: 'afiliado', label: 'Id. afiliado' },
];
const ESTADOS = [
  { value: 'sin-facturar', label: 'Sin Facturar y Parciales' },
  { value: 'sin-facturar-solo', label: 'Sin Facturar' },
  { value: 'parciales', label: 'Parciales' },
  { value: 'facturadas', label: 'Facturadas' },
];
const RESPONSABLES = [
  { value: 'todos', label: 'Todos los Responsables' },
  { value: 'uno', label: 'Un Responsable' },
];

// `modo`: 'ordenes' (con la grilla de detalle) | 'citas' (misma pantalla, sin detalle).
const MODOS = {
  ordenes: {
    titulo: 'Facturación de autorizaciones',
    descripcion: 'Selecciona las autorizaciones pendientes de un tercero y genera su factura.',
    ruta: '/facturacion/autorizaciones',
    detalle: true,
    unaFacturaPor: 'orden médica',
  },
  citas: {
    titulo: 'Facturación de citas',
    descripcion: 'Selecciona las citas atendidas de un tercero y genera su factura.',
    ruta: '/facturacion/citas',
    detalle: false,
    unaFacturaPor: 'cita médica',
  },
};

export default function FacturacionAutorizaciones({ filtros, modo = 'ordenes' }) {
  const cfg = MODOS[modo];
  const [editando, setEditando] = useState(false);
  // Vista 'lista' | 'dividida' (solo con detalle) y proporción del divisor: se recuerdan entre visitas.
  const vista = useVistaModo();
  const splitRatio = useSplitRatio();
  const [query, setQuery] = useState('');
  const [campo, setCampo] = useState('autorizacion');
  const [estado, setEstado] = useState('sin-facturar');
  const [facturarResp, setFacturarResp] = useState('todos');
  const [responsable, setResponsable] = useState('');
  const [catalogoResponsableAbierto, setCatalogoResponsableAbierto] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // fila resaltada (su detalle va en la grilla inferior)
  const [marcadas, setMarcadas] = useState(() => new Set()); // ids marcados para facturar

  // "340 - Contributivo" -> 340; "0" o vacío -> sin filtro por contrato.
  const contratoId = Number.parseInt(filtros?.regimen, 10);
  const q = query.trim().toLowerCase();
  const visibles = AUTORIZACIONES.filter((a) => {
    if (!coincideEstado(a, estado)) return false;
    if (contratoId > 0 && a.kcnt !== contratoId) return false;
    if (q && !(campo === 'autorizacion' ? a.noAutorizacion : a.idAfiliado).toLowerCase().includes(q)) return false;
    return true;
  });
  const seleccionada = visibles.find((a) => a.id === selectedId) ?? null;
  const facturables = visibles.filter((a) => a.estado !== 'facturada');
  const cantMarcadas = facturables.filter((a) => marcadas.has(a.id)).length;

  function toggleMarca(id) {
    setMarcadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  // El catálogo entrega solo el Id. Tercero; el campo muestra "id · razón social".
  function elegirResponsable(idTercero) {
    const tercero = ASEGURADORAS_CATALOGO.find((t) => t.idTercero === idTercero);
    setResponsable(tercero ? `${idTercero} · ${tercero.razonSocial}` : idTercero);
  }

  // Checkbox general de la columna "Fac": marca/desmarca todas las facturables visibles.
  const todasMarcadas = facturables.length > 0 && cantMarcadas === facturables.length;
  function toggleTodas() {
    setMarcadas((prev) => {
      const next = new Set(prev);
      facturables.forEach((a) => { if (todasMarcadas) next.delete(a.id); else next.add(a.id); });
      return next;
    });
  }

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  // Grilla de autorizaciones (siempre) y su detalle (solo en facturación por
  // órdenes médicas): en vista "dividida" van en un SplitPane; en "lista", solo la grilla.
  const grillaAutorizaciones = (
    <div className="fa-grid fa-grid-top">
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={todasMarcadas}
                ref={(el) => { if (el) el.indeterminate = cantMarcadas > 0 && !todasMarcadas; }}
                disabled={facturables.length === 0}
                onChange={toggleTodas}
                aria-label="Marcar todas las autorizaciones"
              />
            </th>
            <th>Fecha</th>
            <th>No. autorización</th>
            <th>Id. afiliado</th>
            <th>Nombre afiliado</th>
            <th className="fa-num">Valor Total</th>
            <th className="fa-num">Valor Copago</th>
            <th>Id. área funcional</th>
            <th>Centro Costo</th>
            <th>Id. Plan</th>
            <th>KCNT</th>
          </tr>
        </thead>
        <tbody>
          {visibles.map((a) => {
            const facturada = a.estado === 'facturada';
            return (
              <tr
                key={a.id}
                className={`${a.id === selectedId ? 'fa-selected' : ''}${facturada ? ' fa-facturada' : ''}`}
                onClick={() => setSelectedId(a.id)}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={!facturada && marcadas.has(a.id)}
                    disabled={facturada}
                    onChange={() => toggleMarca(a.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Marcar la autorización ${a.noAutorizacion}`}
                  />
                </td>
                <td>{fechaCorta(a.fecha)}</td>
                <td>{a.noAutorizacion}</td>
                <td>{a.idAfiliado}</td>
                <td>{a.nombreAfiliado}</td>
                <td className="fa-num">{moneda(a.valorTotal)}</td>
                <td className="fa-num">{moneda(a.valorCopago)}</td>
                <td>{a.idAreaFuncional}</td>
                <td>{a.centroCosto}</td>
                <td>{a.idPlan}</td>
                <td>{a.kcnt}</td>
              </tr>
            );
          })}
          {visibles.length === 0 && (
            <tr><td colSpan={11} className="fa-empty">No hay autorizaciones con los filtros actuales.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
  const grillaDetalle = (
    <div className="fa-grid fa-grid-bottom">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Servicio</th>
            <th>N</th>
            <th className="fa-num">Cant</th>
            <th className="fa-num">Valor</th>
            <th className="fa-num">Valor Copago</th>
            <th>Tercero al que se le cobra</th>
            <th>No. Factura</th>
          </tr>
        </thead>
        <tbody>
          {seleccionada?.items.map((it, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{it.servicio}</td>
              <td>{it.n}</td>
              <td className="fa-num">{it.cant}</td>
              <td className="fa-num">{moneda(it.valor)}</td>
              <td className="fa-num">{moneda(it.copago)}</td>
              <td>{it.tercero}</td>
              <td>{it.noFactura}</td>
            </tr>
          ))}
          {!seleccionada && (
            <tr><td colSpan={8} className="fa-empty">Selecciona una autorización para ver su detalle.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Finanzas"
          page={cfg.titulo}
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="fa-page-header">
            <div>
              <h1>{cfg.titulo}</h1>
              <p>{cfg.descripcion}</p>
            </div>

            <div className="fa-datos">
              {[...datosFacturacion(filtros), ...DATOS_CONSECUTIVO].map((d) => (
                <div key={d.label} className="fa-dato"><span>{d.label}</span><b>{d.value}</b></div>
              ))}
              <Button variant="outline" size="sm" icon={LuPencil} onClick={() => setEditando(true)} className="fa-editar-btn" aria-label="Editar datos de la facturación" title="Editar" />
            </div>
          </div>

          <div className="card fa-shell">
            {/* Encabezado: tercero + filtros */}
            <section className="fa-filters" aria-label="Filtros">
              <SearchField
                className="fa-search"
                value={query}
                onChange={setQuery}
                placeholder={campo === 'autorizacion' ? 'Buscar por No. autorización' : 'Buscar por Id. afiliado'}
                fields={CAMPOS_BUSQUEDA}
                field={campo}
                onChangeField={setCampo}
              />

              <div className="fa-estado">
                <FormSelect id="fa-estado" value={estado} onChange={setEstado} options={ESTADOS} ariaLabel="Estado de las autorizaciones" />
              </div>

              {cfg.detalle && <VistaModoMenu modo={vista} onChange={setVistaModo} />}
            </section>

            {cfg.detalle && vista === 'dividida' ? (
              <SplitPane
                ratio={splitRatio}
                onRatioChange={setSplitRatio}
                defaultRatio={SPLIT_RATIO_DEFAULT}
                label="Redimensionar lista de autorizaciones y detalle"
                top={grillaAutorizaciones}
                bottom={grillaDetalle}
              />
            ) : grillaAutorizaciones}

            {/* Selección + observación */}
            <section className="fa-bottom">
              <div className="fa-bottom-left">
                <div className="fa-select-actions">
                  <Button variant="outline" size="sm" icon={LuUserPen} disabled={cantMarcadas === 0}>Cambiar el responsable</Button>
                </div>

                <div className="fa-resp-row">
                  <div className="form-field">
                    <label htmlFor="fa-facturar-resp">Facturar responsables</label>
                    <FormSelect id="fa-facturar-resp" value={facturarResp} onChange={setFacturarResp} options={RESPONSABLES} />
                  </div>
                  <div className="form-field fa-resp-field">
                    <label htmlFor="fa-responsable">Responsable</label>
                    <div className="field-with-search">
                      <input
                        id="fa-responsable"
                        className="fa-required"
                        value={responsable}
                        onChange={(e) => setResponsable(e.target.value)}
                      />
                      <button
                        type="button"
                        className="search-btn"
                        onClick={() => setCatalogoResponsableAbierto(true)}
                        aria-label="Buscar responsable"
                        title="Buscar responsable"
                      >
                        <LuSearch className="icon" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="fa-resp-hint">
                  <LuEye className="icon" aria-hidden="true" />
                  Se facturarán todos los Terceros Responsables
                </p>
              </div>

              <div className="form-field fa-obs">
                <label htmlFor="fa-observacion">Observación factura</label>
                <textarea id="fa-observacion" rows={4} />
              </div>
            </section>

            {/* Acciones */}
            <footer className="fa-actions">
              <div className="fa-actions-main">
                <Button variant="secondary-accent" icon={LuFileText}>Una factura x {cfg.unaFacturaPor}</Button>
                <Button variant="secondary-accent" icon={LuUsers}>Una factura x responsable cuenta</Button>
                <ImprimirMenu />
              </div>
            </footer>
          </div>
        </div>
      </div>

      {catalogoResponsableAbierto && (
        <CatalogoAseguradorasModal
          onSelect={elegirResponsable}
          onClose={() => setCatalogoResponsableAbierto(false)}
        />
      )}

      {editando && (
        <FacturacionMasivaCEModal filtrosIniciales={filtros} rutaEdicion={cfg.ruta} onClose={() => setEditando(false)} />
      )}
    </div>
  );
}
