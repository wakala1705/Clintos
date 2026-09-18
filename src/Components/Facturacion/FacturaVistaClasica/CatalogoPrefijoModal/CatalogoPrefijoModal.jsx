'use client';

import { useEffect, useState } from 'react';
import './CatalogoPrefijoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuSearch } from 'react-icons/lu';

// Quita tildes -- mismo helper que CatalogoCentroCostoModal.jsx/
// CatalogoAreaFuncionalModal.jsx (no compartido entre features, ver
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

// Catálogo real de prefijos (encargo explícito, ver imágenes de
// referencia) -- reemplaza el listado chico fijo (3 códigos, sin
// descripción) que reusaba PREFIJO_OPTIONS de mockFacturasData.js. Mismo
// patrón que CatalogoCentroCostoModal/CatalogoAreaFuncionalModal (buscador
// de texto libre + tabla sin paginación, el volumen entero cabe en un solo
// scroll), acá con 2 columnas (Prefijo/Descripción) en vez de 3 -- este
// catálogo no trae un tercer dato propio (ni "Estado" ni "Centro de
// costo").
const PREFIJOS = [
  { prefijo: '12', descripcion: 'ACCIONES DE PROTECCION ESPECIFICA Y DETECCION TEMPRANA' },
  { prefijo: '20', descripcion: 'ACTIVIDADES Y PROCEDIMIENTOS DE LAS ARP' },
  { prefijo: '22', descripcion: 'ACTIVOS FIJOS' },
  { prefijo: 'XX23', descripcion: 'ACTIVOS FIJOS' },
  { prefijo: 'S003', descripcion: 'APOYO DIAGNOSTICO' },
  { prefijo: 'S001', descripcion: 'APOYO TERAPEUTICO' },
  { prefijo: 'S005', descripcion: 'ARRENDAMIENTO BIENES INMUEBLES' },
  { prefijo: '002', descripcion: 'Articulo No POS' },
  { prefijo: '001', descripcion: 'Articulos POS' },
  { prefijo: 'S013', descripcion: 'BECA EDUCATIVA' },
  { prefijo: '38', descripcion: 'BIOPSIAS Y PROCEDIMIENTOS GUIADOS POR IMAGENES' },
  { prefijo: '41', descripcion: 'CARDIOLOGIA' },
  { prefijo: '24', descripcion: 'CIRUGIA CARDIOVASCULAR' },
  { prefijo: '01', descripcion: 'CIRUGIAS GENERALES' },
  { prefijo: '23', descripcion: 'CIRUGIAS GINECOLOGICAS' },
  { prefijo: '991', descripcion: 'CONCEPTO' },
  { prefijo: 'XX19', descripcion: 'CONJUNTOS DE ATENCION EN SALUD POR TARIFA INTEGRAL' },
  { prefijo: '43', descripcion: 'CONSULTA EXTERNA' },
  { prefijo: '03', descripcion: 'CONSULTA MONITORIZACION Y PROCEDIMIENTOS DIAGNOSTICOS' },
  { prefijo: '099', descripcion: 'CONSULTAS ESPECIALIZADAS' },
  { prefijo: 'S012', descripcion: 'CONVENIO DOCENTE ASISTENCIAL' },
  { prefijo: '51', descripcion: 'COPAGO' },
  { prefijo: 'COT', descripcion: 'Cotizacion' },
  { prefijo: '52', descripcion: 'CUOTA MODERADORA' },
  { prefijo: '07', descripcion: 'DESEMPEÑO FUNCIONAL Y REHABILITACION' },
  { prefijo: '992', descripcion: 'DETALLES' },
  { prefijo: '09', descripcion: 'DIAGNOSTICO Y TRATAMIENTO EN SISTEMAS VISUAL Y AUDITIVO' },
  { prefijo: '005', descripcion: 'Dispositivos Medicos e Insumos' },
  { prefijo: '25', descripcion: 'DOMICILIARIO' },
  { prefijo: '31', descripcion: 'ECOGRAFIAS' },
  { prefijo: '031', descripcion: 'Ecografias' },
  { prefijo: '42', descripcion: 'ELECTROFISIOLOGIA' },
  { prefijo: '007', descripcion: 'Elementos de Aseo y Cafeteria' },
  { prefijo: '18', descripcion: 'ENDOSCOPIAS TERAPEUTICAS POR LAPAROSCOPIA' },
  { prefijo: '46', descripcion: 'GAMAGRAFIAS' },
  { prefijo: '21', descripcion: 'GASES MEDICINALES' },
  { prefijo: '021', descripcion: 'Gases Medicinales' },
  { prefijo: '40', descripcion: 'GASTROENTEROLOGIA' },
  { prefijo: '32', descripcion: 'HEMODINAMIA' },
  { prefijo: 'S011', descripcion: 'HONORARIOS' },
  { prefijo: 'S002', descripcion: 'HOSPITALIZACION' },
  { prefijo: 'XX2', descripcion: 'IMAGENES' },
  { prefijo: '006', descripcion: 'Imagenologia' },
  { prefijo: '02', descripcion: 'IMAGENOLOGIA Y RADIOLOGIA' },
  { prefijo: '28', descripcion: 'INSUMOS HEMODINAMIA' },
  { prefijo: 'S015', descripcion: 'INTERESES' },
  { prefijo: '37', descripcion: 'INTERNACION' },
  { prefijo: '04', descripcion: 'INVESTIGACIONES' },
  { prefijo: '44', descripcion: 'KIT LABORATORIO' },
  { prefijo: '19', descripcion: 'LABORATORIO CLINICO' },
  { prefijo: '019', descripcion: 'Laboratorio Clinico' },
  { prefijo: '19-1', descripcion: 'LABORATORIO CLINICO NO PBS' },
  { prefijo: '29', descripcion: 'LABORATORIO CLINICO NO PBS' },
  { prefijo: '993', descripcion: 'MANUALES' },
  { prefijo: '17', descripcion: 'MATERIAL DE OSTEOSINTESIS' },
];

