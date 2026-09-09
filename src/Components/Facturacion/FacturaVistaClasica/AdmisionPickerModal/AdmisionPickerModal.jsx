'use client';

import { useEffect, useState } from 'react';
import './AdmisionPickerModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  ESTADO_LABEL, ESTADO_FILTER_OPTIONS, fetchAdmisiones,
} from '@/hooks/Admisiones/mockAdmisionesData';
import { LuSearch } from 'react-icons/lu';

const ESTADO_TONE = {
  admitido: 'success',
  'pendiente-triage': 'warn',
  triage: 'warn',
  'alta-medica': 'neutral',
  'alta-administrativa': 'neutral',
};

// Quita tildes -- mismo helper que CatalogoAseguradorasModal.jsx/
// AllModulesModal.jsx (no compartido entre features, ver AGENTS.md
// "Component organization").
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// Picker "extragrande" de admisiones (encargo explícito) para el campo "No.
// Referencia" de FacturaAgregarModalClasico -- reusa el dataset mock de
// /admisiones (fetchAdmisiones/ESTADO_LABEL/ESTADO_FILTER_OPTIONS de
// @/hooks/Admisiones/mockAdmisionesData) en vez de navegar a esa ruta y
// perder el formulario de factura en curso (encargo explícito: "no podemos
// abrir la página y salirnos del formulario"). A diferencia de
// AdmisionesTable (la tabla real de /admisiones) esto es de solo lectura --
// sin RowActionsMenu/Editar/Detalles/Triage badge (ninguno aplica eligiendo
// una referencia para una factura); clic en fila selecciona, "Elegir"
// confirma -- mismo patrón que CatalogoContratacionModal/
// CatalogoTipoTerceroModal. Estado usa Badge (app-wide) en vez del
// `.adm-estado-*` propio de Admisiones.css, que no está disponible acá.
// Filtro "Estado" arranca en "todos" (a diferencia de Admisiones.jsx, que
// arranca en "admitido"): acá se puede referenciar cualquier admisión, no
// solo las que siguen activas. Búsqueda multi-campo (N° admisión/documento/
// nombre) client-side sobre el resultado ya filtrado por estado -- distinto
// de fetchAdmisiones, que solo busca un campo a la vez.
// `onSelect` recibe el registro de admisión completo (no solo
// numeroAdmision, encargo explícito): bajo Copago/Moderadora/Pago
// Compartido, FacturaAgregarModalClasico también usa `documento`/
// `nombreAfiliado` de acá para autocompletar "Id Tercero", además de
// `numeroAdmision` para "No. Referencia" -- ver handleSeleccionAdmision ahí.
export default function AdmisionPickerModal({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [estado, setEstado] = useState('todos');
  const [status, setStatus] = useState('loading');
  const [admisiones, setAdmisiones] = useState([]);
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    fetchAdmisiones({ estado }).then(({ items }) => {
      if (cancelled) return;
      setAdmisiones(items);
      setStatus('ready');
    });
    return () => { cancelled = true; };
  }, [estado]);

  function handleChangeEstado(value) {
    setStatus('loading');
    setEstado(value);
  }

  const q = normalizar(query.trim());
  const filtered = !q ? admisiones : admisiones.filter((a) => (
    normalizar(a.numeroAdmision).includes(q)
    || normalizar(a.documento).includes(q)
    || normalizar(a.nombreAfiliado).includes(q)
  ));

  function handleElegir() {
    if (!seleccion) return;
    onSelect(seleccion);
    onClose();
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal apm-modal" role="dialog" aria-modal="true" aria-labelledby="apm-title">
        <ModalHeader
          title="Seleccionar admisión"
          titleId="apm-title"
          onClose={onClose}
          closeLabel="Cerrar selección de admisión"
        />

        <div className="modal-body">
          <div className="apm-toolbar">
            <div className="apm-search">
              <LuSearch className="icon" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por N° de admisión, documento o nombre del afiliado"
                aria-label="Buscar admisión"
              />
            </div>
            <div className="apm-estado-filter">
              <FormSelect
                id="apm-estado"
                value={estado}
                onChange={handleChangeEstado}
                options={ESTADO_FILTER_OPTIONS}
                ariaLabel="Filtrar por estado"
              />
            </div>
          </div>

          <div className="apm-table">
            <div className="apm-row apm-row-head">
              <span>N° Admisión</span>
              <span>Fecha</span>
              <span>Hora</span>
              <span>Estado</span>
              <span>Documento</span>
              <span>Nombre del afiliado</span>
              <span>Administradora</span>
              <span>Tipo de contrato</span>
              <span>Tipo de admisión</span>
            </div>
            <div className="apm-list" role="listbox" aria-labelledby="apm-title">
              {status === 'loading' && <div className="apm-empty">Cargando admisiones…</div>}
              {status === 'ready' && filtered.length === 0 && (
                <div className="apm-empty">Sin resultados para los filtros aplicados.</div>
              )}
              {status === 'ready' && filtered.map((a) => {
                const active = seleccion?.id === a.id;
                return (
                  <button
                    type="button"
                    key={a.id}
                    role="option"
                    aria-selected={active}
                    className={`apm-row apm-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(a)}
                  >
                    <span className="apm-num">{a.numeroAdmision}</span>
                    <span>{a.fecha}</span>
                    <span>{a.hora}</span>
                    <span><Badge tone={ESTADO_TONE[a.estado]}>{ESTADO_LABEL[a.estado]}</Badge></span>
                    <span className="apm-num">{a.documento}</span>
                    <span className="apm-ellipsis">{a.nombreAfiliado}</span>
                    <span className="apm-ellipsis">{a.administradora}</span>
                    <span>{a.tipoContrato}</span>
                    <span>{a.tipoAdmision}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleElegir} disabled={!seleccion}>Elegir</Button>
        </div>
      </div>
    </div>
  );
}
