import './RecepcionSub.css';
import { LuCalendar, LuCheck, LuChevronDown, LuFilter, LuSearch, LuTriangleAlert } from 'react-icons/lu';

// Sub-panel "Recepción" de Pedidos: acordeón orden → medicamento → artículo/lote.
// Las 7 órdenes de aquí son el estado semilla; legacy-app.js las filtra (por
// estado/fecha/tipo), expande/colapsa por atributo data-group/data-parent-group,
// y confirma la recepción (botón .btn-confirm-receipt) sin volver a renderizar
// este árbol — solo reemplaza el contenido de *-status y los data-* de la orden.
// Cuando se envía un pedido nuevo desde el modal de "Pedido a farmacia",
// legacy-app.js inserta una nueva orden al inicio de #recepcion-list vía innerHTML.
export default function RecepcionSub() {
  return (
    <div role="tabpanel" id="subpanel-recepcion" aria-labelledby="subtab-recepcion" tabIndex="0" className="sub-panel">
      <div className="filter-bar">
        <div className="search-field">
          <label htmlFor="search-recepcion" className="sr-only">Buscar recepción por medicamento o insumo</label>
          <LuSearch className="icon" aria-hidden="true" />
          <input type="text" placeholder="Buscar medicamento o insumo..." id="search-recepcion"/>
        </div>
        <div className="chip-group" id="chipgroup-recepcion-estado">
          <button className="chip-filter" data-filter="todas" aria-pressed="false">Todas</button>
          <button className="chip-filter active" data-filter="despachado" aria-pressed="true">Pendiente</button>
          <button className="chip-filter" data-filter="recibido" aria-pressed="false">Recibido</button>
          <button className="chip-filter" data-filter="parcial" aria-pressed="false">Parcial</button>
        </div>
        <div className="filter-divider"></div>
        <div className="chip-group" id="chipgroup-recepcion-fecha">
          <button className="chip-filter" data-quickdate="hoy" aria-pressed="false">Hoy</button>
          <button className="chip-filter" data-quickdate="semana" aria-pressed="false">Última semana</button>
        </div>
        <div className="filter-popover-wrap" id="recep-date-popover-wrap">
          <button className="date-picker-btn" id="recep-date-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="recep-date-popover">
            <LuCalendar className="icon" />
            <span id="recep-date-range-label">Rango personalizado</span>
            <LuChevronDown className="icon chev" />
          </button>
          <div className="filter-popover" id="recep-date-popover" role="dialog" aria-label="Seleccionar rango de fechas">
            <div className="fp-title">Seleccionar rango de fechas</div>
            <div className="fp-date-row">
              <div className="fp-date-field">
                <label htmlFor="recep-date-from">Desde</label>
                <input type="date" id="recep-date-from"/>
              </div>
              <div className="fp-date-field">
                <label htmlFor="recep-date-to">Hasta</label>
                <input type="date" id="recep-date-to"/>
              </div>
            </div>
            <div className="fp-actions">
              <button className="btn btn-secondary" type="button" id="recep-date-clear-btn">Limpiar</button>
              <button className="btn btn-primary" type="button" id="recep-date-apply-btn">Aplicar</button>
            </div>
          </div>
        </div>
        <div className="filter-divider"></div>
        <div className="filter-popover-wrap" id="recep-more-popover-wrap">
          <button className="filters-more-btn" id="recep-more-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="recep-more-popover">
            <LuFilter className="icon" />
            Otros filtros
            <span className="badge-count" id="recep-more-badge-count" style={{display: 'none'}} aria-live="polite">0</span>
          </button>
          <div className="filter-popover" id="recep-more-popover" role="dialog" aria-label="Otros filtros: tipo">
            <div className="fp-section">
              <div className="fp-section-title">Tipo</div>
              <div className="chip-group" id="recep-tipo-chip-group">
                <button className="chip-filter" data-tipo="medicamento" aria-pressed="false">Medicamento</button>
                <button className="chip-filter" data-tipo="insumo" aria-pressed="false">Insumo</button>
              </div>
            </div>
            <div className="fp-actions">
              <button className="btn btn-secondary" type="button" id="recep-more-clear-btn">Limpiar</button>
              <button className="btn btn-primary" type="button" id="recep-more-apply-btn">Aplicar</button>
            </div>
          </div>
        </div>
      </div>

      <div className="recep-list" id="recepcion-list">
        <div className="recep-order" id="order-recep-478" data-order-id="recep-478" data-estado="recibido" data-partial="false">
          <div className="recep-order-header">
            <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="body-recep-478" data-group="recep-478" title="Ver medicamentos de esta orden">
              <LuChevronDown className="icon" aria-hidden="true" />
            </button>
            <span className="recep-order-number">SOL-000478</span>
            <span className="recep-order-date">02 May 2026 · 08:10</span>
            <span className="child-count-badge">2 ítems</span>
            <div className="recep-order-spacer"></div>
            <div className="recep-order-status" id="recep-478-status">
              <span className="confirmed-tag"><LuCheck className="icon" aria-hidden="true" />Recibido</span>
            </div>
          </div>
          <div className="recep-order-body" id="body-recep-478" data-parent-group="recep-478">
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-enoxaparina" data-group="enoxaparina" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Enoxaparina sódica 40 mg solución inyectable</span>
              <span className="child-count-badge">3</span>
            </div>
            <div className="recep-med-detail collapsed" id="detalle-enoxaparina" data-parent-group="enoxaparina">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr>
                    <td>MX0000012-1</td>
                    <td>Enoxaparina sódica 40 mg solución inyectable - Clexane</td>
                    <td className="cant-entregada">3</td>
                    <td>L-48210</td>
                    <td>2027-08-31</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="detalle-acetaminofen" data-group="acetaminofen" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Acetaminofén 500 mg tableta</span>
              <span className="child-count-badge">3</span>
            </div>
            <div className="recep-med-detail" id="detalle-acetaminofen" data-parent-group="acetaminofen">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>MX0000005-2</td><td>Acetaminofén 500 mg tableta - Genfar</td><td className="cant-entregada">1</td><td>858E</td><td>2026-12-31</td></tr>
                  <tr><td>MX0000005-2</td><td>Acetaminofén 500 mg tableta - Genfar</td><td className="cant-entregada">1</td><td>ERR_25</td><td>2026-12-31</td></tr>
                  <tr><td>MX0000005-3</td><td>Acetaminofén 500mg tableta (Dolex)</td><td className="cant-entregada">1</td><td>UTYLO778</td><td>2026-09-16</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="recep-order" id="order-recep-481" data-order-id="recep-481" data-estado="despachado" data-partial="false">
          <div className="recep-order-header">
            <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="body-recep-481" data-group="recep-481" title="Ver medicamentos de esta orden">
              <LuChevronDown className="icon" aria-hidden="true" />
            </button>
            <span className="recep-order-number">SOL-000481</span>
            <span className="recep-order-date">02 May 2026 · 10:15</span>
            <span className="child-count-badge">1 ítem</span>
            <div className="recep-order-spacer"></div>
            <div className="recep-order-status" id="recep-481-status">
              <button type="button" className="btn btn-primary btn-sm btn-confirm-receipt" data-confirm-target="recep-481" data-med-targets="ceftriaxona" data-partial="false">
                <LuCheck className="icon" aria-hidden="true" />
                Confirmar recepción
              </button>
            </div>
          </div>
          <div className="recep-order-body" id="body-recep-481" data-parent-group="recep-481">
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="detalle-ceftriaxona" data-group="ceftriaxona" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Ceftriaxona sódica 1 g solución inyectable</span>
              <span className="child-count-badge" id="ceftriaxona-badge">4</span>
            </div>
            <div className="recep-med-detail" id="detalle-ceftriaxona" data-parent-group="ceftriaxona">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>MX0000041-1</td><td>Ceftriaxona sódica 1 g - Rocephin</td><td className="cant-entregada">1</td><td>L-51190</td><td>2026-11-30</td></tr>
                  <tr><td>MX0000041-1</td><td>Ceftriaxona sódica 1 g - Rocephin</td><td className="cant-entregada">1</td><td>L-51204</td><td>2026-11-30</td></tr>
                  <tr><td>MX0000041-1</td><td>Ceftriaxona sódica 1 g - Rocephin</td><td className="cant-entregada">1</td><td>L-51218</td><td>2026-12-15</td></tr>
                  <tr><td>MX0000041-1</td><td>Ceftriaxona sódica 1 g - Rocephin</td><td className="cant-entregada">1</td><td>L-51233</td><td>2027-01-10</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="recep-order" id="order-recep-493" data-order-id="recep-493" data-estado="despachado" data-partial="false">
          <div className="recep-order-header">
            <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="body-recep-493" data-group="recep-493" title="Ver medicamentos de esta orden">
              <LuChevronDown className="icon" aria-hidden="true" />
            </button>
            <span className="recep-order-number">SOL-000493</span>
            <span className="recep-order-date">02 May 2026 · 06:50</span>
            <span className="child-count-badge">2 ítems</span>
            <div className="recep-order-spacer"></div>
            <div className="recep-order-status" id="recep-493-status">
              <button type="button" className="btn btn-primary btn-sm btn-confirm-receipt" data-confirm-target="recep-493" data-med-targets="aposito-hidrocoloide,gasa-esteril" data-partial="false">
                <LuCheck className="icon" aria-hidden="true" />
                Confirmar recepción
              </button>
            </div>
          </div>
          <div className="recep-order-body collapsed" id="body-recep-493" data-parent-group="recep-493">
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-aposito-hidrocoloide" data-group="aposito-hidrocoloide" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Apósito hidrocoloide 10x10 cm</span>
              <span className="child-count-badge" id="aposito-hidrocoloide-badge">5</span>
            </div>
            <div className="recep-med-detail collapsed" id="detalle-aposito-hidrocoloide" data-parent-group="aposito-hidrocoloide">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>IN0000018-1</td><td>Apósito hidrocoloide 10x10 cm - Convatec</td><td className="cant-entregada">5</td><td>L-90214</td><td>2027-04-30</td></tr>
                </tbody>
              </table>
            </div>
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-gasa-esteril" data-group="gasa-esteril" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Gasa estéril 10x10 cm</span>
              <span className="child-count-badge" id="gasa-esteril-badge">10</span>
            </div>
            <div className="recep-med-detail collapsed" id="detalle-gasa-esteril" data-parent-group="gasa-esteril">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>IN0000021-1</td><td>Gasa estéril 10x10 cm - Curitas Médicas</td><td className="cant-entregada">10</td><td>L-77031</td><td>2028-01-31</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="recep-order" id="order-recep-497" data-order-id="recep-497" data-estado="recibido" data-partial="false">
          <div className="recep-order-header">
            <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="body-recep-497" data-group="recep-497" title="Ver medicamentos de esta orden">
              <LuChevronDown className="icon" aria-hidden="true" />
            </button>
            <span className="recep-order-number">SOL-000497</span>
            <span className="recep-order-date">02 May 2026 · 11:20</span>
            <span className="child-count-badge">1 ítem</span>
            <div className="recep-order-spacer"></div>
            <div className="recep-order-status" id="recep-497-status">
              <span className="confirmed-tag"><LuCheck className="icon" aria-hidden="true" />Recibido</span>
            </div>
          </div>
          <div className="recep-order-body collapsed" id="body-recep-497" data-parent-group="recep-497">
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-metamizol" data-group="metamizol" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Metamizol sódico 1 g solución inyectable</span>
              <span className="child-count-badge">2</span>
            </div>
            <div className="recep-med-detail collapsed" id="detalle-metamizol" data-parent-group="metamizol">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>MX0000029-1</td><td>Metamizol sódico 1 g solución inyectable - Novalgina</td><td className="cant-entregada">2</td><td>L-60214</td><td>2027-02-28</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="recep-order" id="order-recep-501" data-order-id="recep-501" data-estado="recibido" data-partial="true">
          <div className="recep-order-header">
            <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="body-recep-501" data-group="recep-501" title="Ver medicamentos de esta orden">
              <LuChevronDown className="icon" aria-hidden="true" />
            </button>
            <span className="recep-order-number">SOL-000501</span>
            <span className="recep-order-date">02 May 2026 · 14:05</span>
            <span className="child-count-badge">3 ítems</span>
            <div className="recep-order-spacer"></div>
            <div className="recep-order-status" id="recep-501-status">
              <span className="confirmed-tag"><LuCheck className="icon" aria-hidden="true" />Recibido</span>
              <span className="partial-flag" title="Un ítem de esta orden se recibió incompleto"><LuTriangleAlert className="icon" aria-hidden="true" />Parcial</span>
            </div>
          </div>
          <div className="recep-order-body" id="body-recep-501" data-parent-group="recep-501">
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-vancomicina-501" data-group="vancomicina-501" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Vancomicina 1 g solución inyectable</span>
              <span className="child-count-badge">2</span>
            </div>
            <div className="recep-med-detail collapsed" id="detalle-vancomicina-501" data-parent-group="vancomicina-501">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>MX0000015-1</td><td>Vancomicina 1 g solución inyectable - Vancocin</td><td className="cant-entregada">2</td><td>L-42078</td><td>2027-01-31</td></tr>
                </tbody>
              </table>
            </div>
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="detalle-piperacilina" data-group="piperacilina" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Piperacilina/Tazobactam 4.5 g solución inyectable</span>
              <span className="child-count-badge">4</span>
              <span className="partial-flag" title="Se solicitaron 6 unidades y solo se confirmaron 4"><LuTriangleAlert className="icon" aria-hidden="true" />Parcial</span>
            </div>
            <div className="recep-med-detail" id="detalle-piperacilina" data-parent-group="piperacilina">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>MX0000033-1</td><td>Piperacilina/Tazobactam 4.5 g solución inyectable - Tazonam</td><td className="cant-entregada">2</td><td>L-58821</td><td>2026-10-31</td></tr>
                  <tr><td>MX0000033-1</td><td>Piperacilina/Tazobactam 4.5 g solución inyectable - Tazonam</td><td className="cant-entregada">2</td><td>L-58902</td><td>2026-10-31</td></tr>
                </tbody>
              </table>
            </div>
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-cloruro-potasio" data-group="cloruro-potasio" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Cloruro de potasio 10 mEq solución inyectable</span>
              <span className="child-count-badge">5</span>
            </div>
            <div className="recep-med-detail collapsed" id="detalle-cloruro-potasio" data-parent-group="cloruro-potasio">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>MX0000040-1</td><td>Cloruro de potasio 10 mEq solución inyectable - Pisa</td><td className="cant-entregada">5</td><td>L-31490</td><td>2027-06-30</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="recep-order" id="order-recep-505" data-order-id="recep-505" data-estado="despachado" data-partial="false">
          <div className="recep-order-header">
            <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="body-recep-505" data-group="recep-505" title="Ver medicamentos de esta orden">
              <LuChevronDown className="icon" aria-hidden="true" />
            </button>
            <span className="recep-order-number">SOL-000505</span>
            <span className="recep-order-date">02 May 2026 · 15:30</span>
            <span className="child-count-badge">1 ítem</span>
            <div className="recep-order-spacer"></div>
            <div className="recep-order-status" id="recep-505-status">
              <button type="button" className="btn btn-primary btn-sm btn-confirm-receipt" data-confirm-target="recep-505" data-med-targets="solucion-salina" data-partial="false">
                <LuCheck className="icon" aria-hidden="true" />
                Confirmar recepción
              </button>
            </div>
          </div>
          <div className="recep-order-body collapsed" id="body-recep-505" data-parent-group="recep-505">
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-solucion-salina" data-group="solucion-salina" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Cloruro de sodio 0.9% 500 ml solución para infusión</span>
              <span className="child-count-badge" id="solucion-salina-badge">10</span>
            </div>
            <div className="recep-med-detail collapsed" id="detalle-solucion-salina" data-parent-group="solucion-salina">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>MX0000008-2</td><td>Cloruro de sodio 0.9% 500 ml solución para infusión - Baxter</td><td className="cant-entregada">10</td><td>L-20456</td><td>2028-03-31</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="recep-order" id="order-recep-508" data-order-id="recep-508" data-estado="recibido" data-partial="false">
          <div className="recep-order-header">
            <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="body-recep-508" data-group="recep-508" title="Ver medicamentos de esta orden">
              <LuChevronDown className="icon" aria-hidden="true" />
            </button>
            <span className="recep-order-number">SOL-000508</span>
            <span className="recep-order-date">02 May 2026 · 16:45</span>
            <span className="child-count-badge">3 ítems</span>
            <div className="recep-order-spacer"></div>
            <div className="recep-order-status" id="recep-508-status">
              <span className="confirmed-tag"><LuCheck className="icon" aria-hidden="true" />Recibido</span>
            </div>
          </div>
          <div className="recep-order-body collapsed" id="body-recep-508" data-parent-group="recep-508">
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-guantes-nitrilo" data-group="guantes-nitrilo" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Guantes de nitrilo talla M</span>
              <span className="child-count-badge">1</span>
            </div>
            <div className="recep-med-detail collapsed" id="detalle-guantes-nitrilo" data-parent-group="guantes-nitrilo">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>IN0000002-1</td><td>Guantes de nitrilo talla M - Kimberly Clark</td><td className="cant-entregada">1</td><td>L-11023</td><td>2028-08-31</td></tr>
                </tbody>
              </table>
            </div>
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-jeringas" data-group="jeringas" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Jeringas 10 ml</span>
              <span className="child-count-badge">20</span>
            </div>
            <div className="recep-med-detail collapsed" id="detalle-jeringas" data-parent-group="jeringas">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>IN0000005-1</td><td>Jeringas 10 ml - BD</td><td className="cant-entregada">20</td><td>L-40217</td><td>2029-05-31</td></tr>
                </tbody>
              </table>
            </div>
            <div className="recep-med">
              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-alcohol-antiseptico" data-group="alcohol-antiseptico" title="Ver artículo(s) y lote(s)">
                <LuChevronDown className="icon" aria-hidden="true" />
              </button>
              <span className="recep-med-name">Alcohol antiséptico 70% 250 ml</span>
              <span className="child-count-badge">4</span>
            </div>
            <div className="recep-med-detail collapsed" id="detalle-alcohol-antiseptico" data-parent-group="alcohol-antiseptico">
              <table className="detail-table">
                <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  <tr><td>IN0000009-1</td><td>Alcohol antiséptico 70% 250 ml - Barrytek</td><td className="cant-entregada">4</td><td>L-63340</td><td>2027-12-31</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="legend-bar">
        <div className="footer-title-block"><div className="ft-sub" id="recepcion-footer-count">3 órdenes · filtro: Pendiente</div></div>
        <div className="footer-updated">Última actualización: <b>14:32h</b></div>
      </div>
    </div>
  );
}