// `onSelect` entrega "prefijo — descripción" ya compuesto (mismo formato
// que CatalogoCentroCostoModal/CatalogoAreaFuncionalModal) -- AgregarItemModal
// lo guarda y muestra tal cual en el input.
export default function CatalogoPrefijoModal({ onSelect, onClose }) {
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
  const filtered = PREFIJOS.filter((p) => (
    !q
    || normalizar(p.prefijo).includes(q)
    || normalizar(p.descripcion).includes(q)
  ));

  function handleElegir() {
    if (!seleccion) return;
    onSelect(`${seleccion.prefijo} — ${seleccion.descripcion}`);
    onClose();
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal cpfm-modal" role="dialog" aria-modal="true" aria-labelledby="cpfm-title">
        <ModalHeader
          title="Seleccionar Prefijo"
          titleId="cpfm-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo"
        />

        <div className="modal-body">
          <div className="cpfm-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por prefijo o descripción..."
              aria-label="Buscar por prefijo o descripción"
            />
          </div>

          <div className="cpfm-table">
            <div className="cpfm-row cpfm-row-head">
              <span>Prefijo</span>
              <span>Descripción</span>
            </div>
            <div className="cpfm-list" role="listbox" aria-labelledby="cpfm-title">
              {filtered.length === 0 && (
                <div className="cpfm-empty">Sin resultados para la búsqueda.</div>
              )}
              {filtered.map((p) => {
                const active = seleccion?.prefijo === p.prefijo;
                return (
                  <button
                    type="button"
                    key={p.prefijo}
                    role="option"
                    aria-selected={active}
                    className={`cpfm-row cpfm-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(p)}
                  >
                    <span className="cpfm-prefijo">{p.prefijo}</span>
                    <span className="cpfm-descripcion">{p.descripcion}</span>
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
