import {makeQuery,normalize} from './lib/search.js';
const response=await fetch(process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',{method:'POST',headers:{'User-Agent':'RadarEmpresas/1.0','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:makeQuery('4205407','beauty')}),signal:AbortSignal.timeout(45000)});
if(!response.ok)throw Error(`Overpass HTTP ${response.status}: ${(await response.text()).slice(0,1200)}`);
const data=await response.json();if(data.remark)throw Error(data.remark);
console.log(JSON.stringify({source:'OpenStreetMap',city:'Florianópolis',segment:'Beleza',count:normalize(data.elements).length,sample:normalize(data.elements).slice(0,2)},null,2));
const ibge=await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome',{signal:AbortSignal.timeout(15000)});const cities=await ibge.json();console.log('IBGE municípios:',cities.length);
