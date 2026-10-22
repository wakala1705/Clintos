'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './FacturacionMasivaCEModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import DatePicker from '@/Components/DatePicker/DatePicker';
import CatalogoAseguradorasModal from '@/Components/CatalogoAseguradorasModal/CatalogoAseguradorasModal';
import CatalogoContratosTerceroModal from '@/Components/CatalogoContratosTerceroModal/CatalogoContratosTerceroModal';
import {
  LuCalendarCheck, LuCheck, LuClipboardCheck, LuSearch,
} from 'react-icons/lu';

const PYP_OPTIONS = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: 'todos', label: 'Todos' },
];

const FILTROS_INICIALES = {
  tercero: '', regimen: '0', contrato: '', desde: '', hasta: '', pyp: 'todos',
};

const OPCIONES = [
  {
    id: 'ordenes',
    label: 'Órdenes médicas',
    desc: 'Facturar a partir de las órdenes médicas del período.',
    icon: LuClipboardCheck,
    ruta: '/facturacion/autorizaciones',
  },
  {
    id: 'citas',
    label: 'Citas',
    desc: 'Facturar a partir de las citas atendidas del período.',
    icon: LuCalendarCheck,
    ruta: '/facturacion/citas',
  },
];

// Ventana de Facturación masiva · Consulta externa: filtros comunes + dos
// opciones (órdenes médicas / citas) + "Continuar". Id. Tercero reusa
// CatalogoAseguradorasModal y Régimen ID el Catálogo de contratos
// (CatalogoContratosTerceroModal).
// "Continuar" abre Facturación de autorizaciones (órdenes médicas) o Facturación
// de citas, según la card elegida (`ruta` de OPCIONES).
// Con `filtrosIniciales` (los de la query de esas pantallas) abre en modo edición:
// sin las cards de "qué facturar", y "Aplicar" recarga `rutaEdicion` (la pantalla
// desde la que se abrió) con los filtros nuevos.
export default function FacturacionMasivaCEModal({ onClose, filtrosIniciales, rutaEdicion }) {
  const editando = filtrosIniciales !== undefined;
  const router = useRouter();
  const [filtros, setFiltros] = useState({ ...FILTROS_INICIALES, ...filtrosIniciales });
  const [opcion, setOpcion] = useState(null);
  const [picker, setPicker] = useState(null); // null | 'tercero' | 'regimen'
  const set = (patch) => setFiltros((f) => ({ ...f, ...patch }));

  // Con un picker abierto, Escape lo cierra a él (su propio listener) y no a esta ventana.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !picker) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, picker]);

  const elegida = OPCIONES.find((o) => o.id === opcion);

  // Los filtros viajan por query para que la pantalla los muestre (fa-datos).
  function irA(ruta) {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`${ruta}?${params.toString()}`);
  }

  function handleContinuar() {
    if (editando) {
      irA(rutaEdicion);
      onClose();
      return;
    }
    if (elegida) irA(elegida.ruta);
  }

  return (
    <>
      <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-card fmce-card" role="dialog" aria-modal="true" aria-labelledby="fmce-title">
          <ModalHeader
            title={editando ? 'Editar datos de facturación' : 'Facturación masiva · Consulta externa'}
            titleId="fmce-title"
            onClose={onClose}
          />

          <div className="modal-body">
            <div className="fmce-grid">
              <div className="form-field">
                <label htmlFor="fmce-tercero">Id. Tercero</label>
                <div className="field-with-search">
                  <input
                    id="fmce-tercero"
                    type="text"
                    required
                    placeholder="Id. del tercero"
                    value={filtros.tercero}
                    onChange={(e) => set({ tercero: e.target.value })}
                  />
                  <button
                    type="button"
                    className="search-btn"
                    onClick={() => setPicker('tercero')}
                    aria-label="Buscar tercero"
                    title="Buscar tercero"
                  >
                    <LuSearch className="icon" />
                  </button>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="fmce-regimen">Régimen ID</label>
                <div className="field-with-search">
                  <input
                    id="fmce-regimen"
                    type="text"
                    value={filtros.regimen}
                    onChange={(e) => set({ regimen: e.target.value })}
                  />
                  <button
                    type="button"
                    className="search-btn"
                    onClick={() => setPicker('regimen')}
                    aria-label="Buscar régimen"
                    title="Buscar régimen"
                  >
                    <LuSearch className="icon" />
                  </button>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="fmce-contrato">ID. Contrato</label>
                <input
                  id="fmce-contrato"
                  type="text"
                  required
                  placeholder="Id. del contrato"
                  value={filtros.contrato}
                  onChange={(e) => set({ contrato: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="fmce-pyp">P y P</label>
                <FormSelect
                  id="fmce-pyp"
                  value={filtros.pyp}
                  onChange={(v) => set({ pyp: v })}
                  options={PYP_OPTIONS}
                />
              </div>

              <div className="form-field">
                <label htmlFor="fmce-desde">Fecha inicial</label>
                <DatePicker
                  id="fmce-desde"
                  ariaLabel="Fecha inicial"
                  value={filtros.desde}
                  onChange={(iso) => set({ desde: iso, hasta: filtros.hasta && filtros.hasta < iso ? iso : filtros.hasta })}
                  max={filtros.hasta || undefined}
                  clearable
                />
              </div>
              <div className="form-field">
                <label htmlFor="fmce-hasta">Fecha final</label>
                <DatePicker
                  id="fmce-hasta"
                  ariaLabel="Fecha final"
                  value={filtros.hasta}
                  onChange={(iso) => set({ hasta: iso })}
                  min={filtros.desde || undefined}
                  clearable
                />
              </div>
            </div>

            {!editando && (
            <div>
              <h4 className="fmce-section-title" id="fmce-que-facturar">¿Qué quieres facturar?</h4>
              <div className="fmce-opciones" role="radiogroup" aria-labelledby="fmce-que-facturar">
                {OPCIONES.map((o) => {
                  const selected = opcion === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`fmce-opcion${selected ? ' selected' : ''}`}
                      onClick={() => setOpcion(o.id)}
                    >
                      <span className="fmce-opcion-check" aria-hidden="true"><LuCheck className="icon" /></span>
                      <span className="fmce-opcion-icon"><o.icon className="icon" /></span>
                      <span className="fmce-opcion-titulo">{o.label}</span>
                      <span className="fmce-opcion-desc">{o.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            )}
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>{editando ? 'Cancelar' : 'Cerrar'}</Button>
            <Button onClick={handleContinuar} disabled={!editando && !opcion}>
              {editando ? 'Aplicar' : 'Continuar'}
            </Button>
          </div>
        </div>
      </div>

      {picker === 'tercero' && (
        <CatalogoAseguradorasModal onSelect={(v) => set({ tercero: v })} onClose={() => setPicker(null)} />
      )}
      {picker === 'regimen' && (
        <CatalogoContratosTerceroModal
          onSelect={(c) => set({ regimen: `${c.id} - ${c.regimen}`, contrato: c.noContrato })}
          onClose={() => setPicker(null)}
        />
      )}
    </>
  );
}
