const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const C=require('../dist/core.js');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(require.resolve('../dist/data.js'),'utf8')+'\nglobalThis.data={airports:AIRPORTS,demo:DEMO_FLIGHTS,land:LAND_DATA}',context);
const {airports,demo,land}=JSON.parse(JSON.stringify(context.data));

test('all shipped sample flights and coordinates are valid',()=>{
  assert.equal(demo.length,8);
  for(const f of demo)assert.equal(C.normalizeFlight(f,airports).id,f.id);
  for(const a of Object.values(airports)){assert.ok(a.lat>=-90&&a.lat<=90);assert.ok(a.lon>=-180&&a.lon<=180)}
  assert.equal(land.type,'FeatureCollection');assert.ok(land.features.length>0);
});
test('distance is symmetric, accurate to scale, and crosses the Pacific correctly',()=>{
  assert.equal(C.distanceKm(airports.HKG,airports.HKG),0);
  const tokyo=C.distanceKm(airports.HKG,airports.HND);
  assert.ok(tokyo>2850&&tokyo<2950,tokyo);
  assert.equal(tokyo,C.distanceKm(airports.HND,airports.HKG));
  const pacific=C.distanceKm(airports.NRT,airports.HNL);assert.ok(pacific>6000&&pacific<6400,pacific);
  assert.ok(Number.isFinite(C.distanceKm({lat:0,lon:0},{lat:0,lon:180})));
});
test('statistics exclude wish flights and unknown aircraft',()=>{
  const result=C.statistics(demo,airports);
  assert.deepEqual([result.flights,result.airports,result.aircraft],[5,4,4]);
  assert.deepEqual(C.statistics(demo.filter(f=>f.status==='wish'),airports),{flights:0,airports:0,aircraft:0,distance:0});
  assert.equal(C.statistics([{...demo[0],aircraft:'待确认'}],airports).aircraft,0);
});
test('backup round trips notes and optional fields without altering the source',()=>{
  const record={...demo[0],note:'云海\n"清晨"，<b>你好</b>'};
  const before=JSON.stringify(record);const restored=C.parseBackup(C.backup([record]),airports);
  assert.deepEqual(restored,[record]);assert.equal(JSON.stringify(record),before);
});
test('invalid dates, airports, oversized notes and duplicate IDs are rejected',()=>{
  const invalid=[{from:'XXX'},{from:'HKG',to:'HKG'},{date:'2025-02-29'},{date:'2025-13-01'},{date:'2101-01-01'},{status:'booked'},{note:'x'.repeat(801)},{id:'<script>'}];
  for(const patch of invalid)assert.throws(()=>C.normalizeFlight({...demo[0],...patch},airports));
  assert.ok(C.isDate('2024-02-29'));assert.equal(C.normalizeFlight({...demo[0],date:''},airports).date,'');
  assert.throws(()=>C.parseBackup(C.backup([demo[0],demo[0]]),airports),/重复/);
});
test('invalid imports leave current records unchanged; valid imports merge by ID',()=>{
  const original=structuredClone(demo),before=JSON.stringify(original);
  for(const text of ['not json','{}',JSON.stringify({app:'35K',version:2,flights:[]}),C.backup([demo[0],{...demo[1],from:'BAD'}])])assert.throws(()=>C.parseBackup(text,airports));
  assert.equal(JSON.stringify(original),before);
  const next=C.mergeFlights(original,[{...demo[0],seat:'40A'},{...demo[1],id:'new-id'}]);
  assert.equal(next.length,original.length+1);assert.equal(next.find(f=>f.id===demo[0].id).seat,'40A');assert.equal(JSON.stringify(original),before);
});
test('CSV handles quotes, newlines, Unicode and spreadsheet formula injection',()=>{
  const result=C.csv([{...demo[0],airline:'=2+2',note:'你好，"云"\n第二行'}]);
  assert.ok(result.startsWith('\uFEFF'));assert.ok(result.includes('"\'=2+2"'));assert.ok(result.includes('"你好，""云""\n第二行"'));
});
test('D3 assets render clipped spherical routes without malformed coordinates',()=>{
  const geo=vm.createContext({});
  for(const name of ['d3-array.min.js','d3-geo.min.js'])vm.runInContext(fs.readFileSync(require.resolve('../dist/assets/'+name),'utf8'),geo);
  const {d3}=geo;const projection=d3.geoOrthographic().rotate([-150,-25,0]).translate([400,270]).scale(242);const path=d3.geoPath(projection);
  const earth=path(land);assert.ok(earth.length>10000);assert.ok(!/NaN|Infinity/.test(earth));
  assert.ok(d3.geoArea(land)>2&&d3.geoArea(land)<5,'land polygon winding must describe land, not almost the whole sphere');
  for(const f of demo){const route=path({type:'LineString',coordinates:[[airports[f.from].lon,airports[f.from].lat],[airports[f.to].lon,airports[f.to].lat]]});assert.ok(!/NaN|Infinity/.test(route||''))}
});
