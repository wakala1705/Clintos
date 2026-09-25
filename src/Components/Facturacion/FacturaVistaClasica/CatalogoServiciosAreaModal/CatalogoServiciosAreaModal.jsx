'use client';

import { useEffect, useState } from 'react';
import './CatalogoServiciosAreaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { LuSearch } from 'react-icons/lu';
import { ITEMS_CATALOGO } from '@/hooks/Facturacion/mockFacturasData';

// Quita tildes -- mismo helper que CatalogoAseguradorasModal.jsx/
// CatalogoCentroCostoModal.jsx (no compartido entre features, ver
// AGENTS.md "Component organization").
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// Mismo ITEMS_CATALOGO que ya usaba CatalogoItemsModal (el componente que
// este reemplaza para el campo "Código" de AgregarItemModal, encargo
// explícito, ver imagen de referencia "SERVICIOS CONTRATADOS POR AREA...").
// "Prefijo"/"Id. Servicio CUPS"/"Descripción CUPS" son columnas que trae la
// referencia sin tener un dataset real en el proyecto todavía -- quedan en
// blanco ('—' en la tabla) en vez de forzar un valor que no existe, mismo
// criterio que mapFacturaItemsToForm en FacturaAgregarModalClasico.jsx.
const SERVICIOS = ITEMS_CATALOGO.map((it) => ({
  idServicio: it.referencia,
  descripcion: it.descripcion,
  prefijo: '',
  idServicioCups: '',
  descripcionCups: '',
}));

// Modos de búsqueda de la referencia (4 tabs en la imagen original) --
// unificados acá en un solo campo de búsqueda con un FormSelect de alcance
// pegado al input (encargo explícito: "que la barra de búsqueda sea una
// sola con esos tipos de búsqueda", en vez del tab bar por separado que
// tenía antes este modal, ver .csam-search/.csam-search-scope más abajo).
// Cada modo cambia qué campo de la fila evalúa el buscador, no es chrome
// decorativo: "Descripción Manual"/"Id. Servicio" sí filtran contra datos
// reales de SERVICIOS; "Descripción CUPS"/"Id. Servicio CUPS" filtran contra
// columnas hoy siempre vacías -- con la caja de búsqueda vacía muestran el
// catálogo completo igual que las otras dos, con texto tipeado no
// encuentran nada, que es el comportamiento honesto mientras no exista un
// catálogo CUPS real.
const SEARCH_SCOPES = [
  { key: 'manual', label: 'Descripción Manual', field: 'descripcion', placeholder: 'Buscar por descripción...' },
  { key: 'idServicio', label: 'Id. Servicio', field: 'idServicio', placeholder: 'Buscar por ID de servicio...' },
  {
    key: 'descripcionCups', label: 'Descripción CUPS', field: 'descripcionCups', placeholder: 'Buscar por descripción CUPS...',
  },
  {
    key: 'idServicioCups', label: 'Id. Servicio CUPS', field: 'idServicioCups', placeholder: 'Buscar por ID de servicio CUPS...',
  },
];

function Field({ label, value }) {
  return (
    <div className="csam-field">
      <span className="csam-field-label">{label}:</span>
      <span className="csam-field-value">{value || '—'}</span>
    </div>
  );
}

// Reemplaza a CatalogoItemsModal para el campo "Código" de AgregarItemModal
// (encargo explícito, ver imagen de referencia "SERVICIOS CONTRATADOS POR
// AREA..."). Mismo contrato de onSelect ({ referencia, descripcion }) que el
// componente reemplazado, para no tocar el call site en AgregarItemModal más
// de lo necesario. La franja de contexto (Bodega/Asegurador/Sexo/Prefijo/
// Área/Fecha) es de solo lectura (mismo criterio que CatalogoContratacionModal):
// muestra lo que ya conoce el padre, el resto queda en "—" -- AgregarItemModal
// hoy solo tiene Centro Costo/Prefijo/Área Funcional para pasarle, Asegurador/
// Sexo/Fecha no existen ahí todavía.
export default function CatalogoServiciosAreaModal({
  bodega, asegurador, sexo, prefijo, area, fecha, onSelect, onClose,
}) {
  const [activeScope, setActiveScope] = useState(SEARCH_SCOPES[0].key);
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const scope = SEARCH_SCOPES.find((s) => s.key === activeScope);
  const q = normalizar(query.trim());
  const filtered = SERVICIOS.filter((s) => !q || normalizar(s[scope.field] ?? '').includes(q));

  function handleElegir() {
    if (!seleccion) return;
    onSelect({ referencia: seleccion.idServicio, descripcion: seleccion.descripcion });
    onClose();
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal csam-modal" role="dialog" aria-modal="true" aria-labelledby="csam-title">
        <ModalHeader
          title="Servicios contratados por área"
          titleId="csam-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo"
        />

        <div className="modal-body">
          <div className="csam-info-panel">
            <Field label="Bodega" value={bodega} />
            <Field label="Asegurador" value={asegurador} />
            <Field label="Sexo" value={sexo} />
            <Field label="Prefijo" value={prefijo} />
            <Field label="Área" value={area} />
            <Field label="Fecha" value={fecha} />
          </div>

          <div className="csam-search">
            <div className="csam-search-scope">
              <FormSelect
                id="csam-search-scope"
                value={activeScope}
                onChange={setActiveScope}
                options={SEARCH_SCOPES.map((s) => ({ value: s.key, label: s.label }))}
                ariaLabel="Buscar por"
              />
            </div>
            <div className="csam-search-input">
              <LuSearch className="icon" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={scope.placeholder}
                aria-label={scope.placeholder}
              />
            </div>
          </div>

          <div className="csam-table">
            <div className="csam-row csam-row-head">
              <span>Id. Servicio</span>
              <span>Descripción</span>
              <span>Prefijo</span>
              <span>Id. Servicio CUPS</span>
              <span>Descripción CUPS</span>
            </div>
            <div className="csam-list" role="listbox" aria-labelledby="csam-title">
              {filtered.length === 0 && (
                <div className="csam-empty">Sin resultados para la búsqueda.</div>
              )}
              {filtered.map((s) => {
                const active = seleccion?.idServicio === s.idServicio;
                return (
                  <button
                    type="button"
                    key={s.idServicio}
                    role="option"
                    aria-selected={active}
                    className={`csam-row csam-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(s)}
                  >
                    <span className="csam-id">{s.idServicio}</span>
                    <span className="csam-descripcion">{s.descripcion}</span>
                    <span>{s.prefijo || '—'}</span>
                    <span>{s.idServicioCups || '—'}</span>
                    <span className="csam-descripcion">{s.descripcionCups || '—'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleElegir} disabled={!seleccion}>Seleccionar</Button>
        </div>
      </div>
    </div>
  );
}
