'use client';

import { useEffect, useState } from 'react';
import './CatalogoCentroCostoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuSearch } from 'react-icons/lu';

// Quita tildes -- mismo helper que CatalogoAseguradorasModal.jsx (no
// compartido entre features, ver AGENTS.md "Component organization").
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// Catálogo real de centros de costo (encargo explícito, ver imágenes de
// referencia "Seleccionar Centro de Costo (CEN)") -- reemplaza el listado
// chico fijo (CENTRO_COSTO_OPTIONS) que antes vivía como opciones de un
// FormSelect en AgregarItemModal.jsx. A diferencia de
// CatalogoAreaFuncionalModal/CatalogoPrefijoModal (listas de 3-4 valores,
// picker fijo sin búsqueda), este catálogo sí trae un buscador de texto
// libre (código/descripción/estado) -- mismo patrón que
// @/Components/CatalogoAseguradorasModal, pero sin paginación: el volumen
// de filas cabe entero en un solo scroll (mismo criterio que
// CatalogoItemsModal/CatalogoTipoTerceroModal, que tampoco paginan).
const CENTROS_COSTO = [
  { codigo: '01', descripcion: 'CONSULTA EXTERNA T1', estado: 'Activo' },
  { codigo: '02', descripcion: 'QUIMIOTERAPIA', estado: 'Activo' },
  { codigo: '03', descripcion: 'RADIOTERAPIA', estado: 'Activo' },
  { codigo: '04', descripcion: 'BRAQUITERAPIA', estado: 'Activo' },
  { codigo: '05', descripcion: 'LABORATORIO CLINICO', estado: 'Activo' },
  { codigo: '06', descripcion: 'SERVICIO FARMACEUTICO T1', estado: 'Activo' },
  { codigo: '09', descripcion: 'HOSPITALIZACION PISO 2 T1', estado: 'Activo' },
  { codigo: '10', descripcion: 'INVESTIGACION', estado: 'Activo' },
  { codigo: '112403', descripcion: 'SALUD OCUPACIONAL', estado: 'Activo' },
  { codigo: '12', descripcion: 'CARDIOLOGIA', estado: 'Activo' },
  { codigo: '131600', descripcion: 'SALA DORADA', estado: 'Activo' },
  { codigo: '14', descripcion: 'HEMODINAMIA', estado: 'Activo' },
  { codigo: '15', descripcion: 'UCI ADULTO INTENSIVO PISO 4 T1', estado: 'Activo' },
  { codigo: '16', descripcion: 'CIRUGIA', estado: 'Activo' },
  { codigo: '18', descripcion: 'AMBULANCIA', estado: 'Activo' },
  { codigo: '19', descripcion: 'GESTION DE ENSEÑANZA', estado: 'Activo' },
  { codigo: '210101', descripcion: 'GERENCIA', estado: 'Activo' },
  { codigo: '210201', descripcion: 'SUB GERENCIA', estado: 'Activo' },
  { codigo: '210301', descripcion: 'JUNTA DIRECTIVA', estado: 'Activo' },
  { codigo: '210302', descripcion: 'REVISORIA FISCAL', estado: 'Activo' },
  { codigo: '210303', descripcion: 'GESTION CONTABLE -CONTABILIDAD', estado: 'Activo' },
  { codigo: '210304', descripcion: 'JURÍDICA', estado: 'Activo' },
  { codigo: '210309', descripcion: 'ZONAS COMUNES', estado: 'Activo' },
  { codigo: '210401', descripcion: 'COMITÉ ÉTICA E INVESTIGACION', estado: 'Activo' },
];

// `onSelect` entrega "código — descripción" ya compuesto (mismo formato de
// label que ya mostraba CENTRO_COSTO_OPTIONS, ej. "01 — Consulta Externa
// T1") -- AgregarItemModal lo guarda y muestra tal cual en el input, mismo
// criterio que "No Contrato"/"Área Funcional"/"Prefijo" (todos guardan el
// texto ya listo para mostrar, no un value/label separado).
//
// Prefijo de clases "cco-" (no "ccm"): bug real encontrado en producción
// (encargo explícito: "la modal de contratación acomoda la modal como
// estaba antes, reajusta la layout") -- este componente nació reusando por
// coincidencia el mismo prefijo "ccm" que ya usaba CatalogoContratacionModal
// ("Catálogo Contratación Modal" vs. "Catálogo Centro de Costo Modal", ambas
// abrevian igual). Como el CSS del proyecto es global (no CSS Modules, ver
// AGENTS.md "Botones" para el motivo de esa excepción puntual en Button/
// Badge), sus `.ccm-modal`/`.ccm-row`/etc. colisionaban con los de
// CatalogoContratacionModal en cualquier página donde ambos modales
// estuvieran montados -- el que cargara después en el bundle ganaba, lo que
// rompía visualmente al otro (grid de 3 columnas angosto pisando el de 7
// columnas de Contratación). Se renombra este componente a "cco" en vez de
// tocar CatalogoContratacionModal porque este es el más nuevo de los dos.
export default function CatalogoCentroCostoModal({ onSelect, onClose }) {
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
  const filtered = CENTROS_COSTO.filter((c) => (
    !q
    || normalizar(c.codigo).includes(q)
    || normalizar(c.descripcion).includes(q)
    || normalizar(c.estado).includes(q)
  ));

  function handleSeleccionar() {
    if (!seleccion) return;
    onSelect(`${seleccion.codigo} — ${seleccion.descripcion}`);
    onClose();
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal cco-modal" role="dialog" aria-modal="true" aria-labelledby="cco-title">
        <ModalHeader
          title="Seleccionar Centro de Costo (CEN)"
          titleId="cco-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo"
        />

        <div className="modal-body">
          <div className="cco-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por código, descripción o estado..."
              aria-label="Buscar por código, descripción o estado"
            />
          </div>

          <div className="cco-table">
            <div className="cco-row cco-row-head">
              <span>Código</span>
              <span>Descripción</span>
              <span>Estado</span>
            </div>
            <div className="cco-list" role="listbox" aria-labelledby="cco-title">
              {filtered.length === 0 && (
                <div className="cco-empty">Sin resultados para la búsqueda.</div>
              )}
              {filtered.map((c) => {
                const active = seleccion?.codigo === c.codigo;
                return (
                  <button
                    type="button"
                    key={c.codigo}
                    role="option"
                    aria-selected={active}
                    className={`cco-row cco-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(c)}
                  >
                    <span className="cco-codigo">{c.codigo}</span>
                    <span className="cco-descripcion">{c.descripcion}</span>
                    <span className="cco-estado">{c.estado}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSeleccionar} disabled={!seleccion}>Seleccionar</Button>
        </div>
      </div>
    </div>
  );
}
