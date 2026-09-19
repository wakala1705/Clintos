'use client';

import { useState } from 'react';
import './CargosModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import ProgramacionCirugiaModal from './ProgramacionCirugiaModal/ProgramacionCirugiaModal';
import CirugiaDetalleModal from './CirugiaDetalleModal/CirugiaDetalleModal';
import {
  LuBan, LuCalculator, LuChevronDown, LuChevronUp, LuEye, LuEyeOff, LuFileText,
  LuFlaskConical, LuFolderDown, LuInfo, LuPackage, LuPencil, LuPill, LuPlus,
  LuPrinter, LuRefreshCw, LuRotateCcw, LuScan, LuShieldAlert, LuTrash2,
  LuTriangleAlert, LuUndo2, LuUser,
} from 'react-icons/lu';

const TABS = [
  { id: 'cargos', label: 'Cargos' },
  { id: 'cirugias', label: 'Cirugías' },
  { id: 'recien-nacidos', label: 'Recién nacidos' },
];

// Placeholder de solo lectura (mock estático, sin backend detrás todavía) —
// mismas columnas/orden que la referencia de diseño de la opción "Cargos"
// del megamenú de Acciones (ver AccionesMegaMenu.jsx). Cada pestaña comparte
// la misma tabla vacía, solo cambia el texto del estado vacío.
const CARGOS_COLUMNS = [
  'Servicios', 'Prefijo', 'Fecha y Hora', 'N° de prestación', 'Área', 'NA',
  'Valor total', 'Valor copago', 'Valor P. Comp.', 'Valor excedente', 'Usuario',
];
const DETALLE_COLUMNS = ['Servicio', 'Cant.', 'Vlr. Unitario', 'Vlr. Unit. IVA', 'Vlr Total', 'Copago'];

const EMPTY_LABEL = {
  cargos: 'No hay cargos registrados.',
  cirugias: 'No hay cirugías registradas.',
  'recien-nacidos': 'No hay recién nacidos registrados.',
};

// Tab "Cirugías": 4 sub-tablas propias (no la tabla genérica de Cargos) —
// mismas columnas/acciones que la referencia de diseño legacy ("Catálogo de
// CARGOS" → pestaña Cirugías). Cada CirugiaPanel es una mini cm-cargos-card
// (mismo borde/cm-table) con su propia fila de acciones al pie.
const PROGRAMACION_COLUMNS = ['Consecutivo', 'Id. Sala', 'Fecha', 'Hora', 'Id. área'];
const CIRUGIAS_SUB_COLUMNS = ['Item', 'Id. servicio', 'Nombre', 'Tipo Cirugía', 'PAQUE', 'Cobrar a Tercero'];
const RECURSO_HUMANO_COLUMNS = ['Tipo Recurso', 'Médico'];
const INSUMOS_COLUMNS = ['Artículo', 'Nombre', 'Cant. estimada', 'Cantidad Real', 'Valor Unidad', 'Costo Unidad'];

// Filas mock de las 4 sub-tablas (misma referencia legacy que las columnas de
// arriba) — primera fila de cada tabla con datos viene preseleccionada
// (encargo: replica el resaltado azul de la captura), Recurso Humano queda
// sin filas (así también en la referencia).
const PROGRAMACION_ROWS = [
  ['0200016449', '01', '15.SEP.2026', '14:21', '10'],
  ['0200016454', '02', '15.SEP.2026', '14:45', '05'],
  ['0200016455', '03', '15.SEP.2026', '14:46', '05'],
];
const CIRUGIAS_SUB_ROWS = [
  ['001', '361607C', 'ANASTOMOSIS SECUENCIAL ARTERIA DESCENDENTE', 'UNICA', '0', '900156264'],
  ['002', '805906C', 'ABLACIÓN DE DISCO TORÁCICO (NUCLEOLISIS)', 'DVIC', '0', '900156264'],
];
const RECURSO_HUMANO_ROWS = [];
const INSUMOS_ROWS = [
  ['DM000009', 'AGUJA DESECHABLE HIPODERMICA 1', '10.000000', '10.000000', '0.000000', '0.000000'],
  ['DM000067', 'BATA QUIRURGICA ESTERIL - REF. 2', '3.000000', '3.000000', '0.000000', '0.000000'],
  ['DM000092', 'CANULA DE GUEDEL # 4', '1.000000', '1.000000', '0.000000', '0.000000'],
  ['DM000093', 'CANULA DE GUEDEL # 5', '1.000000', '1.000000', '0.000000', '0.000000'],
  ['DM000126', 'CARTUCHO KAOLIN - REF. ACT CART', '7.000000', '7.000000', '0.000000', '0.000000'],
  ['DM000127', 'CARTUCHO PARA GASOMETRO CAR', '7.000000', '7.000000', '0.000000', '0.000000'],
  ['DM000128', 'CARTUCHO PARA GASOMETRO EG7', '7.000000', '7.000000', '0.000000', '0.000000'],
  ['DM000140', 'CATETER CENTRAL BILUMEN MAC 7', '1.000000', '1.000000', '0.000000', '0.000000'],
  ['DM000145', 'CATETER CENTRAL TRILUMEN 7 FR', '1.000000', '1.000000', '0.000000', '0.000000'],
  ['DM000153', 'CATETER INTRAVENOSO # 20G', '2.000000', '2.000000', '0.000000', '0.000000'],
];

