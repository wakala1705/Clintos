'use client';

import { useMemo, useState } from 'react';
import './ItemFormPanel.css';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import {
  getCatalogoCategoria, PRESENTACIONES, UNIDADES_MEDIDA, UNIDADES_TIEMPO, VIAS_ADMINISTRACION,
} from '@/hooks/HistoriaClinica/mockCatalogoOrdenes';
import { LuMic, LuPlus, LuSearch, LuX } from 'react-icons/lu';

function unidadTiempoLabel(value) {
  return UNIDADES_TIEMPO.find((u) => u.value === value)?.label.toLowerCase() ?? '';
}

// Formulario "agregar ítem" del panel izquierdo de "Iniciar nueva orden".
// Remonta completo cada vez que cambia la categoría activa (ver
// `key={categoriaActiva}` en NuevaOrdenForm.jsx), así que todo su estado es
// local: no necesita resetearse manualmente al cambiar de categoría, solo
// después de un "Agregar a la orden" exitoso (ver resetFormulario) para
// poder cargar varios ítems seguidos de la misma categoría. Los campos de
// dosificación (Dosis/Unidad/Presentación/Vía/Frecuencia/Duración) solo
// existen cuando `categoria.formulario === 'completo'` (Medicamentos/
// Medicamentos de investigación, ver ../../shared/ordenSecciones.js) — el
// resto de categorías solo pide Cantidad/Prioritario/Única dosis/
// Observaciones. El buscador filtra el catálogo mock de la categoría activa;
// elegir una sugerencia la deja como chip removible y, si la categoría es de
// formulario completo, precarga dosis/unidad/presentación/vía desde el
// catálogo (editable después).
export default function ItemFormPanel({ categoria, onAgregar }) {
  const esCompleto = categoria.formulario === 'completo';
  const catalogo = useMemo(() => getCatalogoCategoria(categoria.clave), [categoria.clave]);

  const [busqueda, setBusqueda] = useState('');
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [dosis, setDosis] = useState('');
  const [unidad, setUnidad] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [via, setVia] = useState('');
  const [frecuenciaValor, setFrecuenciaValor] = useState('');
  const [frecuenciaUnidad, setFrecuenciaUnidad] = useState('');
  const [duracionValor, setDuracionValor] = useState('');
  const [duracionUnidad, setDuracionUnidad] = useState('');
  const [cantidad, setCantidad] = useState(esCompleto ? '' : '1');
  const [prioritario, setPrioritario] = useState(false);
  const [unicaDosis, setUnicaDosis] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [errors, setErrors] = useState({});

  const sugerencias = !itemSeleccionado && busqueda.trim()
    ? catalogo.filter((i) => i.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())).slice(0, 8)
    : [];

  function handleSeleccionar(item) {
    setItemSeleccionado(item);
    setBusqueda('');
    if (esCompleto) {
      setDosis(item.dosis ?? '');
      setUnidad(item.unidad ?? '');
      setPresentacion(item.presentacion ?? '');
      setVia(item.via ?? '');
    }
  }

  function clearError(field) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function resetFormulario() {
    setItemSeleccionado(null);
    setBusqueda('');
    setDosis('');
    setUnidad('');
    setPresentacion('');
    setVia('');
    setFrecuenciaValor('');
    setFrecuenciaUnidad('');
    setDuracionValor('');
    setDuracionUnidad('');
    setCantidad(esCompleto ? '' : '1');
    setPrioritario(false);
    setUnicaDosis(false);
    setObservaciones('');
    setErrors({});
  }

  function handleAgregar() {
    const nombre = itemSeleccionado?.nombre ?? busqueda.trim();
    const nextErrors = {};
    if (!nombre) nextErrors.nombre = true;
    if (esCompleto) {
      if (!dosis.trim()) nextErrors.dosis = true;
      if (!unidad) nextErrors.unidad = true;
      if (!presentacion) nextErrors.presentacion = true;
      if (!via) nextErrors.via = true;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      window.ncToast?.('Completa los campos obligatorios para agregar el ítem.');
      return;
    }

    const frecuencia = frecuenciaValor.trim()
      ? `Cada ${frecuenciaValor.trim()} ${unidadTiempoLabel(frecuenciaUnidad)}`.trim()
      : '';
    const duracion = duracionValor.trim()
      ? `${duracionValor.trim()} ${unidadTiempoLabel(duracionUnidad)}`.trim()
      : '';

    onAgregar({
      id: `${categoria.clave}-${itemSeleccionado?.id ?? 'custom'}-${Date.now()}`,
      descripcion: nombre,
      servicioContratado: true,
      dosis: esCompleto ? dosis.trim() : '',
      unidad: esCompleto ? unidad : '',
      presentacion: esCompleto ? presentacion : '',
      via: esCompleto ? via : '',
      frecuencia,
      duracion,
      cantidad: cantidad.trim() || (esCompleto ? '' : '1'),
      prioritario,
      observaciones: observaciones.trim(),
    });
    resetFormulario();
  }

  return (
    <div className="ifp-panel">
      <div className={`ifp-search${errors.nombre ? ' error' : ''}`}>
        <LuSearch className="icon" aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar"
          value={itemSeleccionado ? '' : busqueda}
          disabled={!!itemSeleccionado}
          aria-label={`Buscar en ${categoria.titulo}`}
          onChange={(e) => { setBusqueda(e.target.value); clearError('nombre'); }}
        />
      </div>

      {sugerencias.length > 0 && (
        <ul className="ifp-suggestions">
          {sugerencias.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => handleSeleccionar(item)}>{item.nombre}</button>
            </li>
          ))}
        </ul>
      )}

      {itemSeleccionado && (
        <div className="ifp-chip">
          <span>{itemSeleccionado.nombre}</span>
          <button type="button" onClick={() => setItemSeleccionado(null)} aria-label="Quitar selección">
            <LuX className="icon" aria-hidden="true" />
          </button>
        </div>
      )}

      {esCompleto && (
        <>
          <div className="ifp-row">
            <div className="form-field">
              <label htmlFor="ifp-dosis">Dosis<span className="req">*</span></label>
              <input
                id="ifp-dosis"
                type="text"
                value={dosis}
                aria-invalid={errors.dosis ? 'true' : undefined}
                onChange={(e) => { setDosis(e.target.value); clearError('dosis'); }}
              />
            </div>
            <div className="form-field">
              <label htmlFor="ifp-unidad">Unidad de medida<span className="req">*</span></label>
              <FormSelect
                id="ifp-unidad"
                value={unidad}
                options={UNIDADES_MEDIDA}
                placeholder="Seleccione unidad de medida"
                required
                onChange={(v) => { setUnidad(v); clearError('unidad'); }}
              />
            </div>
          </div>

          <div className="ifp-row">
            <div className="form-field">
              <label htmlFor="ifp-presentacion">Presentación<span className="req">*</span></label>
              <FormSelect
                id="ifp-presentacion"
                value={presentacion}
                options={PRESENTACIONES}
                placeholder="Seleccione"
                required
                onChange={(v) => { setPresentacion(v); clearError('presentacion'); }}
              />
            </div>
            <div className="form-field">
              <label htmlFor="ifp-via">Vía<span className="req">*</span></label>
              <FormSelect
                id="ifp-via"
                value={via}
                options={VIAS_ADMINISTRACION}
                placeholder="Seleccione"
                required
                onChange={(v) => { setVia(v); clearError('via'); }}
              />
            </div>
          </div>

          <div className="ifp-row">
            <div className="form-field">
              <label htmlFor="ifp-frecuencia">Frecuencia</label>
              <div className="ifp-field-split">
                <input
                  id="ifp-frecuencia"
                  type="number"
                  min="0"
                  value={frecuenciaValor}
                  onChange={(e) => setFrecuenciaValor(e.target.value)}
                />
                <FormSelect
                  id="ifp-frecuencia-unidad"
                  value={frecuenciaUnidad}
                  options={UNIDADES_TIEMPO}
                  placeholder="Seleccione"
                  ariaLabel="Unidad de frecuencia"
                  onChange={setFrecuenciaUnidad}
                />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="ifp-duracion">Duración</label>
              <div className="ifp-field-split">
                <input
                  id="ifp-duracion"
                  type="number"
                  min="0"
                  value={duracionValor}
                  onChange={(e) => setDuracionValor(e.target.value)}
                />
                <FormSelect
                  id="ifp-duracion-unidad"
                  value={duracionUnidad}
                  options={UNIDADES_TIEMPO}
                  placeholder="Seleccione"
                  ariaLabel="Unidad de duración"
                  onChange={setDuracionUnidad}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="ifp-row-cantidad">
        <div className="form-field ifp-cantidad">
          <label htmlFor="ifp-cantidad">Cantidad</label>
          <input
            id="ifp-cantidad"
            type="number"
            min="0"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>
        <ToggleSwitch label="Prioritario" checked={prioritario} onChange={setPrioritario} />
        <ToggleSwitch label="Única dosis" checked={unicaDosis} onChange={setUnicaDosis} />
      </div>

      <div className="form-field">
        <label htmlFor="ifp-observaciones">Observaciones</label>
        <textarea
          id="ifp-observaciones"
          rows={3}
          placeholder="Presione F2 para ver sugerencias, F3 para ver resumen"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>

      <div className="ifp-actions">
        <Button variant="outline" icon={LuMic} onClick={() => window.ncToast?.('Recetario por voz (flujo en desarrollo).')}>
          Recetario por voz
        </Button>
        <Button variant="primary" icon={LuPlus} onClick={handleAgregar}>
          Agregar a la orden
        </Button>
      </div>
    </div>
  );
}
