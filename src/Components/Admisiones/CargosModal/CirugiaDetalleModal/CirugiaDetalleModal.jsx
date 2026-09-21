'use client';

import { useState } from 'react';
import './CirugiaDetalleModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { LuRefreshCw, LuSearch } from 'react-icons/lu';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'contratacion', label: 'Contratación' },
];

const TIPO_CIRUJANO_OPTIONS = [
  { value: 'cirujano', label: 'Cirujano' },
  { value: 'primer-ayudante', label: 'Primer Ayudante' },
  { value: 'segundo-ayudante', label: 'Segundo Ayudante' },
];

// Columnas de la matriz de tarifas (roles que participan de la cirugía) —
// mismo orden que la referencia legacy.
const TARIFA_ROLES = ['cirujano', 'anestesiologo', 'ayudantia', 'derechosSala', 'materiales'];
const TARIFA_ROLE_LABEL = {
  cirujano: 'Cirujano',
  anestesiologo: 'Anestesiólogo',
  ayudantia: 'Ayudantía',
  derechosSala: 'Derechos Sala',
  materiales: 'Materiales y Med.',
};

// Pestaña "Contratación": datos del contrato de la admisión, de solo lectura
// (mock estático, en 2 columnas como la referencia). Cada campo es
// [id, etiqueta, valor].
const CONTRATACION_COLUMNAS = [
  [
    ['id-contratante', 'Id. Contratante', '900156264'],
    ['servicio-adm', 'Servicio Adm.', '01'],
    ['cobrar-a', 'Cobrar A', 'Contratante'],
    ['id-tercero-ca', 'ID Tercero CA', '900156264'],
  ],
  [
    ['tipo-contrato', 'Tipo Contrato', 'Evento'],
    ['tipo-tercero', 'Tipo Tercero', 'EPS'],
    ['contrat-regimen', 'Régimen', 'Empresa Promotora de Salud Contributiva'],
    ['id-contratacion', 'ID Contratación', '340'],
    ['no-contrato', 'No Contrato', 'PRUEBA123458'],
  ],
];

// Un valor por rol, todos iguales — atajo para armar el estado inicial de las
// filas de la matriz.
function porRol(value) {
  return Object.fromEntries(TARIFA_ROLES.map((role) => [role, value]));
}

// "Nuevo" arranca con Tipo Cirugía/Id. Servicio vacíos (se eligen desde su
// catálogo) y con el tercero/régimen del contrato de la admisión.
function initialDraft() {
  return {
    urgencia: false,
    idTercero: '900156264 - NUEVA EPS',
    regimen: 'EPS - Empresa Promotora de Salud Contributiva',
    tipoCirugia: '',
    cubrimiento: '100',
    idServicio: '',
    paquete: false,
    tipoCirujano: 'cirujano',
    segunTarifa: porRol(false),
    cobrar: porRol(true),
    manual: porRol(false),
    porMinutoValor: porRol('0'),
    vrManuales: porRol('0'),
  };
}

