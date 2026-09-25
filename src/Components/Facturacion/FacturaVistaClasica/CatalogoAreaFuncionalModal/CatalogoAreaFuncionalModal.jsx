'use client';

import { useEffect, useState } from 'react';
import './CatalogoAreaFuncionalModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuSearch } from 'react-icons/lu';

// Quita tildes -- mismo helper que CatalogoCentroCostoModal.jsx/
// CatalogoAseguradorasModal.jsx (no compartido entre features, ver
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

// Catálogo real de áreas funcionales -- "Tabla de AFU" (encargo explícito,
// ver imágenes de referencia), reemplaza el listado chico fijo de 3
// nombres (Asistencial/Administrativa/Apoyo Diagnóstico) que tenía antes
// este picker. Mismo patrón que CatalogoCentroCostoModal (buscador de texto
// libre + tabla sin paginación, el volumen entero cabe en un solo scroll):
// acá con 3 columnas (Id. área funcional/Descripción/Centro de costo) en
// vez de las 3 de ese catálogo (Código/Descripción/Estado) -- el legado
// trae "Centro de costo" como dato propio de cada área, no un estado.
// Los tabs "Id. Area"/"Descripción"/"Centro Costo" de la imagen de
// referencia (ordenar la tabla por esa columna) no se replican: ningún otro
// catálogo del proyecto tiene esa mecánica todavía (ver
// CatalogoCentroCostoModal/CatalogoTipoTerceroModal/CatalogoItemsModal, que
// solo filtran, nunca ordenan por columna) -- se resuelve con el mismo
// buscador de texto libre que ya cubre los otros catálogos.
const AREAS_FUNCIONALES = [
  { id: '01', descripcion: 'CONSULTA EXTERNA', centroCosto: '01' },
  { id: '02', descripcion: 'QUIMIOTERAPIA', centroCosto: '02' },
  { id: '03', descripcion: 'RADIOTERAPIA', centroCosto: '03' },
  { id: '04', descripcion: 'BRAQUITERAPIA', centroCosto: '04' },
  { id: '05', descripcion: 'LABORATORIO CLINICO', centroCosto: '05' },
  { id: '06', descripcion: 'SERVICIO FARMACEUTICO T1', centroCosto: '06' },
  { id: '07', descripcion: 'URGENCIAS', centroCosto: '07' },
  { id: '08', descripcion: 'IMÁGENES DIAGNÓSTICAS', centroCosto: '08' },
  { id: '09', descripcion: 'HOSPITALIZACION PISO 2 T1', centroCosto: '09' },
  { id: '10', descripcion: 'INVESTIGACION', centroCosto: '80' },
  { id: '11', descripcion: 'GESTIÓN DE ENSEÑANZA', centroCosto: '11' },
  { id: '12', descripcion: 'CARDIOLOGIA', centroCosto: '12' },
  { id: '14', descripcion: 'HEMODINAMIA', centroCosto: '14' },
  { id: '15', descripcion: 'UCI ADULTO INTENSIVO PISO 4 T1', centroCosto: '15' },
  { id: '16', descripcion: 'CIRUGIA', centroCosto: '16' },
  { id: '18', descripcion: 'AMBULANCIA', centroCosto: '18' },
  { id: '210101', descripcion: 'GERENCIA', centroCosto: '210101' },
  { id: '210201', descripcion: 'SUB GERENCIA', centroCosto: '210201' },
  { id: '210301', descripcion: 'JUNTA DIRECTIVA', centroCosto: '210301' },
  { id: '210302', descripcion: 'REVISORIA FISCAL', centroCosto: '210302' },
  { id: '210303', descripcion: 'GESTION CONTABLE -CONTABILIDAD', centroCosto: '210303' },
  { id: '210304', descripcion: 'JURÍDICA', centroCosto: '210304' },
  { id: '210309', descripcion: 'ZONAS COMUNES', centroCosto: '210309' },
  { id: '210401', descripcion: 'COMITÉ ÉTICA E INVESTIGACIONE', centroCosto: '210401' },
  { id: '210504', descripcion: 'PROYECTO ACREDITACIÓN', centroCosto: '210504' },
  { id: '210601', descripcion: 'DIRECCIÓN MEDICA', centroCosto: '210601' },
  { id: '210699', descripcion: 'GESTIÓN CLÍNICA', centroCosto: '210699' },
  { id: '210801', descripcion: 'AUDITORIA CONCURRENTE', centroCosto: '210801' },
  { id: '210802', descripcion: 'AUDITORIA DE HISTORIAS CLÍNICAS', centroCosto: '210802' },
  { id: '210901', descripcion: 'EXPERIENCIA DEL USUARIO', centroCosto: '210901' },
  { id: '211001', descripcion: 'DIRECCIÓN FINANCIERA', centroCosto: '211001' },
  { id: '211202', descripcion: 'ADMISIONES', centroCosto: '211202' },
  { id: '211203', descripcion: 'CUENTAS MEDICAS (FACTURACIÓN)', centroCosto: '211203' },
];

// `onSelect` entrega "id — descripción" ya compuesto (mismo formato que
// CatalogoCentroCostoModal, ej. "210101 — Gerencia") -- AgregarItemModal lo
// guarda y muestra tal cual en el input.
export default function CatalogoAreaFuncionalModal({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const q = normalizar(query.trim());
  const filtered = AREAS_FUNCIONALES.filter((a) => (
    !q
    || normalizar(a.id).includes(q)
    || normalizar(a.descripcion).includes(q)
    || normalizar(a.centroCosto).includes(q)
  ));

  function handleElegir() {
    if (!seleccion) return;
    onSelect(`${seleccion.id} — ${seleccion.descripcion}`);
    onClose();
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal cafm-modal" role="dialog" aria-modal="true" aria-labelledby="cafm-title">
        <ModalHeader
          title="Seleccionar Área Funcional (AFU)"
          titleId="cafm-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo"
        />

        <div className="modal-body">
          <div className="cafm-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por id., descripción o centro de costo..."
              aria-label="Buscar por id., descripción o centro de costo"
            />
          </div>

          <div className="cafm-table">
            <div className="cafm-row cafm-row-head">
              <span>Id. Área Funcional</span>
              <span>Descripción</span>
              <span>Centro de Costo</span>
            </div>
            <div className="cafm-list" role="listbox" aria-labelledby="cafm-title">
              {filtered.length === 0 && (
                <div className="cafm-empty">Sin resultados para la búsqueda.</div>
              )}
              {filtered.map((area) => {
                const active = seleccion?.id === area.id;
                return (
                  <button
                    type="button"
                    key={area.id}
                    role="option"
                    aria-selected={active}
                    className={`cafm-row cafm-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(area)}
                  >
                    <span className="cafm-id">{area.id}</span>
                    <span className="cafm-descripcion">{area.descripcion}</span>
                    <span className="cafm-centro-costo">{area.centroCosto}</span>
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
