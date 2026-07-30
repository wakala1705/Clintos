// Ported from the updated static-HTML mockup's inline <script> (Cronograma de
// Administración / Clintos eMAR — versión ampliada con Órdenes médicas, Pedidos
// (Solicitudes/Recepción/Devoluciones), modales de Suspender/Devolver/Programar/
// Pedido a farmacia y catálogo de insumos). Same conventions as
// ../asignacion-citas/legacy-app.js: this module owns its own state via closures
// and re-renders by writing innerHTML / toggling classList on containers that the
// React shell (page.jsx + components/*.jsx) renders once and never touches again.
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
     A partir de aquí: contenido íntegro del <script> del mockup ampliado.
  ================================================================= */

  const ALL_HOURS = Array.from({length:24}, (_,i)=> i);
  let hourMode = 'all';
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

  function getSystemTodayDate(){
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  const TODAY_DATE = getSystemTodayDate();
  let currentViewDate = TODAY_DATE;
  const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  function formatDateLabel(dateStr){
    const [y,m,d] = dateStr.split('-').map(Number);
    return String(d).padStart(2,'0') + ' ' + MESES_CORTOS[m-1] + ' ' + y;
  }
  function shiftDate(dateStr, deltaDays){
    const [y,m,d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m-1, d);
    dt.setDate(dt.getDate() + deltaDays);
    return dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0');
  }
  function getMedMarkers(med, dateStr){
    if(!med.markersByDate) med.markersByDate = {};
    if(!med.markersByDate[dateStr]) med.markersByDate[dateStr] = {};
    return med.markersByDate[dateStr];
  }
  function marcarDosisFuturasComoSuspendidas(med){
    if(!med.markersByDate) return;
    Object.keys(med.markersByDate).forEach(dateStr=>{
      const dayMarkers = med.markersByDate[dateStr];
      Object.keys(dayMarkers).forEach(hourStr=>{
        if(dayMarkers[hourStr] === 'scheduled' || dayMarkers[hourStr] === 'upcoming'){
          dayMarkers[hourStr] = 'suspended';
        }
      });
    });
  }
  function getDosisSuspendidas(med){
    const dosis = [];
    if(!med.markersByDate) return dosis;
    Object.keys(med.markersByDate).sort().forEach(dateStr=>{
      const dayMarkers = med.markersByDate[dateStr];
      Object.keys(dayMarkers).map(Number).sort((a,b)=>a-b).forEach(hour=>{
        if(dayMarkers[hour] === 'suspended') dosis.push({ date: dateStr, hour });
      });
    });
    return dosis;
  }
  function esFechaHoraPasada(dateStr, hour){
    if(dateStr < TODAY_DATE) return true;
    if(dateStr > TODAY_DATE) return false;
    return hour < new Date().getHours();
  }
  function revisarDosisVencidas(){
    let huboCambios = false;
    MEDS.forEach(med=>{
      if(!med.markersByDate) return;
      Object.keys(med.markersByDate).forEach(dateStr=>{
        const dayMarkers = med.markersByDate[dateStr];
        Object.keys(dayMarkers).forEach(hourStr=>{
          const tipo = dayMarkers[hourStr];
          if((tipo === 'scheduled' || tipo === 'upcoming') && esFechaHoraPasada(dateStr, Number(hourStr))){
            dayMarkers[hourStr] = 'incident';
            huboCambios = true;
          }
        });
      });
    });
    if(huboCambios){
      renderMedRows();
      applyFilters();
    }
  }
  function checkTratamientoCompleto(med){
    if(med.estado === 'finalizado' || med.estado === 'suspendido' || med.estado === 'devuelto') return;
    if(!med.markersByDate) return;
    let hayMarcadores = false;
    let todoAdministrado = true;
    Object.keys(med.markersByDate).forEach(dateStr=>{
      Object.values(med.markersByDate[dateStr]).forEach(tipo=>{
        hayMarcadores = true;
        if(tipo !== 'administered') todoAdministrado = false;
      });
    });
    if(hayMarcadores && todoAdministrado) med.estado = 'finalizado';
  }

  const MEDS = [
    { name:'ENOXAPARINA SODICA 40 MG SOLUCION INYECTABLE', dose:'40 mg', freq:'c/12h', via:'SC', estado:'activo',
      lote:'ENX-2291', vencimiento:'11/2026', profesional:'Enf. Laura Gómez',
      markersByDate:{[TODAY_DATE]:{8:'administered', 20:'scheduled'}} },
    { name:'OMEPRAZOL SODICO 40 MG SOLUCION INYECTABLE', dose:'40 mg', freq:'c/12h', via:'IV', estado:'activo',
      lote:'OMZ-0457', vencimiento:'03/2027', profesional:'Enf. Laura Gómez',
      markersByDate:{[TODAY_DATE]:{10:'incident', 22:'scheduled'}} },
    { name:'METAMIZOL 2.5 G / 5 ML SOLUCION INYECTABLE - NOVALGINA', dose:'1 g', freq:'c/8h', via:'IV', estado:'activo',
      lote:'MTZ-1188', vencimiento:'08/2026', profesional:'Enf. Carlos Ruiz',
      markersByDate:{[TODAY_DATE]:{6:'administered', 12:'upcoming', 18:'scheduled'}} },
    { name:'CEFTRIAXONA SODICA 1 G SOLUCION INYECTABLE', dose:'1 g', freq:'c/12h', via:'IV', estado:'activo',
      lote:'CFX-3305', vencimiento:'01/2027', profesional:'Enf. Laura Gómez',
      markersByDate:{[TODAY_DATE]:{8:'administered', 20:'scheduled'}} },
    { name:'DEXAMETASONA 4 MG SOLUCION INYECTABLE', dose:'8 mg', freq:'c/8h', via:'IV', estado:'suspendido',
      lote:'DXM-0876', vencimiento:'05/2026', profesional:'Enf. Laura Gómez',
      markersByDate:{[TODAY_DATE]:{6:'administered', 14:'suspended', 22:'suspended'}} },
    { name:'ONDANSETRON 8MG / 4ML SOLUCION INYECTABLE', dose:'8 mg', freq:'c/12h', via:'IV', estado:'activo',
      lote:'OND-2210', vencimiento:'09/2026', profesional:'Enf. Laura Gómez',
      markersByDate:{[TODAY_DATE]:{8:'administered', 20:'scheduled'}} },
    { name:'ACETAMINOFEN 500 MG TABLETA', dose:'500 mg', freq:'c/6h', via:'VO', estado:'finalizado',
      lote:'ACT-5541', vencimiento:'12/2026', profesional:'Enf. Laura Gómez',
      markersByDate:{[TODAY_DATE]:{0:'administered', 6:'administered', 12:'administered', 18:'administered'}} },
    { name:'VANCOMICINA 1 G SOLUCION INYECTABLE', dose:'1 g', freq:'c/12h', via:'IV', estado:'activo',
      lote:'VCM-4402', vencimiento:'02/2027', profesional:'Enf. Carlos Ruiz',
      markersByDate:{[TODAY_DATE]:{2:'administered', 14:'upcoming'}} },
    { name:'INSULINA CRISTALINA 100 UI/ML SOLUCION INYECTABLE', dose:'según esquema', freq:'c/8h', via:'SC', estado:'activo',
      lote:'INS-7790', vencimiento:'06/2026', profesional:'Enf. Laura Gómez',
      markersByDate:{[TODAY_DATE]:{6:'administered', 14:'administered', 22:'scheduled'}} },
    { name:'FUROSEMIDA 20 MG SOLUCION INYECTABLE', dose:'20 mg', freq:'c/24h', via:'IV', estado:'activo',
      lote:'FRS-1123', vencimiento:'04/2027', profesional:'Enf. Laura Gómez',
      markersByDate:{[TODAY_DATE]:{8:'administered'}} },
    { name:'METOCLOPRAMIDA 10 MG SOLUCION INYECTABLE', dose:'10 mg', freq:'c/8h', via:'IV', estado:'activo',
      lote:'MTC-9021', vencimiento:'09/2027', profesional:'Enf. Manuel Hernández',
      markersByDate:{[TODAY_DATE]:{8:'administered', 16:'scheduled', 0:'scheduled'}} },
    { name:'HIDROCORTISONA 100 MG SOLUCION INYECTABLE', dose:'100 mg', freq:'c/6h', via:'IV', estado:'suspendido',
      lote:'HDC-6654', vencimiento:'07/2026', profesional:'Enf. Carlos Ruiz',
      markersByDate:{[TODAY_DATE]:{0:'administered', 6:'suspended', 12:'suspended', 18:'suspended'}} },
    { name:'TRAMADOL 50 MG SOLUCION INYECTABLE - PRN', dose:'50 mg', freq:'PRN c/8h', via:'IV', estado:'activo',
      lote:'TRM-9081', vencimiento:'10/2026', profesional:'Enf. Laura Gómez',
      markersByDate:{[TODAY_DATE]:{14:'upcoming', 22:'scheduled'}} },
    { name:'COMPLEJO B MULTIVITAMINICO TABLETA', dose:'1 tableta', freq:'c/24h', via:'VO', estado:'finalizado',
      lote:'CBM-3317', vencimiento:'01/2027', profesional:'Enf. Laura Gómez',
      markersByDate:{[TODAY_DATE]:{8:'administered'}} }
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
  let currentHourColWidth = 52;

  function computeHourColWidth(){
    const wrap = document.getElementById('timeline-wrap');
    const hours = getDisplayHours();
    const available = wrap.clientWidth - CHECK_COL_WIDTH - MED_COL_WIDTH;
    const natural = 52;
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
    wrap.dataset.fecha = formatDateLabel(currentViewDate);
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
      wrap.dataset.profesional = med.profesional;
      wrap.dataset.lote = med.lote;
      wrap.dataset.vencimiento = med.vencimiento;
    } else {
      wrap.dataset.profesional = '—';
    }
    wrap.setAttribute('aria-label', `Dosis ${time}, ${statusLabel} — ${med.name}`);
    wrap.setAttribute('aria-haspopup', 'true');
    return wrap;
  }

  const ROWS = [];
  const selectedMeds = new Set();
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
      const markerType = getMedMarkers(med, currentViewDate)[h];
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
        const hours = Object.keys(getMedMarkers(med, currentViewDate)).map(Number);
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
      ? `${visibleCount} de ${total} medicamentos · ronda del ${formatDateLabel(currentViewDate)}`
      : `${total} medicamentos · ronda del ${formatDateLabel(currentViewDate)}`;

    requestAnimationFrame(updateNowLine);
    updateSelectAllCheckboxState();
  }

  function toggleRowSelection(med, tr, checked){
    if(checked){ selectedMeds.add(med); tr.classList.add('selected'); }
    else { selectedMeds.delete(med); tr.classList.remove('selected'); }
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

    if(count === 0){ toolbar.classList.remove('open'); return; }
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

  function bulkDevolverFarmacia(){ openReturnModal(Array.from(selectedMeds)); }
  function bulkSuspender(){ openSuspendModal(Array.from(selectedMeds), null); }

  let toastTimer = null;
  function showToast(message, action){
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = message;
    const actionBtn = document.getElementById('toast-action-btn');
    if(action && action.label && action.onClick){
      actionBtn.textContent = action.label;
      actionBtn.style.display = 'inline-block';
      actionBtn.onclick = ()=>{
        toast.classList.remove('show');
        clearTimeout(toastTimer);
        action.onClick();
      };
    } else {
      actionBtn.style.display = 'none';
      actionBtn.onclick = null;
    }
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toast.classList.remove('show'), action ? 6000 : 3500);
  }

  function computeNowLineLeft(){
    const hours = getDisplayHours();
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
    if(currentViewDate !== TODAY_DATE){ line.style.display = 'none'; return; }
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

  function updateDayNavLabel(){
    document.getElementById('day-nav-label').textContent = formatDateLabel(currentViewDate);
    document.getElementById('day-nav-today-btn').style.display = currentViewDate === TODAY_DATE ? 'none' : 'inline-block';
  }
  function goToDate(dateStr){
    currentViewDate = dateStr;
    updateDayNavLabel();
    renderMedRows();
    applyFilters();
    requestAnimationFrame(()=>{ updateNowLine(); scrollToNow(); });
  }
  document.getElementById('day-prev-btn').addEventListener('click', ()=> goToDate(shiftDate(currentViewDate, -1)));
  document.getElementById('day-next-btn').addEventListener('click', ()=> goToDate(shiftDate(currentViewDate, 1)));
  document.getElementById('day-nav-today-btn').addEventListener('click', ()=> goToDate(TODAY_DATE));
  updateDayNavLabel();
  document.getElementById('date-from').value = TODAY_DATE;
  document.getElementById('date-to').value = TODAY_DATE;

  buildHeader();
  buildBody();
  requestAnimationFrame(buildNowLine);
  const nowLineInterval = setInterval(updateNowLine, 30000);
  revisarDosisVencidas();
  const dosisVencidasInterval = setInterval(revisarDosisVencidas, 60000);

  let resizeTimer = null;
  function handleResize(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=>{
      buildHeader();
      renderMedRows();
      applyFilters();
      updateNowLine();
    }, 120);
  }
  window.addEventListener('resize', handleResize);

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

  const DENSITY_LEVELS = ['compact', 'normal', 'expanded'];
  let densityIdx = 1;
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
      if(targetIdx !== null){ e.preventDefault(); selectCardTab(cardTabs[targetIdx], true); }
    });
  });

  document.querySelectorAll('.subnav-bar').forEach(bar=>{
    const tabs = Array.from(bar.querySelectorAll('.subnav-tab'));
    function selectSubnavTab(tab, focusIt){
      tabs.forEach(t=>{
        const isSelected = t === tab;
        t.classList.toggle('active', isSelected);
        t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        t.tabIndex = isSelected ? 0 : -1;
      });
      if(focusIt) tab.focus();
      const targetId = tab.getAttribute('aria-controls');
      Array.from(bar.parentElement.children).forEach(el=>{
        if(el.classList && el.classList.contains('sub-panel')){
          el.classList.toggle('active', el.id === targetId);
        }
      });
    }
    tabs.forEach((tab, idx)=>{
      tab.addEventListener('click', ()=> selectSubnavTab(tab, false));
      tab.addEventListener('keydown', (e)=>{
        let targetIdx = null;
        if(e.key === 'ArrowRight') targetIdx = (idx + 1) % tabs.length;
        else if(e.key === 'ArrowLeft') targetIdx = (idx - 1 + tabs.length) % tabs.length;
        else if(e.key === 'Home') targetIdx = 0;
        else if(e.key === 'End') targetIdx = tabs.length - 1;
        if(targetIdx !== null){ e.preventDefault(); selectSubnavTab(tabs[targetIdx], true); }
      });
    });
  });

  document.querySelectorAll('#panel-pedidos .chip-group:not(#chipgroup-recepcion-estado):not(#chipgroup-devoluciones-estado):not(#chipgroup-solicitudes-estado)').forEach(group=>{
    const chips = Array.from(group.querySelectorAll('.chip-filter'));
    chips.forEach(chip=>{
      chip.addEventListener('click', ()=>{
        chips.forEach(c=>{ c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
      });
    });
  });

  /* ================= RECEPCIÓN: filtro por estado + fecha + tipo ================= */
  const RECEPCION_FILTER_LABELS = { todas: 'turno actual', despachado: 'filtro: Pendiente', recibido: 'filtro: Recibido', parcial: 'filtro: Parcial' };
  let recepcionEstadoFilter = 'despachado';
  let recepcionDateFilter = null;
  let recepcionTipoFilter = null;
  const RECEP_INSUMO_KEYWORDS = ['Jeringas','Catéter','Guantes','Gasa','Apósito','Alcohol antiséptico','Equipo de infusión','Llave de tres vías'];

  function ordenRecepcionTieneTipo(orderEl, tipo){
    const nombres = Array.from(orderEl.querySelectorAll('.recep-med-name')).map(el => el.textContent);
    if(nombres.length === 0) return true;
    const esInsumo = n => RECEP_INSUMO_KEYWORDS.some(k => n.includes(k));
    if(tipo === 'insumo') return nombres.some(esInsumo);
    if(tipo === 'medicamento') return nombres.some(n => !esInsumo(n));
    return true;
  }

  function applyRecepcionFilter(){
    const filterValue = recepcionEstadoFilter;
    let visibleCount = 0;
    document.querySelectorAll('#subpanel-recepcion .recep-order[data-estado]').forEach(orderEl=>{
      const estado = orderEl.getAttribute('data-estado');
      const partial = orderEl.getAttribute('data-partial') === 'true';
      let estadoMatch;
      if(filterValue === 'todas') estadoMatch = true;
      else if(filterValue === 'parcial') estadoMatch = partial;
      else estadoMatch = (estado === filterValue);

      const fechaISO = orderEl.getAttribute('data-fecha-iso') || '';
      const fechaMatch = !recepcionDateFilter || (fechaISO >= recepcionDateFilter.from && fechaISO <= recepcionDateFilter.to);
      const tipoMatch = !recepcionTipoFilter || ordenRecepcionTieneTipo(orderEl, recepcionTipoFilter);

      const match = estadoMatch && fechaMatch && tipoMatch;
      orderEl.classList.toggle('filtered-out', !match);
      if(match) visibleCount++;

      const orderBtn = orderEl.querySelector('.recep-order-header .row-expand-btn');
      const orderBody = orderEl.querySelector('.recep-order-body');
      if(orderBtn && orderBody){
        if(filterValue === 'despachado'){
          orderBtn.setAttribute('aria-expanded', 'true');
          orderBody.classList.remove('collapsed');
          orderEl.querySelectorAll('.recep-med-detail').forEach(d => d.classList.remove('collapsed'));
          orderEl.querySelectorAll('.recep-med .row-expand-btn').forEach(b => b.setAttribute('aria-expanded', 'true'));
        } else {
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
      recepcionEstadoFilter = chip.getAttribute('data-filter');
      applyRecepcionFilter();
    });
  });
  applyRecepcionFilter();

  document.querySelectorAll('#chipgroup-recepcion-fecha .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const yaActivo = chip.classList.contains('active');
      document.querySelectorAll('#chipgroup-recepcion-fecha .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      document.getElementById('recep-date-range-label').textContent = 'Rango personalizado';
      document.getElementById('recep-date-from').value = '';
      document.getElementById('recep-date-to').value = '';
      if(yaActivo){
        recepcionDateFilter = null;
      } else {
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
        const modo = chip.getAttribute('data-quickdate');
        recepcionDateFilter = modo === 'hoy'
          ? { from: TODAY_DATE, to: TODAY_DATE }
          : { from: shiftDate(TODAY_DATE, -6), to: TODAY_DATE };
      }
      applyRecepcionFilter();
    });
  });

  setupPopover('recep-date-popover-wrap', 'recep-date-popover-btn', 'recep-date-popover');
  document.getElementById('recep-date-apply-btn').addEventListener('click', ()=>{
    const from = document.getElementById('recep-date-from').value;
    const to = document.getElementById('recep-date-to').value;
    if(from && to){
      recepcionDateFilter = { from, to };
      document.getElementById('recep-date-range-label').textContent = `${from} – ${to}`;
      document.querySelectorAll('#chipgroup-recepcion-fecha .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      applyRecepcionFilter();
    }
    closeAllPopovers();
  });
  document.getElementById('recep-date-clear-btn').addEventListener('click', ()=>{
    document.getElementById('recep-date-from').value = '';
    document.getElementById('recep-date-to').value = '';
    document.getElementById('recep-date-range-label').textContent = 'Rango personalizado';
    recepcionDateFilter = null;
    applyRecepcionFilter();
    closeAllPopovers();
  });

  setupPopover('recep-more-popover-wrap', 'recep-more-popover-btn', 'recep-more-popover');
  document.querySelectorAll('#recep-tipo-chip-group .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const yaActivo = chip.classList.contains('active');
      document.querySelectorAll('#recep-tipo-chip-group .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      if(!yaActivo){ chip.classList.add('active'); chip.setAttribute('aria-pressed', 'true'); }
    });
  });
  document.getElementById('recep-more-apply-btn').addEventListener('click', ()=>{
    const activa = document.querySelector('#recep-tipo-chip-group .chip-filter.active');
    recepcionTipoFilter = activa ? activa.getAttribute('data-tipo') : null;
    const badge = document.getElementById('recep-more-badge-count');
    if(recepcionTipoFilter){ badge.textContent = '1'; badge.style.display = 'inline-flex'; }
    else { badge.style.display = 'none'; }
    applyRecepcionFilter();
    closeAllPopovers();
  });
  document.getElementById('recep-more-clear-btn').addEventListener('click', ()=>{
    document.querySelectorAll('#recep-tipo-chip-group .chip-filter').forEach(c=>{
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    recepcionTipoFilter = null;
    document.getElementById('recep-more-badge-count').style.display = 'none';
    applyRecepcionFilter();
    closeAllPopovers();
  });

  const RECEP_FECHA_OFFSETS = { 'recep-478': -1, 'recep-481': -3, 'recep-493': 0, 'recep-497': -1, 'recep-501': -1, 'recep-505': 0, 'recep-508': -2 };
  Object.keys(RECEP_FECHA_OFFSETS).forEach(recepId=>{
    const el = document.getElementById('order-' + recepId);
    if(el) el.setAttribute('data-fecha-iso', shiftDate(TODAY_DATE, RECEP_FECHA_OFFSETS[recepId]));
  });

  /* ================= Insumos disponibles del paciente (recibidos de farmacia) ================= */
  const insumosDisponibles = [
    { id: 'insumo-1', nombre: 'Jeringas 10 ml', cantidadDisponible: 6 },
    { id: 'insumo-2', nombre: 'Alcohol antiséptico 70% 250 ml', cantidadDisponible: 2 },
  ];
  let insumoSeq = 2;
  function agregarInsumoDisponible(nombre, cantidad){
    const existente = insumosDisponibles.find(i => i.nombre === nombre);
    if(existente){ existente.cantidadDisponible += cantidad; }
    else {
      insumoSeq++;
      insumosDisponibles.push({ id: 'insumo-' + insumoSeq, nombre, cantidadDisponible: cantidad });
    }
  }

  const RECEPCION_MED_LINKS = {};

  function isoAMesAno(isoDate){
    const [y, m] = isoDate.split('-');
    return m + '/' + y;
  }

  function crearRecepcionDesdeSolicitud(solicitud){
    const recepId = 'recep-' + solicitud.id.replace('sol-', '');

    const medBlocksHtml = solicitud.items.map((item, idx)=>{
      const group = 'pedmed-' + solicitud.id + '-' + idx;
      const articuloCod = (item.esInsumo ? 'IN' : 'MX') + String(1000 + idx) + '-1';
      const loteCod = 'L-' + Math.floor(60000 + Math.random() * 9000);
      const vencIso = shiftDate(TODAY_DATE, 180 + idx * 15);
      const vencMesAno = isoAMesAno(vencIso);
      const cantidadNum = parseInt(item.cantidad, 10) || 1;

      if(item.omeItemId){
        RECEPCION_MED_LINKS[group] = {
          omeItemId: item.omeItemId,
          lote: loteCod, vencimiento: vencMesAno,
          lotes: [{ lote: loteCod, vencimiento: vencMesAno, cantidad: cantidadNum }]
        };
      } else if(item.esInsumo){
        RECEPCION_MED_LINKS[group] = { esInsumo: true, nombre: item.nombre, cantidad: cantidadNum };
      }

      return `
        <div class="recep-med">
          <button type="button" class="row-expand-btn" aria-expanded="false" aria-controls="detalle-${group}" data-group="${group}" title="Ver artículo(s) y lote(s)">
            <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <span class="recep-med-name">${item.nombre}</span>
          <span class="child-count-badge">${cantidadNum}</span>
        </div>
        <div class="recep-med-detail collapsed" id="detalle-${group}" data-parent-group="${group}">
          <table class="detail-table">
            <thead><tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr></thead>
            <tbody>
              <tr>
                <td>${articuloCod}</td>
                <td>${item.nombre}</td>
                <td class="cant-entregada">${cantidadNum}</td>
                <td>${loteCod}</td>
                <td>${vencIso}</td>
              </tr>
            </tbody>
          </table>
        </div>`;
    }).join('');

    const medTargets = solicitud.items.map((item, idx) => 'pedmed-' + solicitud.id + '-' + idx).join(',');

    const orderHtml = `
      <div class="recep-order" id="order-${recepId}" data-order-id="${recepId}" data-estado="despachado" data-partial="false" data-fecha-iso="${TODAY_DATE}">
        <div class="recep-order-header">
          <button type="button" class="row-expand-btn" aria-expanded="true" aria-controls="body-${recepId}" data-group="${recepId}" title="Ver medicamentos de esta orden">
            <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <span class="recep-order-number">${solicitud.consecutivo}</span>
          <span class="recep-order-date">${solicitud.fecha}</span>
          <span class="child-count-badge">${solicitud.items.length} ítem${solicitud.items.length === 1 ? '' : 's'}</span>
          <div class="recep-order-spacer"></div>
          <div class="recep-order-status" id="${recepId}-status">
            <button type="button" class="btn btn-primary btn-sm btn-confirm-receipt" data-confirm-target="${recepId}" data-med-targets="${medTargets}" data-partial="false">
              <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              Confirmar recepción
            </button>
          </div>
        </div>
        <div class="recep-order-body" id="body-${recepId}" data-parent-group="${recepId}">
          ${medBlocksHtml}
        </div>
      </div>`;

    document.getElementById('recepcion-list').insertAdjacentHTML('afterbegin', orderHtml);
    applyRecepcionFilter();
  }

  /* ================= Filas/paneles expandibles (patrón genérico) ================= */
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.row-expand-btn');
    if(!btn) return;
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    const willExpand = !isExpanded;
    btn.setAttribute('aria-expanded', willExpand ? 'true' : 'false');
    const group = btn.getAttribute('data-group');

    document.querySelectorAll('[data-parent-group="'+group+'"]').forEach(row=>{
      row.classList.toggle('collapsed', !willExpand);
    });
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

  /* ================= Confirmar recepción ================= */
  const PARTIAL_FLAG_SVG = '<span class="partial-flag" title="Un ítem de esta orden se recibió incompleto"><svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>Parcial</span>';
  const CONFIRMED_TAG_SVG = '<span class="confirmed-tag"><svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Recibido</span>';

  document.getElementById('recepcion-list').addEventListener('click', (e)=>{
    const btn = e.target.closest('.btn-confirm-receipt');
    if(!btn) return;
    const orderTarget = btn.getAttribute('data-confirm-target');
    const isPartial = btn.getAttribute('data-partial') === 'true';
    const medTargets = (btn.getAttribute('data-med-targets') || '').split(',').filter(Boolean);

    const statusContainer = document.getElementById(orderTarget + '-status');
    if(statusContainer) statusContainer.innerHTML = CONFIRMED_TAG_SVG + (isPartial ? PARTIAL_FLAG_SVG : '');

    const orderEl = document.getElementById('order-' + orderTarget);
    if(orderEl){ orderEl.setAttribute('data-estado', 'recibido'); orderEl.setAttribute('data-partial', isPartial ? 'true' : 'false'); }

    medTargets.forEach(group=>{
      const link = RECEPCION_MED_LINKS[group];
      if(!link) return;
      if(link.esInsumo){ agregarInsumoDisponible(link.nombre, link.cantidad); return; }
      const med = MEDS.find(m => m.omeItemId === link.omeItemId);
      if(!med) return;
      med.lote = link.lote;
      med.vencimiento = link.vencimiento;
      med.lotesRecibidos = link.lotes;
      med.pendienteRecepcion = false;
    });
  });

  /* ================= Popovers: fecha personalizada, otros filtros y alergias ================= */
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
      if(willOpen){ pop.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
    pop.addEventListener('click', (e)=> e.stopPropagation());
    return {wrap, btn, pop};
  }

  const datePop = setupPopover('date-popover-wrap','date-popover-btn','date-popover');
  const morePop = setupPopover('more-popover-wrap','more-popover-btn','more-popover');
  const allergyPop = setupPopover('allergy-popover-wrap','allergy-btn','allergy-popover');

  document.addEventListener('click', closeAllPopovers);

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

  document.getElementById('search-input').addEventListener('input', applyFilters);

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

  applyFilters();

  /* ================= Popover hover sobre los marcadores de dosis ================= */
  const dosePopEl = document.getElementById('dose-popover');
  let doseHideTimer = null;
  let currentPopoverMarker = null;

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

    const hasLote = !!marker.dataset.lote;
    document.getElementById('dp-row-lote').style.display = hasLote ? 'flex' : 'none';
    document.getElementById('dp-row-vencimiento').style.display = hasLote ? 'flex' : 'none';
    document.getElementById('dp-lote-pending-note').style.display = (!hasLote && status !== 'suspended') ? 'block' : 'none';
    if(hasLote){
      document.getElementById('dp-lote').textContent = marker.dataset.lote;
      document.getElementById('dp-vencimiento').textContent = marker.dataset.vencimiento;
    }

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

    const isResolved = RESOLVED_STATUSES.hasOwnProperty(status);
    document.getElementById('dp-actions').style.display = isResolved ? 'none' : 'flex';
    const note = document.getElementById('dp-resolved-note');
    if(isResolved){
      note.style.display = 'flex';
      note.innerHTML = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>${RESOLVED_STATUSES[status]}`;
    } else {
      note.style.display = 'none';
    }

    dosePopEl.style.visibility = 'hidden';
    dosePopEl.classList.add('open');
    const popRect = dosePopEl.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();

    let left = markerRect.left + markerRect.width/2 - popRect.width/2;
    left = Math.max(12, Math.min(left, window.innerWidth - popRect.width - 12));

    const spaceBelow = window.innerHeight - markerRect.bottom;
    let top;
    if(spaceBelow > popRect.height + 16){ top = markerRect.bottom + 10; }
    else { top = markerRect.top - popRect.height - 10; }
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
        if(e.key === 'Escape'){ hideDosePopoverNow(); marker.focus(); }
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

  /* ================= Modal: Registrar administración ================= */
  const CURRENT_USER_NAME = 'Manuel Hernández';
  const adminModalOverlay = document.getElementById('admin-modal-overlay');
  let adminModalContext = null;
  let adminModalOpenerMarker = null;
  let selectedLoteOption = null;

  function shiftMonthYear(mmYYYY, delta){
    let [m, y] = mmYYYY.split('/').map(Number);
    m += delta;
    while(m > 12){ m -= 12; y += 1; }
    while(m < 1){ m += 12; y -= 1; }
    return String(m).padStart(2,'0') + '/' + y;
  }
  function monthsUntil(mmYYYY){
    const [m, y] = mmYYYY.split('/').map(Number);
    const [refY, refM] = TODAY_DATE.split('-').map(Number);
    return (y - refY) * 12 + (m - refM);
  }

  function getLoteOptions(med){
    if(med.pendienteRecepcion) return [];
    if(med.lotesRecibidos && med.lotesRecibidos.length > 0){
      return med.lotesRecibidos.filter(opt => monthsUntil(opt.vencimiento) >= 0);
    }
    const [prefix, numStr] = med.lote.split('-');
    const baseNum = parseInt(numStr, 10) || 1000;
    return [
      { lote: `${prefix}-${baseNum + 64}`, vencimiento: shiftMonthYear(med.vencimiento, 7),  cantidad: 24 },
      { lote: `${prefix}-${baseNum + 41}`, vencimiento: shiftMonthYear(med.vencimiento, 5),  cantidad: 18 },
      { lote: `${prefix}-${baseNum + 9}`,  vencimiento: shiftMonthYear(med.vencimiento, 0),  cantidad: 6  },
      { lote: `${prefix}-${baseNum - 21}`, vencimiento: shiftMonthYear(med.vencimiento, -3), cantidad: 2  },
      { lote: `${prefix}-${baseNum - 55}`, vencimiento: shiftMonthYear(med.vencimiento, -5), cantidad: 11 }
    ].filter(opt => monthsUntil(opt.vencimiento) >= 0);
  }

  function renderLoteOptions(med){
    const tbody = document.getElementById('admin-lote-list');
    tbody.innerHTML = '';
    selectedLoteOption = null;
    const options = getLoteOptions(med);
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

  function renderAdminInsumos(){
    const wrap = document.getElementById('admin-insumos-list');
    const disponibles = insumosDisponibles.filter(i => i.cantidadDisponible > 0);
    if(disponibles.length === 0){
      wrap.innerHTML = '<div class="admin-insumos-empty">No hay insumos disponibles para este paciente todavía — llegan aquí una vez que farmacia despacha un pedido que los incluya.</div>';
      return;
    }
    wrap.innerHTML = disponibles.map(i => `
      <label class="admin-insumo-row">
        <input type="checkbox" data-insumo-id="${i.id}">
        <span class="air-name">${i.nombre}</span>
        <span class="air-disp">Disponible: ${i.cantidadDisponible}</span>
      </label>
    `).join('');
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
    renderAdminInsumos();
    document.getElementById('admin-observaciones').value = '';
    document.getElementById('admin-5-correctos').checked = false;
    document.getElementById('admin-lote-warning').style.display = 'none';
    updateAdminConfirmState();

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
  function handleAdminModalEscape(e){
    if(e.key === 'Escape' && adminModalOverlay.classList.contains('open')) closeAdminModal();
  }
  document.addEventListener('keydown', handleAdminModalEscape);

  document.getElementById('admin-5-correctos').addEventListener('change', updateAdminConfirmState);

  document.getElementById('admin-confirm-btn').addEventListener('click', ()=>{
    if(!adminModalContext || !selectedLoteOption) return;
    const { med, hour } = adminModalContext;

    const horaReal = document.getElementById('admin-hora-registro').textContent;
    const observaciones = document.getElementById('admin-observaciones').value.trim();

    const insumosUsados = [];
    document.querySelectorAll('#admin-insumos-list input[type="checkbox"]:checked').forEach(cb=>{
      const insumo = insumosDisponibles.find(i => i.id === cb.getAttribute('data-insumo-id'));
      if(insumo && insumo.cantidadDisponible > 0){
        insumo.cantidadDisponible -= 1;
        insumosUsados.push({ nombre: insumo.nombre, cantidad: 1 });
      }
    });

    med.registrations = med.registrations || {};
    med.registrations[hour] = {
      horaReal, dosisReal: med.dose, viaReal: med.via,
      lote: selectedLoteOption.lote, vencimiento: selectedLoteOption.vencimiento,
      observaciones, profesional: CURRENT_USER_NAME, insumosUsados
    };
    getMedMarkers(med, currentViewDate)[hour] = 'administered';
    checkTratamientoCompleto(med);

    adminModalOverlay.classList.remove('open');
    adminModalContext = null;
    selectedLoteOption = null;
    adminModalOpenerMarker = null;
    stopAdminClock();

    renderMedRows();
    applyFilters();
    requestAnimationFrame(updateNowLine);
    const insumosMsg = insumosUsados.length > 0 ? ` (+ ${insumosUsados.map(i=>i.nombre).join(', ')} para cargos)` : '';
    showToast(`Administración registrada: ${med.name} · ${horaReal}${insumosMsg}`);
  });

  /* ================= Modal: Suspender tratamiento ================= */
  const suspendModalOverlay = document.getElementById('suspend-modal-overlay');
  let suspendModalMeds = [];
  let suspendModalOpener = null;

  function openSuspendModal(meds, opener){
    if(!meds || meds.length === 0) return;
    suspendModalMeds = meds;
    suspendModalOpener = opener || null;
    hideDosePopoverNow();

    const count = meds.length;
    const titleText = count === 1 ? 'Suspender tratamiento' : `Suspender ${count} tratamientos`;
    document.getElementById('suspend-modal-title').textContent = titleText;
    document.getElementById('suspend-confirm-label').textContent = titleText;

    document.getElementById('suspend-patient-name').textContent =
      document.querySelector('.patient-name-block .pname')?.textContent || '—';
    document.getElementById('suspend-patient-cc').textContent =
      document.querySelector('.patient-meta .pm-item b')?.textContent || '—';

    document.getElementById('suspend-med-list').innerHTML = meds.map(med => `
      <div class="suspend-med-row">
        <div>
          <div class="sm-name">${med.name}</div>
          <div class="sm-meta">${med.dose} · ${med.via} · ${med.freq}</div>
        </div>
      </div>
    `).join('');

    document.getElementById('suspend-motivo').value = '';
    document.getElementById('suspend-detalle').value = '';
    document.getElementById('suspend-detalle-wrap').style.display = 'none';
    document.getElementById('suspend-motivo-required').style.display = 'none';
    document.getElementById('suspend-detalle-required').style.display = 'none';
    document.getElementById('suspend-por').textContent = CURRENT_USER_NAME;

    suspendModalOverlay.classList.add('open');
    startSuspendClock();
  }

  function closeSuspendModal(){
    suspendModalOverlay.classList.remove('open');
    suspendModalMeds = [];
    stopSuspendClock();
    if(suspendModalOpener){ suspendModalOpener.focus(); }
    suspendModalOpener = null;
  }

  document.getElementById('dp-action-suspender').addEventListener('click', ()=>{
    if(!currentPopoverMarker || !currentPopoverMarker._med) return;
    openSuspendModal([currentPopoverMarker._med], currentPopoverMarker);
  });

  document.getElementById('suspend-modal-close').addEventListener('click', closeSuspendModal);
  document.getElementById('suspend-cancel-btn').addEventListener('click', closeSuspendModal);
  suspendModalOverlay.addEventListener('click', (e)=>{
    if(e.target === suspendModalOverlay) closeSuspendModal();
  });
  function handleSuspendModalEscape(e){
    if(e.key === 'Escape' && suspendModalOverlay.classList.contains('open')) closeSuspendModal();
  }
  document.addEventListener('keydown', handleSuspendModalEscape);

  document.getElementById('suspend-motivo').addEventListener('change', ()=>{
    const val = document.getElementById('suspend-motivo').value;
    document.getElementById('suspend-motivo-required').style.display = 'none';
    const detalleWrap = document.getElementById('suspend-detalle-wrap');
    if(val === 'otro'){ detalleWrap.style.display = 'block'; }
    else {
      detalleWrap.style.display = 'none';
      document.getElementById('suspend-detalle-required').style.display = 'none';
    }
  });

  document.getElementById('suspend-confirm-btn').addEventListener('click', ()=>{
    const motivo = document.getElementById('suspend-motivo');
    const detalle = document.getElementById('suspend-detalle');
    let valid = true;
    let focusTarget = null;

    if(!motivo.value){
      document.getElementById('suspend-motivo-required').style.display = 'inline-flex';
      focusTarget = focusTarget || motivo;
      valid = false;
    }
    if(motivo.value === 'otro' && !detalle.value.trim()){
      document.getElementById('suspend-detalle-required').style.display = 'inline-flex';
      focusTarget = focusTarget || detalle;
      valid = false;
    }
    if(!valid){ if(focusTarget) focusTarget.focus(); return; }

    const motivoLabel = motivo.options[motivo.selectedIndex].text;
    const horaReal = document.getElementById('suspend-hora-registro').textContent;
    const meds = suspendModalMeds;

    meds.forEach(med=>{
      med.estado = 'suspendido';
      med.suspension = { motivo: motivo.value, motivoLabel, detalle: detalle.value.trim(), por: CURRENT_USER_NAME, hora: horaReal };
      marcarDosisFuturasComoSuspendidas(med);
    });

    const count = meds.length;
    const firstName = meds[0].name;
    closeSuspendModal();
    clearSelection();
    renderMedRows();
    applyFilters();
    showToast(
      count === 1 ? `${firstName} suspendido correctamente` : `${count} medicamentos suspendidos correctamente`,
      { label: 'Devolver a farmacia', onClick: ()=> openReturnModal(meds) }
    );
  });

  let suspendClockTimer = null;
  function updateSuspendClock(){
    document.getElementById('suspend-hora-registro').textContent = new Date().toTimeString().slice(0,5);
  }
  function startSuspendClock(){
    updateSuspendClock();
    clearInterval(suspendClockTimer);
    suspendClockTimer = setInterval(updateSuspendClock, 1000);
  }
  function stopSuspendClock(){
    clearInterval(suspendClockTimer);
    suspendClockTimer = null;
  }

  /* ================= Modal: Devolver a farmacia ================= */
  const returnModalOverlay = document.getElementById('return-modal-overlay');
  let returnModalMeds = [];

  function dateGroupLabel(dateStr, refDateStr){
    if(dateStr === refDateStr) return 'Hoy';
    if(dateStr === shiftDate(refDateStr, 1)) return 'Mañana';
    return formatDateLabel(dateStr);
  }

  function openReturnModal(meds){
    if(!meds || meds.length === 0) return;
    returnModalMeds = meds;

    document.getElementById('return-patient-name').textContent =
      document.querySelector('.patient-name-block .pname')?.textContent || '—';
    document.getElementById('return-patient-cc').textContent =
      document.querySelector('.patient-meta .pm-item b')?.textContent || '—';

    document.getElementById('return-med-list').innerHTML = meds.map(med => {
      const dosis = getDosisSuspendidas(med);
      const byDate = {};
      dosis.forEach(d => { (byDate[d.date] = byDate[d.date] || []).push(d.hour); });
      const dateBlocksHtml = Object.keys(byDate).sort().map(dateStr => {
        const chips = byDate[dateStr].map(h => `<span class="program-chip">${String(h).padStart(2,'0')}:00</span>`).join('');
        return `
          <div class="program-date-group">
            <div class="pdg-label">${dateGroupLabel(dateStr, TODAY_DATE)} · ${dateStr === TODAY_DATE ? '' : formatDateLabel(dateStr) + ' · '}${byDate[dateStr].length} dosis</div>
            <div class="program-chips">${chips}</div>
          </div>`;
      }).join('');
      return `
        <div class="program-med-block">
          <div class="program-med-block-header">
            <div class="pmb-name">${med.name}</div>
            <div class="pmb-meta">${med.dose} · ${med.via} · ${med.freq} — Lote <b>${med.lote}</b> · Vence <b>${med.vencimiento}</b> — ${dosis.length} dosis a devolver</div>
          </div>
          ${dosis.length > 0 ? dateBlocksHtml : '<div style="padding:12px 14px;font-size:12.5px;color:var(--ink-500);">No quedaron dosis suspendidas pendientes por devolver para este medicamento.</div>'}
        </div>`;
    }).join('');

    document.getElementById('return-motivo').value = 'suspension_tratamiento';
    document.getElementById('return-detalle').value = '';
    document.getElementById('return-detalle-wrap').style.display = 'none';
    document.getElementById('return-motivo-required').style.display = 'none';
    document.getElementById('return-detalle-required').style.display = 'none';
    document.getElementById('return-por').textContent = CURRENT_USER_NAME;

    returnModalOverlay.classList.add('open');
    startReturnClock();
  }

  function closeReturnModal(){
    returnModalOverlay.classList.remove('open');
    returnModalMeds = [];
    stopReturnClock();
  }

  document.getElementById('return-modal-close').addEventListener('click', closeReturnModal);
  document.getElementById('return-cancel-btn').addEventListener('click', closeReturnModal);
  returnModalOverlay.addEventListener('click', (e)=>{
    if(e.target === returnModalOverlay) closeReturnModal();
  });
  function handleReturnModalEscape(e){
    if(e.key === 'Escape' && returnModalOverlay.classList.contains('open')) closeReturnModal();
  }
  document.addEventListener('keydown', handleReturnModalEscape);

  document.getElementById('return-motivo').addEventListener('change', ()=>{
    const val = document.getElementById('return-motivo').value;
    document.getElementById('return-motivo-required').style.display = 'none';
    const detalleWrap = document.getElementById('return-detalle-wrap');
    if(val === 'otro'){ detalleWrap.style.display = 'block'; }
    else {
      detalleWrap.style.display = 'none';
      document.getElementById('return-detalle-required').style.display = 'none';
    }
  });

  document.getElementById('return-confirm-btn').addEventListener('click', ()=>{
    const motivo = document.getElementById('return-motivo');
    const detalle = document.getElementById('return-detalle');
    let valid = true;
    let focusTarget = null;

    if(!motivo.value){
      document.getElementById('return-motivo-required').style.display = 'inline-flex';
      focusTarget = focusTarget || motivo;
      valid = false;
    }
    if(motivo.value === 'otro' && !detalle.value.trim()){
      document.getElementById('return-detalle-required').style.display = 'inline-flex';
      focusTarget = focusTarget || detalle;
      valid = false;
    }
    if(!valid){ if(focusTarget) focusTarget.focus(); return; }

    const motivoLabel = motivo.value === 'otro' ? detalle.value.trim() : motivo.options[motivo.selectedIndex].text;
    const horaReal = document.getElementById('return-hora-registro').textContent;
    const meds = returnModalMeds;
    const fechaLabel = `${formatDateLabel(TODAY_DATE)} · ${horaReal}`;
    const responsable = CURRENT_USER_NAME.startsWith('Enf.') ? CURRENT_USER_NAME : 'Enf. ' + CURRENT_USER_NAME;

    const devMeds = [];
    meds.forEach(med => {
      const dosis = getDosisSuspendidas(med);
      if(dosis.length === 0) return;
      const cantidad = dosis.length + (dosis.length === 1 ? ' unidad' : ' unidades');
      med.estado = 'devuelto';
      med.devolucion = { motivo: motivo.value, motivoLabel, cantidad, lote: med.lote, vencimiento: med.vencimiento, por: responsable, fecha: fechaLabel };
      devMeds.push({ nombre: med.name, cantidad, lote: med.lote, vencimiento: med.vencimiento });
    });

    if(devMeds.length === 0){
      showToast('No hay dosis suspendidas pendientes por devolver en la selección');
      return;
    }

    devolucionesSeq++;
    const consecutivo = 'DEV-' + String(devolucionesSeq).padStart(6, '0');
    devMeds.forEach(dm => { dm.consecutivo = consecutivo; });
    meds.forEach(med => { if(med.devolucion) med.devolucion.consecutivo = consecutivo; });

    devoluciones.unshift({
      id: 'dev-' + devolucionesSeq,
      consecutivo, motivo: motivoLabel, fecha: fechaLabel, responsable,
      estado: 'pendiente', confirmaFarmacia: null,
      meds: devMeds
    });
    renderDevolucionesList();
    const activeDevChip = document.querySelector('#chipgroup-devoluciones-estado .chip-filter.active');
    if(activeDevChip) applyDevolucionesFilter(activeDevChip.getAttribute('data-filter'));

    closeReturnModal();
    clearSelection();
    renderMedRows();
    applyFilters();
    showToast(`Devolución ${consecutivo} generada correctamente`);
  });

  let returnClockTimer = null;
  function updateReturnClock(){
    document.getElementById('return-hora-registro').textContent = new Date().toTimeString().slice(0,5);
  }
  function startReturnClock(){
    updateReturnClock();
    clearInterval(returnClockTimer);
    returnClockTimer = setInterval(updateReturnClock, 1000);
  }
  function stopReturnClock(){
    clearInterval(returnClockTimer);
    returnClockTimer = null;
  }

  /* ================= SOLICITUDES: datos y render ================= */
  const solicitudes = [
    { id:'orden-478', consecutivo:'SOL-000478', prioridad:'normal', solicitadoPor:'Enf. Manuel Hernández',
      fecha:'02 May 2026 · 08:10', fechaISO: shiftDate(TODAY_DATE, -1), estado:'despachada',
      items:[
        { nombre:'Enoxaparina sódica 40 mg solución inyectable', cantidad:'3 unidades', prioridad:'normal', estado:'despachada' },
        { nombre:'Acetaminofén 500 mg tableta', cantidad:'3 unidades', prioridad:'normal', estado:'despachada' },
      ] },
    { id:'orden-479', consecutivo:'SOL-000479', prioridad:'urgente', solicitadoPor:'Enf. Manuel Hernández',
      fecha:'02 May 2026 · 09:45', fechaISO: shiftDate(TODAY_DATE, -1), estado:'mixto',
      items:[
        { nombre:'Vancomicina 1 g solución inyectable', cantidad:'2 unidades', prioridad:'urgente', estado:'aprobada' },
        { nombre:'Insulina cristalina 100 UI/ml solución inyectable', cantidad:'1 unidad', prioridad:'urgente', estado:'rechazada' },
      ] },
    { id:'orden-481', consecutivo:'SOL-000481', prioridad:'normal', solicitadoPor:'Enf. Laura Gómez',
      fecha:'02 May 2026 · 10:15', fechaISO: shiftDate(TODAY_DATE, -3), estado:'despachada',
      items:[ { nombre:'Ceftriaxona sódica 1 g solución inyectable', cantidad:'4 unidades', prioridad:'normal', estado:'despachada' } ] },
    { id:'orden-486', consecutivo:'SOL-000486', prioridad:'urgente', solicitadoPor:'Enf. Manuel Hernández',
      fecha:'02 May 2026 · 13:20', fechaISO: shiftDate(TODAY_DATE, 0), estado:'pendiente',
      items:[ { nombre:'Tramadol 50 mg solución inyectable', esPRN:true, cantidad:'2 unidades', prioridad:'urgente', estado:'pendiente' } ] },
    { id:'orden-490', consecutivo:'SOL-000490', prioridad:'normal', solicitadoPor:'Enf. Laura Gómez',
      fecha:'02 May 2026 · 12:05', fechaISO: shiftDate(TODAY_DATE, -1), estado:'aprobada',
      items:[
        { nombre:'Cloruro de sodio 0.9% 500 ml solución para infusión', cantidad:'2 bolsas', prioridad:'normal', estado:'aprobada' },
        { nombre:'Catéter venoso periférico N° 20', esInsumo:true, cantidad:'2 unidades', prioridad:'normal', estado:'aprobada' },
        { nombre:'Apósito transparente estéril 10x12 cm', esInsumo:true, cantidad:'3 unidades', prioridad:'normal', estado:'aprobada' },
      ] },
  ];
  let solicitudesSeq = 490;

  const SOL_PRIORIDAD_BADGE = {
    normal: '<span class="order-badge normal">Normal</span>',
    urgente: '<span class="order-badge urgente">Urgente</span>',
  };
  const SOL_ESTADO_BADGE = {
    pendiente: '<span class="order-badge pendiente">Pendiente</span>',
    aprobada: '<span class="order-badge aprobada">Aprobada</span>',
    despachada: '<span class="order-badge despachada">Despachada</span>',
    rechazada: '<span class="order-badge rechazada">Rechazada</span>',
    mixto: '<span class="order-badge mixto">Mixto</span>',
    cancelada: '<span class="order-badge no-solicitado">Cancelada</span>',
  };

  function renderSolicitudesList(){
    const container = document.getElementById('solicitudes-list');
    container.innerHTML = solicitudes.map(sol=>{
      const itemsHtml = sol.items.map(item=>{
        const etiqueta = item.esInsumo ? ' <span class="row-indent-sub">Insumo</span>' : item.esPRN ? ' <span class="row-indent-sub">PRN</span>' : '';
        return `
          <div class="sol-item-row sol-grid-cols">
            <span></span>
            <span></span>
            <span><div class="row-indent"><span class="row-indent-icon">↳</span>${item.nombre}${etiqueta}</div></span>
            <span>${SOL_PRIORIDAD_BADGE[item.prioridad]}</span>
            <span class="dev-cell muted">${item.cantidad}</span>
            <span></span>
            <span>${SOL_ESTADO_BADGE[item.estado]}</span>
            <span></span>
          </div>`;
      }).join('');

      const accionCancelar = sol.estado === 'pendiente'
        ? `<button type="button" class="dev-icon-btn" title="Cancelar pedido" data-cancelar-solicitud="${sol.id}">
             <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
           </button>`
        : '';

      return `
        <div class="dev-order" data-order-id="${sol.id}" data-estado="${sol.estado}" data-prioridad="${sol.prioridad}" data-fecha-iso="${sol.fechaISO || ''}">
          <div class="dev-order-header sol-grid-cols">
            <button type="button" class="row-expand-btn" aria-expanded="false" data-group="${sol.id}" title="Ver medicamentos de esta solicitud">
              <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <span class="dev-consecutivo">${sol.consecutivo}</span>
            <span><span class="child-count-badge">${sol.items.length} ítem${sol.items.length === 1 ? '' : 's'}</span></span>
            <span>${SOL_PRIORIDAD_BADGE[sol.prioridad]}</span>
            <span class="dev-cell">${sol.solicitadoPor}</span>
            <span class="dev-cell">${sol.fecha}</span>
            <span>${SOL_ESTADO_BADGE[sol.estado]}</span>
            <div class="dev-actions-cell">
              ${accionCancelar}
              <button type="button" class="dev-icon-btn" title="Ver detalle" data-sol-action="ver">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button type="button" class="dev-icon-btn" title="Imprimir" data-sol-action="imprimir">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              </button>
              <button type="button" class="dev-icon-btn" title="Más opciones" data-sol-action="mas">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
            </div>
          </div>
          <div class="recep-order-body collapsed" data-parent-group="${sol.id}">
            ${itemsHtml}
          </div>
        </div>`;
    }).join('');

    const totalItems = solicitudes.reduce((sum, s) => sum + s.items.length, 0);
    const footerCount = document.getElementById('solicitudes-footer-count');
    if(footerCount) footerCount.textContent = `${solicitudes.length} solicitudes · ${totalItems} ítems · turno actual`;
  }
  renderSolicitudesList();

  let solicitudesEstadoFilter = 'todas';
  let solicitudesDateFilter = null;
  let solicitudesPrioridadFilter = null;

  function applySolicitudesFilter(){
    let visibleCount = 0;
    document.querySelectorAll('#solicitudes-list .dev-order[data-order-id]').forEach(orderEl=>{
      const estadoMatch = solicitudesEstadoFilter === 'todas' || orderEl.getAttribute('data-estado') === solicitudesEstadoFilter;
      const fechaISO = orderEl.getAttribute('data-fecha-iso');
      const fechaMatch = !solicitudesDateFilter || (fechaISO >= solicitudesDateFilter.from && fechaISO <= solicitudesDateFilter.to);
      const prioridadMatch = !solicitudesPrioridadFilter || orderEl.getAttribute('data-prioridad') === solicitudesPrioridadFilter;
      const match = estadoMatch && fechaMatch && prioridadMatch;
      orderEl.classList.toggle('filtered-out', !match);
      if(match) visibleCount++;
    });
    const footerCount = document.getElementById('solicitudes-footer-count');
    if(footerCount) footerCount.textContent = visibleCount + ' solicitud' + (visibleCount === 1 ? '' : 'es') + ' · turno actual';
  }
  document.querySelectorAll('#chipgroup-solicitudes-estado .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      document.querySelectorAll('#chipgroup-solicitudes-estado .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      solicitudesEstadoFilter = chip.getAttribute('data-filter');
      applySolicitudesFilter();
    });
  });

  document.querySelectorAll('#chipgroup-solicitudes-fecha .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const yaActivo = chip.classList.contains('active');
      document.querySelectorAll('#chipgroup-solicitudes-fecha .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      document.getElementById('sol-date-range-label').textContent = 'Rango personalizado';
      document.getElementById('sol-date-from').value = '';
      document.getElementById('sol-date-to').value = '';
      if(yaActivo){
        solicitudesDateFilter = null;
      } else {
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
        const modo = chip.getAttribute('data-quickdate');
        solicitudesDateFilter = modo === 'hoy'
          ? { from: TODAY_DATE, to: TODAY_DATE }
          : { from: shiftDate(TODAY_DATE, -6), to: TODAY_DATE };
      }
      applySolicitudesFilter();
    });
  });

  setupPopover('sol-date-popover-wrap', 'sol-date-popover-btn', 'sol-date-popover');
  document.getElementById('sol-date-apply-btn').addEventListener('click', ()=>{
    const from = document.getElementById('sol-date-from').value;
    const to = document.getElementById('sol-date-to').value;
    if(from && to){
      solicitudesDateFilter = { from, to };
      document.getElementById('sol-date-range-label').textContent = `${from} – ${to}`;
      document.querySelectorAll('#chipgroup-solicitudes-fecha .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      applySolicitudesFilter();
    }
    closeAllPopovers();
  });
  document.getElementById('sol-date-clear-btn').addEventListener('click', ()=>{
    document.getElementById('sol-date-from').value = '';
    document.getElementById('sol-date-to').value = '';
    document.getElementById('sol-date-range-label').textContent = 'Rango personalizado';
    solicitudesDateFilter = null;
    applySolicitudesFilter();
    closeAllPopovers();
  });

  setupPopover('sol-more-popover-wrap', 'sol-more-popover-btn', 'sol-more-popover');
  document.querySelectorAll('#sol-prioridad-chip-group .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const yaActivo = chip.classList.contains('active');
      document.querySelectorAll('#sol-prioridad-chip-group .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      if(!yaActivo){ chip.classList.add('active'); chip.setAttribute('aria-pressed', 'true'); }
    });
  });
  document.getElementById('sol-more-apply-btn').addEventListener('click', ()=>{
    const activa = document.querySelector('#sol-prioridad-chip-group .chip-filter.active');
    solicitudesPrioridadFilter = activa ? activa.getAttribute('data-prioridad') : null;
    const badge = document.getElementById('sol-more-badge-count');
    if(solicitudesPrioridadFilter){ badge.textContent = '1'; badge.style.display = 'inline-flex'; }
    else { badge.style.display = 'none'; }
    applySolicitudesFilter();
    closeAllPopovers();
  });
  document.getElementById('sol-more-clear-btn').addEventListener('click', ()=>{
    document.querySelectorAll('#sol-prioridad-chip-group .chip-filter').forEach(c=>{
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    solicitudesPrioridadFilter = null;
    document.getElementById('sol-more-badge-count').style.display = 'none';
    applySolicitudesFilter();
    closeAllPopovers();
  });

  document.getElementById('solicitudes-list').addEventListener('click', (e)=>{
    const cancelBtn = e.target.closest('[data-cancelar-solicitud]');
    if(cancelBtn){
      const sol = solicitudes.find(s => s.id === cancelBtn.getAttribute('data-cancelar-solicitud'));
      if(sol && sol.estado === 'pendiente'){
        sol.estado = 'cancelada';
        sol.items.forEach(item => { item.estado = 'cancelada'; });
        renderSolicitudesList();
        applySolicitudesFilter();
        showToast(`Pedido ${sol.consecutivo} cancelado`);
      }
      return;
    }
    const actionBtn = e.target.closest('[data-sol-action]');
    if(actionBtn) showToast('Esta acción estará disponible próximamente');
  });

  /* ================= DEVOLUCIONES: datos y render ================= */
  const devoluciones = [
    { id:'dev-1', consecutivo:'DEV-000001', motivo:'Cambio de orden médica', fecha:'01 May 2026 · 19:40', responsable:'Enf. Manuel Hernández',
      estado:'confirmada', confirmaFarmacia:'02 May 2026 · 07:15',
      meds:[{ nombre:'Dexametasona 4 mg solución inyectable', cantidad:'1 unidad', lote:'L-77210', vencimiento:'2027-03-31' }] },
    { id:'dev-2', consecutivo:'DEV-000002', motivo:'Sobrante de dispensación', fecha:'30 Abr 2026 · 08:05', responsable:'Enf. Laura Gómez',
      estado:'confirmada', confirmaFarmacia:'30 Abr 2026 · 10:20',
      meds:[{ nombre:'Omeprazol sódico 40 mg solución inyectable', cantidad:'2 unidades', lote:'L-50213', vencimiento:'2026-08-31' }] },
    { id:'dev-3', consecutivo:'DEV-000003', motivo:'Suspensión de tratamiento', fecha:'02 May 2026 · 09:10', responsable:'Enf. Manuel Hernández',
      estado:'pendiente', confirmaFarmacia:null,
      meds:[{ nombre:'Metamizol 2.5 g / 5 ml solución inyectable (Novalgina)', cantidad:'1 unidad', lote:'L-61840', vencimiento:'2026-07-31' }] },
  ];
  let devolucionesSeq = devoluciones.length;

  const DEV_ESTADO_BADGE = {
    confirmada: '<span class="order-badge recibido">Confirmada por farmacia</span>',
    pendiente: '<span class="order-badge pendiente">Pendiente</span>',
    rechazada: '<span class="order-badge rechazada">Rechazada</span>',
  };

  function renderDevolucionesList(){
    const container = document.getElementById('devoluciones-list');
    container.innerHTML = devoluciones.map(dev=>{
      const medsHtml = dev.meds.map((med, i)=>{
        const group = dev.id + '-med-' + i;
        return `
          <div class="recep-med">
            <button type="button" class="row-expand-btn" aria-expanded="false" data-group="${group}" title="Ver detalle de lote">
              <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <span class="recep-med-name">${med.nombre}</span>
          </div>
          <div class="recep-med-detail collapsed" data-parent-group="${group}">
            <table class="detail-table">
              <thead><tr><th>Medicamento</th><th>Cantidad devuelta</th><th>Lote</th><th>Vencimiento</th></tr></thead>
              <tbody>
                <tr>
                  <td>${med.nombre}</td>
                  <td class="cant-entregada">${med.cantidad}</td>
                  <td>${med.lote || '—'}</td>
                  <td>${med.vencimiento || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>`;
      }).join('');

      return `
        <div class="dev-order" data-order-id="${dev.id}" data-estado="${dev.estado}">
          <div class="dev-order-header dev-grid-cols">
            <button type="button" class="row-expand-btn" aria-expanded="false" data-group="${dev.id}" title="Ver medicamentos devueltos">
              <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <span class="dev-consecutivo">${dev.consecutivo}</span>
            <span class="dev-cell">${dev.motivo}</span>
            <span class="dev-cell">${dev.fecha}</span>
            <span class="dev-cell">${dev.responsable}</span>
            <span>${DEV_ESTADO_BADGE[dev.estado]}</span>
            <span class="dev-cell muted">${dev.confirmaFarmacia || '—'}</span>
            <div class="dev-actions-cell">
              <button type="button" class="dev-icon-btn" title="Ver detalle" data-dev-action="ver">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button type="button" class="dev-icon-btn" title="Imprimir" data-dev-action="imprimir">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              </button>
              <button type="button" class="dev-icon-btn" title="Más opciones" data-dev-action="mas">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
            </div>
          </div>
          <div class="recep-order-body collapsed" data-parent-group="${dev.id}">
            ${medsHtml}
          </div>
        </div>`;
    }).join('');

    const footerCount = document.getElementById('devoluciones-footer-count');
    if(footerCount) footerCount.textContent = `${devoluciones.length} devoluciones · turno actual`;
  }
  renderDevolucionesList();

  function applyDevolucionesFilter(filterValue){
    let visibleCount = 0;
    document.querySelectorAll('#subpanel-devoluciones .dev-order[data-estado]').forEach(orderEl=>{
      const match = filterValue === 'todas' || orderEl.getAttribute('data-estado') === filterValue;
      orderEl.classList.toggle('filtered-out', !match);
      if(match) visibleCount++;
    });
    const footerCount2 = document.getElementById('devoluciones-footer-count');
    if(footerCount2) footerCount2.textContent = visibleCount + ' devolucion' + (visibleCount === 1 ? '' : 'es') + ' · turno actual';
  }
  document.querySelectorAll('#chipgroup-devoluciones-estado .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      document.querySelectorAll('#chipgroup-devoluciones-estado .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      applyDevolucionesFilter(chip.getAttribute('data-filter'));
    });
  });

  document.getElementById('devoluciones-list').addEventListener('click', (e)=>{
    const actionBtn = e.target.closest('.dev-icon-btn');
    if(actionBtn) showToast('Esta acción estará disponible próximamente');
  });

  /* ================= ÓRDENES MÉDICAS: datos, render, selección y "Programar" ================= */
  const ordenesMedicas = [
    { id:'ome-1403', consecutivo:'OME-1403', fecha:'27 de jul de 2026, 18:01', fechaISO: shiftDate(TODAY_DATE, 0), medico:'Daniel Antonio Martínez',
      items:[
        { id:'ome-1403-0', desc:'Acetaminofén 500 mg tableta', prioridad:'Normal', dosis:'500 mg', frecuencia:'Cada 4 horas', via:'ORAL', duracion:'24 horas', enfermera:'-', estadoProgramacion:'pendiente', estadoPedido:'no_solicitado', cantPedida:'0/6', aplicadas:'0 de 6' },
      ] },
    { id:'ome-1398', consecutivo:'OME-1398', fecha:'27 de jul de 2026, 14:20', fechaISO: shiftDate(TODAY_DATE, 0), medico:'Carolina Restrepo',
      items:[
        { id:'ome-1398-0', desc:'Ceftriaxona 1 g solución inyectable', prioridad:'Urgente', dosis:'1 g', frecuencia:'Cada 12 horas', via:'IV', duracion:'5 días', enfermera:'-', estadoProgramacion:'pendiente', estadoPedido:'no_solicitado', cantPedida:'0/10', aplicadas:'0 de 10' },
        { id:'ome-1398-1', desc:'Omeprazol sódico 40 mg solución inyectable', prioridad:'Normal', dosis:'40 mg', frecuencia:'Cada 24 horas', via:'IV', duracion:'5 días', enfermera:'-', estadoProgramacion:'pendiente', estadoPedido:'no_solicitado', cantPedida:'0/5', aplicadas:'0 de 5' },
      ] },
    { id:'ome-1390', consecutivo:'OME-1390', fecha:'26 de jul de 2026, 09:15', fechaISO: shiftDate(TODAY_DATE, -2), medico:'Daniel Antonio Martínez',
      items:[
        { id:'ome-1390-0', desc:'Enoxaparina sódica 40 mg solución inyectable', prioridad:'Normal', dosis:'40 mg', frecuencia:'Cada 24 horas', via:'SC', duracion:'7 días', enfermera:'Enf. Manuel Hernández', estadoProgramacion:'programada', estadoPedido:'solicitado', cantPedida:'6/7', aplicadas:'3 de 7' },
      ] },
  ];
  const selectedOmeItems = new Set();

  const OME_PROGRAMACION_BADGE = {
    pendiente: '<span class="order-badge pendiente">Pendiente</span>',
    programada: '<span class="order-badge programada">Programada</span>',
  };
  const OME_PEDIDO_BADGE = {
    no_solicitado: '<span class="order-badge no-solicitado">No solicitado</span>',
    solicitado: '<span class="order-badge solicitado">Solicitado</span>',
  };

  function findOmeItemById(id){
    for(const orden of ordenesMedicas){
      const item = orden.items.find(i => i.id === id);
      if(item) return item;
    }
    return null;
  }

  function renderOrdenesList(){
    const container = document.getElementById('ordenes-list');
    container.innerHTML = ordenesMedicas.map(orden=>{
      const rows = orden.items.map(item=>{
        const checked = selectedOmeItems.has(item.id);
        const prioridadCell = item.prioridad === 'Urgente'
          ? `<td style="color:var(--red);font-weight:600;">${item.prioridad}</td>`
          : `<td class="ome-muted">${item.prioridad}</td>`;
        let actionCell;
        if(item.estadoProgramacion === 'pendiente'){
          actionCell = `<button type="button" class="btn btn-primary btn-sm btn-programar" data-programar-item="${item.id}">
               <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="m9 16 2 2 4-4"/></svg>
               Programar
             </button>`;
        } else if(item.estadoPedido === 'no_solicitado'){
          actionCell = `<button type="button" class="btn btn-primary btn-sm btn-programar" data-pedir-item="${item.id}">
               <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
               Pedir a farmacia
             </button>`;
        } else {
          actionCell = `<span class="ome-muted" style="font-size:12px;">—</span>`;
        }
        return `
          <tr class="${checked ? 'selected' : ''}" data-item-id="${item.id}">
            <td class="ome-check-cell"><input type="checkbox" data-ome-check="${item.id}" ${checked ? 'checked' : ''} aria-label="Seleccionar ${item.desc}"></td>
            <td class="ome-desc">${item.desc}</td>
            ${prioridadCell}
            <td>${item.dosis}</td>
            <td>${item.frecuencia}</td>
            <td>${item.via}</td>
            <td>${item.duracion}</td>
            <td class="ome-muted">${item.enfermera}</td>
            <td>${OME_PROGRAMACION_BADGE[item.estadoProgramacion]}</td>
            <td>${OME_PEDIDO_BADGE[item.estadoPedido]}</td>
            <td>${item.cantPedida}</td>
            <td>${item.aplicadas}</td>
            <td>
              <div class="ome-actions-cell">
                ${actionCell}
                <button type="button" class="dev-icon-btn" title="Más opciones" data-ome-more="${item.id}">
                  <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </div>
            </td>
          </tr>`;
      }).join('');

      const pendCount = orden.items.filter(i => i.estadoProgramacion === 'pendiente').length;
      const progCount = orden.items.length - pendCount;
      let ordenEstado, estadoBadgeHtml;
      if(pendCount === 0){
        ordenEstado = 'programada';
        estadoBadgeHtml = '<span class="order-badge programada">Programada</span>';
      } else if(progCount === 0){
        ordenEstado = 'pendiente';
        estadoBadgeHtml = '<span class="order-badge pendiente">Pendiente</span>';
      } else {
        ordenEstado = 'pendiente';
        estadoBadgeHtml = '<span class="order-badge pendiente">Pendiente</span><span class="partial-flag" title="Algunos medicamentos de esta orden ya están programados"><svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>Parcial</span>';
      }

      return `
        <div class="ome-order" data-order-id="${orden.id}" data-estado="${ordenEstado}" data-fecha-iso="${orden.fechaISO || ''}" data-prioridades="${orden.items.map(i=>i.prioridad).join(',')}">
          <div class="ome-order-header ome-grid-cols">
            <button type="button" class="row-expand-btn" aria-expanded="true" data-group="${orden.id}" title="Ver medicamentos de esta orden">
              <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <span class="ome-order-number">${orden.consecutivo}</span>
            <span class="ome-order-cell">${orden.medico}</span>
            <span class="ome-order-cell">${orden.fecha}</span>
            <span class="ome-order-badge">${orden.items.length} medicamento${orden.items.length === 1 ? '' : 's'}</span>
            <span>${estadoBadgeHtml}</span>
            <div class="ome-order-actions-cell">
              <button type="button" class="dev-icon-btn" title="Ver detalle" data-ome-order-action="ver">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button type="button" class="dev-icon-btn" title="Imprimir" data-ome-order-action="imprimir">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              </button>
              <button type="button" class="dev-icon-btn" title="Más opciones" data-ome-order-action="mas">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
            </div>
          </div>
          <div class="ome-order-body" data-parent-group="${orden.id}">
            <div class="ome-table-wrap">
              <table class="ome-table">
                <thead>
                  <tr>
                    <th></th><th>Descripción</th><th>Prioridad</th><th>Dosis</th><th>Frecuencia</th><th>Vía</th>
                    <th>Duración</th><th>Enfermera</th><th>Est. programación</th><th>Est. pedido</th>
                    <th>Cant. pedida</th><th>Aplicadas</th><th>Acción</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        </div>`;
    }).join('');

    const footerCount = document.getElementById('ordenes-footer-count');
    if(footerCount) footerCount.textContent = `${ordenesMedicas.length} órdenes · turno actual`;
  }
  renderOrdenesList();

  /* ================= OTROS ORDENAMIENTOS ================= */
  const otrosOrdenamientos = [
    { id:'oo-1', descripcion:'Hemograma completo', tipo:'Laboratorio', prioridad:'normal', medico:'Daniel Antonio Martínez', fecha:'28 de jul de 2026, 07:40', fechaISO: shiftDate(TODAY_DATE, 0), estado:'pendiente' },
    { id:'oo-2', descripcion:'Radiografía de tórax PA y lateral', tipo:'Imagenología', prioridad:'urgente', medico:'Carolina Restrepo', fecha:'27 de jul de 2026, 16:10', fechaISO: shiftDate(TODAY_DATE, -1), estado:'programado' },
    { id:'oo-3', descripcion:'Interconsulta cardiología', tipo:'Interconsulta', prioridad:'normal', medico:'Daniel Antonio Martínez', fecha:'26 de jul de 2026, 11:00', fechaISO: shiftDate(TODAY_DATE, -2), estado:'realizado' },
  ];

  const OO_ESTADO_BADGE = {
    pendiente: '<span class="order-badge pendiente">Pendiente</span>',
    programado: '<span class="order-badge programada">Programado</span>',
    realizado: '<span class="order-badge recibido">Realizado</span>',
  };

  function renderOtrosOrdenamientosList(){
    const tbody = document.getElementById('otros-ordenamientos-tbody');
    tbody.innerHTML = otrosOrdenamientos.map(oo=>{
      const accion = oo.estado === 'pendiente'
        ? `<button type="button" class="btn btn-primary btn-sm btn-programar" data-programar-otro="${oo.id}">Programar</button>`
        : `<span class="ome-muted" style="font-size:12px;">—</span>`;
      return `
        <tr data-order-id="${oo.id}" data-estado="${oo.estado}" data-tipo="${oo.tipo}" data-fecha-iso="${oo.fechaISO}">
          <td class="cell-primary">${oo.descripcion}</td>
          <td>${oo.tipo}</td>
          <td>${SOL_PRIORIDAD_BADGE[oo.prioridad]}</td>
          <td>${oo.medico}</td>
          <td>${oo.fecha}</td>
          <td>${OO_ESTADO_BADGE[oo.estado]}</td>
          <td>${accion}</td>
        </tr>`;
    }).join('');
    const footerCount = document.getElementById('otros-ordenamientos-footer-count');
    if(footerCount) footerCount.textContent = `${otrosOrdenamientos.length} ordenamientos · turno actual`;
  }
  renderOtrosOrdenamientosList();

  document.getElementById('otros-ordenamientos-tbody').addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-programar-otro]');
    if(btn) showToast('Esta acción estará disponible próximamente');
  });

  let otrosEstadoFilter = 'todas';
  let otrosDateFilter = null;
  let otrosTipoFilter = null;

  function applyOtrosOrdenamientosFilter(){
    let visibleCount = 0;
    document.querySelectorAll('#otros-ordenamientos-tbody tr[data-order-id]').forEach(tr=>{
      const estadoMatch = otrosEstadoFilter === 'todas' || tr.getAttribute('data-estado') === otrosEstadoFilter;
      const fechaISO = tr.getAttribute('data-fecha-iso');
      const fechaMatch = !otrosDateFilter || (fechaISO >= otrosDateFilter.from && fechaISO <= otrosDateFilter.to);
      const tipoMatch = !otrosTipoFilter || tr.getAttribute('data-tipo') === otrosTipoFilter;
      const match = estadoMatch && fechaMatch && tipoMatch;
      tr.classList.toggle('filtered-out', !match);
      if(match) visibleCount++;
    });
    const footerCount = document.getElementById('otros-ordenamientos-footer-count');
    if(footerCount) footerCount.textContent = visibleCount + ' ordenamiento' + (visibleCount === 1 ? '' : 's') + ' · turno actual';
  }
  document.querySelectorAll('#chipgroup-otros-estado .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      document.querySelectorAll('#chipgroup-otros-estado .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      otrosEstadoFilter = chip.getAttribute('data-filter');
      applyOtrosOrdenamientosFilter();
    });
  });

  document.querySelectorAll('#chipgroup-otros-fecha .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const yaActivo = chip.classList.contains('active');
      document.querySelectorAll('#chipgroup-otros-fecha .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      document.getElementById('otros-date-range-label').textContent = 'Rango personalizado';
      document.getElementById('otros-date-from').value = '';
      document.getElementById('otros-date-to').value = '';
      if(yaActivo){
        otrosDateFilter = null;
      } else {
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
        const modo = chip.getAttribute('data-quickdate');
        otrosDateFilter = modo === 'hoy'
          ? { from: TODAY_DATE, to: TODAY_DATE }
          : { from: shiftDate(TODAY_DATE, -6), to: TODAY_DATE };
      }
      applyOtrosOrdenamientosFilter();
    });
  });

  setupPopover('otros-date-popover-wrap', 'otros-date-popover-btn', 'otros-date-popover');
  document.getElementById('otros-date-apply-btn').addEventListener('click', ()=>{
    const from = document.getElementById('otros-date-from').value;
    const to = document.getElementById('otros-date-to').value;
    if(from && to){
      otrosDateFilter = { from, to };
      document.getElementById('otros-date-range-label').textContent = `${from} – ${to}`;
      document.querySelectorAll('#chipgroup-otros-fecha .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      applyOtrosOrdenamientosFilter();
    }
    closeAllPopovers();
  });
  document.getElementById('otros-date-clear-btn').addEventListener('click', ()=>{
    document.getElementById('otros-date-from').value = '';
    document.getElementById('otros-date-to').value = '';
    document.getElementById('otros-date-range-label').textContent = 'Rango personalizado';
    otrosDateFilter = null;
    applyOtrosOrdenamientosFilter();
    closeAllPopovers();
  });

  setupPopover('otros-more-popover-wrap', 'otros-more-popover-btn', 'otros-more-popover');
  document.querySelectorAll('#otros-tipo-chip-group .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const yaActivo = chip.classList.contains('active');
      document.querySelectorAll('#otros-tipo-chip-group .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      if(!yaActivo){ chip.classList.add('active'); chip.setAttribute('aria-pressed', 'true'); }
    });
  });
  document.getElementById('otros-more-apply-btn').addEventListener('click', ()=>{
    const activa = document.querySelector('#otros-tipo-chip-group .chip-filter.active');
    otrosTipoFilter = activa ? activa.getAttribute('data-tipo') : null;
    const badge = document.getElementById('otros-more-badge-count');
    if(otrosTipoFilter){ badge.textContent = '1'; badge.style.display = 'inline-flex'; }
    else { badge.style.display = 'none'; }
    applyOtrosOrdenamientosFilter();
    closeAllPopovers();
  });
  document.getElementById('otros-more-clear-btn').addEventListener('click', ()=>{
    document.querySelectorAll('#otros-tipo-chip-group .chip-filter').forEach(c=>{
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    otrosTipoFilter = null;
    document.getElementById('otros-more-badge-count').style.display = 'none';
    applyOtrosOrdenamientosFilter();
    closeAllPopovers();
  });

  function parseFrecuenciaHoras(frecuencia){
    const m = frecuencia.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 24;
  }
  function parseDuracionHoras(duracion){
    const m = duracion.match(/(\d+)/);
    if(!m) return 24;
    const n = parseInt(m[1], 10);
    return /d[ií]a/i.test(duracion) ? n * 24 : n;
  }
  function computeScheduleByDate(frecuencia, duracion, horaInicioStr, startDateStr){
    const intervalo = parseFrecuenciaHoras(frecuencia);
    const duracionHoras = parseDuracionHoras(duracion);
    const startHour = parseInt((horaInicioStr || '00:00').split(':')[0], 10);
    const startMin = parseInt((horaInicioStr || '00:00').split(':')[1] || '0', 10);
    const totalDosisEsquema = Math.ceil(duracionHoras / intervalo);

    const byDate = {};
    let date = startDateStr;
    let hourCursor = startHour;
    for(let i = 0; i < totalDosisEsquema; i++){
      if(!byDate[date]) byDate[date] = [];
      byDate[date].push(hourCursor);
      hourCursor += intervalo;
      while(hourCursor >= 24){ hourCursor -= 24; date = shiftDate(date, 1); }
    }
    return { byDate, totalDosisEsquema, startMin };
  }

  function programarItems(ids, fechaInicioStr, horaInicioStr){
    const profesionalLabel = CURRENT_USER_NAME.startsWith('Enf.') ? CURRENT_USER_NAME : 'Enf. ' + CURRENT_USER_NAME;
    ids.forEach(id=>{
      const item = findOmeItemById(id);
      if(!item) return;

      const { byDate, totalDosisEsquema } = computeScheduleByDate(item.frecuencia, item.duracion, horaInicioStr, fechaInicioStr);
      const markersByDate = {};
      Object.keys(byDate).forEach(dateStr=>{
        markersByDate[dateStr] = {};
        byDate[dateStr].forEach(h => { markersByDate[dateStr][h] = 'scheduled'; });
      });

      MEDS.unshift({
        name: item.desc.toUpperCase(),
        dose: item.dosis, freq: 'c/' + parseFrecuenciaHoras(item.frecuencia) + 'h', via: item.via, estado: 'activo',
        lote: 'Pendiente de recepción', vencimiento: '—',
        profesional: profesionalLabel,
        markersByDate,
        omeItemId: item.id, pendienteRecepcion: true
      });

      item.estadoProgramacion = 'programada';
      item.enfermera = profesionalLabel;
      item.cantPedida = '0/' + totalDosisEsquema;
      selectedOmeItems.delete(id);
    });

    renderOrdenesList();
    updateOmeSelectionUI();
    const activeChip = document.querySelector('#chipgroup-ordenes-estado .chip-filter.active');
    if(activeChip) applyOrdenesFilter();

    renderMedRows();
    applyFilters();

    showToast(ids.length === 1 ? 'Medicamento programado correctamente' : `${ids.length} medicamentos programados correctamente`);
  }

  function pedirAFarmacia(ids){ openPedidoModal(ids); }

  function updateOmeSelectionUI(){
    const count = selectedOmeItems.size;
    const toolbar = document.getElementById('ome-selection-toolbar');
    document.getElementById('ome-sel-count').textContent = count;
    const actionsWrap = document.getElementById('ome-sel-actions');
    actionsWrap.innerHTML = '';
    if(count === 0){ toolbar.classList.remove('open'); return; }
    toolbar.classList.add('open');

    const items = Array.from(selectedOmeItems).map(findOmeItemById).filter(Boolean);
    const allPendientes = items.every(i => i.estadoProgramacion === 'pendiente');
    const allListosParaPedir = items.every(i => i.estadoProgramacion === 'programada' && i.estadoPedido === 'no_solicitado');

    if(allPendientes){
      actionsWrap.innerHTML = `
        <button class="btn btn-primary" id="ome-bulk-programar-btn" type="button">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="m9 16 2 2 4-4"/></svg>
          Programar seleccionados
        </button>`;
      document.getElementById('ome-bulk-programar-btn').addEventListener('click', ()=>{
        openProgramModal(Array.from(selectedOmeItems));
      });
    } else if(allListosParaPedir){
      actionsWrap.innerHTML = `
        <button class="btn btn-primary" id="ome-bulk-pedir-btn" type="button">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
          Pedir a farmacia
        </button>`;
      document.getElementById('ome-bulk-pedir-btn').addEventListener('click', ()=>{
        pedirAFarmacia(Array.from(selectedOmeItems));
      });
    } else {
      actionsWrap.innerHTML = `<span class="sel-hint">Selecciona medicamentos con el mismo estado para aplicar una acción masiva</span>`;
    }
  }

  document.getElementById('ordenes-list').addEventListener('change', (e)=>{
    const cb = e.target.closest('[data-ome-check]');
    if(!cb) return;
    const itemId = cb.getAttribute('data-ome-check');
    if(cb.checked) selectedOmeItems.add(itemId); else selectedOmeItems.delete(itemId);
    const tr = cb.closest('tr');
    if(tr) tr.classList.toggle('selected', cb.checked);
    updateOmeSelectionUI();
  });

  document.getElementById('ordenes-list').addEventListener('click', (e)=>{
    const programarBtn = e.target.closest('[data-programar-item]');
    if(programarBtn){ openProgramModal([programarBtn.getAttribute('data-programar-item')]); return; }
    const pedirBtn = e.target.closest('[data-pedir-item]');
    if(pedirBtn){ pedirAFarmacia([pedirBtn.getAttribute('data-pedir-item')]); return; }
    const moreBtn = e.target.closest('[data-ome-more]');
    if(moreBtn){ showToast('Esta acción estará disponible próximamente'); return; }
    const orderActionBtn = e.target.closest('[data-ome-order-action]');
    if(orderActionBtn){ showToast('Esta acción estará disponible próximamente'); }
  });

  document.getElementById('ome-sel-cancel-btn').addEventListener('click', ()=>{
    selectedOmeItems.clear();
    renderOrdenesList();
    updateOmeSelectionUI();
  });

  let ordenesEstadoFilter = 'todas';
  let ordenesDateFilter = null;
  let ordenesPrioridadFilter = null;

  function applyOrdenesFilter(){
    let visibleCount = 0;
    document.querySelectorAll('#panel-ordenes .ome-order[data-estado]').forEach(orderEl=>{
      const estadoMatch = ordenesEstadoFilter === 'todas' || orderEl.getAttribute('data-estado') === ordenesEstadoFilter;
      const fechaISO = orderEl.getAttribute('data-fecha-iso');
      const fechaMatch = !ordenesDateFilter || (fechaISO >= ordenesDateFilter.from && fechaISO <= ordenesDateFilter.to);
      const prioridades = (orderEl.getAttribute('data-prioridades') || '').split(',');
      const prioridadMatch = !ordenesPrioridadFilter || prioridades.includes(ordenesPrioridadFilter);
      const match = estadoMatch && fechaMatch && prioridadMatch;
      orderEl.classList.toggle('filtered-out', !match);
      if(match) visibleCount++;
    });
    const footerCount = document.getElementById('ordenes-footer-count');
    if(footerCount) footerCount.textContent = visibleCount + ' orden' + (visibleCount === 1 ? '' : 'es') + ' · turno actual';
  }
  document.querySelectorAll('#chipgroup-ordenes-estado .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      document.querySelectorAll('#chipgroup-ordenes-estado .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      ordenesEstadoFilter = chip.getAttribute('data-filter');
      applyOrdenesFilter();
    });
  });

  document.querySelectorAll('#chipgroup-ordenes-fecha .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const yaActivo = chip.classList.contains('active');
      document.querySelectorAll('#chipgroup-ordenes-fecha .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      document.getElementById('ome-date-range-label').textContent = 'Rango personalizado';
      document.getElementById('ome-date-from').value = '';
      document.getElementById('ome-date-to').value = '';
      if(yaActivo){
        ordenesDateFilter = null;
      } else {
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
        const modo = chip.getAttribute('data-quickdate');
        ordenesDateFilter = modo === 'hoy'
          ? { from: TODAY_DATE, to: TODAY_DATE }
          : { from: shiftDate(TODAY_DATE, -6), to: TODAY_DATE };
      }
      applyOrdenesFilter();
    });
  });

  setupPopover('ome-date-popover-wrap', 'ome-date-popover-btn', 'ome-date-popover');
  document.getElementById('ome-date-apply-btn').addEventListener('click', ()=>{
    const from = document.getElementById('ome-date-from').value;
    const to = document.getElementById('ome-date-to').value;
    if(from && to){
      ordenesDateFilter = { from, to };
      document.getElementById('ome-date-range-label').textContent = `${from} – ${to}`;
      document.querySelectorAll('#chipgroup-ordenes-fecha .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      applyOrdenesFilter();
    }
    closeAllPopovers();
  });
  document.getElementById('ome-date-clear-btn').addEventListener('click', ()=>{
    document.getElementById('ome-date-from').value = '';
    document.getElementById('ome-date-to').value = '';
    document.getElementById('ome-date-range-label').textContent = 'Rango personalizado';
    ordenesDateFilter = null;
    applyOrdenesFilter();
    closeAllPopovers();
  });

  setupPopover('ome-more-popover-wrap', 'ome-more-popover-btn', 'ome-more-popover');
  document.querySelectorAll('#ome-prioridad-chip-group .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const yaActivo = chip.classList.contains('active');
      document.querySelectorAll('#ome-prioridad-chip-group .chip-filter').forEach(c=>{
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      if(!yaActivo){ chip.classList.add('active'); chip.setAttribute('aria-pressed', 'true'); }
    });
  });
  document.getElementById('ome-more-apply-btn').addEventListener('click', ()=>{
    const activa = document.querySelector('#ome-prioridad-chip-group .chip-filter.active');
    ordenesPrioridadFilter = activa ? activa.getAttribute('data-prioridad') : null;
    const badge = document.getElementById('ome-more-badge-count');
    if(ordenesPrioridadFilter){ badge.textContent = '1'; badge.style.display = 'inline-flex'; }
    else { badge.style.display = 'none'; }
    applyOrdenesFilter();
    closeAllPopovers();
  });
  document.getElementById('ome-more-clear-btn').addEventListener('click', ()=>{
    document.querySelectorAll('#ome-prioridad-chip-group .chip-filter').forEach(c=>{
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    ordenesPrioridadFilter = null;
    document.getElementById('ome-more-badge-count').style.display = 'none';
    applyOrdenesFilter();
    closeAllPopovers();
  });

  /* ================= Modal: Programar tratamiento ================= */
  const programModalOverlay = document.getElementById('program-modal-overlay');
  let programModalItemIds = [];

  function nowTimeString(){ return new Date().toTimeString().slice(0,5); }
  function nearestQuarterHourString(){
    const d = new Date();
    let h = d.getHours();
    let m = Math.round(d.getMinutes() / 15) * 15;
    if(m === 60){ m = 0; h = (h + 1) % 24; }
    return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
  }

  function populateHoraInicioSelect(){
    const select = document.getElementById('program-hora-inicio');
    if(select.options.length > 0) return;
    let optionsHtml = '';
    for(let h = 0; h < 24; h++){
      for(let m = 0; m < 60; m += 15){
        const value = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
        optionsHtml += `<option value="${value}">${value}</option>`;
      }
    }
    select.innerHTML = optionsHtml;
  }
  populateHoraInicioSelect();

  function renderProgramPreview(){
    const fechaInicio = document.getElementById('program-fecha-inicio').value || currentViewDate;
    const horaInicio = document.getElementById('program-hora-inicio').value || nowTimeString();
    const blocksWrap = document.getElementById('program-med-blocks');
    blocksWrap.innerHTML = programModalItemIds.map(id=>{
      const item = findOmeItemById(id);
      if(!item) return '';
      const { byDate, totalDosisEsquema, startMin } = computeScheduleByDate(item.frecuencia, item.duracion, horaInicio, fechaInicio);
      const minLabel = String(startMin).padStart(2,'0');
      const dateBlocksHtml = Object.keys(byDate).sort().map(dateStr=>{
        const chips = byDate[dateStr].map(h => `<span class="program-chip">${String(h).padStart(2,'0')}:${minLabel}</span>`).join('');
        return `
          <div class="program-date-group">
            <div class="pdg-label">${dateGroupLabel(dateStr, fechaInicio)} · ${dateStr === fechaInicio ? '' : formatDateLabel(dateStr) + ' · '}${byDate[dateStr].length} dosis</div>
            <div class="program-chips">${chips}</div>
          </div>`;
      }).join('');
      return `
        <div class="program-med-block">
          <div class="program-med-block-header">
            <div class="pmb-name">${item.desc}</div>
            <div class="pmb-meta">${item.dosis} · ${item.frecuencia} · ${item.via} · ${item.duracion} — ${totalDosisEsquema} dosis en total</div>
          </div>
          ${dateBlocksHtml}
        </div>`;
    }).join('');
  }

  function openProgramModal(ids){
    if(!ids || ids.length === 0) return;
    programModalItemIds = ids;

    const count = ids.length;
    document.getElementById('program-modal-title').textContent = count === 1 ? 'Programar tratamiento' : `Programar ${count} tratamientos`;
    document.getElementById('program-confirm-label').textContent = count === 1 ? 'Confirmar programación' : `Confirmar programación (${count})`;

    document.getElementById('program-patient-name').textContent =
      document.querySelector('.patient-name-block .pname')?.textContent || '—';
    document.getElementById('program-patient-cc').textContent =
      document.querySelector('.patient-meta .pm-item b')?.textContent || '—';
    document.getElementById('program-por').textContent =
      CURRENT_USER_NAME.startsWith('Enf.') ? CURRENT_USER_NAME : 'Enf. ' + CURRENT_USER_NAME;

    const fechaField = document.getElementById('program-fecha-inicio');
    fechaField.min = TODAY_DATE;
    fechaField.value = currentViewDate >= TODAY_DATE ? currentViewDate : TODAY_DATE;
    document.getElementById('program-hora-inicio').value = nearestQuarterHourString();
    renderProgramPreview();

    programModalOverlay.classList.add('open');
  }

  function closeProgramModal(){
    programModalOverlay.classList.remove('open');
    programModalItemIds = [];
  }

  document.getElementById('program-fecha-inicio').addEventListener('change', renderProgramPreview);
  document.getElementById('program-hora-inicio').addEventListener('change', renderProgramPreview);
  document.getElementById('program-modal-close').addEventListener('click', closeProgramModal);
  document.getElementById('program-cancel-btn').addEventListener('click', closeProgramModal);
  programModalOverlay.addEventListener('click', (e)=>{
    if(e.target === programModalOverlay) closeProgramModal();
  });
  function handleProgramModalEscape(e){
    if(e.key === 'Escape' && programModalOverlay.classList.contains('open')) closeProgramModal();
  }
  document.addEventListener('keydown', handleProgramModalEscape);

  document.getElementById('program-confirm-btn').addEventListener('click', ()=>{
    const fechaInicio = document.getElementById('program-fecha-inicio').value || currentViewDate;
    const horaInicio = document.getElementById('program-hora-inicio').value || nowTimeString();
    const ids = programModalItemIds;
    closeProgramModal();
    programarItems(ids, fechaInicio, horaInicio);
  });

  /* ================= CATÁLOGO DE INSUMOS (overlay sobre el modal de Pedido) ================= */
  const CATALOGO_ARTICULOS = [
    { id:'DM000114', desc:'Jeringa desechable 10 ml con aguja', disp:84, porVencer:2 },
    { id:'DM000221', desc:'Sutura absorbible 3-0', disp:52, porVencer:0 },
    { id:'IN000241', desc:'Guantes de examen nitrilo talla M', disp:420, porVencer:0 },
    { id:'IN000318', desc:'Gasa estéril 10x10 cm paquete x 5', disp:96, porVencer:12 },
    { id:'IN000402', desc:'Esparadrapo hipoalergénico 5 cm', disp:38, porVencer:0 },
    { id:'IN000508', desc:'Catéter venoso periférico N° 20', disp:55, porVencer:0 },
    { id:'IN000612', desc:'Equipo de infusión macrogotero', disp:40, porVencer:3 },
    { id:'IN000703', desc:'Llave de tres vías', disp:28, porVencer:0 },
    { id:'IN000841', desc:'Alcohol antiséptico 70% 250 ml', disp:15, porVencer:4 },
    { id:'MED000045', desc:'Cloruro de sodio 0.9% 500 ml (solución para infusión)', disp:75, porVencer:5 },
    { id:'MED000102', desc:'Agua estéril para inyección 10 ml', disp:120, porVencer:0 },
  ];

  let catalogCart = [];
  let catalogFiltro = 'todos';
  const catalogOverlay = document.getElementById('catalog-overlay');

  function renderCatalogTable(){
    const term = document.getElementById('catalog-search').value.trim().toLowerCase();
    let filtrados = CATALOGO_ARTICULOS.filter(a=>{
      const textMatch = !term || a.id.toLowerCase().includes(term) || a.desc.toLowerCase().includes(term);
      const dispMatch = catalogFiltro === 'disponibles' ? a.disp > 0 : true;
      return textMatch && dispMatch;
    });

    document.getElementById('catalog-count-todos').textContent = CATALOGO_ARTICULOS.filter(a=> !term || a.id.toLowerCase().includes(term) || a.desc.toLowerCase().includes(term)).length;
    document.getElementById('catalog-count-disponibles').textContent = CATALOGO_ARTICULOS.filter(a=>(a.disp>0) && (!term || a.id.toLowerCase().includes(term) || a.desc.toLowerCase().includes(term))).length;

    const tbody = document.getElementById('catalog-tbody');
    if(filtrados.length === 0){
      tbody.innerHTML = '<tr><td colspan="6"><div class="catalog-empty">No se encontraron artículos para tu búsqueda.</div></td></tr>';
      return;
    }
    tbody.innerHTML = filtrados.map(a=>{
      const enCarrito = catalogCart.some(c => c.id === a.id);
      return `
        <tr>
          <td class="ct-desc">${a.desc}</td>
          <td class="ct-id">${a.id}</td>
          <td class="ct-num ${a.disp > 0 ? 'pos' : 'zero'}">${a.disp}</td>
          <td class="ct-num ${a.porVencer > 0 ? 'pos' : ''}">${a.porVencer > 0 ? a.porVencer : '0'}</td>
          <td class="ct-center">
            <input type="number" class="catalog-qty-input" min="1" max="${a.disp > 0 ? a.disp : 999}"
              id="cat-qty-${a.id}" value="1" ${enCarrito ? 'disabled' : ''}>
          </td>
          <td class="ct-center">
            <button type="button" class="catalog-add-btn ${enCarrito ? 'added' : ''}"
              data-add-art="${a.id}" title="${enCarrito ? 'Ya en el pedido' : 'Agregar al pedido'}">
              <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${enCarrito ? '<path d="M20 6 9 17l-5-5"/>' : '<path d="M5 12h14"/><path d="M12 5v14"/>'}
              </svg>
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  function renderCatalogCart(){
    const list = document.getElementById('catalog-cart-list');
    const empty = document.getElementById('catalog-cart-empty');
    const count = catalogCart.length;
    const units = catalogCart.reduce((s, c) => s + c.cantidad, 0);

    document.getElementById('catalog-cart-count').textContent = count;
    document.getElementById('catalog-footer-items').textContent = count;
    document.getElementById('catalog-footer-units').textContent = units;
    document.getElementById('catalog-confirm-btn').disabled = count === 0;

    if(count === 0){
      list.innerHTML = '';
      if(!list.contains(empty)){ empty.style.display = 'flex'; list.appendChild(empty); }
      return;
    }
    if(list.contains(empty)) list.removeChild(empty);

    list.innerHTML = catalogCart.map(c => `
      <div class="cart-item" data-cart-id="${c.id}">
        <span class="cart-item-name">${c.desc}</span>
        <div class="cart-item-qty">
          <input type="number" min="1" value="${c.cantidad}" aria-label="Cantidad de ${c.desc}" data-cart-qty="${c.id}">
        </div>
        <button type="button" class="cart-remove-btn" data-remove-cart="${c.id}" title="Quitar">
          <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>`).join('');
  }

  function openCatalog(){
    catalogCart = [];
    document.getElementById('catalog-search').value = '';
    catalogFiltro = 'todos';
    document.getElementById('catalog-chip-todos').classList.add('active');
    document.getElementById('catalog-chip-disponibles').classList.remove('active');
    renderCatalogTable();
    renderCatalogCart();
    catalogOverlay.classList.add('open');
    document.getElementById('catalog-search').focus();
  }
  function closeCatalog(){ catalogOverlay.classList.remove('open'); }

  document.getElementById('catalog-close-btn').addEventListener('click', closeCatalog);
  catalogOverlay.addEventListener('click', (e)=>{ if(e.target === catalogOverlay) closeCatalog(); });
  function handleCatalogEscape(e){
    if(e.key === 'Escape' && catalogOverlay.classList.contains('open')){ e.stopPropagation(); closeCatalog(); }
  }
  document.addEventListener('keydown', handleCatalogEscape, true);

  document.getElementById('catalog-search').addEventListener('input', renderCatalogTable);

  document.querySelectorAll('.catalog-chip[data-cat-filter]').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      catalogFiltro = chip.getAttribute('data-cat-filter');
      document.querySelectorAll('.catalog-chip[data-cat-filter]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderCatalogTable();
    });
  });

  document.getElementById('catalog-tbody').addEventListener('click', (e)=>{
    const addBtn = e.target.closest('[data-add-art]');
    if(!addBtn) return;
    const id = addBtn.getAttribute('data-add-art');
    if(catalogCart.some(c => c.id === id)) return;
    const art = CATALOGO_ARTICULOS.find(a => a.id === id);
    if(!art) return;
    const qtyInput = document.getElementById('cat-qty-' + id);
    const n = Math.max(1, parseInt(qtyInput ? qtyInput.value : '1', 10) || 1);
    catalogCart.push({ id: art.id, desc: art.desc, cantidad: n });
    renderCatalogTable();
    renderCatalogCart();
  });

  document.getElementById('catalog-cart-list').addEventListener('input', (e)=>{
    const input = e.target.closest('[data-cart-qty]');
    if(!input) return;
    const id = input.getAttribute('data-cart-qty');
    const item = catalogCart.find(c => c.id === id);
    if(item){ item.cantidad = Math.max(1, parseInt(input.value, 10) || 1); }
    document.getElementById('catalog-footer-units').textContent = catalogCart.reduce((s, c) => s + c.cantidad, 0);
    document.getElementById('catalog-cart-count').textContent = catalogCart.length;
  });

  document.getElementById('catalog-cart-list').addEventListener('click', (e)=>{
    const removeBtn = e.target.closest('[data-remove-cart]');
    if(!removeBtn) return;
    const id = removeBtn.getAttribute('data-remove-cart');
    catalogCart = catalogCart.filter(c => c.id !== id);
    renderCatalogTable();
    renderCatalogCart();
  });

  document.getElementById('catalog-confirm-btn').addEventListener('click', ()=>{
    const seleccionados = catalogCart.slice();
    closeCatalog();
    renderPedidoInsumosResumen(seleccionados);
    const label = document.getElementById('pedido-add-insumo-label');
    if(label) label.textContent = seleccionados.length > 0
      ? `Editar insumos seleccionados (${seleccionados.length})`
      : 'Agregar insumos desde el catálogo';
    pedidoInsumosSeleccionados = seleccionados;
  });

  function renderPedidoInsumosResumen(items){
    const wrap = document.getElementById('pedido-insumos-resumen');
    if(!items || items.length === 0){ wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    wrap.innerHTML = items.map(i => `
      <div class="insumos-resumen-row">
        <span class="ir-name">${i.desc}</span>
        <span class="ir-qty">${i.cantidad} unidad${i.cantidad === 1 ? '' : 'es'}</span>
      </div>`).join('');
  }

  /* ================= Modal: Pedido a farmacia ================= */
  const pedidoModalOverlay = document.getElementById('pedido-modal-overlay');
  let pedidoModalItemIds = [];
  let pedidoCoberturaHoras = 12;
  let pedidoInsumosSeleccionados = [];

  function parseCantPedidaTotal(item){
    const m = (item.cantPedida || '').match(/\/(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }
  function calcularUnidadesPedido(item, coberturaHoras){
    const intervalo = parseFrecuenciaHoras(item.frecuencia);
    const total = parseCantPedidaTotal(item);
    const crudo = Math.floor(coberturaHoras / intervalo) + 1;
    return Math.max(1, Math.min(crudo, total));
  }

  function renderPedidoSummary(){
    const wrap = document.getElementById('pedido-med-summary');
    wrap.innerHTML = pedidoModalItemIds.map(id=>{
      const item = findOmeItemById(id);
      if(!item) return '';
      const total = parseCantPedidaTotal(item);
      const unidades = calcularUnidadesPedido(item, pedidoCoberturaHoras);
      return `
        <div class="suspend-med-row">
          <div>
            <div class="sm-name">${item.desc}</div>
            <div class="sm-meta">${item.frecuencia} · ${item.via}</div>
          </div>
          <div class="sm-qty-result">
            <span class="program-chip">${unidades} unidad${unidades === 1 ? '' : 'es'}</span>
            <div class="sm-qty-note">de ${total} totales del tratamiento</div>
          </div>
        </div>`;
    }).join('');
  }

  function setPedidoCobertura(valor){
    if(valor === 'custom'){
      document.getElementById('pedido-cobertura-custom-wrap').style.display = 'flex';
      const customVal = parseInt(document.getElementById('pedido-cobertura-custom').value, 10);
      pedidoCoberturaHoras = customVal > 0 ? customVal : pedidoCoberturaHoras;
    } else {
      document.getElementById('pedido-cobertura-custom-wrap').style.display = 'none';
      pedidoCoberturaHoras = parseInt(valor, 10);
    }
    renderPedidoSummary();
  }
  document.querySelectorAll('#pedido-cobertura-group .chip-filter').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      document.querySelectorAll('#pedido-cobertura-group .chip-filter').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      setPedidoCobertura(chip.getAttribute('data-cobertura'));
    });
  });
  document.getElementById('pedido-cobertura-custom').addEventListener('input', ()=> setPedidoCobertura('custom'));

  document.getElementById('pedido-add-insumo-btn').addEventListener('click', openCatalog);

  function openPedidoModal(ids){
    if(!ids || ids.length === 0) return;
    pedidoModalItemIds = ids;
    pedidoInsumosSeleccionados = [];

    const count = ids.length;
    document.getElementById('pedido-modal-title').textContent = count === 1 ? 'Pedido a farmacia' : `Pedido a farmacia (${count} medicamentos)`;

    document.getElementById('pedido-patient-name').textContent =
      document.querySelector('.patient-name-block .pname')?.textContent || '—';
    document.getElementById('pedido-patient-cc').textContent =
      document.querySelector('.patient-meta .pm-item b')?.textContent || '—';
    document.getElementById('pedido-por').textContent =
      CURRENT_USER_NAME.startsWith('Enf.') ? CURRENT_USER_NAME : 'Enf. ' + CURRENT_USER_NAME;

    document.querySelectorAll('#pedido-cobertura-group .chip-filter').forEach(c => c.classList.remove('active'));
    document.querySelector('#pedido-cobertura-group .chip-filter[data-cobertura="12"]').classList.add('active');
    document.getElementById('pedido-cobertura-custom-wrap').style.display = 'none';
    document.getElementById('pedido-cobertura-custom').value = '';
    pedidoCoberturaHoras = 12;

    renderPedidoInsumosResumen([]);
    const label = document.getElementById('pedido-add-insumo-label');
    if(label) label.textContent = 'Agregar insumos desde el catálogo';

    renderPedidoSummary();
    pedidoModalOverlay.classList.add('open');
  }

  function closePedidoModal(){
    pedidoModalOverlay.classList.remove('open');
    pedidoModalItemIds = [];
  }

  document.getElementById('pedido-modal-close').addEventListener('click', closePedidoModal);
  document.getElementById('pedido-cancel-btn').addEventListener('click', closePedidoModal);
  pedidoModalOverlay.addEventListener('click', (e)=>{
    if(e.target === pedidoModalOverlay) closePedidoModal();
  });
  function handlePedidoModalEscape(e){
    if(e.key === 'Escape' && pedidoModalOverlay.classList.contains('open') && !catalogOverlay.classList.contains('open')) closePedidoModal();
  }
  document.addEventListener('keydown', handlePedidoModalEscape);

  document.getElementById('pedido-confirm-btn').addEventListener('click', ()=>{
    const ids = pedidoModalItemIds;
    const coberturaHoras = pedidoCoberturaHoras;
    const insumos = pedidoInsumosSeleccionados;

    let totalMeds = 0;
    const medItems = [];
    let prioridadAgregada = 'normal';
    ids.forEach(id=>{
      const item = findOmeItemById(id);
      if(!item || item.estadoProgramacion !== 'programada') return;
      const unidades = calcularUnidadesPedido(item, coberturaHoras);
      item.estadoPedido = 'solicitado';
      item.cantPedida = unidades + '/' + parseCantPedidaTotal(item);
      selectedOmeItems.delete(id);
      totalMeds++;

      const prioridadKey = item.prioridad === 'Urgente' ? 'urgente' : 'normal';
      if(prioridadKey === 'urgente') prioridadAgregada = 'urgente';
      medItems.push({ nombre: item.desc, cantidad: unidades + (unidades === 1 ? ' unidad' : ' unidades'), prioridad: prioridadKey, estado: 'pendiente', omeItemId: item.id });
    });
    insumos.forEach(ins=>{
      medItems.push({ nombre: ins.desc, cantidad: ins.cantidad + (ins.cantidad === 1 ? ' unidad' : ' unidades'), prioridad: 'normal', estado: 'pendiente', esInsumo: true });
    });

    let nuevoConsecutivo;
    if(medItems.length > 0){
      solicitudesSeq++;
      const responsable = CURRENT_USER_NAME.startsWith('Enf.') ? CURRENT_USER_NAME : 'Enf. ' + CURRENT_USER_NAME;
      nuevoConsecutivo = 'SOL-' + String(solicitudesSeq).padStart(6, '0');
      const nuevaSolicitud = {
        id: 'sol-' + solicitudesSeq,
        consecutivo: nuevoConsecutivo,
        prioridad: prioridadAgregada, solicitadoPor: responsable,
        fecha: `${formatDateLabel(TODAY_DATE)} · ${new Date().toTimeString().slice(0,5)}`,
        fechaISO: TODAY_DATE,
        estado: 'pendiente',
        items: medItems
      };
      solicitudes.unshift(nuevaSolicitud);
      renderSolicitudesList();
      const activeSolChip = document.querySelector('#chipgroup-solicitudes-estado .chip-filter.active');
      if(activeSolChip) applySolicitudesFilter(activeSolChip.getAttribute('data-filter'));

      crearRecepcionDesdeSolicitud(nuevaSolicitud);
    }

    closePedidoModal();
    renderOrdenesList();
    updateOmeSelectionUI();
    const activeChip = document.querySelector('#chipgroup-ordenes-estado .chip-filter.active');
    if(activeChip) applyOrdenesFilter();

    const insumosMsg = insumos.length > 0 ? ` + ${insumos.length} insumo${insumos.length === 1 ? '' : 's'}` : '';
    showToast(`Pedido ${nuevoConsecutivo ? nuevoConsecutivo + ' ' : ''}enviado a farmacia: ${totalMeds} medicamento${totalMeds === 1 ? '' : 's'}${insumosMsg}`);
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
    document.removeEventListener('keydown', handleAdminModalEscape);
    document.removeEventListener('keydown', handleSuspendModalEscape);
    document.removeEventListener('keydown', handleReturnModalEscape);
    document.removeEventListener('keydown', handleProgramModalEscape);
    document.removeEventListener('keydown', handlePedidoModalEscape);
    document.removeEventListener('keydown', handleCatalogEscape, true);
    clearInterval(nowLineInterval);
    clearInterval(dosisVencidasInterval);
    clearTimeout(resizeTimer);
    clearTimeout(toastTimer);
    clearTimeout(doseHideTimer);
    clearInterval(adminClockTimer);
    clearInterval(suspendClockTimer);
    clearInterval(returnClockTimer);
    for (const name of Object.keys(exported)) delete window[name];
  };
}