function CirugiaPanel({
  title, columns, rows, emptyLabel, actions,
}) {
  return (
    <div className="cm-cirugia-panel">
      <div className="cm-cirugia-panel-header">{title}</div>
      <div className="cm-table-scroll">
        <table className="cm-table">
          <thead>
            <tr>
              {columns.map((c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row, i) => (
              <tr key={row[0]} className={i === 0 ? 'selected' : undefined}>
                {row.map((cell, j) => <td key={columns[j]}>{cell}</td>)}
              </tr>
            )) : (
              <tr className="cm-empty-row">
                <td colSpan={columns.length}>{emptyLabel}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="cm-cirugia-panel-actions">{actions}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="cm-field">
      <span className="cm-field-label">{label}</span>
      <span className="cm-field-value">{value}</span>
    </div>
  );
}

// Enmascara un valor manteniendo su longitud (mismo criterio que un campo de
// contraseña) — el botón de ojo (ver cm-patient-badges) alterna esto en vez
// de navegar a ningún lado.
function maskValue(value) {
  return '•'.repeat(String(value).length);
}

// Mismo criterio que maskValue, pero conserva los espacios entre palabras
// (nombre completo) para que el resultado siga leyéndose como un nombre de
// varias palabras en vez de un solo bloque de puntos.
function maskName(value) {
  return String(value).replace(/\S/g, '•');
}

// Modal extra grande disparado por la opción "Cargos" del megamenú de
// Acciones (columna Administrativas, ver AccionesMegaMenu.jsx) — vuelca la
// ficha de cargos de una admisión (barra de admisión + banner de paciente +
// pestañas Cargos/Cirugías/Recién nacidos + tabla de cargos con su resumen
// de totales + tabla de detalle de la prestación seleccionada + acciones de
// pie) siguiendo la referencia de diseño entregada. Todo el contenido es
// mock estático y los botones son solo visuales (sin handlers) — es la
// primera versión del modal, para conectar comportamiento real más
// adelante. `admision` es la única fuente de verdad de si el modal está
// abierto, mismo patrón que AdmisionDetalleModal.
export default function CargosModal({ admision, onClose }) {
  const [activeTab, setActiveTab] = useState('cargos');
  const [adminExpanded, setAdminExpanded] = useState(true);
  // El botón de ojo (ver cm-patient-badges) no navega — enmascara/revela los
  // datos sensibles del afiliado (nombre y documento), como el botón de
  // mostrar contraseña de un formulario.
  const [dataHidden, setDataHidden] = useState(false);
  // Modal "Agregando un Registro" del panel Programación Sala Cirugía (ver
  // ProgramacionCirugiaModal.jsx) — se monta por encima de este modal (mismo
  // patrón que CatalogoDiagnosticosModal dentro de InformacionGeneralStep).
  const [nuevaProgramacionOpen, setNuevaProgramacionOpen] = useState(false);
  // Modal "Cambiando un Registro de QXPCXD" del panel Cirugías (ver
  // CirugiaDetalleModal.jsx) — mismo patrón anidado que nuevaProgramacionOpen.
  const [nuevaCirugiaOpen, setNuevaCirugiaOpen] = useState(false);

  if (!admision) return null;

  const documentoMostrado = dataHidden ? maskValue(admision.documento) : admision.documento;
  const nombreMostrado = dataHidden ? maskName(admision.nombreAfiliado) : admision.nombreAfiliado;

  return (
    <div className="adm-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal cm-modal" role="dialog" aria-modal="true" aria-labelledby="cargos-modal-title">
        <ModalHeader
          title="Cargos"
          titleId="cargos-modal-title"
          onClose={onClose}
          trailing={<Badge tone="success" className="cm-tipo-badge">Administrativo</Badge>}
        />

        <div className="adm-modal-body cm-body">
          <div className="cm-patient-banner">
            {/* Fila 1: identidad del paciente + datos clínicos en la misma
                fila (encargo explícito) — ya no llevan label de grupo, la
                identidad (avatar/nombre/badges) alcanza para dar contexto de
                que lo que sigue es del paciente. */}
            <div className="cm-patient-row">
              <div className="cm-patient-identity">
                <div className="cm-patient-avatar">
                  <LuUser className="icon" aria-hidden="true" />
                </div>
                {/* Nombre + tipo/n° de documento agrupados en una sola
                    columna (encargo explícito) — antes Doc. Id./Tipo vivían
                    como Field aparte en la grilla, ahora es la línea
                    secundaria de la identidad ("CC 2450854"). */}
                <div className="cm-patient-info">
                  <span className="cm-patient-name">{nombreMostrado}</span>
                  <span className="cm-patient-doc">CC {documentoMostrado}</span>
                </div>
              </div>
              <div className="cm-patient-fields">
                <Field label="Sexo" value="F" />
                <Field label="Fecha Nac." value="16.SEP.1984 · 41 años 4 meses" />
                <Field label="Asegurador" value={admision.administradora} />
              </div>
              {/* Alergias/chevron al extremo derecho de la fila (encargo
                  explícito) — antes en la misma línea del nombre. "Activo"
                  bajó a la fila 2 (encargo explícito, ver abajo). El chevron
                  vive acá (fila 1, siempre visible) y no en la fila 2 — así,
                  colapsado, el banner queda en una sola fila en vez de dejar
                  una franja aparte solo para el botón. El botón de ojo no
                  navega (encargo explícito): enmascara/revela los datos
                  sensibles del afiliado (nombre y documento, ver
                  nombreMostrado/documentoMostrado más arriba), como el
                  toggle de un campo de contraseña. */}
              <div className="cm-patient-badges">
                <button
                  type="button"
                  className="cm-icon-btn"
                  onClick={() => setDataHidden((v) => !v)}
                  aria-pressed={dataHidden}
                  aria-label={dataHidden ? 'Mostrar datos sensibles' : 'Ocultar datos sensibles'}
                >
                  {dataHidden ? <LuEyeOff className="icon" aria-hidden="true" /> : <LuEye className="icon" aria-hidden="true" />}
                </button>
                <Badge tone="warn" dot className="cm-alergias-badge">Alergias</Badge>
                <button
                  type="button"
                  className="cm-banner-toggle"
                  onClick={() => setAdminExpanded((v) => !v)}
                  aria-expanded={adminExpanded}
                  aria-label={adminExpanded ? 'Ocultar datos administrativos' : 'Mostrar datos administrativos'}
                >
                  {adminExpanded ? <LuChevronUp className="icon" aria-hidden="true" /> : <LuChevronDown className="icon" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Fila 2: datos administrativos (admisión/contrato) + Cama +
                Id. Afiliado + Activo (encargo explícito: bajaron de la fila
                1 a esta; Asegurador subió a la fila 1, después de Fecha
                Nac.) — mismo criterio de mock estático que N° Contrato/ID
                Contrato (no hay estos campos en mockAdmisionesData.js
                todavía). Colapsable con el chevron de la fila 1 (encargo
                explícito): compactado, el banner queda en una sola fila —
                esta fila entera deja de montarse, sin dejar franja. */}
            {adminExpanded && (
              <div className="cm-patient-fields cm-patient-fields-admin">
                <Field label="N° Admisión" value={admision.numeroAdmision} />
                <Field label="Fecha de ingreso" value={`${admision.fecha} - ${admision.hora}`} />
                <Field label="Cama" value={admision.cama ?? '—'} />
                <Field label="Id. Afiliado" value={documentoMostrado} />
                <Field label="Régimen" value="FOSYGA" />
                <Field label="N° Contrato" value="PRUEBA123458" />
                <Field label="ID Contrato" value="340" />
                <Badge tone="success" dot className="cm-estado-badge">Activo</Badge>
              </div>
            )}
          </div>

          {/* cm-cargos-card / cm-detail-card en 2 columnas del 50% (encargo
              explícito) — antes apiladas de a una por fila. */}
          <div className="cm-main-split">
            {/* cm-tabs + tabla de cargos agrupados en un solo bloque con
                borde propio (encargo explícito) — antes eran 2 piezas
                visuales separadas (tabs sueltos arriba de la tarjeta de la
                tabla). El bloque no lleva padding propio: cm-tabs/
                cm-totals-row ponen su propio padding horizontal, pero
                cm-table-scroll queda a borde a borde del bloque (encargo
                explícito: "la tabla no debería tomar el padding del bloque
                externo"). */}
            <div className="cm-cargos-card">
              <div className="cm-tabs" role="tablist" aria-label="Secciones de cargos">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`cm-tab${activeTab === tab.id ? ' active' : ''}`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`cm-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="cm-tabpanel" role="tabpanel" id={`cm-panel-${activeTab}`}>
                {activeTab === 'cirugias' ? (
                  // 4 sub-tablas en grilla 2x2 (encargo: replica la
                  // referencia legacy) en vez de la tabla+totales genérica
                  // de Cargos — por eso no comparte CARGOS_COLUMNS/
                  // cm-totals-row, y cm-detail-card tampoco se monta para
                  // este tab (ver más abajo).
                  <div className="cm-cirugia-grid">
                    <CirugiaPanel
                      title="Programación Sala Cirugía"
                      columns={PROGRAMACION_COLUMNS}
                      rows={PROGRAMACION_ROWS}
                      emptyLabel="No hay programaciones registradas."
                      actions={(
                        <>
                          <Button variant="secondary" size="sm" icon={LuFolderDown}>Traer de Prog.</Button>
                          <Button variant="primary" size="sm" icon={LuPlus} onClick={() => setNuevaProgramacionOpen(true)}>Nuevo</Button>
                          <Button variant="secondary" size="sm" icon={LuPencil}>Editar</Button>
                          <Button variant="danger-outline" size="sm" icon={LuTrash2}>Borrar</Button>
                        </>
                      )}
                    />
                    <CirugiaPanel
                      title="Cirugías"
                      columns={CIRUGIAS_SUB_COLUMNS}
                      rows={CIRUGIAS_SUB_ROWS}
                      emptyLabel={EMPTY_LABEL.cirugias}
                      actions={(
                        <>
                          <Button variant="primary" size="sm" icon={LuPlus} onClick={() => setNuevaCirugiaOpen(true)}>Nuevo</Button>
                          <Button variant="secondary" size="sm" icon={LuPencil}>Editar</Button>
                          <Button variant="danger-outline" size="sm" icon={LuTrash2}>Borrar</Button>
                          <Button variant="secondary" size="sm" icon={LuCalculator}>Liquidar</Button>
                          <Button variant="secondary" size="sm" icon={LuUndo2} disabled>Deshacer Liquidación</Button>
                        </>
                      )}
                    />
                    <CirugiaPanel
                      title="Recurso Humano"
                      columns={RECURSO_HUMANO_COLUMNS}
                      rows={RECURSO_HUMANO_ROWS}
                      emptyLabel="No hay recurso humano asignado."
                      actions={(
                        <>
                          <Button variant="primary" size="sm" icon={LuPlus}>Nuevo</Button>
                          <Button variant="secondary" size="sm" icon={LuPencil}>Editar</Button>
                          <Button variant="danger-outline" size="sm" icon={LuTrash2}>Borrar</Button>
                        </>
                      )}
                    />
                    <CirugiaPanel
                      title="Insumos"
                      columns={INSUMOS_COLUMNS}
                      rows={INSUMOS_ROWS}
                      emptyLabel="No hay insumos registrados."
                      actions={(
                        <>
                          <Button variant="primary" size="sm" icon={LuPlus}>Nuevo</Button>
                          <Button variant="secondary" size="sm" icon={LuPencil}>Editar</Button>
                          <Button variant="danger-outline" size="sm" icon={LuTrash2}>Borrar</Button>
                          <Button variant="secondary" size="sm" icon={LuPackage}>Inventario</Button>
                          <Button variant="secondary" size="sm" icon={LuRotateCcw}>Devolución</Button>
                        </>
                      )}
                    />
                  </div>
                ) : (
                  <>
                    <div className="cm-table-scroll">
                      <table className="cm-table">
                        <thead>
                          <tr>
                            {CARGOS_COLUMNS.map((c) => <th key={c}>{c}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="cm-empty-row">
                            <td colSpan={CARGOS_COLUMNS.length}>{EMPTY_LABEL[activeTab]}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="cm-totals-row">
                      <div className="cm-totals">
                        <div className="cm-totals-item"><span>Vr. Prestaciones</span><span className="cm-totals-value">0,00</span></div>
                        <div className="cm-totals-item"><span>Vr. Copago</span><span className="cm-totals-value">0,00</span></div>
                        <div className="cm-totals-item"><span>Vr. Pago Com:</span><span className="cm-totals-value">0,00</span></div>
                        <div className="cm-totals-item"><span>Vr. Administradora:</span><span className="cm-totals-value">0,00</span></div>
                      </div>
                      <div className="cm-totals-actions">
                        <Button variant="secondary" size="sm" icon={LuRefreshCw}>Actualizar</Button>
                        <Button variant="secondary" size="sm" icon={LuPrinter}>Imprimir</Button>
                        <Button variant="primary" size="sm" icon={LuPlus}>Nuevo</Button>
                        <Button variant="secondary" size="sm" icon={LuPencil}>Editar</Button>
                        <Button variant="danger-outline" size="sm" icon={LuTrash2}>Eliminar</Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {activeTab !== 'cirugias' && (
              <div className="cm-detail-card">
                <div className="cm-table-scroll">
                  <table className="cm-table">
                    <thead>
                      <tr>
                        {DETALLE_COLUMNS.map((c) => <th key={c}>{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="cm-empty-row">
                        <td colSpan={DETALLE_COLUMNS.length}>No hay detalles para esta prestación.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="cm-footer">
          <div className="cm-footer-row">
            <span className="cm-footer-hint">
              <LuInfo className="icon" aria-hidden="true" />
              Seleccione un detalle...
            </span>
            <div className="cm-footer-actions">
              <Button variant="secondary" size="sm" icon={LuPlus} disabled>Nuevo</Button>
              <Button variant="secondary" size="sm" icon={LuPencil} disabled>Editar</Button>
              <Button variant="danger-outline" size="sm" icon={LuTrash2} disabled>Eliminar Item</Button>
            </div>
          </div>
          <div className="cm-footer-row cm-footer-quick-actions">
            <Button variant="secondary-accent" size="sm" icon={LuUser}>Paciente</Button>
            <Button variant="secondary-accent" size="sm" icon={LuFileText}>Justificación NO POS</Button>
            <Button variant="secondary-accent" size="sm" icon={LuShieldAlert}>Proceso especial</Button>
            <Button variant="secondary-accent" size="sm" icon={LuBan}>No cobrar</Button>
            <Button variant="secondary-accent" size="sm" icon={LuPill}>Pedir a farmacia</Button>
            <Button variant="secondary-accent" size="sm" icon={LuFlaskConical}>Pedir a laboratorio</Button>
            <Button variant="secondary-accent" size="sm" icon={LuScan}>Enviar a imagenología</Button>
          </div>
        </div>
      </div>

      {nuevaProgramacionOpen && (
        <ProgramacionCirugiaModal admision={admision} onClose={() => setNuevaProgramacionOpen(false)} />
      )}
      {nuevaCirugiaOpen && (
        <CirugiaDetalleModal admision={admision} onClose={() => setNuevaCirugiaOpen(false)} />
      )}
    </div>
  );
}
