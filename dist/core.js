/* Shared, dependency-free domain rules. No storage or DOM side effects. */
(function(root){
  'use strict';
  const AIRCRAFT=['待确认','Airbus A220','Airbus A320','Airbus A321','Airbus A321neo','Airbus A330-300','Airbus A330-900','Airbus A350-900','Airbus A350-1000','Airbus A380-800','Boeing 737-800','Boeing 737 MAX 8','Boeing 747-400','Boeing 747-8','Boeing 767-300ER','Boeing 777-200','Boeing 777-300','Boeing 777-300ER','Boeing 787-8','Boeing 787-9','Boeing 787-10','其他'];
  const CABINS=['经济舱','特选经济舱','商务舱','头等舱'];
  const MAX_FLIGHTS=5000;
  const LIMITS={id:100,airline:60,number:12,registration:20,seat:12,note:800};
  const fail=(s)=>{throw new Error(s)};
  function airportCode(value){return String(value||'').trim().toUpperCase().split(/[\s·—-]/)[0]}
  function isDate(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
    const d=new Date(value+'T12:00:00Z');
    return !isNaN(d)&&d.toISOString().slice(0,10)===value&&value>='1900-01-01'&&value<='2100-12-31';
  }
  function normalizeFlight(raw,airports){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))fail('航班记录格式不正确。');
    const result={};
    for(const [key,max] of Object.entries(LIMITS)){
      const value=raw[key]??'';
      if(typeof value!=='string'||value.length>max)fail('字段 '+key+' 格式或长度不正确。');
      result[key]=value.trim();
    }
    if(!/^[a-zA-Z0-9_-]{1,100}$/.test(result.id))fail('航班编号不正确。');
    result.from=airportCode(raw.from);result.to=airportCode(raw.to);
    if(!Object.hasOwn(airports,result.from)||!Object.hasOwn(airports,result.to))fail('请选择列表中的机场，或填写有效的三字机场代码。');
    if(result.from===result.to)fail('出发机场和到达机场不能相同。');
    if(!['flown','wish'].includes(raw.status))fail('请选择「已飞」或「想飞」。');
    result.status=raw.status;
    result.date=raw.date??'';
    if(typeof result.date!=='string'||(result.date&&!isDate(result.date)))fail('请输入 1900–2100 年间的有效日期。');
    result.aircraft=raw.aircraft||'待确认';
    if(!AIRCRAFT.includes(result.aircraft))fail('请选择支持的机型，或选择「其他」。');
    result.cabin=raw.cabin||'经济舱';
    if(!CABINS.includes(result.cabin))fail('舱等格式不正确。');
    result.number=result.number.toUpperCase();result.seat=result.seat.toUpperCase();result.registration=result.registration.toUpperCase();
    return result;
  }
  function parseBackup(text,airports){
    if(typeof text!=='string'||text.length>8*1024*1024)fail('备份文件过大，上限为 8 MB。');
    let data;try{data=JSON.parse(text)}catch{fail('这不是有效的 JSON 文件。')}
    if(!data||data.app!=='35K'||data.version!==1||!Array.isArray(data.flights))fail('请使用 35K 导出的 v1 JSON 备份。');
    if(data.flights.length>MAX_FLIGHTS)fail('单份手账最多支持 5,000 条记录。');
    const result=data.flights.map(f=>normalizeFlight(f,airports));
    const ids=new Set();for(const f of result){if(ids.has(f.id))fail('备份中有重复编号，请检查后再导入。');ids.add(f.id)}
    return result;
  }
  function mergeFlights(current,incoming){
    const merged=new Map(current.map(f=>[f.id,f]));incoming.forEach(f=>merged.set(f.id,f));
    if(merged.size>MAX_FLIGHTS)fail('合并后超过 5,000 条记录。');
    return [...merged.values()];
  }
  function distanceKm(a,b){
    const r=Math.PI/180,lat1=a.lat*r,lat2=b.lat*r,dlat=(b.lat-a.lat)*r,dlon=(b.lon-a.lon)*r;
    const h=Math.sin(dlat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlon/2)**2;
    return Math.round(6371.0088*2*Math.atan2(Math.sqrt(Math.min(1,h)),Math.sqrt(Math.max(0,1-h))));
  }
  function statistics(flights,airports){
    const flown=flights.filter(f=>f.status==='flown'),ports=new Set(),aircraft=new Set();let distance=0;
    for(const f of flown){ports.add(f.from);ports.add(f.to);if(!['待确认','其他'].includes(f.aircraft))aircraft.add(f.aircraft);distance+=distanceKm(airports[f.from],airports[f.to])}
    return {flights:flown.length,airports:ports.size,aircraft:aircraft.size,distance};
  }
  function backup(flights){return JSON.stringify({app:'35K',version:1,exportedAt:new Date().toISOString(),flights},null,2)}
  function csv(flights){
    const columns=['status','date','from','to','airline','number','aircraft','registration','seat','cabin','note'];
    const escape=value=>{let s=String(value??'');if(/^[\s]*[=+@-]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
    return '\uFEFF'+[['状态','出发日期','出发机场','到达机场','航空公司','航班号','机型','注册号','座位','舱等','备注'].map(escape).join(','),...flights.map(f=>columns.map(k=>escape(k==='status'?(f[k]==='flown'?'已飞':'想飞'):f[k])).join(','))].join('\r\n');
  }
  const api={AIRCRAFT,CABINS,MAX_FLIGHTS,airportCode,isDate,normalizeFlight,parseBackup,mergeFlights,distanceKm,statistics,backup,csv};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FlightCore=api;
})(globalThis);
