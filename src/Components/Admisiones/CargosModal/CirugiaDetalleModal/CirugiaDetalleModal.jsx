'use client';

import { useState } from 'react';
import './CirugiaDetalleModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import { LuAmbulance, LuSearch } from 'react-icons/lu';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'contratacion', label: 'Contratación' },
];

const TIPO_CIRUJANO_OPTIONS = [
  { value: 'cirujano', label: 'Cirujano' },
  { value: 'primer-ayudante', label: 'Primer Ayudante' },
  { value: 'segundo-ayudante', label: 'Segundo Ayudante' },
];

// Columnas de la grilla de tarifas (roles que participan de la cirugía) —
// mismo orden que la referencia legacy.
const TARIFA_ROLES = ['cirujano', 'anestesiologo', 'ayudantia', 'derechosSala', 'materiales'];
const TARIFA_ROLE_LABEL = {
  cirujano: 'Cirujano',
  anestesiologo: 'Anestesiólogo',
  ayudantia: 'Ayudantía',
  derechosSala: 'Derechos Sala',
  materiales: 'Materiales y Med.',
};

function initialDraft() {
  return {
    urgencia: false,
    idTercero: '900156264',
    idTerceroLabel: 'NUEVA EPS',
    regimen: 'EPSS',
    regimenLabel: 'Empresa Promotora de Salud Subsidiada',
    tipoCirugia: 'UNICA',
    cubrimiento: '100.00',
    idServicio: '361607C',
    paquete: false,
    tipoCirujano: 'cirujano',
    segunTarifa: {
      cirujano: true, anestesiologo: true, ayudantia: true, derechosSala: true, materiales: false,
    },
    cobrar: {
      cirujano: true, anestesiologo: true, ayudantia: true, derechosSala: true, materiales: false,
    },
    manual: {
      cirujano: false, anestesiologo: false, ayudantia: false, derechosSala: false, materiales: false,
    },
    porMinutoValor: {
      cirujano: '0', anestesiologo: '0', ayudantia: '0', derechosSala: '0',
    },
    porMinutoActivo: { derechosSala: false },
    vrManuales: {
      cirujano: '0.00', anestesiologo: '0.00', ayudantia: '0.00', derechosSala: '0.00', materiales: '0.00',
    },
  };
}

