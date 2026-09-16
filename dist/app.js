/* 35K — your data stays in this browser. No analytics, network writes or account. */
(()=>{
  'use strict';
  const C=FlightCore,A=AIRPORTS,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const KEY='35k.flights.v1',MODE='35k.mode.v1';
  const ICONS={plus:'M12 5v14M5 12h14',minus:'M5 12h14',x:'m6 6 12 12M6 18 18 6',archive:'M3 4h18v4H3zM5 8v12h14V8M10 12h4',globe:'M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',search:'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15m5-2 5 5',plane:'m22 2-7 20-4-9-9-4 20-7ZM11 13 22 2',edit:'m16 3 5 5M3 21l5-1L21 7a2.1 2.1 0 0 0-4-4L4 16l-1 5Z',trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',download:'M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6',upload:'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',sheet:'M4 3h16v18H4zM4 9h16M4 15h16M10 9v12',pin:'M12 22s8-8 8-13a8 8 0 0 0-16 0c0 5 8 13 8 13Zm3-13a3 3 0 1 0-6 0 3 3 0 0 0 6 0',route:'M5 5h9a5 5 0 0 1 0 10H9a3 3 0 0 0 0 6h10M3 5h4M17 19l2 2-2 2',fleet:'M3 9h18M7 9l3-6h4l3 6M5 9v12M19 9v12M5 14h14M9 14v7M15 14v7',chevron:'m9 5 7 7-7 7',check:'m5 12 4 4L19 6'};
  const icon=n=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[n]||ICONS.plane}"/></svg>`;
  function icons(){for(const el of $$('[data-icon]')){el.innerHTML=icon(el.dataset.icon);el.removeAttribute('data-icon')}}
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>Number(n).toLocaleString('en-US');
  let own=[],demo=DEMO_FLIGHTS.map(f=>({...f})),isDemo=true,filter='all',query='',selected=null,deleteId=null,readError=null,toastTimer;
  try{const raw=localStorage.getItem(KEY);if(raw)own=C.parseBackup(raw,A);isDemo=localStorage.getItem(MODE)!=='own'}catch(error){readError=error}
  const flights=()=>isDemo?demo:own;
  function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4000)}
  function setMode(mode){isDemo=mode==='demo';try{localStorage.setItem(MODE,mode)}catch{toast('浏览器禁止存储，模式只在本次打开有效。')}selected=null;filter='all';query='';$('#search').value='';render();focusFlight()}
  function persist(next,forDemo=isDemo){
    if(forDemo){demo=next;return true}
    if(readError){toast('保存暂不可用，请在「我的数据」中下载原始备份。');return false}
    try{localStorage.setItem(KEY,C.backup(next));own=next;return true}catch{toast('无法保存，请检查浏览器存储权限或剩余空间。');return false}
  }
  const sortFlights=list=>[...list].sort((a,b)=>(b.date||'0000').localeCompare(a.date||'0000'));
  function visible(){return sortFlights(flights().filter(f=>(filter==='all'||f.status===filter)&&[f.from,f.to,A[f.from].city,A[f.to].city,A[f.from].name,A[f.to].name,f.airline,f.number,f.aircraft,f.note].join(' ').toLowerCase().includes(query.toLowerCase())))}
  function chosen(){return flights().find(f=>f.id===selected)}
  function routeFeature(f){return {type:'LineString',coordinates:[[A[f.from].lon,A[f.from].lat],[A[f.to].lon,A[f.to].lat]]}}
  function render(){
    const shown=visible();if(!shown.some(f=>f.id===selected))selected=shown[0]?.id||null;
    $('#demo-banner').hidden=!isDemo;$('#demo-toggle').textContent=isDemo?'回到我的手账':'查看示例手账';
    $$('[data-filter]').forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});
    $('#flight-count').textContent=shown.length;
    $('#map-title').textContent=chosen()?`${A[chosen().from].city} → ${A[chosen().to].city}`:'每一程，都有迹可循';
    const s=C.statistics(flights(),A);
    const metrics=[['plane','已飞航班',s.flights,'程'],['route','大圆距离 ≈',s.distance,'km'],['pin','到访机场',s.airports,'座'],['fleet','机型收藏',s.aircraft,'款']];
    $('#stats').innerHTML=metrics.map(([i,l,v,u])=>`<div class="stat"><div class="stat-label">${icon(i)}${l}</div><div class="stat-value">${fmt(v)}<span class="stat-unit">${u}</span></div></div>`).join('');
    $('#flight-list').innerHTML=shown.length?shown.map(f=>`<button class="flight-row${f.id===selected?' selected':''}" data-flight="${esc(f.id)}" aria-pressed="${f.id===selected}" aria-label="${esc(f.from+' 到 '+f.to+'，'+(f.date||'日期待定')+'，'+(f.status==='flown'?'已飞':'想飞')+'，'+f.aircraft)}"><span class="row-date">${f.date?esc(f.date.slice(5).replace('-','.')):'待定'}<small>${f.date?esc(f.date.slice(0,4)):f.status==='wish'?'SOMEDAY':'UNDATED'}</small></span><span><span class="row-route">${f.from}<span class="route-arrow">→</span>${f.to}</span><span class="row-cities">${esc(A[f.from].city)} → ${esc(A[f.to].city)}<span class="mobile-status ${f.status==='wish'?'wish':''}">${f.status==='wish'?'◇ 想飞':'✓ 已飞'}</span></span></span><span class="row-airline">${esc(f.airline||'航空公司待定')}<small>${esc(f.number||'航班号待定')}</small></span><span class="row-aircraft">${esc(f.aircraft.replace('Airbus ','').replace('Boeing ',''))}<small><span class="badge ${f.status==='wish'?'wish':''}">${f.status==='wish'?'◇ 想飞':'✓ 已飞'}</span></small></span><span class="row-chevron">${icon('chevron')}</span></button>`).join(''):`<div class="empty-state">${icon('plane')}<h3>${query||filter!=='all'?'还没有符合条件的航程':'第一程，从这里开始。'}</h3><p>${query||filter!=='all'?'换一个关键词，或查看全部航班。':'记录一段飞过的路，或先写下一个想去的地方。'}</p><button class="button button-quiet" id="empty-action">${query||filter!=='all'?'查看全部':'记录第一程'}</button></div>`;
    $$('#flight-list [data-flight]').forEach(el=>el.addEventListener('click',()=>selectFlight(el.dataset.flight,true)));
    $('#empty-action')?.addEventListener('click',()=>{if(query||filter!=='all'){query='';filter='all';$('#search').value='';render()}else openForm()});
    renderTicket();drawGlobe();icons();
  }
  function renderTicket(){
    const f=chosen();let ticket;
    if(!f)ticket=`<div class="ticket empty-ticket"><span class="eyebrow">YOUR WINDOW SEAT</span><div class="airport-code">35K</div><h2>下一程，去哪里？</h2><p>把心里的目的地，变成地图上的一条线。</p><button class="button button-primary" id="ticket-add">记录航班</button></div>`;
    else{const distance=C.distanceKm(A[f.from],A[f.to]);const bits=[['航空公司',f.airline||'待定'],['航班 / 日期',`${f.number||'待定'} · ${f.date||'未填写'}`],['机型',f.aircraft],['距离 / 舱等',`${fmt(distance)} km ≈ · ${f.cabin}`]];
      ticket=`<article class="ticket"><div class="ticket-main"><div class="ticket-top"><span class="eyebrow">${isDemo?'SAMPLE BOARDING PASS':'YOUR BOARDING PASS'}</span><span class="badge ${f.status==='wish'?'wish':''}">${f.status==='wish'?'◇ 想飞':'✓ 已飞'}</span></div><div class="ticket-route"><div><div class="airport-code">${f.from}</div><div class="airport-city">${esc(A[f.from].city)}</div></div><span class="ticket-plane">${icon('plane')}</span><div class="ticket-route-end"><div class="airport-code">${f.to}</div><div class="airport-city">${esc(A[f.to].city)}</div></div></div><div class="ticket-route-line"></div><dl class="ticket-metadata">${bits.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}${f.registration?`<div><dt>注册号</dt><dd>${esc(f.registration)}</dd></div>`:''}</dl></div><div class="ticket-stub"><div class="ticket-seat"><span class="seat-label">SEAT<br>座位</span><span class="seat-value">${esc(f.seat||'—')}</span></div><div class="ticket-actions"><button id="edit-selected" class="icon-button" aria-label="编辑这段航程">${icon('edit')}</button><button id="delete-selected" class="icon-button" aria-label="删除这段航程">${icon('trash')}</button></div></div></article>`;
    }
    $('#journey-panel').innerHTML=ticket+`<div class="window-card"><img src="./assets/window.webp" alt="蓝调晨光中，机翼掠过云海的创作图像" width="1536" height="1024"><div class="window-caption"><p>${esc(f?.note||'云层之上，留一点时间给自己。').replaceAll('\n','<br>')}</p><span>${f?.note?'A NOTE FROM THIS FLIGHT':'SOMEWHERE ABOVE THE CLOUDS'}</span></div></div>`;
    $('#edit-selected')?.addEventListener('click',()=>openForm(chosen()));$('#ticket-add')?.addEventListener('click',()=>openForm());
    $('#delete-selected')?.addEventListener('click',()=>{deleteId=chosen().id;$('#confirm-text').textContent=`${chosen().from} → ${chosen().to} · ${chosen().date||'日期待定'}。删除后可以通过提示中的「撤销」恢复。`;$('#confirm-dialog').showModal()});
  }
  function selectFlight(id,scroll){selected=id;render();focusFlight();if(scroll&&matchMedia('(max-width: 800px)').matches)$('#journey-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'})}
  function openForm(f){const form=$('#flight-form');form.reset();$('#form-error').textContent='';$('#flight-dialog-title').textContent=f?'编辑这段航程':isDemo?'试着记录一段示例航程':'记录一段航程';form.elements.id.value=f?.id||'';if(f)for(const [key,value] of Object.entries(f)){if(form.elements[key])form.elements[key].value=value}else{form.elements.from.value='HKG';form.elements.aircraft.value='待确认';form.elements.date.value=''}$('#flight-dialog').showModal()}
  $('#flight-form').addEventListener('submit',event=>{
    event.preventDefault();const form=event.currentTarget;const raw=Object.fromEntries(new FormData(form));raw.id=raw.id||crypto.randomUUID();
    try{const f=C.normalizeFlight(raw,A);const next=C.mergeFlights(flights(),[f]);if(!persist(next))return;selected=f.id;filter='all';query='';$('#search').value='';$('#flight-dialog').close();render();focusFlight();toast(isDemo?'已保存示例航程。建立自己的手账后可正式记录。':'已收进你的飞行手账。')}catch(error){$('#form-error').textContent=error.message}
  });
  $('#confirm-delete').addEventListener('click',()=>{
    const deleted=flights().find(f=>f.id===deleteId),deletedMode=isDemo;if(!deleted)return;if(!persist(flights().filter(f=>f.id!==deleteId)))return;$('#confirm-dialog').close();render();toast('已删除这段航程。');
    const undo=document.createElement('button');undo.className='text-button';undo.style.marginLeft='12px';undo.textContent='撤销';$('#toast').append(undo);clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,10000);
    undo.onclick=()=>{if(persist(C.mergeFlights(deletedMode?demo:own,[deleted]),deletedMode)){if(isDemo===deletedMode)selected=deleted.id;render();toast('航程已恢复。')}};
  });
  $('#add-flight').addEventListener('click',()=>openForm());$('#start-own').addEventListener('click',()=>{setMode('own');toast('这是你的手账。示例不会计入记录。');if(!own.length)openForm()});
  $$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
  $$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;render();focusFlight()}));
  $('#search').addEventListener('input',e=>{query=e.target.value;render()});
  $('#data-button').addEventListener('click',()=>{$('#data-message').textContent=readError?'保存记录暂时无法读取。下载 JSON 会保存原始数据，避免覆盖。':'';$('#data-dialog').showModal()});
  $('#demo-toggle').addEventListener('click',()=>{setMode(isDemo?'own':'demo');$('#data-dialog').close();toast(isDemo?'已切换到示例手账。':'已回到你的手账。')});
  function download(contents,name,type){const url=URL.createObjectURL(new Blob([contents],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function exportName(ext){return `35K-${isDemo?'sample':'flights'}-${new Date().toISOString().slice(0,10)}.${ext}`}
  $('#export-json').addEventListener('click',()=>{if(readError){try{const raw=localStorage.getItem(KEY);if(raw)download(raw,'35K-recovery.json','application/json');else toast('浏览器不允许读取记录。')}catch{toast('浏览器不允许读取记录。')}return}download(C.backup(flights()),exportName('json'),'application/json');toast('备份已下载。')});
  $('#export-csv').addEventListener('click',()=>download(C.csv(flights()),exportName('csv'),'text/csv;charset=utf-8'));
  $('#import-json').addEventListener('click',()=>$('#import-file').click());
  $('#import-file').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try{if(file.size>8*1024*1024)throw new Error('文件超过 8 MB，请选择较小的备份。');const incoming=C.parseBackup(await file.text(),A);if(readError)throw new Error('现有记录无法读取，请先下载原始备份。');const next=C.mergeFlights(own,incoming);localStorage.setItem(KEY,C.backup(next));own=next;setMode('own');$('#data-dialog').close();toast(`已校验并合并 ${incoming.length} 条记录。`)}catch(error){$('#data-message').textContent=error.message||'导入失败，原记录未更改。'}finally{event.target.value=''}
  });
  $('#aircraft-select').innerHTML=C.AIRCRAFT.map(v=>`<option>${v}</option>`).join('');
  $('#airports').innerHTML=Object.entries(A).map(([code,a])=>`<option value="${code}">${esc(a.city+' · '+a.name)}</option>`).join('');

  // D3 handles spherical clipping, including dateline crossings and the hidden hemisphere.
  let projection,path,land=null,rotate=[-127,-23,0],zoom=1,drag=null,drawPending=false;
  const svg=$('#globe'),layer=$('#globe-layers'),NS='http://www.w3.org/2000/svg';
  function node(tag,attrs,parent=layer){const el=document.createElementNS(NS,tag);for(const [key,v] of Object.entries(attrs))el.setAttribute(key,v);parent.append(el);return el}
  function drawGlobe(){
    if(!projection)return;
    projection.rotate(rotate).scale(242*zoom);layer.replaceChildren();
    node('circle',{cx:400,cy:270,r:285*zoom,fill:'url(#halo)'});
    node('path',{d:path({type:'Sphere'}),fill:'url(#ocean)',stroke:'#496576','stroke-width':1});
    node('path',{d:path(d3.geoGraticule10()),class:'globe-graticule'});
    if(land)node('path',{d:path(land),class:'globe-land'});
    const shown=visible(),ordered=[...shown.filter(f=>f.id!==selected),...shown.filter(f=>f.id===selected)];
    for(const f of ordered){const route=path(routeFeature(f));if(!route)continue;const color=f.status==='wish'?'#ffc48b':'#8fd5f7',active=f.id===selected;
      if(active)node('path',{d:route,fill:'none',stroke:color,'stroke-width':5,opacity:.3,filter:'url(#route-glow)','pointer-events':'none'});
      node('path',{d:route,class:'globe-route',stroke:color,'stroke-width':active?2.4:1.2,'stroke-dasharray':f.status==='wish'?'5 6':'none',opacity:active?1:.48,'pointer-events':'none'});
      const target=node('path',{d:route,fill:'none',stroke:'transparent','stroke-width':16,'pointer-events':'stroke',cursor:'pointer','data-map-flight':f.id});const title=node('title',{},target);title.textContent=`${f.from} → ${f.to}`;
    }
    const allPorts=[...new Set(shown.flatMap(f=>[f.from,f.to]))],f=chosen(),activePorts=f?[f.from,f.to]:[];
    for(const code of [...allPorts.filter(c=>!activePorts.includes(c)),...activePorts]){
      const a=A[code],coord=[a.lon,a.lat],center=projection.invert([400,270]);if(d3.geoDistance(coord,center)>Math.PI/2-.01)continue;
      const [x,y]=projection(coord),active=activePorts.includes(code);node('circle',{cx:x,cy:y,r:active?4.3:2.8,fill:active?'#e6f7ff':'#83b6cf',stroke:'#163243','stroke-width':2});
      if(active){node('circle',{cx:x,cy:y,r:9,fill:'none',stroke:'#8fd5f7','stroke-width':.8,opacity:.55});const label=node('text',{x:x+12,y:y+4,class:'globe-label'});label.textContent=code}
    }
  }
  function requestDraw(){if(!drawPending){drawPending=true;requestAnimationFrame(()=>{drawPending=false;drawGlobe()})}}
  function focusFlight(){
    if(!projection)return;const f=chosen();if(!f)return;const center=d3.geoInterpolate([A[f.from].lon,A[f.from].lat],[A[f.to].lon,A[f.to].lat])(.5);rotate=[-center[0],-center[1],0];drawGlobe();
  }
  try{
    if(typeof d3==='undefined')throw new Error('Map library unavailable');
    projection=d3.geoOrthographic().translate([400,270]).clipAngle(90);path=d3.geoPath(projection);
    land=LAND_DATA;render();focusFlight();
  }catch(error){$('#map-error').hidden=false;render()}
  function resetMap(){rotate=[-127,-23,0];zoom=1;drawGlobe()}
  $('#map-reset').onclick=resetMap;$('#map-east').onclick=resetMap;$('#map-in').onclick=()=>{zoom=Math.min(1.8,zoom+.15);drawGlobe()};$('#map-out').onclick=()=>{zoom=Math.max(.7,zoom-.15);drawGlobe()};
  svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,rotation:[...rotate],moved:false,flightId:e.target.dataset.mapFlight};svg.setPointerCapture(e.pointerId)});
  svg.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;if(drag.moved){svg.classList.add('dragging');rotate=[drag.rotation[0]+dx*.35,Math.max(-85,Math.min(85,drag.rotation[1]-dy*.35)),0];requestDraw()}});
  function endDrag(event){const previous=drag;drag=null;svg.classList.remove('dragging');if(event.type==='pointerup'&&previous?.flightId&&!previous.moved)selectFlight(previous.flightId,false)}svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
  icons();if(readError)setTimeout(()=>toast('读取本机记录时出错，原数据已保留。请打开「我的数据」。'),700);

  // Progressive WebMCP enhancement; browsers without this proposed API work normally.
  const context=document.modelContext;
  if(context?.registerTool){
    const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
    const registrations=[
      {name:'read_flight_journal',description:'Read visible flight records and summary from the current personal or sample journal.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object');return {mode:isDemo?'sample':'personal',flights:visible(),summary:C.statistics(flights(),A)}}},
      {name:'start_flight_record',description:'Open the flight editor with optional airport codes. This does not save a record; the user completes the form.',inputSchema:{type:'object',properties:{from:{type:'string'},to:{type:'string'}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['from','to'].includes(k)))throw new Error('Invalid input');for(const key of ['from','to'])if(input[key]!==undefined&&(typeof input[key]!=='string'||!Object.hasOwn(A,C.airportCode(input[key]))))throw new Error('Unknown airport');if(input.from&&input.to&&C.airportCode(input.from)===C.airportCode(input.to))throw new Error('Airports must differ');if($('#flight-dialog').open)throw new Error('Flight editor is already open');openForm();for(const key of ['from','to'])if(input[key])$('#flight-form').elements[key].value=C.airportCode(input[key]);return {editor:'open',saved:false,mode:isDemo?'sample':'personal'}}}
    ];
    for(const tool of registrations)try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{}
  }
})();
