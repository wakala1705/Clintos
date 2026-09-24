'use client';

import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import './ItemFormPanel.css';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import RecetarioVozModal from '../RecetarioVozModal/RecetarioVozModal';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import {
  getCatalogoCategoria, PRESENTACIONES, UNIDADES_MEDIDA, UNIDADES_TIEMPO, VIAS_ADMINISTRACION,
} from '@/hooks/HistoriaClinica/mockCatalogoOrdenes';
import {
  LuCircleCheck, LuInfo, LuMic, LuPlus, LuSearch, LuX,
} from 'react-icons/lu';

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
// Observaciones.
//
// El buscador (encargo explícito, ver captura de referencia) abre un listado
// completo del catálogo mock de la categoría activa apenas se enfoca —no
// hace falta escribir para verlo— que se va filtrando a medida que se
// escribe; mientras ese listado está abierto reemplaza al resto del
// formulario (Dosis...Observaciones quedan ocultos, ver `!dropdownOpen` más
// abajo), igual que en la referencia. Elegir un resultado lo deja como un
// banner de 2 estados según `servicioContratado` del catálogo (verde
// "Servicio contratado" / ámbar "Servicio no contratado", mismos tokens que
// Badge/OrdenPreview) y cierra el listado, dejando ver el resto del
// formulario de nuevo — precargado con dosis/unidad/presentación/vía si la
// categoría es de formulario completo.
//
// `prefill` (Recetario por voz, ver RecetarioVozModal.jsx): receta dictada
// ya interpretada — solo siembra el estado inicial (NuevaOrdenForm cambia el
// `key` para remontar este panel con ella). "Usar receta" en el modal no
// toca este estado directo: sube vía `onRecetaVoz`, porque la receta es de
// Medicamentos y el panel puede estar abierto en otra categoría.
export default function ItemFormPanel({
  categoria, onAgregar, prefill = null, onRecetaVoz,
}) {
  const esCompleto = categoria.formulario === 'completo';
  const catalogo = useMemo(() => getCatalogoCategoria(categoria.clave), [categoria.clave]);

  const [busqueda, setBusqueda] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(prefill?.item ?? null);
  const [dosis, setDosis] = useState(prefill?.dosis ?? '');
  const [unidad, setUnidad] = useState(prefill?.unidad ?? '');
  const [presentacion, setPresentacion] = useState(prefill?.presentacion ?? '');
  const [via, setVia] = useState(prefill?.via ?? '');
  const [frecuenciaValor, setFrecuenciaValor] = useState(prefill?.frecuenciaValor ?? '');
  const [frecuenciaUnidad, setFrecuenciaUnidad] = useState(prefill?.frecuenciaUnidad ?? '');
  const [duracionValor, setDuracionValor] = useState(prefill?.duracionValor ?? '');
  const [duracionUnidad, setDuracionUnidad] = useState(prefill?.duracionUnidad ?? '');
  const [cantidad, setCantidad] = useState(esCompleto ? '' : '1');
  const [prioritario, setPrioritario] = useState(false);
  const [unicaDosis, setUnicaDosis] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [errors, setErrors] = useState({});
  const [recetarioVozOpen, setRecetarioVozOpen] = useState(false);
  // Estable para que el efecto de Escape de RecetarioVozModal no se
  // re-suscriba en cada render de este formulario.
  const closeRecetarioVoz = useCallback(() => setRecetarioVozOpen(false), []);

  const searchWrapRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setDropdownOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const filtradas = busqueda.trim()
    ? catalogo.filter((i) => i.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    : catalogo;

  function handleSeleccionar(item) {
    setItemSeleccionado(item);
    setBusqueda('');
    setDropdownOpen(false);
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
    setDropdownOpen(false);
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
      servicioContratado: itemSeleccionado?.servicioContratado ?? true,
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
      <div className="ifp-header">
        <span className={`ifp-header-icon ${categoria.tono}`}>
          <categoria.icon className="icon" aria-hidden="true" />
        </span>
        <div className="ifp-header-text">
          <span className="ifp-header-eyebrow">Agregando a</span>
          <h3 className="ifp-header-title">{categoria.titulo}</h3>
        </div>
      </div>

      <div className="ifp-search-wrap" ref={searchWrapRef}>
        <div className={`ifp-search${errors.nombre ? ' error' : ''}`}>
          <LuSearch className="icon" aria-hidden="true" />
          <input
            type="text"
            placeholder={`Buscar en ${categoria.titulo.toLowerCase()}`}
            value={itemSeleccionado ? '' : busqueda}
            disabled={!!itemSeleccionado}
            aria-label={`Buscar en ${categoria.titulo}`}
            onFocus={() => setDropdownOpen(true)}
            onChange={(e) => { setBusqueda(e.target.value); setDropdownOpen(true); clearError('nombre'); }}
          />
        </div>

        {dropdownOpen && !itemSeleccionado && (
          <div className="ifp-results">
            <ul className="ifp-results-list">
              {filtradas.length === 0 ? (
                <li className="ifp-results-empty">Sin resultados{busqueda.trim() ? ` para "${busqueda.trim()}"` : ''}.</li>
              ) : filtradas.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => handleSeleccionar(item)}>
                    <span className="ifp-result-nombre">{item.nombre}</span>
                    <span className="ifp-result-codigo">{item.codigo}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="ifp-results-footer">{filtradas.length} de {catalogo.length} servicios</div>
          </div>
        )}
      </div>

      {itemSeleccionado && (
        <div className={`ifp-chip${itemSeleccionado.servicioContratado ? ' contratado' : ' no-contratado'}`}>
          <div className="ifp-chip-info">
            <span className="ifp-chip-nombre">{itemSeleccionado.nombre}</span>
            <span className="ifp-chip-estado">
              {itemSeleccionado.servicioContratado
                ? <LuCircleCheck className="icon" aria-hidden="true" />
                : <LuInfo className="icon" aria-hidden="true" />}
              {itemSeleccionado.servicioContratado ? 'Servicio contratado' : 'Servicio no contratado'}
            </span>
          </div>
          <button type="button" onClick={() => setItemSeleccionado(null)} aria-label="Quitar selección">
            <LuX className="icon" aria-hidden="true" />
          </button>
        </div>
      )}

      {!dropdownOpen && (
        <>
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
        </>
      )}

      <div className="ifp-actions">
        <Button variant="primary" icon={LuPlus} className="ifp-agregar-btn" onClick={handleAgregar}>
          Agregar a la orden
        </Button>
        <Button
          variant="outline"
          icon={LuMic}
          className="ifp-voz-btn"
          aria-label="Recetario por voz"
          title="Recetario por voz"
          onClick={() => setRecetarioVozOpen(true)}
        />
      </div>

      {recetarioVozOpen && (
        <RecetarioVozModal
          onClose={closeRecetarioVoz}
          onUsarReceta={(receta) => { setRecetarioVozOpen(false); onRecetaVoz(receta); }}
        />
      )}
    </div>
  );
}