// Modal "Cambiando un Registro de QXPCXD" — enganchado al botón "Nuevo" del
// panel "Cirugías" (ver CirugiaPanel en CargosModal.jsx), mismo patrón que
// ProgramacionCirugiaModal (modal anidado sobre CargosModal, mock estático
// sin handlers reales). Precargado con los datos de la fila mock existente
// (Item 001 / Id. Servicio 361607C / Id. Tercero 900156264, ver
// CIRUGIAS_SUB_ROWS en CargosModal.jsx) porque es la única referencia de
// diseño disponible -- al conectar el catálogo real, "Nuevo" debería arrancar
// con estos campos vacíos en vez de precargados.
export default function CirugiaDetalleModal({ admision, onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const [draft, setDraft] = useState(initialDraft);

  function set(field, value) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  function setRoleFlag(group, role, value) {
    setDraft((d) => ({ ...d, [group]: { ...d[group], [role]: value } }));
  }

  if (!admision) return null;

  return (
    <div className="adm-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal cdm-modal" role="dialog" aria-modal="true" aria-labelledby="cdm-modal-title">
        <ModalHeader
          tone="warning"
          title="Cambiando un Registro de QXPCXD (1)"
          titleId="cdm-modal-title"
          onClose={onClose}
        />

        <div className="cdm-topbar">
          <span className="cdm-usuario-liquidacion">Usuario Liquidación: <strong>CLINTOS</strong></span>
          <span className="cdm-consecutivo">Consecutivo: <strong>0200016449</strong></span>
        </div>

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

        <div className="adm-modal-body cdm-body" role="tabpanel" id={`cdm-panel-${activeTab}`}>
          {activeTab === 'general' ? (
            <>
              <div className="cdm-row cdm-row-top">
                <div className="form-field cdm-item-field">
                  <label htmlFor="cdm-item">Item</label>
                  <div className="tf-readonly-value" id="cdm-item">001</div>
                </div>
                <label className="cdm-checkbox">
                  <input
                    type="checkbox"
                    checked={draft.urgencia}
                    onChange={(e) => set('urgencia', e.target.checked)}
                  />
                  Urgencia
                </label>
                <Button variant="tinted" size="sm" icon={LuAmbulance} className="cdm-contrato-btn">
                  Cambiar Contrato
                </Button>
              </div>

              <div className="cdm-row">
                <div className="form-field cdm-field-with-label">
                  <label htmlFor="cdm-id-tercero">Id. Tercero:</label>
                  <div className="field-with-search">
                    <input
                      id="cdm-id-tercero"
                      type="text"
                      value={draft.idTercero}
                      onChange={(e) => set('idTercero', e.target.value)}
                    />
                    <button type="button" className="search-btn" aria-label="Buscar tercero" title="Buscar tercero">
                      <LuSearch className="icon" />
                    </button>
                  </div>
                  <span className="cdm-resolved-label">{draft.idTerceroLabel}</span>
                </div>
              </div>

              <div className="cdm-row">
                <div className="form-field cdm-field-with-label">
                  <label htmlFor="cdm-regimen">Régimen:</label>
                  <div className="field-with-search">
                    <input
                      id="cdm-regimen"
                      type="text"
                      value={draft.regimen}
                      onChange={(e) => set('regimen', e.target.value)}
                    />
                    <button type="button" className="search-btn" aria-label="Buscar régimen" title="Buscar régimen">
                      <LuSearch className="icon" />
                    </button>
                  </div>
                  <span className="cdm-resolved-label">{draft.regimenLabel}</span>
                </div>
              </div>

              <div className="cdm-row">
                <div className="form-field">
                  <label htmlFor="cdm-tipo-cirugia">Tipo Cirugía:</label>
                  <div className="field-with-search">
                    <input
                      id="cdm-tipo-cirugia"
                      type="text"
                      value={draft.tipoCirugia}
                      onChange={(e) => set('tipoCirugia', e.target.value)}
                    />
                    <button type="button" className="search-btn" aria-label="Buscar tipo de cirugía" title="Buscar tipo de cirugía">
                      <LuSearch className="icon" />
                    </button>
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="cdm-cubrimiento">% Cubrimiento:</label>
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
              </div>

              <div className="cdm-row">
                <div className="form-field">
                  <label htmlFor="cdm-id-servicio">Id. Servicio:</label>
                  <div className="field-with-search">
                    <input
                      id="cdm-id-servicio"
                      type="text"
                      value={draft.idServicio}
                      onChange={(e) => set('idServicio', e.target.value)}
                    />
                    <button type="button" className="search-btn" aria-label="Buscar servicio" title="Buscar servicio">
                      <LuSearch className="icon" />
                    </button>
                  </div>
                </div>
                <label className="cdm-checkbox cdm-checkbox-inline">
                  <input
                    type="checkbox"
                    checked={draft.paquete}
                    onChange={(e) => set('paquete', e.target.checked)}
                  />
                  PAQUETE
                </label>
              </div>

              <div className="cdm-row">
                <div className="form-field">
                  <label htmlFor="cdm-tipo-cirujano">Tipo de Cirujano:</label>
                  <FormSelect
                    id="cdm-tipo-cirujano"
                    value={draft.tipoCirujano}
                    onChange={(v) => set('tipoCirujano', v)}
                    options={TIPO_CIRUJANO_OPTIONS}
                  />
                </div>
              </div>

              <table className="cdm-tarifa-table">
                <thead>
                  <tr>
                    <th aria-hidden="true" />
                    {TARIFA_ROLES.map((role) => <th key={role}>{TARIFA_ROLE_LABEL[role]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Según Tarifa</th>
                    {TARIFA_ROLES.map((role) => (
                      <td key={role}>
                        <input type="checkbox" checked={draft.segunTarifa[role]} disabled />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Cobrar</th>
                    {TARIFA_ROLES.map((role) => (
                      <td key={role}>
                        <input
                          type="checkbox"
                          checked={draft.cobrar[role]}
                          onChange={(e) => setRoleFlag('cobrar', role, e.target.checked)}
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Manual</th>
                    {TARIFA_ROLES.map((role) => (
                      <td key={role}>
                        <input
                          type="checkbox"
                          checked={draft.manual[role]}
                          onChange={(e) => setRoleFlag('manual', role, e.target.checked)}
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Por Minuto/UVR</th>
                    {TARIFA_ROLES.map((role) => {
                      if (role === 'materiales') return <td key={role} />;
                      if (role === 'derechosSala') {
                        return (
                          <td key={role} className="cdm-tarifa-cell-combo">
                            <input
                              type="checkbox"
                              checked={draft.porMinutoActivo.derechosSala}
                              onChange={(e) => set('porMinutoActivo', { ...draft.porMinutoActivo, derechosSala: e.target.checked })}
                            />
                            <input
                              type="number"
                              min="0"
                              className="cdm-tarifa-input"
                              value={draft.porMinutoValor[role]}
                              onChange={(e) => set('porMinutoValor', { ...draft.porMinutoValor, [role]: e.target.value })}
                            />
                          </td>
                        );
                      }
                      return (
                        <td key={role}>
                          <input
                            type="number"
                            min="0"
                            className="cdm-tarifa-input"
                            value={draft.porMinutoValor[role]}
                            onChange={(e) => set('porMinutoValor', { ...draft.porMinutoValor, [role]: e.target.value })}
                          />
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>

              <div className="cdm-manuales-row">
                <span className="cdm-manuales-label">Vr. Manuales</span>
                {TARIFA_ROLES.map((role) => (
                  <label key={role} className="cdm-manuales-field">
                    <span className="cdm-manuales-field-label">{TARIFA_ROLE_LABEL[role]}</span>
                    <input
                      type="text"
                      className="cdm-manuales-input"
                      value={draft.vrManuales[role]}
                      readOnly
                    />
                  </label>
                ))}
              </div>
            </>
          ) : (
            <p className="cdm-placeholder">Contenido de &quot;Contratación&quot; pendiente de referencia de diseño.</p>
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
