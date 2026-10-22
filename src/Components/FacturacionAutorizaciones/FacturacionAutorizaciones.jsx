'use client';

import { useEffect, useState } from 'react';
import '@/Components/Facturacion/shared/shared.css';
import './FacturacionAutorizaciones.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import ImprimirMenu from './ImprimirMenu/ImprimirMenu';
import FacturacionMasivaCEModal from '@/Components/FacturacionMasiva/modals/FacturacionMasivaCEModal/FacturacionMasivaCEModal';
import SearchField from '@/Components/SearchField/SearchField';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { ASEGURADORAS_CATALOGO } from '@/hooks/CatalogoAseguradorasModal/mockAseguradorasData';
import {
  LuSquareCheck, LuListChecks, LuListX, LuUserPen, LuFileText, LuUsers,
  LuEye, LuPencil,
} from 'react-icons/lu';

const SIN_DATO = '—';
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

export default function FacturacionAutorizaciones({ filtros }) {
  const [editando, setEditando] = useState(false);
  const [query, setQuery] = useState('');
  const [campo, setCampo] = useState('autorizacion');
  const [estado, setEstado] = useState('sin-facturar');
  const [facturarResp, setFacturarResp] = useState('todos');

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Finanzas"
          page="Facturación de autorizaciones"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="fa-page-header">
            <div>
              <h1>Facturación de autorizaciones</h1>
              <p>Selecciona las autorizaciones pendientes de un tercero y genera su factura.</p>
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
            </section>

            {/* Grilla superior: autorizaciones */}
            <div className="fa-grid fa-grid-top">
              <table>
                <thead>
                  <tr>
                    <th>Fac</th>
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
                <tbody />
              </table>
            </div>

            {/* Grilla inferior: detalle */}
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
                <tbody />
              </table>
            </div>

            {/* Selección + observación */}
            <section className="fa-bottom">
              <div className="fa-bottom-left">
                <div className="fa-select-actions">
                  <Button variant="outline" size="sm" icon={LuSquareCheck}>Marcar uno</Button>
                  <Button variant="outline" size="sm" icon={LuListChecks}>Marcar todo</Button>
                  <Button variant="outline" size="sm" icon={LuListX}>Desmarcar todo</Button>
                  <Button variant="outline" size="sm" icon={LuUserPen} disabled>Cambiar el responsable</Button>
                </div>

                <div className="fa-resp-row">
                  <div className="form-field">
                    <label htmlFor="fa-facturar-resp">Facturar responsables</label>
                    <FormSelect id="fa-facturar-resp" value={facturarResp} onChange={setFacturarResp} options={RESPONSABLES} />
                  </div>
                  <div className="form-field fa-resp-field">
                    <label htmlFor="fa-responsable">Responsable</label>
                    <input id="fa-responsable" className="fa-required" />
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
                <Button variant="secondary-accent" icon={LuFileText}>Una factura x orden médica</Button>
                <Button variant="secondary-accent" icon={LuUsers}>Una factura x responsable cuenta</Button>
                <ImprimirMenu />
              </div>
            </footer>
          </div>
        </div>
      </div>

      {editando && (
        <FacturacionMasivaCEModal filtrosIniciales={filtros} onClose={() => setEditando(false)} />
      )}
    </div>
  );
}
