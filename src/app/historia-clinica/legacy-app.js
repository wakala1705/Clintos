// Ported from the original static-HTML mockup's inline <script> (Cronograma de
// Administración / Clintos eMAR). Same conventions as ../asignacion-citas/legacy-app.js:
// this module owns its own state via closures and re-renders by writing
// innerHTML / toggling classList on containers that the React shell (page.jsx)
// renders once and never touches again. The original mockup's script wired
// every behavior with document.querySelectorAll(...).addEventListener(...)
// rather than inline onclick="" attributes, so almost nothing here needs to be
// attached to `window` — only the sidebar/theme helpers, which page.jsx calls
// via onClick={() => window.fn()} the same way asignacion-citas/legacy-app.js does.
export function initHistoriaClinica() {

  /* ================= MODO OSCURO / SIDEBAR (idéntico a asignacion-citas/legacy-app.js) ================= */
  function applyTheme(dark){
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.getElementById('theme-switch').checked = dark;
  }

  function toggleTheme(){
    applyTheme(document.getElementById('theme-switch').checked);
  }

  function toggleThemeFromIcon(){
    const chk = document.getElementById('theme-switch');
    applyTheme(!chk.checked);
  }

  function toggleSidebar(){
    document.getElementById('sidebar').classList.toggle('collapsed');
  }

  function toggleNavGroup(headEl){
    const sidebar = document.getElementById('sidebar');
    if(sidebar.classList.contains('collapsed')){
      sidebar.classList.remove('collapsed');
    }
    const group = headEl.parentElement;
    group.classList.toggle('open');
  }

  /* ================================================================
     A partir de aquí: contenido íntegro del <script> original del mockup
     (cronograma de administración), sin más cambios que nombrar los 3
     listeners anónimos de document/window (resize + 2x keydown) y guardar
     el setInterval de la línea "ahora" en una variable, para poder
     desmontarlos limpiamente en el cleanup() de abajo.
  ================================================================= */

  const ALL_HOURS = Array.from({length:24}, (_,i)=> i);
  let hourMode = 'all'; // 'all' = 24 columnas 1x1 | 'even' = solo horas pares (bloques de 2h)
  function getDisplayHours(){
    return hourMode === 'even' ? ALL_HOURS.filter(h => h % 2 === 0) : ALL_HOURS.slice();
  }
  function hourLabel(h){ return h.toString().padStart(2,'0') + ':00'; }

  const ICONS = {
    check: '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    clock: '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    warning: '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    minus: '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>'
  };

  // markers: {hour: [type]}  type in administered/upcoming/incident/scheduled/suspended
  const RONDA_FECHA = '02 May 2026';
  const MEDS = [
    {
      name:'ENOXAPARINA SODICA 40 MG SOLUCION INYECTABLE',
      dose:'40 mg', freq:'c/12h', via:'SC', estado:'activo',
      lote:'ENX-2291', vencimiento:'11/2026', profesional:'Enf. Laura Gómez',
      markers:{8:'administered', 20:'scheduled'}
    },
    {
      name:'OMEPRAZOL SODICO 40 MG SOLUCION INYECTABLE',
      dose:'40 mg', freq:'c/12h', via:'IV', estado:'activo',
      lote:'OMZ-0457', vencimiento:'03/2027', profesional:'Enf. Laura Gómez',
      markers:{10:'incident', 22:'scheduled'}
    },
    {
      name:'METAMIZOL 2.5 G / 5 ML SOLUCION INYECTABLE - NOVALGINA',
      dose:'1 g', freq:'c/8h', via:'IV', estado:'activo',
      lote:'MTZ-1188', vencimiento:'08/2026', profesional:'Enf. Carlos Ruiz',
      markers:{6:'administered', 12:'upcoming', 18:'scheduled'}
    },
    {
      name:'CEFTRIAXONA SODICA 1 G SOLUCION INYECTABLE',
      dose:'1 g', freq:'c/12h', via:'IV', estado:'activo',
      lote:'CFX-3305', vencimiento:'01/2027', profesional:'Enf. Laura Gómez',
      markers:{8:'administered', 20:'scheduled'}
    },
    {
      name:'DEXAMETASONA 4 MG SOLUCION INYECTABLE',
      dose:'8 mg', freq:'c/8h', via:'IV', estado:'suspendido',
      lote:'DXM-0876', vencimiento:'05/2026', profesional:'Enf. Laura Gómez',
      markers:{6:'administered', 14:'suspended', 22:'suspended'}
    },
    {
      name:'ONDANSETRON 8MG / 4ML SOLUCION INYECTABLE',
      dose:'8 mg', freq:'c/12h', via:'IV', estado:'activo',
      lote:'OND-2210', vencimiento:'09/2026', profesional:'Enf. Laura Gómez',
      markers:{8:'administered', 20:'scheduled'}
    },
    {
      name:'ACETAMINOFEN 500 MG TABLETA',
      dose:'500 mg', freq:'c/6h', via:'VO', estado:'finalizado',
      lote:'ACT-5541', vencimiento:'12/2026', profesional:'Enf. Laura Gómez',
      markers:{0:'administered', 6:'administered', 12:'administered', 18:'administered'}
    },
    {
      name:'VANCOMICINA 1 G SOLUCION INYECTABLE',
      dose:'1 g', freq:'c/12h', via:'IV', estado:'activo',
      lote:'VCM-4402', vencimiento:'02/2027', profesional:'Enf. Carlos Ruiz',
      markers:{2:'administered', 14:'upcoming'}
    },
    {
      name:'INSULINA CRISTALINA 100 UI/ML SOLUCION INYECTABLE',
      dose:'según esquema', freq:'c/8h', via:'SC', estado:'activo',
      lote:'INS-7790', vencimiento:'06/2026', profesional:'Enf. Laura Gómez',
      markers:{6:'administered', 14:'administered', 22:'scheduled'}
    },
    {
      name:'FUROSEMIDA 20 MG SOLUCION INYECTABLE',
      dose:'20 mg', freq:'c/24h', via:'IV', estado:'activo',
      lote:'FRS-1123', vencimiento:'04/2027', profesional:'Enf. Laura Gómez',
      markers:{8:'administered'}
    },
    {
      name:'HIDROCORTISONA 100 MG SOLUCION INYECTABLE',
      dose:'100 mg', freq:'c/6h', via:'IV', estado:'suspendido',
      lote:'HDC-6654', vencimiento:'07/2026', profesional:'Enf. Carlos Ruiz',
      markers:{0:'administered', 6:'suspended', 12:'suspended', 18:'suspended'}
    },
    {
      name:'TRAMADOL 50 MG SOLUCION INYECTABLE - PRN',
      dose:'50 mg', freq:'PRN c/8h', via:'IV', estado:'activo',
      lote:'TRM-9081', vencimiento:'10/2026', profesional:'Enf. Laura Gómez',
      markers:{14:'upcoming', 22:'scheduled'}
    },
    {
      name:'COMPLEJO B MULTIVITAMINICO TABLETA',
      dose:'1 tableta', freq:'c/24h', via:'VO', estado:'finalizado',
      lote:'CBM-3317', vencimiento:'01/2027', profesional:'Enf. Laura Gómez',
      markers:{8:'administered'}
    }
  ];

  const ESTADO_LABEL = {activo:'Activo', suspendido:'Suspendido', finalizado:'Finalizado', devuelto:'Devuelto a farmacia'};
  const STATUS_META = {
    administered:{label:'Administrado', cls:'st-administered'},
    upcoming:{label:'Próximo', cls:'st-upcoming'},
    incident:{label:'Incidencia', cls:'st-incident'},
    scheduled:{label:'Programado', cls:'st-scheduled'},
    suspended:{label:'Suspendido', cls:'st-suspended'}
  };

  const CHECK_COL_WIDTH = 44, MED_COL_WIDTH = 300;
  let currentHourColWidth = 52; // se recalcula en cada buildHeader() según el espacio disponible

  function computeHourColWidth(){
    const wrap = document.getElementById('timeline-wrap');
    const hours = getDisplayHours();
    const available = wrap.clientWidth - CHECK_COL_WIDTH - MED_COL_WIDTH;
    const natural = 52; // ancho mínimo cómodo por columna
    const stretched = Math.floor(available / hours.length);
    return Math.max(natural, stretched);
  }

  function buildHeader(){
    const row = document.getElementById('hour-header-row');
    row.querySelectorAll('th.hour-head').forEach(th => th.remove());
    currentHourColWidth = computeHourColWidth();
    const hours = getDisplayHours();
    hours.forEach(h=>{
      const th = document.createElement('th');
      th.className='hour-head';
      th.style.width = currentHourColWidth + 'px';
      th.textContent = hourLabel(h);
      row.appendChild(th);
    });
    // Fijar el ancho total de la tabla en píxeles explícitos: más robusto entre
    // navegadores que depender de que 'width:max-content' se recalcule solo con
    // table-layout:fixed tras mutar anchos por JS.
    const totalWidth = CHECK_COL_WIDTH + MED_COL_WIDTH + hours.length * currentHourColWidth;
    document.querySelector('.timeline-table').style.width = totalWidth + 'px';
  }

  function markerNode(type, med, hourIndex){
    const wrap = document.createElement('button');
    wrap.type = 'button';
    wrap.className = 'dose-marker ' + type;
    if(type==='administered') wrap.innerHTML = ICONS.check;
    else if(type==='upcoming') wrap.innerHTML = ICONS.clock;
    else if(type==='incident') wrap.innerHTML = ICONS.warning;
    else if(type==='suspended') wrap.innerHTML = ICONS.minus;
    const time = hourLabel(hourIndex);
    const statusLabel = (STATUS_META[type] || {}).label || type;
    const reg = (med.registrations && med.registrations[hourIndex]) || null;

    wrap._med = med;
    wrap._hour = hourIndex;
    wrap.dataset.time = time;
    wrap.dataset.status = type;
    wrap.dataset.fecha = RONDA_FECHA;
    wrap.dataset.markerId = `${med.lote}-${hourIndex}-${type}`;
    if(reg){
      wrap.dataset.profesional = reg.profesional;
      wrap.dataset.horaReal = reg.horaReal;
      wrap.dataset.dosisReal = reg.dosisReal;
      wrap.dataset.viaReal = reg.viaReal;
      wrap.dataset.lote = reg.lote;
      wrap.dataset.vencimiento = reg.vencimiento;
      if(reg.observaciones) wrap.dataset.observaciones = reg.observaciones;
    } else if(type === 'administered'){
      // Dato semilla (administrado antes de existir este flujo de registro): usamos el
      // lote fijo del medicamento como aproximación histórica, ya que sí se aplicó.
      wrap.dataset.profesional = med.profesional;
      wrap.dataset.lote = med.lote;
      wrap.dataset.vencimiento = med.vencimiento;
    } else {
      // Dosis pendiente: el lote real aún no se conoce — se elige recién al
      // momento de registrar la administración, según el stock disponible.
      wrap.dataset.profesional = '—';
    }
    wrap.setAttribute('aria-label', `Dosis ${time}, ${statusLabel} — ${med.name}`);
    wrap.setAttribute('aria-haspopup', 'true');
    return wrap;
  }

  const ROWS = []; // {tr, med} — usado por applyFilters() y selección
  const selectedMeds = new Set(); // medicamentos actualmente seleccionados
  let tbodyEl = null;

  function buildMedRow(med){
    const tr = document.createElement('tr');
    tr.className = 'med-row row-' + med.estado;
    if(selectedMeds.has(med)) tr.classList.add('selected');

    const checkTd = document.createElement('td');
    checkTd.className = 'check-col-cell';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'row-check';
    checkbox.checked = selectedMeds.has(med);
    checkbox.setAttribute('aria-label', `Seleccionar ${med.name}`);
    checkbox.addEventListener('change', ()=> toggleRowSelection(med, tr, checkbox.checked));
    checkTd.appendChild(checkbox);
    tr.appendChild(checkTd);

    const medTd = document.createElement('th');
    medTd.scope = 'row';
    medTd.className = 'med-cell med-col-cell';
    medTd.innerHTML = `
      <button class="med-menu-btn" title="Más opciones" aria-label="Más opciones para ${med.name}">
        <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
      <div class="med-name">${med.name}<span class="med-status-badge ${med.estado}">${ESTADO_LABEL[med.estado]}</span></div>
      <div class="med-sub"><span>${med.dose}</span><span class="dot-sep"></span><span>${med.freq}</span><span class="dot-sep"></span><span>${med.via}</span></div>
    `;
    tr.appendChild(medTd);

    getDisplayHours().forEach(h=>{
      const td = document.createElement('td');
      td.className = 'hour-cell';
      td.style.width = currentHourColWidth + 'px';
      const markerType = med.markers[h];
      if(markerType){
        td.appendChild(markerNode(markerType, med, h));
      } else {
        const dot = document.createElement('span');
        dot.className='grid-dot';
        dot.setAttribute('aria-hidden', 'true');
        td.appendChild(dot);
      }
      tr.appendChild(td);
    });

    return tr;
  }

  function renderMedRows(){
    tbodyEl.querySelectorAll('tr.med-row').forEach(tr=>tr.remove());
    ROWS.length = 0;
    const emptyRow = document.getElementById('empty-state-row');
    MEDS.forEach(med=>{
      const tr = buildMedRow(med);
      tbodyEl.insertBefore(tr, emptyRow);
      ROWS.push({tr, med});
    });
    attachDoseMarkerEvents();
  }

  function buildBody(){
    tbodyEl = document.getElementById('timeline-body');

    // Fila de estado vacío (sin resultados tras filtrar) — se crea una sola vez
    const emptyTr = document.createElement('tr');
    emptyTr.id = 'empty-state-row';
    emptyTr.className = 'row-empty';
    emptyTr.style.display = 'none';
    const emptyTd = document.createElement('td');
    emptyTd.colSpan = getDisplayHours().length + 2;
    emptyTd.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:40px 16px;color:var(--ink-500);">
        <svg class="icon" style="width:26px;height:26px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
        <div style="font-size:13px;">No se encontraron medicamentos con los filtros aplicados</div>
      </div>`;
    emptyTr.appendChild(emptyTd);
    tbodyEl.appendChild(emptyTr);

    renderMedRows();
  }

  const TURNO_RANGES = { manana:[6,11], tarde:[12,17], noche:[18,23] };

  function applyFilters(){
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    const estadoBtn = document.querySelector('#estado-chip-group .chip-filter.active');
    const estadoFilter = estadoBtn ? estadoBtn.dataset.estado : '';
    const turnoFilters = Array.from(document.querySelectorAll('#turno-chip-group .chip-filter.active')).map(b=>b.dataset.turno);
    const viaFilters = Array.from(document.querySelectorAll('#via-chip-group .chip-filter.active')).map(b=>b.dataset.via);

    let visibleCount = 0;

    ROWS.forEach(({tr, med})=>{
      let visible = true;

      if(estadoFilter && med.estado !== estadoFilter) visible = false;

      if(visible && viaFilters.length && !viaFilters.includes(med.via)) visible = false;

      if(visible && turnoFilters.length){
        const hours = Object.keys(med.markers).map(Number);
        const inTurno = hours.some(h => turnoFilters.some(t => h >= TURNO_RANGES[t][0] && h <= TURNO_RANGES[t][1]));
        if(!inTurno) visible = false;
      }

      if(visible && searchTerm && !med.name.toLowerCase().includes(searchTerm)) visible = false;

      tr.style.display = visible ? '' : 'none';
      if(visible) visibleCount++;
    });

    document.getElementById('empty-state-row').style.display = visibleCount === 0 ? 'table-row' : 'none';

    const ftSub = document.getElementById('ft-sub');
    const total = MEDS.length;
    const hasActiveFilters = !!estadoFilter || turnoFilters.length>0 || viaFilters.length>0 || !!searchTerm;
    ftSub.textContent = hasActiveFilters
      ? `${visibleCount} de ${total} medicamentos · ronda del ${RONDA_FECHA}`
      : `${total} medicamentos · ronda del ${RONDA_FECHA}`;

    requestAnimationFrame(updateNowLine);
    updateSelectAllCheckboxState();
  }

  // ---------- Selección de filas y acciones masivas ----------
  function toggleRowSelection(med, tr, checked){
    if(checked){
      selectedMeds.add(med);
      tr.classList.add('selected');
    } else {
      selectedMeds.delete(med);
      tr.classList.remove('selected');
    }
    updateSelectionUI();
    updateSelectAllCheckboxState();
  }

  function clearSelection(){
    selectedMeds.clear();
    document.querySelectorAll('.row-check:checked').forEach(cb=>{ cb.checked = false; });
    document.querySelectorAll('tr.med-row.selected').forEach(tr=> tr.classList.remove('selected'));
    updateSelectionUI();
    updateSelectAllCheckboxState();
  }

  function visibleRows(){
    return ROWS.filter(r => r.tr.style.display !== 'none');
  }

  function updateSelectAllCheckboxState(){
    const master = document.getElementById('select-all-check');
    const rows = visibleRows();
    const selectedVisible = rows.filter(r => selectedMeds.has(r.med));
    if(rows.length === 0 || selectedVisible.length === 0){
      master.checked = false; master.indeterminate = false;
    } else if(selectedVisible.length === rows.length){
      master.checked = true; master.indeterminate = false;
    } else {
      master.checked = false; master.indeterminate = true;
    }
  }

  function updateSelectionUI(){
    const count = selectedMeds.size;
    const toolbar = document.getElementById('selection-toolbar');
    document.getElementById('sel-count').textContent = count;
    const actionsWrap = document.getElementById('sel-actions');
    const hint = document.getElementById('sel-hint');
    actionsWrap.innerHTML = '';
    hint.textContent = '';

    if(count === 0){
      toolbar.classList.remove('open');
      return;
    }
    toolbar.classList.add('open');

    const estados = new Set(Array.from(selectedMeds).map(m=>m.estado));
    if(estados.size === 1 && estados.has('suspendido')){
      actionsWrap.innerHTML = `
        <button class="btn btn-primary" id="bulk-devolver-btn" type="button">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
          Devolver a farmacia
        </button>`;
      document.getElementById('bulk-devolver-btn').addEventListener('click', bulkDevolverFarmacia);
    } else if(estados.size === 1 && estados.has('activo')){
      actionsWrap.innerHTML = `
        <button class="btn btn-warning-outline" id="bulk-suspender-btn" type="button">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="9" y2="15"/><line x1="14" x2="14" y1="9" y2="15"/></svg>
          Suspender medicamentos
        </button>`;
      document.getElementById('bulk-suspender-btn').addEventListener('click', bulkSuspender);
    } else {
      hint.textContent = 'Selecciona medicamentos con el mismo estado para aplicar una acción masiva';
    }
  }

  function bulkDevolverFarmacia(){
    const meds = Array.from(selectedMeds);
    const ok = confirm(`¿Confirmas la devolución a farmacia de ${meds.length} medicamento(s)?\n\n${meds.map(m=>'• '+m.name).join('\n')}`);
    if(!ok) return;
    meds.forEach(med=>{ med.estado = 'devuelto'; });
    clearSelection();
    renderMedRows();
    applyFilters();
    showToast(`Devolución a farmacia generada para ${meds.length} medicamento(s)`);
  }

  function bulkSuspender(){
    const meds = Array.from(selectedMeds);
    const ok = confirm(`¿Confirmas suspender ${meds.length} medicamento(s)?\n\n${meds.map(m=>'• '+m.name).join('\n')}`);
    if(!ok) return;
    meds.forEach(med=>{ med.estado = 'suspendido'; });
    clearSelection();
    renderMedRows();
    applyFilters();
    showToast(`${meds.length} medicamento(s) suspendido(s) correctamente`);
  }

  let toastTimer = null;
  function showToast(message){
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toast.classList.remove('show'), 3500);
  }

  function computeNowLineLeft(){
    const hours = getDisplayHours(); // ascendente: [0..23] o [0,2,4...22]
    const now = new Date();
    const h = now.getHours();
    const min = now.getMinutes();

    let bucketIdx = hours.length - 1;
    let bucketStart = hours[hours.length - 1];
    let bucketSize = 24 - bucketStart;
    for(let i = 0; i < hours.length; i++){
      const nextStart = (i === hours.length - 1) ? 24 : hours[i+1];
      if(h >= hours[i] && h < nextStart){
        bucketIdx = i;
        bucketStart = hours[i];
        bucketSize = nextStart - hours[i];
        break;
      }
    }
    const fraction = ((h - bucketStart) * 60 + min) / (bucketSize * 60);
    return CHECK_COL_WIDTH + MED_COL_WIDTH + bucketIdx * currentHourColWidth + fraction * currentHourColWidth;
  }

  function buildNowLine(){
    const wrap = document.getElementById('timeline-wrap');
    const line = document.createElement('div');
    line.className = 'now-line';
    line.id = 'now-line';
    line.setAttribute('aria-hidden', 'true');
    wrap.appendChild(line);
    updateNowLine();
    scrollToNow();
  }

  function updateNowLine(){
    const line = document.getElementById('now-line');
    if(!line) return;
    line.style.left = computeNowLineLeft() + 'px';
    const table = document.querySelector('.timeline-table');
    line.style.height = (table ? table.scrollHeight : 0) + 'px';
    line.style.display = 'block';
  }

  function scrollToNow(){
    const wrap = document.getElementById('timeline-wrap');
    const line = document.getElementById('now-line');
    if(!wrap || !line) return;
    const left = parseFloat(line.style.left) || 0;
    wrap.scrollLeft = Math.max(0, left - wrap.clientWidth / 2);
  }

  buildHeader();
  buildBody();
  requestAnimationFrame(buildNowLine);
  const nowLineInterval = setInterval(updateNowLine, 30000); // recalcula cada 30s para que la línea avance en vivo

  let resizeTimer = null;
  function handleResize(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=>{
      buildHeader();   // recalcula el ancho de las columnas de hora para llenar el nuevo espacio
      renderMedRows(); // aplica el mismo ancho a las celdas del cuerpo (deben coincidir con el header)
      applyFilters();  // conserva los filtros activos tras reconstruir las filas
      updateNowLine();
    }, 120);
  }
  window.addEventListener('resize', handleResize);

  // Interactividad de filtros
  document.querySelectorAll('.chip-group:not(#turno-chip-group):not(#via-chip-group)').forEach(group=>{
    group.querySelectorAll('.chip-filter').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        group.querySelectorAll('.chip-filter').forEach(b=>{
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        if(group.id === 'estado-chip-group') applyFilters();
      });
    });
  });
  // ---------- Densidad de filas (compactar / expandir) ----------
  const DENSITY_LEVELS = ['compact', 'normal', 'expanded'];
  let densityIdx = 1; // normal por defecto

  function applyDensity(){
    const table = document.querySelector('.timeline-table');
    table.classList.remove('density-compact', 'density-expanded');
    const level = DENSITY_LEVELS[densityIdx];
    if(level === 'compact') table.classList.add('density-compact');
    if(level === 'expanded') table.classList.add('density-expanded');
    document.getElementById('view-compact-btn').disabled = densityIdx === 0;
    document.getElementById('view-expand-btn').disabled = densityIdx === DENSITY_LEVELS.length - 1;
    requestAnimationFrame(updateNowLine);
  }
  document.getElementById('view-compact-btn').addEventListener('click', ()=>{
    if(densityIdx > 0){ densityIdx--; applyDensity(); }
  });
  document.getElementById('view-expand-btn').addEventListener('click', ()=>{
    if(densityIdx < DENSITY_LEVELS.length - 1){ densityIdx++; applyDensity(); }
  });
  applyDensity();

  // ---------- Modo de horas (todas / solo pares) ----------
  function rebuildTimeline(){
    buildHeader();
    renderMedRows();
    const emptyTd = document.querySelector('#empty-state-row td');
    if(emptyTd) emptyTd.colSpan = getDisplayHours().length + 2;
    applyFilters();
    requestAnimationFrame(()=>{ updateNowLine(); scrollToNow(); });
  }
  document.getElementById('view-columns-btn').addEventListener('click', ()=>{
    if(hourMode === 'all') return;
    hourMode = 'all';
    document.getElementById('view-columns-btn').classList.add('active');
    document.getElementById('view-columns-btn').setAttribute('aria-pressed', 'true');
    document.getElementById('view-split-btn').classList.remove('active');
    document.getElementById('view-split-btn').setAttribute('aria-pressed', 'false');
    rebuildTimeline();
  });
  document.getElementById('view-split-btn').addEventListener('click', ()=>{
    if(hourMode === 'even') return;
    hourMode = 'even';
    document.getElementById('view-split-btn').classList.add('active');
    document.getElementById('view-split-btn').setAttribute('aria-pressed', 'true');
    document.getElementById('view-columns-btn').classList.remove('active');
    document.getElementById('view-columns-btn').setAttribute('aria-pressed', 'false');
    rebuildTimeline();
  });

  // ---------- Patrón ARIA de tabs: click + navegación con teclado ----------
  const cardTabs = Array.from(document.querySelectorAll('.card-tab'));
  function selectCardTab(tab, focusIt){
    cardTabs.forEach(t=>{
      const isSelected = t === tab;
      t.classList.toggle('active', isSelected);
      t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      t.tabIndex = isSelected ? 0 : -1;
    });
    if(focusIt) tab.focus();
    const targetId = tab.getAttribute('aria-controls');
    document.querySelectorAll('.tab-panel').forEach(panel=>{
      panel.classList.toggle('active', panel.id === targetId);
    });
  }
  cardTabs.forEach((tab, idx)=>{
    tab.addEventListener('click', ()=> selectCardTab(tab, false));
    tab.addEventListener('keydown', (e)=>{
      let targetIdx = null;
      if(e.key === 'ArrowRight') targetIdx = (idx + 1) % cardTabs.length;
      else if(e.key === 'ArrowLeft') targetIdx = (idx - 1 + cardTabs.length) % cardTabs.length;
      else if(e.key === 'Home') targetIdx = 0;
      else if(e.key === 'End') targetIdx = cardTabs.length - 1;
      if(targetIdx !== null){
        e.preventDefault();
        selectCardTab(cardTabs[targetIdx], true);
      }
    });
  });

  // ---------- Subnavegación de Pedidos: Solicitudes / Recepción / Devoluciones ----------
  const subnavTabs = Array.from(document.querySelectorAll('.subnav-tab'));
  function selectSubnavTab(tab, focusIt){
    subnavTabs.forEach(t=>{
      const isSelected = t === tab;
      t.classList.toggle('active', isSelected);
      t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      t.tabIndex = isSelected ? 0 : -1;
    });
    if(focusIt) tab.focus();
    const targetId = tab.getAttribute('aria-controls');
    document.querySelectorAll('.sub-panel').forEach(panel=>{
      panel.classList.toggle('active', panel.id === targetId);
    });
  }
  subnavTabs.forEach((tab, idx)=>{
    tab.addEventListener('click', ()=> selectSubnavTab(tab, false));
    tab.addEventListener('keydown', (e)=>{
      let targetIdx = null;
      if(e.key === 'ArrowRight') targetIdx = (idx + 1) % subnavTabs.length;
      else if(e.key === 'ArrowLeft') targetIdx = (idx - 1 + subnavTabs.length) % subnavTabs.length;
      else if(e.key === 'Home') targetIdx = 0;
      else if(e.key === 'End') targetIdx = subnavTabs.length - 1;
      if(targetIdx !== null){
        e.preventDefault();
        selectSubnavTab(subnavTabs[targetIdx], true);
      }
    });
  });

  // ---------- Chips de filtro en Pedidos: toggle visual dentro de su propio grupo ----------
  document.querySelectorAll('#panel-pedidos .chip-group:not(#chipgroup-recepcion-estado)').forEach(group=>{
    const chips = Array.from(group.querySelectorAll('.chip-filter'));
    chips.forEach(chip=>{
      chip.addEventListener('click', ()=>{
        chips.forEach(c=>{
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
      });
    });
  });

  // ---------- Filtro funcional por estado en Recepción (Todas / Pendiente / Recibido / Parcial) ----------
  const RECEPCION_FILTER_LABELS = { todas: 'turno actual', despachado: 'filtro: Pendiente', recibido: 'filtro: Recibido', parcial: 'filtro: Parcial' };
  function applyRecepcionFilter(filterValue){
    let visibleCount = 0;
    document.querySelectorAll('#subpanel-recepcion .recep-order[data-estado]').forEach(orderEl=>{
      const estado = orderEl.getAttribute('data-estado');
      const partial = orderEl.getAttribute('data-partial') === 'true';
      let match;
      if(filterValue === 'todas') match = true;
      else if(filterValue === 'parcial') match = partial;
      else match = (estado === filterValue);
      orderEl.classList.toggle('filtered-out', !match);
      if(match) visibleCount++;

      // Ajustar el nivel de expansión según el filtro activo, sin importar cómo haya quedado antes
      const orderBtn = orderEl.querySelector('.recep-order-header .row-expand-btn');
      const orderBody = orderEl.querySelector('.recep-order-body');
      if(orderBtn && orderBody){
        if(filterValue === 'despachado'){
          // Pendiente: la orden queda abierta (se ven los medicamentos), pero el detalle de artículo/lote
          // queda colapsado — el usuario decide qué expandir.
          orderBtn.setAttribute('aria-expanded', 'true');
          orderBody.classList.remove('collapsed');
          orderEl.querySelectorAll('.recep-med-detail').forEach(d => d.classList.add('collapsed'));
          orderEl.querySelectorAll('.recep-med .row-expand-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
        } else {
          // Recibido (y el resto de filtros): todo colapsado por defecto.
          orderBtn.setAttribute('aria-expanded', 'false');
          orderBody.classList.add('collapsed');
        }
      }
    });
    const footerCount = document.getElementById('recepcion-footer-count');
    if(footerCount) footerCount.textContent = visibleCount + ' orden' + (visibleCount === 1 ? '' : 'es') + ' · ' + (RECEPCION_FILTER_LABELS[filterValue] || 'turno actual');
  }
  document.querySelectorAll('#chipgroup-recepcion-estado .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      document.querySelectorAll('#chipgroup-recepcion-estado .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      applyRecepcionFilter(chip.getAttribute('data-filter'));
    });
  });
  // Aplicar el filtro activo por defecto (Pendiente) al cargar
  applyRecepcionFilter('despachado');

  // ---------- Filas/paneles expandibles (patrón genérico, por atributo: orden → medicamento → lote) ----------
  document.querySelectorAll('.row-expand-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const willExpand = !isExpanded;
      btn.setAttribute('aria-expanded', willExpand ? 'true' : 'false');
      const group = btn.getAttribute('data-group');

      // Mostrar/ocultar los hijos directos (siguiente nivel), sea <tr> o <div>
      document.querySelectorAll('[data-parent-group="'+group+'"]').forEach(row=>{
        row.classList.toggle('collapsed', !willExpand);
      });

      // Si este grupo tiene nietos (data-root-group apuntando aquí) en estructuras de 3 niveles,
      // al colapsar se ocultan siempre; al expandir, cada uno respeta el estado de SU propio toggle.
      document.querySelectorAll('[data-root-group="'+group+'"]').forEach(row=>{
        if(!willExpand){
          row.classList.add('collapsed');
        } else {
          const parentGroup = row.getAttribute('data-parent-group');
          const parentBtn = document.querySelector('.row-expand-btn[data-group="'+parentGroup+'"]');
          const parentExpanded = parentBtn ? parentBtn.getAttribute('aria-expanded') === 'true' : true;
          row.classList.toggle('collapsed', !parentExpanded);
        }
      });
    });
  });

  // ---------- Confirmar recepción (a nivel de orden: enfermería confirma todo lo despachado por farmacia) ----------
  const PARTIAL_FLAG_SVG = '<span class="partial-flag" title="Un ítem de esta orden se recibió incompleto"><svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>Parcial</span>';
  const CONFIRMED_TAG_SVG = '<span class="confirmed-tag"><svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Recibido</span>';

  document.querySelectorAll('.btn-confirm-receipt').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const orderTarget = btn.getAttribute('data-confirm-target');
      const isPartial = btn.getAttribute('data-partial') === 'true';

      // Contenedor de estado de la orden: el botón se reemplaza por la etiqueta "Recibido" (+ indicador Parcial si aplica)
      const statusContainer = document.getElementById(orderTarget + '-status');
      if(statusContainer) statusContainer.innerHTML = CONFIRMED_TAG_SVG + (isPartial ? PARTIAL_FLAG_SVG : '');

      // Sincronizar atributos usados por el filtro de estado
      const orderEl = document.getElementById('order-' + orderTarget);
      if(orderEl){ orderEl.setAttribute('data-estado', 'recibido'); orderEl.setAttribute('data-partial', isPartial ? 'true' : 'false'); }
    });
  });

  // ---------- Popovers: fecha personalizada, otros filtros y alergias ----------
  function closeAllPopovers(){
    document.querySelectorAll('.filter-popover.open').forEach(p=>{
      p.classList.remove('open');
      const btn = document.querySelector(`[aria-controls="${p.id}"]`);
      if(btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function setupPopover(wrapId, btnId, popId){
    const wrap = document.getElementById(wrapId);
    const btn = document.getElementById(btnId);
    const pop = document.getElementById(popId);
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const willOpen = !pop.classList.contains('open');
      closeAllPopovers();
      if(willOpen){
        pop.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    pop.addEventListener('click', (e)=> e.stopPropagation());
    return {wrap, btn, pop};
  }

  const datePop = setupPopover('date-popover-wrap','date-popover-btn','date-popover');
  const morePop = setupPopover('more-popover-wrap','more-popover-btn','more-popover');
  const allergyPop = setupPopover('allergy-popover-wrap','allergy-btn','allergy-popover');

  document.addEventListener('click', closeAllPopovers);

  // Cerrar con Escape y devolver el foco al botón que abrió el popover
  function handlePopoverEscape(e){
    if(e.key === 'Escape'){
      const openPop = document.querySelector('.filter-popover.open');
      if(openPop){
        const btn = document.querySelector(`[aria-controls="${openPop.id}"]`);
        closeAllPopovers();
        if(btn) btn.focus();
      }
    }
  }
  document.addEventListener('keydown', handlePopoverEscape);

  // Chips rápidos de fecha (Hoy / Última semana) desactivan el rango personalizado
  document.querySelectorAll('[data-quickdate]').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      datePop.btn.classList.remove('active');
      document.getElementById('date-range-label').textContent = 'Rango personalizado';
    });
  });

  document.getElementById('date-apply-btn').addEventListener('click', ()=>{
    const from = document.getElementById('date-from').value;
    const to = document.getElementById('date-to').value;
    document.querySelectorAll('[data-quickdate]').forEach(c=>{ c.classList.remove('active'); c.setAttribute('aria-pressed','false'); });
    if(from && to){
      const fmt = d => { const [y,m,day]=d.split('-'); return `${day}/${m}/${y.slice(2)}`; };
      document.getElementById('date-range-label').textContent = from===to ? fmt(from) : `${fmt(from)} – ${fmt(to)}`;
      datePop.btn.classList.add('active');
    }
    closeAllPopovers();
  });

  document.getElementById('date-clear-btn').addEventListener('click', ()=>{
    document.getElementById('date-range-label').textContent = 'Rango personalizado';
    datePop.btn.classList.remove('active');
    document.querySelectorAll('[data-quickdate]').forEach(c=>{ c.classList.remove('active'); c.setAttribute('aria-pressed','false'); });
    const hoyChip = document.querySelector('[data-quickdate="hoy"]');
    hoyChip.classList.add('active');
    hoyChip.setAttribute('aria-pressed','true');
    closeAllPopovers();
  });

  // Otros filtros: Turno + Vía, con badge de conteo
  function updateMoreBadge(){
    const activeCount = document.querySelectorAll('#turno-chip-group .chip-filter.active, #via-chip-group .chip-filter.active').length;
    const badge = document.getElementById('more-badge-count');
    if(activeCount > 0){
      badge.style.display = 'flex';
      badge.textContent = activeCount;
      morePop.btn.classList.add('active');
    } else {
      badge.style.display = 'none';
      morePop.btn.classList.remove('active');
    }
  }
  document.querySelectorAll('#turno-chip-group .chip-filter, #via-chip-group .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const isActive = chip.classList.toggle('active');
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      updateMoreBadge();
    });
  });
  document.getElementById('more-clear-btn').addEventListener('click', ()=>{
    document.querySelectorAll('#turno-chip-group .chip-filter, #via-chip-group .chip-filter').forEach(c=>{
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    updateMoreBadge();
    applyFilters();
  });
  document.getElementById('more-apply-btn').addEventListener('click', ()=>{
    closeAllPopovers();
    applyFilters();
  });

  // Búsqueda en vivo
  document.getElementById('search-input').addEventListener('input', applyFilters);

  // Selección: checkbox "seleccionar todos" (aplica solo a filas visibles) y cancelar selección
  document.getElementById('select-all-check').addEventListener('change', (e)=>{
    const checked = e.target.checked;
    visibleRows().forEach(({tr, med})=>{
      const cb = tr.querySelector('.row-check');
      cb.checked = checked;
      if(checked){ selectedMeds.add(med); tr.classList.add('selected'); }
      else { selectedMeds.delete(med); tr.classList.remove('selected'); }
    });
    updateSelectionUI();
  });
  document.getElementById('sel-cancel-btn').addEventListener('click', clearSelection);

  applyFilters(); // estado inicial de contadores

  // ---------- Popover hover sobre los marcadores de dosis ----------
  const dosePopEl = document.getElementById('dose-popover');
  let doseHideTimer = null;
  let currentPopoverMarker = null; // referencia al <button.dose-marker> activo (para abrir el modal con contexto)

  // Estados ya resueltos: no se pueden volver a registrar/reprogramar/suspender/no aplicar
  const RESOLVED_STATUSES = { administered:'Esta dosis ya fue administrada.', suspended:'Esta dosis está suspendida.' };

  function showDosePopover(marker){
    clearTimeout(doseHideTimer);
    currentPopoverMarker = marker;
    const status = marker.dataset.status;
    const meta = STATUS_META[status] || {label:'—', cls:''};
    dosePopEl.dataset.forMarker = marker.dataset.markerId;

    document.getElementById('dp-time').textContent = marker.dataset.time;
    const badge = document.getElementById('dp-status-badge');
    badge.className = 'dp-status-badge ' + meta.cls;
    document.getElementById('dp-status-label').textContent = meta.label;
    document.getElementById('dp-fecha').textContent = marker.dataset.fecha;
    document.getElementById('dp-hora-programada').textContent = marker.dataset.time;
    document.getElementById('dp-profesional').textContent = marker.dataset.profesional;

    // El lote/vencimiento solo se conocen si la dosis ya fue administrada
    // (se elige del stock disponible al momento de registrar).
    const hasLote = !!marker.dataset.lote;
    document.getElementById('dp-row-lote').style.display = hasLote ? 'flex' : 'none';
    document.getElementById('dp-row-vencimiento').style.display = hasLote ? 'flex' : 'none';
    document.getElementById('dp-lote-pending-note').style.display = (!hasLote && status !== 'suspended') ? 'block' : 'none';
    if(hasLote){
      document.getElementById('dp-lote').textContent = marker.dataset.lote;
      document.getElementById('dp-vencimiento').textContent = marker.dataset.vencimiento;
    }

    // Datos reales de la administración (solo si ya se registró con el formulario)
    const hasReg = !!marker.dataset.horaReal;
    document.getElementById('dp-row-hora-real').style.display = hasReg ? 'flex' : 'none';
    document.getElementById('dp-row-dosis-real').style.display = hasReg ? 'flex' : 'none';
    document.getElementById('dp-row-via-real').style.display = hasReg ? 'flex' : 'none';
    if(hasReg){
      document.getElementById('dp-hora-real').textContent = marker.dataset.horaReal;
      document.getElementById('dp-dosis-real').textContent = marker.dataset.dosisReal;
      document.getElementById('dp-via-real').textContent = marker.dataset.viaReal;
    }
    const obsEl = document.getElementById('dp-observaciones');
    if(marker.dataset.observaciones){
      obsEl.style.display = 'block';
      obsEl.textContent = '"' + marker.dataset.observaciones + '"';
    } else {
      obsEl.style.display = 'none';
    }

    // Sólo se pueden accionar dosis pendientes (próximo/programado/incidencia).
    // Administrado y suspendido ya están resueltos: solo se muestran los detalles.
    const isResolved = RESOLVED_STATUSES.hasOwnProperty(status);
    document.getElementById('dp-actions').style.display = isResolved ? 'none' : 'flex';
    const note = document.getElementById('dp-resolved-note');
    if(isResolved){
      note.style.display = 'flex';
      note.innerHTML = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>${RESOLVED_STATUSES[status]}`;
    } else {
      note.style.display = 'none';
    }

    // Posicionar: medir tamaño real antes de decidir arriba/abajo
    dosePopEl.style.visibility = 'hidden';
    dosePopEl.classList.add('open');
    const popRect = dosePopEl.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();

    let left = markerRect.left + markerRect.width/2 - popRect.width/2;
    left = Math.max(12, Math.min(left, window.innerWidth - popRect.width - 12));

    const spaceBelow = window.innerHeight - markerRect.bottom;
    let top;
    if(spaceBelow > popRect.height + 16){
      top = markerRect.bottom + 10;
    } else {
      top = markerRect.top - popRect.height - 10;
    }
    top = Math.max(12, top);

    dosePopEl.style.left = left + 'px';
    dosePopEl.style.top = top + 'px';
    dosePopEl.style.visibility = 'visible';
  }

  function scheduleHideDosePopover(){
    clearTimeout(doseHideTimer);
    doseHideTimer = setTimeout(()=> dosePopEl.classList.remove('open'), 180);
  }

  function hideDosePopoverNow(){
    clearTimeout(doseHideTimer);
    dosePopEl.classList.remove('open');
  }

  function attachDoseMarkerEvents(){
    document.querySelectorAll('.dose-marker').forEach(marker=>{
      marker.addEventListener('mouseenter', ()=> showDosePopover(marker));
      marker.addEventListener('mouseleave', scheduleHideDosePopover);
      marker.addEventListener('focus', ()=> showDosePopover(marker));
      marker.addEventListener('blur', scheduleHideDosePopover);
      marker.addEventListener('click', (e)=>{
        e.stopPropagation();
        if(dosePopEl.classList.contains('open') && dosePopEl.dataset.forMarker === marker.dataset.markerId){
          hideDosePopoverNow();
        } else {
          showDosePopover(marker);
        }
      });
      marker.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape'){
          hideDosePopoverNow();
          marker.focus();
        }
      });
    });
  }
  dosePopEl.addEventListener('mouseenter', ()=> clearTimeout(doseHideTimer));
  dosePopEl.addEventListener('mouseleave', scheduleHideDosePopover);
  dosePopEl.addEventListener('focusin', ()=> clearTimeout(doseHideTimer));
  dosePopEl.addEventListener('focusout', (e)=>{
    if(!dosePopEl.contains(e.relatedTarget)) scheduleHideDosePopover();
  });
  dosePopEl.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') hideDosePopoverNow();
  });

  attachDoseMarkerEvents();

  // ---------- Modal: Registrar administración ----------
  const CURRENT_USER_NAME = 'Manuel Hernández'; // usuario logueado (ver topbar)
  const adminModalOverlay = document.getElementById('admin-modal-overlay');
  let adminModalContext = null; // { med, hour }
  let adminModalOpenerMarker = null; // para devolver el foco al cerrar
  let selectedLoteOption = null; // lote elegido en la lista del modal

  // Desplaza una fecha "MM/YYYY" N meses (positivo o negativo)
  function shiftMonthYear(mmYYYY, delta){
    let [m, y] = mmYYYY.split('/').map(Number);
    m += delta;
    while(m > 12){ m -= 12; y += 1; }
    while(m < 1){ m += 12; y -= 1; }
    return String(m).padStart(2,'0') + '/' + y;
  }

  // Meses de diferencia entre una fecha "MM/YYYY" y la fecha de la ronda
  function monthsUntil(mmYYYY){
    const [m, y] = mmYYYY.split('/').map(Number);
    const [refM, refY] = [5, 2026]; // ronda del 02 May 2026
    return (y - refY) * 12 + (m - refM);
  }

  // No conocemos de antemano el lote/vencimiento de una dosis pendiente: eso depende
  // de qué unidad física tome el profesional del stock al momento de administrar.
  // Por eso se genera aquí un mock del stock disponible para elegir en el modal.
  function getLoteOptions(med){
    const [prefix, numStr] = med.lote.split('-');
    const baseNum = parseInt(numStr, 10) || 1000;
    return [
      { lote: `${prefix}-${baseNum + 64}`, vencimiento: shiftMonthYear(med.vencimiento, 7),  cantidad: 24 },
      { lote: `${prefix}-${baseNum + 41}`, vencimiento: shiftMonthYear(med.vencimiento, 5),  cantidad: 18 },
      { lote: `${prefix}-${baseNum + 9}`,  vencimiento: shiftMonthYear(med.vencimiento, 0),  cantidad: 6  },
      { lote: `${prefix}-${baseNum - 21}`, vencimiento: shiftMonthYear(med.vencimiento, -3), cantidad: 2  },
      { lote: `${prefix}-${baseNum - 55}`, vencimiento: shiftMonthYear(med.vencimiento, -5), cantidad: 11 }
    ].filter(opt => monthsUntil(opt.vencimiento) >= 0); // nunca ofrecer un lote ya vencido
  }

  function renderLoteOptions(med){
    const tbody = document.getElementById('admin-lote-list');
    tbody.innerHTML = '';
    selectedLoteOption = null;
    const options = getLoteOptions(med);
    // ¿Existe al menos un lote "vence pronto" en el stock? (para la advertencia no bloqueante)
    const hasNearExpiryStock = options.some(o => monthsUntil(o.vencimiento) <= 2);

    options.forEach((opt, idx)=>{
      const nearExpiry = monthsUntil(opt.vencimiento) <= 2;
      opt._nearExpiry = nearExpiry;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="col-radio"><input type="radio" name="admin-lote-radio" value="${idx}" aria-label="Lote ${opt.lote}, vence ${opt.vencimiento}"></td>
        <td class="lote-code">${opt.lote}</td>
        <td class="lote-venc">${opt.vencimiento}</td>
        <td class="lote-disp">${opt.cantidad} un.</td>
        <td class="col-estado"><span class="lote-badge ${nearExpiry ? 'warn' : 'ok'}">${nearExpiry ? 'Vence pronto' : 'Vigente'}</span></td>
      `;
      const radio = tr.querySelector('input');
      function selectRow(){
        radio.checked = true;
        tbody.querySelectorAll('tr').forEach(r=>r.classList.remove('selected'));
        tr.classList.add('selected');
        selectedLoteOption = opt;
        updateLoteWarning(hasNearExpiryStock);
        updateAdminConfirmState();
      }
      radio.addEventListener('change', selectRow);
      tr.addEventListener('click', (e)=>{ if(e.target !== radio) selectRow(); });
      tbody.appendChild(tr);
    });
  }

  // Advertencia NO bloqueante: si el usuario elige un lote vigente existiendo otros
  // más próximos a vencer, se sugiere (por rotación FEFO) sin impedir continuar.
  function updateLoteWarning(hasNearExpiryStock){
    const warn = document.getElementById('admin-lote-warning');
    const show = selectedLoteOption && !selectedLoteOption._nearExpiry && hasNearExpiryStock;
    if(show){
      document.getElementById('admin-lote-warning-text').textContent =
        'Hay otros lotes más próximos a vencer en el stock. Por rotación (primero en vencer, primero en salir) se recomienda usarlos antes, aunque puedes continuar con el seleccionado.';
      warn.style.display = 'flex';
    } else {
      warn.style.display = 'none';
    }
  }

  function updateAdminConfirmState(){
    const checked = document.getElementById('admin-5-correctos').checked;
    document.getElementById('admin-confirm-btn').disabled = !(checked && selectedLoteOption);
  }

  // ---------- Reloj en vivo de hora de registro (mientras el modal está abierto) ----------
  let adminClockTimer = null;
  function updateAdminClock(){
    document.getElementById('admin-hora-registro').textContent = new Date().toTimeString().slice(0,5);
  }
  function startAdminClock(){
    updateAdminClock();
    clearInterval(adminClockTimer);
    adminClockTimer = setInterval(updateAdminClock, 1000);
  }
  function stopAdminClock(){
    clearInterval(adminClockTimer);
    adminClockTimer = null;
  }

  function openAdminModal(){
    if(!currentPopoverMarker) return;
    const marker = currentPopoverMarker;
    const med = marker._med;
    const hour = marker._hour;
    if(!med && med !== 0) return;

    adminModalContext = { med, hour };
    adminModalOpenerMarker = marker;
    hideDosePopoverNow();

    document.getElementById('admin-med-nombre').textContent = med.name;
    document.getElementById('admin-dosis-prescrita').textContent = med.dose;
    document.getElementById('admin-via').textContent = med.via;
    document.getElementById('admin-frecuencia').textContent = med.freq;
    document.getElementById('admin-hora-programada').textContent = hourLabel(hour);

    renderLoteOptions(med);
    document.getElementById('admin-observaciones').value = '';
    document.getElementById('admin-5-correctos').checked = false;
    document.getElementById('admin-lote-warning').style.display = 'none';
    updateAdminConfirmState(); // con selectedLoteOption=null y checkbox=false => queda deshabilitado

    adminModalOverlay.classList.add('open');
    startAdminClock();
  }

  function closeAdminModal(){
    adminModalOverlay.classList.remove('open');
    adminModalContext = null;
    selectedLoteOption = null;
    stopAdminClock();
    if(adminModalOpenerMarker){ adminModalOpenerMarker.focus(); adminModalOpenerMarker = null; }
  }

  document.getElementById('dp-action-registrar').addEventListener('click', openAdminModal);
  document.getElementById('admin-modal-close').addEventListener('click', closeAdminModal);
  document.getElementById('admin-cancel-btn').addEventListener('click', closeAdminModal);
  adminModalOverlay.addEventListener('click', (e)=>{
    if(e.target === adminModalOverlay) closeAdminModal();
  });
  function handleModalEscape(e){
    if(e.key === 'Escape' && adminModalOverlay.classList.contains('open')) closeAdminModal();
  }
  document.addEventListener('keydown', handleModalEscape);

  document.getElementById('admin-5-correctos').addEventListener('change', updateAdminConfirmState);

  document.getElementById('admin-confirm-btn').addEventListener('click', ()=>{
    if(!adminModalContext || !selectedLoteOption) return;
    const { med, hour } = adminModalContext;

    const horaReal = document.getElementById('admin-hora-registro').textContent; // misma hora mostrada en vivo
    const observaciones = document.getElementById('admin-observaciones').value.trim();

    med.registrations = med.registrations || {};
    med.registrations[hour] = {
      horaReal, dosisReal: med.dose, viaReal: med.via,
      lote: selectedLoteOption.lote, vencimiento: selectedLoteOption.vencimiento,
      observaciones, profesional: CURRENT_USER_NAME
    };
    med.markers[hour] = 'administered';

    adminModalOverlay.classList.remove('open');
    adminModalContext = null;
    selectedLoteOption = null;
    adminModalOpenerMarker = null;
    stopAdminClock();

    renderMedRows();
    applyFilters();
    requestAnimationFrame(updateNowLine);
    showToast(`Administración registrada: ${med.name} · ${horaReal}`);
  });

  // Every function referenced by page.jsx's onClick={() => window.fn()} handlers
  // (mirroring the original mockup's inline onclick="" attributes on the shared
  // sidebar/topbar chrome) has to live on `window`. Everything else in this file
  // wires itself up directly via addEventListener, exactly like the original
  // inline <script>, so it needs no window exposure.
  const exported = {
    toggleSidebar, toggleNavGroup, toggleThemeFromIcon, toggleTheme,
  };
  Object.assign(window, exported);

  return function cleanup() {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('click', closeAllPopovers);
    document.removeEventListener('keydown', handlePopoverEscape);
    document.removeEventListener('keydown', handleModalEscape);
    clearInterval(nowLineInterval);
    clearTimeout(resizeTimer);
    clearTimeout(toastTimer);
    clearTimeout(doseHideTimer);
    clearInterval(adminClockTimer);
    for (const name of Object.keys(exported)) delete window[name];
  };
}