// Campo de texto con botón de búsqueda (abre un catálogo — sin catálogo
// conectado todavía, el botón es solo visual).
function SearchField({
  id, label, required, placeholder, value, onChange, searchLabel,
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && <span className="cdm-required" aria-hidden="true"> *</span>}
      </label>
      <div className="field-with-search">
        <input
          id={id}
          type="text"
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="search-btn" aria-label={searchLabel} title={searchLabel}>
          <LuSearch className="icon" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// Modal "Agregando un Registro a QXPCXD" — enganchado al botón "Nuevo" del
// panel "Cirugías" (ver CirugiaPanel en CargosModal.jsx), mismo patrón que
// ProgramacionCirugiaModal (modal anidado sobre CargosModal, mock estático
// sin handlers reales). Versión compacta (encargo explícito, ver captura):
// la franja Usuario Liquidación/Consecutivo va en la misma fila que las
// pestañas, los campos viven en una sola tarjeta con Id. Tercero/Régimen a
// todo el ancho (código y descripción en un mismo campo) y el resto de a
// pares, y la matriz de tarifas incluye Vr. Manuales como su última fila en
// vez de una fila de campos aparte.
export default function CirugiaDetalleModal({ admision, onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const [draft, setDraft] = useState(initialDraft);

  function set(field, value) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  function setRoleValue(group, role, value) {
    setDraft((d) => ({ ...d, [group]: { ...d[group], [role]: value } }));
  }

  if (!admision) return null;

  return (
    <div className="adm-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal cdm-modal" role="dialog" aria-modal="true" aria-labelledby="cdm-modal-title">
        <ModalHeader
          title="Agregando un Registro a QXPCXD (002)"
          titleId="cdm-modal-title"
          onClose={onClose}
          trailing={<Badge tone="neutral">Quirúrgico</Badge>}
        />

        <div className="cdm-tabbar">
          <div className="cdm-tabs" role="tablist" aria-label="Secciones del registro">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`cdm-tab${activeTab === tab.id ? ' active' : ''}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`cdm-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="cdm-meta">
            <span className="cdm-usuario-liquidacion">Usuario Liquidación: <strong>CAMILO</strong></span>
            <span className="cdm-consecutivo">Consecutivo: <strong>QX2609211010</strong></span>
          </div>
        </div>

        <div className="adm-modal-body cdm-body" role="tabpanel" id={`cdm-panel-${activeTab}`}>
          {activeTab === 'general' ? (
            <div className="cdm-card">
              <div className="cdm-row-top">
                <div className="form-field cdm-item-field">
                  <label htmlFor="cdm-item">Item</label>
                  <div className="tf-readonly-value" id="cdm-item">002</div>
                </div>
                <label className="cdm-checkbox">
                  <input
                    type="checkbox"
                    checked={draft.urgencia}
                    onChange={(e) => set('urgencia', e.target.checked)}
                  />
                  Urgencia
                </label>
                <Button variant="outline" size="sm" icon={LuRefreshCw} className="cdm-contrato-btn">
                  Cambiar Contrato
                </Button>
              </div>

              <SearchField
                id="cdm-id-tercero"
                label="Id. Tercero"
                required
                value={draft.idTercero}
                onChange={(v) => set('idTercero', v)}
                searchLabel="Buscar tercero"
              />
              <SearchField
                id="cdm-regimen"
                label="Régimen"
                value={draft.regimen}
                onChange={(v) => set('regimen', v)}
                searchLabel="Buscar régimen"
              />

              <div className="cdm-grid">
                <SearchField
                  id="cdm-tipo-cirugia"
                  label="Tipo Cirugía"
                  placeholder="Buscar tipo de cirugía..."
                  value={draft.tipoCirugia}
                  onChange={(v) => set('tipoCirugia', v)}
                  searchLabel="Buscar tipo de cirugía"
                />
                <div className="form-field">
                  <label htmlFor="cdm-cubrimiento">% Cubrimiento</label>
                  <input
                    id="cdm-cubrimiento"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={draft.cubrimiento}
                    onChange={(e) => set('cubrimiento', e.target.value)}
                  />
                </div>

                <SearchField
                  id="cdm-id-servicio"
                  label="Id. Servicio / CUPS"
                  required
                  placeholder="Buscar procedimiento / cirugía..."
                  value={draft.idServicio}
                  onChange={(v) => set('idServicio', v)}
                  searchLabel="Buscar servicio"
                />
                <div className="cdm-cirujano-row">
                  <div className="form-field">
                    <label htmlFor="cdm-tipo-cirujano">Tipo de Cirujano</label>
                    <FormSelect
                      id="cdm-tipo-cirujano"
                      value={draft.tipoCirujano}
                      onChange={(v) => set('tipoCirujano', v)}
                      options={TIPO_CIRUJANO_OPTIONS}
                    />
                  </div>
                  <label className="cdm-checkbox">
                    <input
                      type="checkbox"
                      checked={draft.paquete}
                      onChange={(e) => set('paquete', e.target.checked)}
                    />
                    PAQUETE
                  </label>
                </div>
              </div>

              <div className="cdm-tarifa-wrap">
                <table className="cdm-tarifa-table">
                  <thead>
                    <tr>
                      <th scope="col" className="cdm-tarifa-concepto">Concepto</th>
                      {TARIFA_ROLES.map((role) => <th scope="col" key={role}>{TARIFA_ROLE_LABEL[role]}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['segunTarifa', 'Según Tarifa'],
                      ['cobrar', 'Cobrar'],
                      ['manual', 'Manual'],
                    ].map(([group, label]) => (
                      <tr key={group}>
                        <th scope="row">{label}</th>
                        {TARIFA_ROLES.map((role) => (
                          <td key={role}>
                            <input
                              type="checkbox"
                              aria-label={`${label} - ${TARIFA_ROLE_LABEL[role]}`}
                              checked={draft[group][role]}
                              onChange={(e) => setRoleValue(group, role, e.target.checked)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <th scope="row">Por Minuto/UVR</th>
                      {TARIFA_ROLES.map((role) => (
                        <td key={role}>
                          {/* Solo Derechos Sala se cobra por minuto/UVR: el
                              resto queda deshabilitado (referencia legacy). */}
                          <input
                            type="number"
                            min="0"
                            className="cdm-tarifa-input"
                            aria-label={`Por Minuto/UVR - ${TARIFA_ROLE_LABEL[role]}`}
                            value={draft.porMinutoValor[role]}
                            disabled={role !== 'derechosSala'}
                            onChange={(e) => setRoleValue('porMinutoValor', role, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th scope="row">Vr. Manuales</th>
                      {TARIFA_ROLES.map((role) => (
                        <td key={role}>
                          <input
                            type="number"
                            className="cdm-tarifa-input"
                            aria-label={`Vr. Manuales - ${TARIFA_ROLE_LABEL[role]}`}
                            value={draft.vrManuales[role]}
                            disabled
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="cdm-card">
              <div className="cdm-contrat-grid">
                {CONTRATACION_COLUMNAS.map((campos, i) => (
                  <div className="cdm-contrat-col" key={i}>
                    {campos.map(([id, label, value]) => (
                      <div className="form-field" key={id}>
                        <label htmlFor={`cdm-${id}`}>{label}</label>
                        <input id={`cdm-${id}`} type="text" value={value} readOnly />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="adm-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={onClose}>Aceptar</Button>
        </div>
      </div>
    </div>
  );
}
